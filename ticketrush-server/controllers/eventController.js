const Event = require('../models/Event');

// 1. Lấy thông tin sự kiện
exports.getEventInfo = async (req, res) => {
  try {
    // Tìm event, ưu tiên lấy cái mới nhất nếu lỡ DB bị tạo đúp
    let event = await Event.findOne().sort({ _id: -1 }); 
    
    // Nếu rạp chưa có sự kiện nào thì tạo mặc định
    if (!event) {
      event = await Event.create({
        name: 'ÂM VANG TỔ QUỐC',
        date: '10.08.2025',
        time: '20:00',
        location: 'SVĐ Quốc Gia Mỹ Đình',
        zones: [],
        layout: [null, 'VIP', null, 'A', null, 'B', 'C', null, 'D']
      });
    }
    
    res.json(event);
  } catch (error) {
    console.error("Lỗi get event:", error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin sự kiện' });
  }
};

// 2. Cập nhật thông tin sự kiện & Sơ đồ
exports.updateEventInfo = async (req, res) => {
  try {
    const { name, date, time, location, zones, layout, gridRows, gridCols } = req.body;
    
    let event = await Event.findOne().sort({ _id: -1 });
    if (!event) event = new Event();

    if (name !== undefined) event.name = name;
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (location !== undefined) event.location = location;
    if (zones !== undefined) event.zones = zones;
    if (layout !== undefined) event.layout = layout;
    
    // ĐÃ THÊM: Lưu cấu hình dòng, cột
    if (gridRows !== undefined) event.gridRows = gridRows;
    if (gridCols !== undefined) event.gridCols = gridCols;

    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    console.error("Lỗi update event:", error);
    res.status(500).json({ message: 'Lỗi khi lưu thông tin sự kiện' });
  }
};