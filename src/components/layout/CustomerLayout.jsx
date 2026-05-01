import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import TicketHistoryModal from '../common/TicketHistoryModal';
import axios from 'axios';

const CustomerLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [showTicketHistory, setShowTicketHistory] = useState(false); 

  // ĐÃ THÊM: State ghi nhớ trang muốn đến sau khi đăng nhập
  const [intendedRoute, setIntendedRoute] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ticketrush_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const response = await axios.post(`http://localhost:5001${endpoint}`, authForm);
      if (authMode === 'login') {
        const userData = { userId: response.data.userId, username: response.data.username, token: response.data.token };
        setUser(userData);
        localStorage.setItem('ticketrush_user', JSON.stringify(userData));
        setShowAuth(false);
        
        // ĐÃ SỬA: Kiểm tra nếu có đích đến thì bay thẳng sang đó, không thì ở yên. (Bỏ reload trang cho mượt)
        if (intendedRoute) {
          navigate(intendedRoute);
          setIntendedRoute(null); // Reset lại
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
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white font-sans selection:bg-brand-secondary selection:text-white flex flex-col">
      <nav className="flex justify-between items-center p-6 lg:px-20 border-b border-gray-800 bg-[#12141A] sticky top-0 z-40 shadow-lg">
        <div 
          onClick={() => navigate('/')}
          className="text-2xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent cursor-pointer"
        >
          NATIONAL CONCERT
        </div>

        <div className="flex items-center gap-6 md:gap-8">
          <div className="hidden md:flex gap-6">
            <button 
              onClick={() => {
                if (!user) {
                  alert("Vui lòng đăng nhập để tra cứu vé!");
                  // Bấm tra cứu vé mà chưa login thì lúc login xong cứ đứng ở trang hiện tại
                  setIntendedRoute(null); 
                  setShowAuth(true);
                } else {
                  setShowTicketHistory(true);
                }
              }}
              className="text-white/90 hover:text-yellow-300 font-bold transition-colors uppercase text-sm tracking-widest"
            >
              Tra cứu vé
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-4 pl-2 md:pl-6 md:border-l border-white/20">
              <span className="hidden md:block text-white/90 text-sm">Chào, <b className="text-yellow-300">{user.username}</b></span>
              <button onClick={handleLogout} className="px-4 py-1.5 bg-red-900/50 hover:bg-red-600 border border-red-800/50 rounded-lg transition text-sm font-bold text-red-200 hover:text-white">
                Đăng xuất
              </button>
            </div>
          ) : (
            <button 
               onClick={() => {
                 setIntendedRoute(null);
                 setShowAuth(true);
               }} 
               className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-black transition shadow-[0_0_15px_rgba(250,204,21,0.3)] uppercase text-sm"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1">
        {/* ĐÃ SỬA: Truyền thêm hàm setIntendedRoute xuống cho các trang con */}
        <Outlet context={{ user, setShowAuth, setIntendedRoute }} />
      </main>

      <footer className="py-6 text-center text-gray-600 text-sm border-t border-gray-800 bg-[#0B0C10] mt-auto">
        &copy; 2026 TicketRush. All rights reserved.
      </footer>

      <TicketHistoryModal isOpen={showTicketHistory} onClose={() => setShowTicketHistory(false)} user={user} />

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
                <input 
                  type="text" required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 transition"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Mật khẩu</label>
                <input 
                  type="password" required
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 transition"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                />
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