import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, handleLogout, onLoginClick, onTicketHistoryClick }) => {
  const navigate = useNavigate();
  
  // Biến kiểm tra xem user hiện tại có phải là admin không
  const isAdmin = user && user.role === 'admin';

  return (
    <nav className="flex justify-between items-center p-4 lg:px-20 border-b border-gray-800 bg-[#12141A] sticky top-0 z-40 shadow-lg">
      <div 
        onClick={() => navigate('/')}
        className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent cursor-pointer"
      >
        TICKETRUSH
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        
        {/* NÚT TRA CỨU VÉ: Chỉ hiện nếu KHÔNG PHẢI là Admin */}
        {!isAdmin && (
          <button 
            onClick={onTicketHistoryClick}
            className="text-white/90 hover:text-yellow-300 font-bold transition-colors flex items-center gap-2"
            title="Tra cứu vé"
          >
            <span className="text-2xl md:hidden animate-pulse">🎟️</span>
            <span className="hidden md:inline uppercase text-sm tracking-widest">Tra cứu vé</span>
          </button>
        )}

        {/* NÚT ADMIN SETUP: Chỉ hiện nếu LÀ Admin */}
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin')}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-black transition shadow-[0_0_15px_rgba(220,38,38,0.4)] uppercase text-xs md:text-sm flex items-center gap-2"
            title="Vào trang quản trị"
          >
            <span>⚙️</span>
            <span className="hidden md:inline">Admin Setup</span>
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-gray-700">
            <span className="hidden md:block text-white/90 text-sm">Chào, <b className={isAdmin ? "text-red-400" : "text-yellow-300"}>{user.username}</b></span>
            <button onClick={handleLogout} className="px-3 md:px-4 py-1.5 bg-gray-800 hover:bg-red-600 border border-gray-700 rounded-lg transition text-xs md:text-sm font-bold text-gray-300 hover:text-white">
              Đăng xuất
            </button>
          </div>
        ) : (
          <button 
             onClick={onLoginClick} 
             className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 md:px-6 py-2 rounded-lg font-black transition shadow-[0_0_15px_rgba(250,204,21,0.3)] uppercase text-xs md:text-sm"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
};

export default Header;