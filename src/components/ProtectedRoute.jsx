import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // 1. Móc thông tin user từ LocalStorage ra (Giả sử lúc đăng nhập lưu tên là 'ticketrush_user')
  const userString = localStorage.getItem('ticketrush_user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. Chặn cửa 1: Chưa đăng nhập hoặc không có data ép về Trang chủ
  if (!user) {
    alert("Bạn chưa đăng nhập!"); // Thêm cái thông báo cho biết lý do bị chặn
    return <Navigate to="/" replace />;
  }

  // 3. Chặn cửa 2: khác admin ép về Trang chủ
  if (user.role !== 'admin') {
    alert("Khu vực cấm! Bạn không có quyền Admin.");
    return <Navigate to="/" replace />;
  }

  // 4. Nếu qua được hết các ải -> Mở cổng cho render các trang con bên trong
  return <Outlet />;
};

export default ProtectedRoute;