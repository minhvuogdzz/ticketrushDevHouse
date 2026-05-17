const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// Xin vào hàng đợi
router.post('/join', queueController.joinQueue);

// Kiểm tra vị trí/trạng thái hàng đợi
router.get('/status/:userId', queueController.checkStatus);

// Tự động xóa vé khi thoát trang
router.post('/leave', queueController.leaveQueue);

module.exports = router;