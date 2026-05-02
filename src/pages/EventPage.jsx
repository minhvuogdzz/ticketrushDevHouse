// src/pages/EventPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

//artist
import imgQuangTho from '../assets/image/quangtho.jpg';
import imgDangDuong from '../assets/image/dangduong.webp';
import imgTungDuong from '../assets/image/tungduong.webp';
import imgSonTung from '../assets/image/mtp.jpg';
import imgVoHaTram from '../assets/image/vohatram.webp';
import imgHaLe from '../assets/image/hale.webp';
import imgNoo from '../assets/image/noo.webp';
import imgHoaMinzy from '../assets/image/hoaminzy.webp';
import imgQuanAP from '../assets/image/quanap.jpg';
import imgBuiTruongLinh from '../assets/image/buitruonglinh.jpg';
import imgDongHung from '../assets/image/donghung.webp';
import imgOplus from '../assets/image/oplus.jpg';

//athletes (Ông nhớ tải 3 ảnh này vào thư mục nhé)
import imgQuangHai from '../assets/image/quanghai.webp';
import imgDinhBac from '../assets/image/dinhbac.webp';
import imgAnThuyen from '../assets/image/anthuyen.png';

const EventPage = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // STATE: QUẢN LÝ NGHỆ SĨ & VĐV ĐANG ĐƯỢC HOVER ĐỂ PHÓNG TO
  const [hoveredArtist, setHoveredArtist] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEventInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/event');
        setEventData(response.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin sự kiện:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-yellow-500">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  // Mảng dữ liệu nghệ sĩ sử dụng biến ảnh đã import
  const artists = [
    { name: "Quang Thọ", role: "NSND", img: imgQuangTho },
    { name: "Đăng Dương", role: "NSƯT", img: imgDangDuong },
    { name: "Tùng Dương", role: "Ca sĩ", img: imgTungDuong },
    { name: "Sơn Tùng M-TP", role: "Ca sĩ", img: imgSonTung },
    { name: "Võ Hạ Trâm", role: "Ca sĩ", img: imgVoHaTram },
    { name: "Hà Lê", role: "Ca sĩ", img: imgHaLe },
    { name: "Noo Phước Thịnh", role: "Ca sĩ", img: imgNoo },
    { name: "Hoà Minzy", role: "Ca sĩ", img: imgHoaMinzy },
    { name: "Bùi Trường Linh", role: "Ca sĩ", img: imgBuiTruongLinh },
    { name: "Quân AP", role: "Ca sĩ", img: imgQuanAP },
    { name: "Đông Hùng", role: "Ca sĩ", img: imgDongHung },
    { name: "Oplus", role: "Nhóm nhạc", img: imgOplus },
  ];

  // Mảng dữ liệu cho Khách mời VĐV
  const athletes = [
    { name: "Quang Hải", role: "Tuyển thủ Quốc gia", img: imgQuangHai },
    { name: "Đình Bắc", role: "Tuyển thủ Quốc gia", img: imgDinhBac },
    { name: "An Thuyên", role: "Boy Hà Tĩnh", img: imgAnThuyen },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans pb-20 relative" fetchpriority="high">
      
      {/* HIỆU ỨNG BOOM DÙNG CHUNG CHO CẢ CA SĨ & VĐV */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none transition-all duration-500 ease-out 
          ${hoveredArtist ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      >
        {hoveredArtist && (
          // container cố định kích thước và aspect ratio 4:5
          <div className="relative animate-boom shadow-[0_0_150px_rgba(234,179,8,0.7)] rounded-3xl overflow-hidden border-4 md:border-8 border-yellow-500
                          w-[90vw] max-w-[320px] md:w-[80vw] md:max-w-[450px] aspect-[4/5]">
             <img 
               src={hoveredArtist.img} 
               alt={hoveredArtist.name} 
               // Image fills the aspect ratio container perfectly
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-black to-transparent text-center">
                <p className="text-yellow-400 font-black uppercase text-[10px] md:text-xs mb-1 tracking-widest">{hoveredArtist.role}</p>
                <h3 className="text-white font-black text-2xl md:text-3xl drop-shadow-[0_0_10px_rgba(254,240,138,0.7)]">{hoveredArtist.name}</h3>
             </div>
          </div>
        )}
      </div>

      {/* HEADER HERO */}
      <div className="relative w-full h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-[#1a0505] z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 z-0"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a] z-10"></div>
        
        <div className="relative z-20 w-full px-4 md:px-[60px] h-full flex flex-col justify-end pb-16">
          <div className="flex flex-wrap items-center gap-3 mb-4">
             <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Sự kiện chính luận</span>
             <span className="bg-white/10 Backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">Live Concert</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 uppercase tracking-tighter mb-6 filter drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            {eventData?.name || 'ĐANG TẢI...'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-10 max-w-3xl leading-relaxed">
            {eventData?.description || 'Đang cập nhật thông tin sự kiện...'}
          </p>
          <div className="flex flex-wrap gap-8 items-center bg-[#12141A] p-6 rounded-2xl border border-gray-800 shadow-xl max-w-fit">
            <div className="flex items-center gap-4 text-gray-300">
              <span className="text-5xl text-yellow-500">⏰</span>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Giờ | Ngày</p>
                <p className="text-2xl font-black text-white">{eventData?.time || '--:--'} | {eventData?.date || '--.--.----'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <span className="text-5xl text-yellow-500">📍</span>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Địa điểm</p>
                <p className="text-2xl font-black text-white">{eventData?.location || 'Đang cập nhật...'}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/event/âm-vang-tổ-quốc')}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-5 rounded-full font-black uppercase transition shadow-lg shadow-yellow-500/20 text-lg hover:-translate-y-1 hover:scale-105"
            >
              MUA VÉ NGAY
            </button>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH (DÀN CA SĨ VÀ VĐV) */}
      <div className="w-full px-4 md:px-[60px] mt-20">
        <div className="mb-10">
          <div className="text-center mb-12">
             <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Dàn <span className="text-yellow-500">Line-up</span> Đỉnh Cao</h2>
             <p className="text-gray-400 max-w-2xl mx-auto">Quy tụ những giọng ca thực lực đa thế hệ và sự xuất hiện bất ngờ của các người hùng thể thao.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.map((artist, idx) => (
              <div 
                key={idx} 
                className="relative overflow-hidden rounded-2xl border border-gray-800 bg-[#111] aspect-[4/5] group cursor-pointer transition-all duration-300 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] origin-center"
                onMouseEnter={() => setHoveredArtist(artist)}
                onMouseLeave={() => setHoveredArtist(null)}
              >
                 <img
                   src={artist.img}
                   alt={artist.name}
                   className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40"
                 />
                 
                 <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"></div>

                 <div className="absolute inset-0 p-4 flex flex-col items-center justify-end z-20 pb-4">
                    <span className="text-[10px] text-gray-400 group-hover:text-yellow-400 uppercase font-black mb-1 tracking-widest transition-colors duration-300">
                      {artist.role}
                    </span>
                    <h4 className="text-white font-black text-lg text-center group-hover:text-yellow-400 group-hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] transition-all">
                      {artist.name}
                    </h4>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION VẬN ĐỘNG VIÊN CÓ HIỆU ỨNG BOOM */}
        <div className="mt-20 mb-24 border-t border-gray-800 pt-16">
           <div className="text-center mb-10">
               <p className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-2">Khách mời đặc biệt</p>
               <h3 className="text-3xl md:text-5xl font-black text-yellow-500 uppercase tracking-tight">Sự xuất hiện của các VĐV Kiệt Xuất</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
             {athletes.map((athlete, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden rounded-3xl border border-gray-800 bg-[#111] aspect-[4/5] group cursor-pointer transition-all duration-300 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                  // GỌI HIỆU ỨNG BOOM DÙNG CHUNG TẠI ĐÂY
                  onMouseEnter={() => setHoveredArtist(athlete)}
                  onMouseLeave={() => setHoveredArtist(null)}
                >
                   <img src={athlete.img} alt={athlete.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40" />
                   <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100"></div>
                   <div className="absolute inset-0 p-6 flex flex-col items-center justify-end z-20 pb-8 transition-all">
                      <span className="text-xs text-gray-400 group-hover:text-yellow-400 uppercase font-black tracking-widest mb-2 transition-colors duration-300">{athlete.role}</span>
                      <h4 className="text-white font-black text-2xl text-center group-hover:text-yellow-400 group-hover:drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] transition-all">{athlete.name}</h4>
                   </div>
                </div>
             ))}
           </div>
        </div>

      </div>
      
      <style>{`
        @keyframes boom {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-boom {
          animation: boom 0.4s ease-out forwards;
        }
      `}</style>

    </div>
  );
};

export default EventPage;