const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, default: 'ÂM VANG TỔ QUỐC' },
  date: { type: String, default: '10.08.2025' },
  time: { type: String, default: '20:00' },
  location: { type: String, default: 'SVĐ Quốc Gia Mỹ Đình' },
  zones: { type: Array, default: [] },
  // ĐÃ THÊM: Mảng 9 ô grid (chứa ID của các Zone, null là ô trống)
  layout: { type: Array, default: [null, 'VIP', null, 'A', null, 'B', 'C', null, 'D'] } 
});

module.exports = mongoose.model('Event', eventSchema);