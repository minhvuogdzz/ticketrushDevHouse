const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

router.post('/join', queueController.joinQueue);
router.get('/status/:userId', queueController.checkStatus);

module.exports = router;