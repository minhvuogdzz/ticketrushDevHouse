import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SeatMatrix from '../../components/SeatMap/SeatMatrix';

// Import ảnh cờ từ thư mục local
import flagImg from '../../assets/image/co.jpg';

const EventDetailPage = () => {
  const { user, setShowAuth } = useOutletContext();
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(false);
  const [checkingQueue, setCheckingQueue] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const joinQueue = async () => {
      setCheckingQueue(true);
      try {
        const response = await axios.post('http://localhost:5001/api/queue/join', { userId: user.userId });
        if (response.data.allowed) {
          setIsAllowed(true);
        } else {
          // Rạp đông, đẩy sang trang Waiting Room kèm theo vị trí
          navigate('/waiting-room', { state: { position: response.data.position } });
        }
      } catch (error) {
        console.error('Lỗi khi vào hàng chờ:', error);
      } finally {
        setCheckingQueue(false);
      }
    };

    joinQueue();
  }, [user, navigate]);

  return (
    <div className="pb-20 bg-[#0B0C10] min-h-screen">
      {/* EVENT HERO SECTION - CỜ PHỦ KÍN BACKGROUND */}
      <div className="relative w-full h-[50vh] md:h-[65vh] flex items-center justify-center overflow-hidden border-b-4 border-yellow-500/80 shadow-[0_10px_40px_rgba(220,38,38,0.2)]">
        
        {/* Lớp nền màu tối (gradient) chèn lên trên cờ để chữ dễ đọc hơn */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/40 via-[#0B0C10]/70 to-[#0B0C10] z-10"></div>
        
        {/* LÁ CỜ LÀM BACKGROUND PHỦ TOÀN BỘ */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-80"
          style={{ backgroundImage: `url(${flagImg})` }}
        ></div>
        
        {/* Nội dung text nằm đè lên trên cờ */}
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-8">
          <span className="px-6 py-1.5 border border-yellow-500/50 text-yellow-400 rounded-full text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-6 bg-red-950/70 backdrop-blur-md shadow-lg">
            Concert Quốc Gia
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 uppercase tracking-tighter text-yellow-400 drop-shadow-[0_4px_20px_rgba(250,204,21,0.5)]">
            Âm Vang Tổ Quốc
          </h1>
          
          <p className="text-gray-100 text-sm md:text-lg font-medium mb-10 max-w-2xl leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4">
            Chào mừng Kỷ niệm <span className="text-yellow-400 font-bold text-xl md:text-2xl mx-1">51 năm</span> Ngày Giải phóng miền Nam, thống nhất đất nước <br className="hidden md:block" />
            <span className="text-yellow-500 text-xs md:text-sm tracking-widest font-bold">(30/04/1975 - 30/04/2026)</span>
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-yellow-100 font-semibold text-sm md:text-base bg-black/60 py-4 px-6 md:px-10 rounded-2xl backdrop-blur-md border border-yellow-600/30 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span> 
              <span>20:00 - 30/04/2026</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-yellow-600/50"></div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span> 
              <span>Sân vận động Quốc gia Mỹ Đình</span>
            </div>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH (Sơ đồ ghế) */}
      <div className="w-full mx-auto px-10 mt-8 md:mt-12">
        {!user ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm shadow-xl">
            <div className="text-5xl mb-4">🎟️</div>
            <h2 className="text-2xl mb-6 font-semibold text-gray-200">Vui lòng đăng nhập để tham gia mua vé</h2>
            <button onClick={() => setShowAuth(true)} className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              Đăng nhập ngay
            </button>
          </div>
        ) : checkingQueue ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <div className="w-14 h-14 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-300 font-medium text-lg animate-pulse">Đang kiểm tra kết nối rạp...</p>
          </div>
        ) : isAllowed ? (
          <SeatMatrix user={user} />
        ) : null}
      </div>
    </div>
  );
};

export default EventDetailPage;