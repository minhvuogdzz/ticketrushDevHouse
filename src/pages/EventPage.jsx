import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';

const EventPage = () => {
  const navigate = useNavigate();
  const { user, setShowAuth, setIntendedRoute } = useOutletContext() || {};
  
  // State lưu thông tin sự kiện lấy từ Database
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Lấy thông tin sự kiện từ Backend
    const fetchEventData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/event');
        setEventData(response.data);
      } catch (error) {
        console.error("Lỗi tải thông tin sự kiện:", error);
      }
    };
    fetchEventData();
  }, []);

  const handleBookingClick = () => {
    if (!user) {
      alert("Vui lòng đăng nhập hệ thống để có thể vào sơ đồ đặt vé!");
      if (setIntendedRoute) setIntendedRoute('/event/1');
      if (setShowAuth) setShowAuth(true); 
    } else {
      navigate('/event/1'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-yellow-500 selection:text-black">
      <section className="relative w-full h-[80vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-[#1a0505] z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 z-0"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-12 animate-fade-in">
          <p className="text-yellow-500 font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base drop-shadow-lg">
            Chương trình nghệ thuật chính luận
          </p>
          {/* TÊN SỰ KIỆN ĐỘNG */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 uppercase tracking-tighter mb-6 filter drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            {eventData?.name || 'ĐANG TẢI...'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-10 max-w-3xl mx-auto leading-relaxed">
            Kỷ niệm 51 năm Giải phóng miền Nam, thống nhất đất nước. Cùng hòa chung nhịp đập tự hào tại "Concert Quốc Gia" lớn nhất năm.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
             <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-gray-800">
               <span className="text-2xl">⏰</span>
               <div className="text-left">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Thời gian</p>
                  {/* GIỜ & NGÀY ĐỘNG */}
                  <p className="text-white font-bold">{eventData?.time || '--:--'} - {eventData?.date || '--.--.----'}</p>
               </div>
             </div>
             <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-gray-800">
               <span className="text-2xl">📍</span>
               <div className="text-left">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Địa điểm</p>
                  {/* ĐỊA ĐIỂM ĐỘNG */}
                  <p className="text-white font-bold">{eventData?.location || 'Đang cập nhật'}</p>
               </div>
             </div>
          </div>

          <button 
            onClick={handleBookingClick} 
            className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-black transition-all duration-300 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] uppercase tracking-widest text-lg overflow-hidden"
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-full group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-2">🎫 Đặt vé ngay <span className="group-hover:translate-x-2 transition-transform">→</span></span>
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
      </section>

      <section className="w-full px-6 py-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-3xl border border-gray-800 hover:border-red-900 transition-colors shadow-2xl">
            <div className="w-14 h-14 bg-red-950/50 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-red-900/50">🔥</div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase">Trải nghiệm Mãn nhãn</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Sự kết hợp hoàn hảo giữa âm nhạc thiêng liêng, trình diễn sân khấu đỉnh cao, cùng công nghệ <b>Mapping 3D</b> và hiệu ứng ánh sáng hiện đại.
            </p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-3xl border border-gray-800 hover:border-yellow-900 transition-colors shadow-2xl transform md:-translate-y-6">
            <div className="w-14 h-14 bg-yellow-950/50 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-yellow-900/50">🇻🇳</div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase">50.000 Trái Tim</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Dự kiến quy tụ 50.000 khán giả có mặt tại sân vận động để cùng hòa chung giọng hát Quốc ca, tạo nên khoảnh khắc lịch sử chấn động.
            </p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-3xl border border-gray-800 hover:border-blue-900 transition-colors shadow-2xl">
            <div className="w-14 h-14 bg-blue-950/50 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-blue-900/50">📡</div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase">Phủ Sóng Toàn Quốc</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Truyền hình trực tiếp trên các kênh truyền hình lớn và tiếp sóng đồng loạt trên các đài địa phương, lan tỏa tinh thần dân tộc.
            </p>
          </div>
        </div>

        <div className="mb-24">
          <div className="text-center mb-12">
             <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Dàn <span className="text-yellow-500">Line-up</span> Đỉnh Cao</h2>
             <p className="text-gray-400 max-w-2xl mx-auto">Quy tụ những giọng ca thực lực đa thế hệ và sự xuất hiện bất ngờ của các người hùng thể thao.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Thu Huyền", role: "NSND", color: "from-red-600 to-red-900" },
              { name: "Đăng Dương", role: "NSƯT", color: "from-red-600 to-red-900" },
              { name: "Tùng Dương", role: "Ca sĩ", color: "from-gray-700 to-gray-900" },
              { name: "Phạm Thu Hà", role: "Ca sĩ", color: "from-gray-700 to-gray-900" },
              { name: "Võ Hạ Trâm", role: "Ca sĩ", color: "from-gray-700 to-gray-900" },
              { name: "Hà Lê", role: "Ca sĩ", color: "from-gray-700 to-gray-900" },
              { name: "Noo Phước Thịnh", role: "Ca sĩ", color: "from-gray-700 to-gray-900" },
              { name: "Tóc Tiên", role: "Ca sĩ", color: "from-gray-700 to-gray-900" },
              { name: "Thanh Duy", role: "Ca sĩ", color: "from-gray-700 to-gray-900" },
              { name: "Suboi", role: "Rapper", color: "from-gray-700 to-gray-900" },
              { name: "Đông Hùng", role: "Ca sĩ", color: "from-gray-700 to-gray-900" },
              { name: "Oplus", role: "Nhóm nhạc", color: "from-gray-700 to-gray-900" },
            ].map((artist, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${artist.color} p-1 rounded-2xl hover:-translate-y-2 transition-transform duration-300 shadow-lg cursor-pointer group`}>
                 <div className="bg-[#111] h-full w-full rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-widest">{artist.role}</span>
                    <h4 className="text-white font-black text-lg group-hover:text-yellow-400 transition-colors">{artist.name}</h4>
                 </div>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-gradient-to-r from-yellow-900/40 via-black to-yellow-900/40 border border-yellow-600/30 rounded-2xl p-6 text-center">
             <p className="text-gray-300">Cùng sự xuất hiện đặc biệt của các VĐV kiệt xuất:</p>
             <h4 className="text-2xl font-black text-yellow-500 mt-2">Quang Hải — Ánh Viên — Lê Văn Công</h4>
          </div>
        </div>

        <div className="bg-[#111] rounded-3xl p-8 md:p-12 border border-gray-800 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full"></div>
           <div className="flex-1 z-10">
              <h2 className="text-3xl font-black text-white uppercase mb-4">Câu chuyện âm nhạc</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                 Kịch bản được xây dựng theo phong cách <b>Chính luận – Nghệ thuật</b>. Một chuyến tàu thời gian tái hiện trọn vẹn chặng đường đấu tranh gian khổ, xây dựng và phát triển đất nước phồn vinh qua âm nhạc, hình ảnh và lời dẫn xúc động.
              </p>
              <div className="flex gap-4">
                 <div className="bg-black px-4 py-2 rounded-lg border border-gray-800 text-sm"><span className="text-gray-500">Đồng tổ chức:</span> <br/><b className="text-white">Báo Nhân Dân</b></div>
                 <div className="bg-black px-4 py-2 rounded-lg border border-gray-800 text-sm"><span className="text-gray-500">Phối hợp:</span> <br/><b className="text-white">UBND TP. Hà Nội</b></div>
              </div>
           </div>
           <div className="md:w-1/3 flex justify-center z-10 w-full">
              <button 
                onClick={handleBookingClick} 
                className="w-full h-full bg-red-700 hover:bg-red-600 text-white font-black text-xl md:text-2xl uppercase tracking-widest py-6 md:py-10 rounded-2xl border border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all active:scale-95"
              >
                Vào Sơ Đồ <br/> Đặt Vé Ngay
              </button>
           </div>
        </div>
      </section>

      {/* FIXED BOTTOM CTA CHO MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black to-transparent z-50">
         <button 
            onClick={handleBookingClick} 
            className="w-full bg-yellow-500 text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] uppercase tracking-wider text-lg"
          >
           Mua vé ngay
         </button>
      </div>
    </div>
  );
};

export default EventPage;