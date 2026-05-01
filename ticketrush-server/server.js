require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// --- 1. IMPORT ROUTES & WORKERS ---
const seatRoutes = require('./routes/seatRoutes');
const queueRoutes = require('./routes/queueRoutes'); 
const startSeatReleaseWorker = require('./workers/seatWorker');
const startQueueWorker = require('./workers/queueWorker');

const app = express();
const server = http.createServer(app);

// --- 2. CẤU HÌNH SOCKET.IO ---
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

// --- 3. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 4. KẾT NỐI DATABASE ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// --- 5. API ROUTES ---
app.get('/', (req, res) => {
  res.send('🚀 Backend TicketRush đang chạy mượt mà trên cổng 5001!');
});
app.use('/api/seats', seatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);

// --- 6. KHỞI ĐỘNG CÁC TRÌNH CHẠY NGẦM (WORKERS) ---
startSeatReleaseWorker(io); // Tự động nhả ghế sau 10 phút
startQueueWorker();         // Tự động mở cổng hàng chờ ảo

// --- 7. CHẠY SERVER ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server Backend chạy tại cổng ${PORT} & Socket.io đã sẵn sàng!`);
});

const eventController = require('./controllers/eventController');
app.get('/api/event', eventController.getEventInfo);
app.post('/api/event/update', eventController.updateEventInfo);