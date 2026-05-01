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

// Hàm lấy toàn bộ danh sách ghế để hiển thị lên màn hình
exports.getAllSeats = async (req, res) => {
  try {
    const seats = await Seat.find().sort({ seatId: 1 }); // Sắp xếp theo ID
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

