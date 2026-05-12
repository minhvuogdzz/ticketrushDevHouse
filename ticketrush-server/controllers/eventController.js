const Event = require('../models/Event');

exports.getEventInfo = async (req, res) => {
  try {
    let event = await Event.findOne().sort({ _id: -1 });
    
    // Nếu chưa có event nào trong DB thì tự động tạo một cái mặc định
    if (!event) {
      event = await Event.create({
        name: 'ÂM VANG TỔ QUỐC',
        description: '',
        date: '10.08.2025',
        time: '20:00',
        location: 'SVĐ Mỹ Đình',
        
        banners: [], 
        
        lineupTitle: 'Dàn Line-up Đỉnh Cao',
        lineupBanners: [],
        lineupDescription: '',
        
        athleteTitle: 'Sự xuất hiện của các VĐV Kiệt Xuất',
        athleteBanners: [],
        athleteDescription: '',
        
        zones: [],
        layout: Array(9).fill(null),
        gridRows: 3,
        gridCols: 3
      });
    }
    
    res.json(event);
  } catch (error) {
    console.error("Lỗi lấy thông tin sự kiện:", error);
    res.status(500).json({ message: 'Lỗi lấy thông tin sự kiện từ database' });
  }
};

exports.updateEventInfo = async (req, res) => {
  try {
    // 1. Nhặt tất cả các trường được gửi lên từ Frontend (Admin)
    const { 
      name, description, date, time, location, 
      banners, 
      lineupTitle, lineupBanners, lineupDescription, 
      athleteTitle, athleteBanners, athleteDescription, 
      zones, layout, gridRows, gridCols 
    } = req.body;
    
    let event = await Event.findOne().sort({ _id: -1 });
    
    // Nếu lỡ DB bị xóa sạch thì tạo mới để lưu
    if (!event) event = new Event();

    // 2. Gán dữ liệu mới (chỉ gán nếu Frontend có gửi dữ liệu đó lên)
    // THÔNG TIN CƠ BẢN
    if (name !== undefined) event.name = name;
    if (description !== undefined) event.description = description; 
    if (date !== undefined) event.date = date;
    if (time !== undefined) event.time = time;
    if (location !== undefined) event.location = location;
    
    // BANNER HERO
    if (banners !== undefined) event.banners = banners;

    // DÀN LINE-UP
    if (lineupTitle !== undefined) event.lineupTitle = lineupTitle;
    if (lineupBanners !== undefined) event.lineupBanners = lineupBanners;
    if (lineupDescription !== undefined) event.lineupDescription = lineupDescription;
    
    // DÀN KHÁCH MỜI / VĐV
    if (athleteTitle !== undefined) event.athleteTitle = athleteTitle;
    if (athleteBanners !== undefined) event.athleteBanners = athleteBanners;
    if (athleteDescription !== undefined) event.athleteDescription = athleteDescription;

    // CẤU HÌNH SƠ ĐỒ VÀ GIÁ VÉ
    if (zones !== undefined) event.zones = zones;
    if (layout !== undefined) event.layout = layout;
    if (gridRows !== undefined) event.gridRows = gridRows;
    if (gridCols !== undefined) event.gridCols = gridCols;

    // 3. Lưu vào Database
    await event.save();
    
    res.json({ success: true, event });
  } catch (error) {
    console.error("Lỗi update event:", error);
    res.status(500).json({ message: 'Lỗi khi lưu thông tin sự kiện' });
  }
};