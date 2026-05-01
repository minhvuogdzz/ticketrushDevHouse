require('dotenv').config();
const mongoose = require('mongoose');
const Seat = require('./models/Seat');

const MONGODB_URI = process.env.MONGODB_URI;

// Cấu hình các khu vực
const sectionsConfig = [
  { id: 'VIP', name: 'Khán đài VIP', rows: 3, seatsPerRow: 10, price: 600000 },
  { id: 'A', name: 'Khán đài A', rows: 4, seatsPerRow: 8, price: 500000 },
  { id: 'B', name: 'Khán đài B', rows: 4, seatsPerRow: 8, price: 500000 },
  { id: 'C', name: 'Khán đài C', rows: 3, seatsPerRow: 12, price: 400000 },
  { id: 'D', name: 'Khán đài D', rows: 3, seatsPerRow: 12, price: 400000 },
];

const generateSeats = () => {
  let seats = [];
  sectionsConfig.forEach(section => {
    for (let r = 1; r <= section.rows; r++) {
      for (let s = 1; s <= section.seatsPerRow; s++) {
        seats.push({
          seatId: `${section.id}${r}${s}`, // VD: VIP15, A24
          section: section.id,
          row: r,
          number: s,
          price: section.price,
          status: 'available'
        });
      }
    }
  });
  return seats;
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB để tạo dữ liệu...');
    
    await Seat.deleteMany({}); // Xóa ghế cũ
    console.log('🗑️ Đã xóa dữ liệu ghế cũ.');

    const newSeats = generateSeats();
    await Seat.insertMany(newSeats);
    
    console.log(`🎉 Đã tạo thành công ${newSeats.length} ghế với cấu hình phân khu chuẩn!`);
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi tạo dữ liệu:', error);
    process.exit(1);
  }
};

seedDB();