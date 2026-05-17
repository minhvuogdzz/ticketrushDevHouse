const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Lấy danh sách toàn bộ ghế
router.get('/', seatController.getAllSeats);

// Seed dữ liệu
router.post('/seed', seatController.seedSeats);

// Các thao tác liên quan đến giữ vé, hủy vé và thanh toán
router.post('/lock', seatController.lockSeat);
router.post('/unlock', seatController.unlockSeat);
router.post('/checkout', seatController.checkoutSeats);
router.post('/unlock-all', seatController.unlockAllByUser);
router.post('/admin/cancel', seatController.adminCancelTicket);
router.post('/admin/update-prices', seatController.updatePrices);
router.post('/admin/generate-map', seatController.generateMap);

router.get('/admin/dashboard', seatController.getDashboardData);
router.post('/admin/refund-zone', seatController.refundZone);
router.post('/admin/refund-all', seatController.refundAll);
module.exports = router;