import React, { useState, useEffect } from 'react';

// COMPONENT CON: XỬ LÝ TRƯỢT SLIDE (SWIPE / DRAG)
const SwipeSlider = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    if (banners.length <= 1 || isDragging) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length, isDragging, currentIndex]);

  const handleStart = (clientX) => {
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX) => {
    if (!isDragging || startX === null) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (translateX < -50) {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    } else if (translateX > 50) {
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    }
    setTranslateX(0);
  };

  return (
    <div 
      className="relative w-full aspect-[2/1] bg-black overflow-hidden border border-gray-800 shadow-[0_0_40px_rgba(234,179,8,0.1)] cursor-grab active:cursor-grabbing select-none"
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      <div 
        className="flex w-full h-full"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${translateX}px))`,
          transition: isDragging ? 'none' : 'transform 0.4s ease-out'
        }}
      >
        {banners.map((url, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0">
            <img src={url} alt={`Banner-${idx}`} className="w-full h-full object-cover" draggable="false" />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { 
                e.stopPropagation(); 
                setCurrentIndex(idx); 
              }}
              className="w-10 h-1.5 bg-black/50 rounded-full overflow-hidden relative cursor-pointer border border-white/10 transition-transform hover:scale-110"
            >
              {idx === currentIndex && (
                <div key={currentIndex} className="h-full bg-yellow-500 animate-slider-progress w-full origin-left"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// COMPONENT CHÍNH
const LineupSection = ({ eventData }) => {
  // 1. ĐIỀU KIỆN KIỂM TRA TỒN TẠI DỮ LIỆU
  // Chỉ coi là CÓ DỮ LIỆU khi: Admin up ít nhất 1 ảnh HOẶC Admin có gõ nội dung vào ô Mô tả.
  const hasLineup = eventData?.lineupBanners?.length > 0 || (eventData?.lineupDescription && eventData.lineupDescription.trim() !== '');
  const hasAthlete = eventData?.athleteBanners?.length > 0 || (eventData?.athleteDescription && eventData.athleteDescription.trim() !== '');

  // Nếu sự kiện này Admin không cấu hình CẢ 2 phần -> Trả về null (Tàng hình hoàn toàn, không dư 1px padding nào)
  if (!hasLineup && !hasAthlete) {
    return null;
  }

  return (
    <div className="w-full px-4 md:px-[60px] mt-24">
      
      {/* --- PHẦN 1: DÀN LINE-UP NGHỆ SĨ (Chỉ hiện nếu hasLineup = true) --- */}
      {hasLineup && (
        <div className="mb-24">
          <div className="text-center mb-10">
             <h2 className="text-4xl font-black text-yellow-500 uppercase tracking-tight mb-4">
               {eventData?.lineupTitle || 'Dàn Line-up Đỉnh Cao'}
             </h2>
             {eventData?.lineupDescription && (
               <p className="text-gray-400 max-w-5xl mx-auto text-start text-lg leading-relaxed whitespace-pre-line">
                 {eventData.lineupDescription}
               </p>
             )}
          </div>
          
          {/* Nếu có ảnh thì mới gọi Slider ra, không thì chỉ hiện Title và Text */}
          {eventData?.lineupBanners?.length > 0 && (
             <SwipeSlider banners={eventData.lineupBanners} />
          )}
        </div>
      )}

      {/* --- PHẦN 2: KHÁCH MỜI VẬN ĐỘNG VIÊN (Chỉ hiện nếu hasAthlete = true) --- */}
      {hasAthlete && (
        <div className="mb-24 border-t border-gray-800 pt-20">
           <div className="text-center mb-10">
               <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Khách mời đặc biệt</p>
               <h3 className="text-3xl font-black text-yellow-500 uppercase tracking-tight mb-4">
                  {eventData?.athleteTitle || 'Sự xuất hiện của các VĐV Kiệt Xuất'}
               </h3>
               {eventData?.athleteDescription && (
                 <p className="text-gray-400 max-w-5xl mx-auto text-start text-lg leading-relaxed whitespace-pre-line">
                   {eventData.athleteDescription}
                 </p>
               )}
           </div>

           {/* Nếu có ảnh thì mới gọi Slider ra, không thì chỉ hiện Title và Text */}
           {eventData?.athleteBanners?.length > 0 && (
             <SwipeSlider banners={eventData.athleteBanners} />
           )}
        </div>
      )}

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

export default LineupSection;