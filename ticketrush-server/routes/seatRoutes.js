const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Lấy danh sách toàn bộ ghế
router.get('/', seatController.getAllSeats);

// Seed dữ liệu (chỉ dùng lúc đầu)
router.post('/seed', seatController.seedSeats);

// Các thao tác liên quan đến giữ vé, hủy vé và thanh toán
router.post('/lock', seatController.lockSeat);
router.post('/unlock', seatController.unlockSeat);
router.post('/checkout', seatController.checkoutSeats);

module.exports = router;