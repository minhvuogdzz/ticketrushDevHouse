const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatId: { type: String, required: true, unique: true }, // Mã ghế (VD: VIP1, A12)
  section: { type: String, required: true }, // Khu vực (VIP, A, B, C, D)
  row: { type: Number, required: true },
  number: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'locked', 'sold'], default: 'available' },
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lockExpires: { type: Date, default: null },
  
  // ĐÃ THÊM 2 TRƯỜNG NÀY ĐỂ ĐỊNH DANH NGƯỜI MUA CHÍNH CHỦ
  customerName: { type: String, default: null },
  customerPhone: { type: String, default: null }
});

module.exports = mongoose.model('Seat', seatSchema);