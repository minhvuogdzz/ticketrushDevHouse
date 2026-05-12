const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, default: 'ÂM VANG TỔ QUỐC' },
  description: { type: String, default: 'Kỷ niệm 51 năm Giải phóng miền Nam, thống nhất đất nước. Cùng hòa chung nhịp đập tự hào tại "Concert Quốc Gia" lớn nhất năm.' },
  date: { type: String, default: '10.08.2025' },
  time: { type: String, default: '20:00' },
  location: { type: String, default: 'SVĐ Quốc Gia Mỹ Đình' },

  banners: { type: [String], default: [] },

  lineupTitle: { type: String, default: 'Dàn Line-up Đỉnh Cao' },
  lineupBanners: { type: [String], default: [] },
  lineupDescription: { type: String, default: '' },
  
  athleteTitle: { type: String, default: 'Sự xuất hiện của các VĐV Kiệt Xuất' },
  athleteBanners: { type: [String], default: [] },
  athleteDescription: { type: String, default: '' },

  zones: { type: Array, default: [] },
  layout: { type: Array, default: [null, 'VIP', null, 'A', null, 'B', 'C', null, 'D'] },
  gridRows: { type: Number, default: 3 },
  gridCols: { type: Number, default: 3 }
});

module.exports = mongoose.model('Event', eventSchema);