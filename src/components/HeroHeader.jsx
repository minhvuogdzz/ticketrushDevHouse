import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// THÊM: prop hideButton
const HeroHeader = ({ eventData, hideButton }) => { 
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = eventData?.banners?.length > 0 
    ? eventData.banners 
    : ['https://www.transparenttextures.com/patterns/stardust.png'];

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    // THAY ĐỔI: Chỉnh height từ h-[80vh] thành min-h-[80vh] md:h-[100vh] để nó tràn full màn hình trang Detail cho ngầu
    <div className="relative w-full min-h-[80vh] md:h-screen overflow-hidden bg-black flex items-center justify-center">
      
      {banners.map((url, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img 
            src={url} 
            alt={`Slide ${idx}`} 
            className="w-full h-full object-cover aspect-[5/4] md:aspect-auto" 
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a] z-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-black/30 z-20 pointer-events-none"></div>
      
      {banners.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden relative cursor-pointer"
            >
              {idx === currentSlide && (
                <div key={currentSlide} className="h-full bg-yellow-500 animate-slider-progress w-full origin-left"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ĐÃ CHỈNH SỬA: Thay đổi margin/padding để nó nằm sát bên dưới cho đẹp */}
      <div className="relative z-30 w-full px-4 md:px-10 flex flex-col justify-end pb-16 md:pb-24 h-full">
        <div className="flex flex-wrap items-center gap-3 mb-4">
           <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.4)]">Live Concert</span>
        </div>
        <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-100 to-yellow-500 uppercase tracking-tighter mb-4 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          {eventData?.name || 'ĐANG TẢI...'}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 font-light mb-8 max-w-3xl leading-relaxed drop-shadow-md">
          {eventData?.description || 'Đang cập nhật thông tin sự kiện...'}
        </p>
        <div className="flex flex-wrap gap-8 items-center bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-2xl max-w-fit">
          <div className="flex items-center gap-4 text-gray-300">
            <span className="text-4xl text-yellow-500">⏰</span>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Giờ | Ngày</p>
              <p className="text-xl font-black text-white">{eventData?.time || '--:--'} | {eventData?.date || '--.--.----'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-300">
            <span className="text-4xl text-yellow-500">📍</span>
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">Địa điểm</p>
              <p className="text-xl font-black text-white">{eventData?.location || 'Đang cập nhật...'}</p>
            </div>
          </div>
          
          {/* ĐÃ THÊM: Nếu hideButton = true (gọi từ trang Detail) thì nó sẽ không hiện cái này */}
          {!hideButton && (
            <button 
              onClick={() => navigate('/event/âm-vang-tổ-quốc')}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-4 rounded-full font-black uppercase transition shadow-[0_0_20px_rgba(234,179,8,0.4)] text-lg hover:-translate-y-1 hover:scale-105"
            >
              MUA VÉ NGAY
            </button>
          )}

        </div>
      </div>

      <style>{`
        @keyframes sliderProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-slider-progress {
          animation: sliderProgress 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default HeroHeader;