import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout chung
import CustomerLayout from "./components/layout/CustomerLayout";

// Import các Trang con
import EventPage from './pages/EventPage'; // NHỚ IMPORT TRANG SỰ KIỆN VÀO ĐÂY
import EventDetailPage from './pages/customer/EventDetailPage'; 
import WaitingRoomPage from './pages/customer/WaitingRoomPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Layout dùng chung cho Khách hàng */}
        <Route path="/" element={<CustomerLayout />}>
          
          {/* ĐÃ SỬA: Mặc định vào web (route '/') sẽ hiện trang Landing Sự Kiện */}
          <Route index element={<EventPage />} />
          
          {/* Trang Chi tiết sự kiện (Có sơ đồ ghế) */}
          <Route path="event/:id" element={<EventDetailPage />} />
          
          {/* Trang Hàng chờ ảo */}
          <Route path="waiting-room" element={<WaitingRoomPage />} />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;