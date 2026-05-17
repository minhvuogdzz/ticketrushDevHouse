import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TicketHistoryModal from '../common/TicketHistoryModal';
import axios from 'axios';

// IMPORT 2 COMPONENT MỚI TÁCH
import Header from './Header';
import Footer from './Footer';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showTicketHistory, setShowTicketHistory] = useState(false); 
  const [intendedRoute, setIntendedRoute] = useState(null);

  const [showSessionWarning, setShowSessionWarning] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ticketrush_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []); 

  // --- LOGIC ĐỒNG HỒ NGẦM 10 PHÚT ---
  useEffect(() => {
    if (!user || user.role === 'admin') return;

    const interval = setInterval(() => {
      const endTime = localStorage.getItem('ticketrush_session_end');
      if (endTime) {
        const remaining = Math.floor((parseInt(endTime) - Date.now()) / 1000);
        
        if (remaining === 60) {
          setShowSessionWarning(true);
        }
        
        if (remaining <= 0) {
          clearInterval(interval);
          handleForceLogout();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  // Bổ sung logic xé vé Hàng chờ ảo khi bị ép đăng xuất
  const handleForceLogout = async () => {
    if (user && user.userId) {
      try {
        // 1. Nhả toàn bộ ghế đang giữ
        await axios.post('http://localhost:5001/api/seats/unlock-all', { userId: user.userId });
        // 2. Nhả luôn Slot hàng chờ (Tránh hiệu ứng Bóng ma giữ chỗ)
        await axios.post('http://localhost:5001/api/queue/leave', { userId: user.userId });
      } catch (error) {
        console.error("Lỗi khi giải phóng vé và hàng chờ:", error);
      }
    }

    setShowSessionWarning(false);
    setUser(null);
    localStorage.removeItem('ticketrush_user');
    localStorage.removeItem('ticketrush_session_end');
    
    alert("⏳ Đã hết 10 phút giao dịch! Hệ thống đã đăng xuất và thu hồi lại vé trong giỏ hàng để nhường cơ hội cho người khác.");
    navigate('/');
    window.location.reload(); 
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const response = await axios.post(`http://localhost:5001${endpoint}`, authForm);
      if (authMode === 'login') {
        const userData = { 
          userId: response.data.userId, 
          username: response.data.username, 
          token: response.data.token,
          role: response.data.role 
        };
        setUser(userData);
        localStorage.setItem('ticketrush_user', JSON.stringify(userData));
        
        if (response.data.role !== 'admin') {
          // Lưu mốc 10 phút đếm ngược
          const newEndTime = Date.now() + 600 * 1000;
          localStorage.setItem('ticketrush_session_end', newEndTime.toString());
        }
        setShowAuth(false);
        
        if (intendedRoute) {
          navigate(intendedRoute);
          setIntendedRoute(null); 
        }
      } else {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setAuthMode('login');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ticketrush_user');
    localStorage.removeItem('ticketrush_session_end');
    navigate('/');
    window.location.reload();
  };

  // --- CÁC HÀM XỬ LÝ TRUYỀN XUỐNG HEADER ---
  const handleLoginClick = () => {
    setIntendedRoute(null);
    setShowAuth(true);
  };

  const handleTicketHistoryClick = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để tra cứu vé!");
      setIntendedRoute(null); 
      setShowAuth(true);
    } else {
      setShowTicketHistory(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans selection:bg-brand-secondary selection:text-white flex flex-col relative">
      
      {showSessionWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] bg-red-600 text-white px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.8)] border-2 border-red-400 flex items-center gap-4 animate-bounce">
          <span className="text-3xl">⚠️</span>
          <div>
            <p className="font-black text-lg uppercase tracking-wider">Cảnh báo hết hạn phiên!</p>
            <p className="text-sm">Bạn chỉ còn chưa đầy 1 phút để hoàn tất thanh toán. Hệ thống sẽ tự động đăng xuất.</p>
          </div>
          <button onClick={() => setShowSessionWarning(false)} className="ml-4 bg-black/30 hover:bg-black/50 p-2 rounded-lg font-bold text-xl">✕</button>
        </div>
      )}

      {/* COMPONENT HEADER ĐÃ ĐƯỢC TÁCH */}
      <Header 
        user={user} 
        handleLogout={handleLogout} 
        onLoginClick={handleLoginClick} 
        onTicketHistoryClick={handleTicketHistoryClick} 
      />

      <main className="flex-1">
        <Outlet context={{ user, setShowAuth, setIntendedRoute }} />
      </main>

      {/* COMPONENT FOOTER ĐÃ ĐƯỢC TÁCH */}
      <Footer />

      <TicketHistoryModal isOpen={showTicketHistory} onClose={() => setShowTicketHistory(false)} user={user} />

      {/* PHẦN MODAL AUTH GIỮ NGUYÊN BÊN LAYOUT CHÍNH ĐỂ DỄ QUẢN LÝ STATE */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 w-full max-w-md relative shadow-2xl animate-fade-in">
            <button onClick={() => setShowAuth(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">✕</button>
            <h2 className="text-3xl font-black text-center mb-8 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              {authMode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
            </h2>
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Tên tài khoản</label>
                <input type="text" required className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 transition" value={authForm.username} onChange={(e) => setAuthForm({...authForm, username: e.target.value})}/>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Mật khẩu</label>
                <input type="password" required className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 transition" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})}/>
              </div>
              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-lg mt-2 transition shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                {authMode === 'login' ? 'Xác nhận' : 'Tạo tài khoản'}
              </button>
            </form>
            <div className="mt-6 text-center text-gray-400 text-sm">
              {authMode === 'login' ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-yellow-500 hover:underline font-bold">
                {authMode === 'login' ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLayout;