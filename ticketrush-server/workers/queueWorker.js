const cron = require('node-cron');
const Queue = require('../models/Queue');

const MAX_CONCURRENT_USERS = 1000;
const USERS_PER_TURN = 5;

const startQueueWorker = () => {
  cron.schedule('*/10 * * * * *', async () => {
    try {
      const activeUsersCount = await Queue.countDocuments({ status: 'allowed' });
      if (activeUsersCount < MAX_CONCURRENT_USERS) {
        const slotsAvailable = MAX_CONCURRENT_USERS - activeUsersCount;
        const usersToAdmit = Math.min(slotsAvailable, USERS_PER_TURN);

        if (usersToAdmit > 0) {
          const topWaitingUsers = await Queue.find({ status: 'waiting' }).sort({ joinedAt: 1 }).limit(usersToAdmit);
          if (topWaitingUsers.length > 0) {
            console.log(`🚪 Hàng chờ: Đang mở cổng cho ${topWaitingUsers.length} người vào mua vé...`);
            const userIds = topWaitingUsers.map(u => u._id);
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