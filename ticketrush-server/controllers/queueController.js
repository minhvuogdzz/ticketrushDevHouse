const Queue = require('../models/Queue');

// Giới hạn số người vào mua vé cùng lúc (Để test là 2, lúc nộp bài sếp chỉnh lên 100-500)
const MAX_CONCURRENT_USERS = 2; 

// 1. Hàm xin xếp hàng (Join Queue)
exports.joinQueue = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'Thiếu userId' });

  try {
    // 🔥 FIX LỖI E11000: Dùng findOneAndUpdate thay vì findOne + create
    // Nó đảm bảo dù gọi API 100 lần cùng lúc cũng chỉ tạo đúng 1 vé, không bao giờ bị Crash
    let userTicket = await Queue.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, status: 'waiting', joinedAt: new Date() } },
      { upsert: true, returnDocument: 'after' } // <--- Đã thay thế chuẩn theo tài liệu
    );

    // Thêm 1 lớp bảo hiểm chống giật lag mạng trả về rỗng:
    if (!userTicket) {
      userTicket = await Queue.findOne({ userId });
    }

    // Nếu đã được duyệt từ trước thì cho vào luôn 
    if (userTicket.status === 'allowed') {
      return res.status(200).json({ allowed: true });
    }

    // Đếm số lượng đang ở trong sân
    const activeUsersCount = await Queue.countDocuments({ status: 'allowed' });

    // Nếu sân chưa đầy
    if (activeUsersCount < MAX_CONCURRENT_USERS) {
      await Queue.updateOne(
        { _id: userTicket._id }, 
        { $set: { status: 'allowed' } }
      );
      return res.status(200).json({ allowed: true });
    }

    // Nếu đầy -> Tính vị trí
    const position = await Queue.countDocuments({ 
      status: 'waiting', 
      joinedAt: { $lt: userTicket.joinedAt } 
    }) + 1;

    res.status(200).json({ allowed: false, position });

  } catch (error) {
    console.error("Lỗi Queue:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Hàm kiểm tra trạng thái (Polling)
exports.checkStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const userTicket = await Queue.findOne({ userId });
    if (!userTicket) return res.status(404).json({ message: 'Không tìm thấy vé xếp hàng' });

    if (userTicket.status === 'allowed') {
      return res.status(200).json({ allowed: true });
    }

    const position = await Queue.countDocuments({ 
      status: 'waiting', 
      joinedAt: { $lt: userTicket.joinedAt } 
    }) + 1;

    res.status(200).json({ allowed: false, position });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Hàm rời khỏi hàng đợi (Leave Queue)
exports.leaveQueue = async (req, res) => {
  const { userId } = req.body;
  try {
    if (userId) {
      // Khách thoát trang hoặc đăng xuất -> Xé vé, xóa data khỏi bảng Queue
      await Queue.deleteOne({ userId });
      console.log(`[QUEUE] User ${userId} đã rời phòng chờ/trang mua vé. Nhả slot!`);
    }
    res.status(200).json({ success: true, message: 'Đã rời phòng chờ' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};