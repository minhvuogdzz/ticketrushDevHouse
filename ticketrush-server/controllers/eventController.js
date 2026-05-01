const Event = require('../models/Event');

// Lấy thông tin sự kiện (Luôn lấy cái đầu tiên vì ta chỉ có 1 sự kiện chính)
exports.getEventInfo = async (req, res) => {
  try {
    let event = await Event.findOne();
    if (!event) {
      event = await Event.create({}); // Tạo mới nếu chưa có
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin sự kiện
exports.updateEventInfo = async (req, res) => {
  try {
    const { name, date, time, location, zones, layout } = req.body;
    let event = await Event.findOne();
    if (!event) event = new Event();
    
    if (name) event.name = name;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (zones) event.zones = zones;
    if (layout) event.layout = layout; // Ghi nhận vị trí kéo thả
    
    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lưu thông tin' });
  }
};