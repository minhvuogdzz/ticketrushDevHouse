const Queue = require('../models/Queue');

// Sức chứa tối đa của phòng vé (Ví dụ: 10 người cho dễ test, thực tế có thể là 1000)
const MAX_CONCURRENT_USERS = 10; 

// 1. Hàm xin xếp hàng
exports.joinQueue = async (req, res) => {
  const { userId } = req.body;

  try {
    // Kiểm tra xem user này đã xếp hàng chưa
    let userTicket = await Queue.findOne({ userId });
    
    if (!userTicket) {
      userTicket = await Queue.create({ userId });
    }

    // Nếu đã được cấp quyền thì cho vào luôn
    if (userTicket.status === 'allowed') {
      return res.status(200).json({ allowed: true });
    }

    // Đếm số người đang mua vé (status: allowed)
    const activeUsersCount = await Queue.countDocuments({ status: 'allowed' });

    // Nếu rạp chưa đầy, cấp quyền luôn không cần chờ
    if (activeUsersCount < MAX_CONCURRENT_USERS) {
      userTicket.status = 'allowed';
      await userTicket.save();
      return res.status(200).json({ allowed: true });
    }

    // Nếu rạp đầy, tính toán vị trí của user trong hàng đợi (những người vào trước user này)
    const position = await Queue.countDocuments({ 
      status: 'waiting', 
      joinedAt: { $lt: userTicket.joinedAt } 
    }) + 1;

    res.status(200).json({ allowed: false, position });

  } catch (error) {
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

    // Cập nhật lại vị trí hiện tại
    const position = await Queue.countDocuments({ 
      status: 'waiting', 
      joinedAt: { $lt: userTicket.joinedAt } 
    }) + 1;

    res.status(200).json({ allowed: false, position });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};