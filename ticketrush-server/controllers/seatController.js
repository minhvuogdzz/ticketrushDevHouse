const Seat = require('../models/Seat');

exports.lockSeat = async (req, res) => {
  try {
    const { seatId, userId } = req.body;
    
    // Tìm chính xác theo mã ghế (VD: VIP15), không dùng findById
    const seat = await Seat.findOne({ seatId });

    if (!seat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ghế này trong hệ thống!' });
    }

    if (seat.status !== 'available') {
      return res.status(409).json({ success: false, message: 'Ghế này đã bị người khác giữ hoặc mua!' });
    }

    // Cập nhật trạng thái và gán ID người dùng
    seat.status = 'locked';
    seat.lockedBy = userId;
    seat.lockExpires = new Date(Date.now() + 10 * 60 * 1000); // Khóa trong 10 phút
    await seat.save();

    // Bắn tín hiệu socket cho toàn bộ rạp biết ghế đã chuyển vàng
    if (req.io) {
      req.io.emit('seatUpdated', seat); 
    }

    res.json({ success: true, seat });
  } catch (error) {
    console.error('Lỗi khi khóa ghế:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý giữ vé.' });
  }
};

// [Quyền Admin] Hủy vé đã bán và hoàn tiền
exports.adminCancelTicket = async (req, res) => {
  try {
    const { seatId } = req.body;
    
    // Tìm ghế đang được bán
    const seat = await Seat.findOne({ seatId });

    if (!seat) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ghế!' });
    }
    if (seat.status !== 'sold') {
      return res.status(400).json({ success: false, message: 'Ghế này chưa được thanh toán thành công, không thể hoàn tiền!' });
    }

    // Reset toàn bộ thông tin ghế về trạng thái trống ban đầu
    seat.status = 'available';
    seat.lockedBy = null;
    seat.lockExpires = null;
    seat.customerName = null;
    seat.customerPhone = null;
    await seat.save();

    // Bắn tín hiệu Socket cho toàn rạp (đổi màu vé thành xám)
    if (req.io) {
      req.io.emit('seatUpdated', seat); 
    }

    res.json({ success: true, message: `Đã hủy vé ${seatId} và hoàn tiền thành công!` });
  } catch (error) {
    console.error('Lỗi khi Admin hủy vé:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi xử lý hoàn tiền.' });
  }
};

// Hàm tạo nhanh 150 ghế trống vào Database
exports.seedSeats = async (req, res) => {
  try {
    const count = await Seat.countDocuments();
    if (count > 0) return res.status(200).json({ message: 'Dữ liệu ghế đã tồn tại, không cần tạo thêm!' });

    const seatsToInsert = [];
    for (let i = 1; i <= 150; i++) {
      seatsToInsert.push({ seatId: `A${i}`, status: 'Available' });
    }
    
    await Seat.insertMany(seatsToInsert);
    res.status(201).json({ message: 'Đã tạo thành công 150 ghế vào Database!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Hàm lấy toàn bộ danh sách ghế & Tự động dọn vé hết hạn
exports.getAllSeats = async (req, res) => {
  try {
    const now = new Date();

    // 1. NGƯỜI QUÉT RÁC: Tìm tất cả các ghế đang giữ chỗ (locked) mà đã quá hạn 10 phút
    const expiredSeats = await Seat.find({ status: 'locked', lockExpires: { $lt: now } });
    
    // Nếu có ghế quá hạn -> Giải phóng chúng ngay lập tức để người khác mua
    if (expiredSeats.length > 0) {
      await Seat.updateMany(
        { status: 'locked', lockExpires: { $lt: now } },
        { $set: { 
            status: 'available', 
            lockedBy: null, 
            lockExpires: null,
            customerName: null, 
            customerPhone: null 
          } 
        }
      );

      // Bắn tín hiệu Socket cho toàn rạp biết các ghế này đã về màu xám
      if (req.io) {
        const resetSeats = await Seat.find({ _id: { $in: expiredSeats.map(s => s._id) } });
        resetSeats.forEach(seat => req.io.emit('seatUpdated', seat));
      }
    }

    // 2. Lấy danh sách ghế sạch sẽ nhất trả về cho Frontend
    const seats = await Seat.find().populate('lockedBy', 'username').sort({ seatId: 1 });
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.checkoutSeats = async (req, res) => {
  try {
    // Nhận thêm customerName và customerPhone từ Frontend gửi lên
    const { seatIds, userId, customerName, customerPhone } = req.body;
    
    if (!seatIds || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' });
    }
    
    if (!customerName || !customerPhone) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Tên và Số điện thoại nhận vé!' });
    }

    const seats = await Seat.find({ seatId: { $in: seatIds } });

    for (let seat of seats) {
      if (seat.lockedBy?.toString() !== userId) {
        return res.status(400).json({ success: false, message: `Ghế ${seat.seatId} đã bị người khác giữ hoặc đã hết hạn.` });
      }
      if (seat.lockExpires && new Date() > seat.lockExpires) {
         return res.status(400).json({ success: false, message: `Ghế ${seat.seatId} đã quá 10 phút giữ chỗ. Xin vui lòng chọn lại.` });
      }
    }

    // UPDATE VÀO DATABASE: Ghi đè tên và SĐT vào từng vé
    await Seat.updateMany(
      { seatId: { $in: seatIds } },
      { $set: { 
          status: 'sold', 
          lockExpires: null,
          customerName: customerName,
          customerPhone: customerPhone
        } 
      } 
    );

    const updatedSeats = await Seat.find({ seatId: { $in: seatIds } });
    if (req.io) {
      updatedSeats.forEach(seat => req.io.emit('seatUpdated', seat));
    }

    res.json({ success: true, message: 'Thanh toán thành công!' });
  } catch (error) {
    console.error('Lỗi khi checkout:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi thanh toán.' });
  }
};

exports.unlockSeat = async (req, res) => {
  try {
    const { seatId, userId } = req.body;
    const seat = await Seat.findOne({ seatId });

    // FIX LỖI: Thêm .toString() để ép kiểu ObjectId về String, nếu không so sánh sẽ luôn sai!
    if (!seat || seat.status !== 'locked' || seat.lockedBy.toString() !== userId) {
      return res.status(400).json({ success: false, message: 'Bạn không có quyền hủy vé này hoặc vé đã bị hủy.' });
    }

    seat.status = 'available';
    seat.lockedBy = null;
    seat.lockExpires = null;
    await seat.save();

    // Phát tín hiệu Socket cho toàn rạp cập nhật màu xám
    if (req.io) {
      req.io.emit('seatUpdated', seat); 
    }

    res.json({ success: true, seat });
  } catch (error) {
    console.error('Lỗi khi hủy ghế:', error);
    res.status(500).json({ success: false, message: 'Lỗi server khi hủy vé' });
  }
};


exports.unlockAllByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Tìm các vé đang bị user này khóa
    const seats = await Seat.find({ lockedBy: userId, status: 'locked' });
    
    if (seats.length > 0) {
      // Mở khóa toàn bộ
      await Seat.updateMany(
        { lockedBy: userId, status: 'locked' },
        { $set: { status: 'available', lockedBy: null, lockExpires: null } }
      );

      // Bắn socket cho rạp biết để đổi màu ghế
      if (req.io) {
        const resetSeats = await Seat.find({ _id: { $in: seats.map(s => s._id) } });
        resetSeats.forEach(seat => req.io.emit('seatUpdated', seat));
      }
    }
    
    res.json({ success: true, message: 'Đã giải phóng vé của user' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [Quyền Admin] Cập nhật giá vé (Không xóa sơ đồ)
exports.updatePrices = async (req, res) => {
  try {
    const { zones } = req.body;
    // zones là mảng: [{ section: 'VIP', price: 800000 }, ...]
    for (let zone of zones) {
      await Seat.updateMany({ section: zone.section }, { $set: { price: Number(zone.price) } });
    }
    
    // Bắn tín hiệu để toàn bộ client F5 lại giá mới
    if (req.io) req.io.emit('seatUpdated', { type: 'RELOAD' }); 
    
    res.json({ success: true, message: 'Đã cập nhật giá vé thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật giá.' });
  }
};

// [Quyền Admin] Tạo mới toàn bộ sơ đồ ghế (Danger Zone)
exports.generateMap = async (req, res) => {
  try {
    const { zones } = req.body;
    
    // Xóa sạch dữ liệu ghế cũ
    await Seat.deleteMany({}); 

    const seatsToInsert = [];
    zones.forEach(zone => {
      // Thuật toán sinh ghế: Lặp Hàng -> Lặp Số ghế
      for (let r = 1; r <= zone.rows; r++) {
        for (let s = 1; s <= zone.seatsPerRow; s++) {
          seatsToInsert.push({
            seatId: `${zone.section}${r}-${s}`, // VD: VIP1-1, A2-5
            section: zone.section,
            row: r,
            number: s,
            price: zone.price,
            status: 'available'
          });
        }
      }
    });

    // Bulk insert để tối ưu hiệu suất tạo hàng nghìn vé 1 lúc
    await Seat.insertMany(seatsToInsert);

    if (req.io) req.io.emit('seatUpdated', { type: 'RELOAD' }); 
    res.json({ success: true, message: 'Đã khởi tạo sơ đồ ghế thành công!' });
  } catch (error) {
    console.error("Lỗi generate map:", error);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo sơ đồ.' });
  }
};