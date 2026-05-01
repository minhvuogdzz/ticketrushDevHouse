const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, default: 'ÂM VANG TỔ QUỐC' },
  date: { type: String, default: '10.08.2025' },
  time: { type: String, default: '20:00' },
  location: { type: String, default: 'SVĐ Quốc Gia Mỹ Đình' },
  zones: { type: Array, default: [] },
  layout: { type: Array, default: [null, 'VIP', null, 'A', null, 'B', 'C', null, 'D'] },
  // ĐÃ THÊM: Kích thước lưới kéo thả
  gridRows: { type: Number, default: 3 },
  gridCols: { type: Number, default: 3 }
});

module.exports = mongoose.model('Event', eventSchema);