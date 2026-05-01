const cron = require('node-cron');
const Seat = require('../models/Seat');

// Hàm khởi động Worker, nhận vào instance của Socket.io để phát sự kiện
const startSeatReleaseWorker = (io) => {
  // Chạy mỗi phút một lần ('* * * * *')
  cron.schedule('* * * * *', async () => {
    try {
      // Tính toán thời điểm 10 phút trước
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

      // Tìm tất cả các ghế đang 'Locked' mà thời gian khóa cũ hơn 10 phút trước
      const expiredSeats = await Seat.find({
        status: 'Locked',
        lockedAt: { $lte: tenMinutesAgo }
      });

      if (expiredSeats.length > 0) {
        console.log(`🧹 Đang dọn dẹp và nhả ${expiredSeats.length} ghế quá hạn...`);

        for (let seat of expiredSeats) {
          // Reset trạng thái ghế về Available
          seat.status = 'Available';
          seat.lockedBy = null;
          seat.lockedAt = null;
          await seat.save();

          // Báo cho toàn bộ Frontend biết để đổi màu ghế từ Vàng sang Xám
          io.emit('seatUpdated', seat);
        }
      }
    } catch (error) {
      console.error('Lỗi khi chạy Worker nhả ghế:', error);
    }
  });
};

module.exports = startSeatReleaseWorker;