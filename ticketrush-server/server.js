require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// --- 1. IMPORT ROUTES & CONTROLLERS & WORKERS ---
const authRoutes = require('./routes/authRoutes');
const seatRoutes = require('./routes/seatRoutes');
const queueRoutes = require('./routes/queueRoutes'); 
const eventController = require('./controllers/eventController'); // ĐÃ ĐƯA LÊN ĐÂY
const startSeatReleaseWorker = require('./workers/seatWorker');
const startQueueWorker = require('./workers/queueWorker');

const app = express();
const server = http.createServer(app);

// --- 2. SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- 3. MIDDLEWARE (Đã có 50mb để chứa ảnh Base64) ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 4. KẾT NỐI DATABASE ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// --- 5. API ROUTES (BẮT BUỘC PHẢI KHAI BÁO TRƯỚC KHI LISTEN) ---
app.get('/', (req, res) => {
  res.send('🚀 Backend TicketRush đang chạy mượt mà trên cổng 5001!');
});

app.use('/api/seats', seatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);

// ĐÃ GOM ROUTE EVENT VÀO ĐÚNG CHỖ NÀY
app.get('/api/event', eventController.getEventInfo);
app.post('/api/event/update', eventController.updateEventInfo);

// --- 6. KHỞI ĐỘNG CÁC TRÌNH CHẠY NGẦM (WORKERS) ---
startSeatReleaseWorker(io); // Tự động nhả ghế sau 10 phút
startQueueWorker();         // Tự động mở cổng hàng chờ ảo

// --- 7. CHẠY SERVER ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server Backend chạy tại cổng ${PORT} & Socket.io đã sẵn sàng!`);
});