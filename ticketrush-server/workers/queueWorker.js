const cron = require('node-cron');
const Queue = require('../models/Queue');

// Bắt buộc đồng bộ số 2 này với số 2 trong queueController.js
const MAX_CONCURRENT_USERS = 2;
const USERS_PER_TURN = 5;

const startQueueWorker = () => {
  // Chạy ngầm mỗi 2 giây
  cron.schedule('*/2 * * * * *', async () => {
    try {
      const activeUsersCount = await Queue.countDocuments({ status: 'allowed' });
      
      if (activeUsersCount < MAX_CONCURRENT_USERS) {
        const slotsAvailable = MAX_CONCURRENT_USERS - activeUsersCount;
        const usersToAdmit = Math.min(slotsAvailable, USERS_PER_TURN);

        if (usersToAdmit > 0) {
          // Tìm những người đợi lâu nhất (sort theo joinedAt)
          const topWaitingUsers = await Queue.find({ status: 'waiting' }).sort({ joinedAt: 1 }).limit(usersToAdmit);
          
          if (topWaitingUsers.length > 0) {
            console.log(`🚪 Hàng chờ: Đang mở cổng cho ${topWaitingUsers.length} người vào mua vé...`);
            const userIds = topWaitingUsers.map(u => u._id);
            // Thăng cấp trạng thái cho họ
            await Queue.updateMany({ _id: { $in: userIds } }, { $set: { status: 'allowed' } });
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi chạy Worker Hàng chờ:', error);
    }
  });
};

module.exports = startQueueWorker;