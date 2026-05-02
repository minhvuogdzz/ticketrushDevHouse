const Event = require('../models/Event');

exports.getEventInfo = async (req, res) => {
  try {
    let event = await Event.findOne().sort({ _id: -1 });
    if (!event) {
      event = await Event.create({
        name: 'ÂM VANG TỔ QUỐC',
        date: '10.08.2025',
        time: '20:00',
        location: 'SVĐ Mỹ Đình',
        zones: [],
        layout: Array(9).fill(null),
        gridRows: 3,
        gridCols: 3
      });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin' });
  }
};

exports.updateEventInfo = async (req, res) => {
  try {
    // Thêm description vào req.body
    const { name, description, date, time, location, zones, layout, gridRows, gridCols } = req.body;
    
    let event = await Event.findOne().sort({ _id: -1 });
    if (!event) event = new Event();

    if (name !== undefined) event.name = name;
    if (description !== undefined) event.description = description; // Đã thêm
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (location !== undefined) event.location = location;
    if (zones !== undefined) event.zones = zones;
    if (layout !== undefined) event.layout = layout;
    if (gridRows !== undefined) event.gridRows = gridRows;
    if (gridCols !== undefined) event.gridCols = gridCols;

    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    console.error("Lỗi update event:", error);
    res.status(500).json({ message: 'Lỗi khi lưu thông tin sự kiện' });
  }
};