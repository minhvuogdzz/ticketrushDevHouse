import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout và Khách hàng
import CustomerLayout from "./components/layout/CustomerLayout";
import EventPage from './pages/EventPage'; 
import EventDetailPage from './pages/customer/EventDetailPage'; 
import WaitingRoomPage from './pages/customer/WaitingRoomPage';
import ManageEventsPage from './pages/admin/ManageEventsPage';

// Import Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Nhánh dành cho Khách hàng */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<EventPage />} />
          <Route path="event/:id" element={<EventDetailPage />} />
          <Route path="waiting-room" element={<WaitingRoomPage />} />
        </Route>

        {/* Nhánh độc lập dành cho Admin */}
        <Route path="/admin">
          <Route index element={<AdminDashboardPage />} />
          <Route path="events" element={<ManageEventsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;