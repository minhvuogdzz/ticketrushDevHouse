// src/pages/customer/EventDetailPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import SeatMatrix from '../../components/SeatMap/SeatMatrix'; 
import eventHeaderBg from '../../assets/image/co.jpg';

const EventDetailPage = () => {
  // eslint-disable-next-line no-unused-vars
  const { id } = useParams();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user } = useOutletContext() || {};
  
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans pb-20">
      {/* HEADER CHI TIẾT SỰ KIỆN */}
      {/* Đổi h-[40vh] thành h-screen để cao tràn full màn hình */}
      <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
        
        {/* ẢNH NỀN: inset-0, w-full, h-full, object-cover để tràn mọi góc độ */}
        <img 
          src={eventHeaderBg} 
          alt="Event Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 z-0" 
        />

        {/* Lớp phủ gradient tối để dễ đọc chữ */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a] z-10"></div>
        
        {/* Căn lề padding px-10 cho đồng bộ với phần sơ đồ bên dưới */}
        <div className="relative z-20 w-full px-4 md:px-10 h-full flex flex-col justify-end pb-16">
          <div className="flex flex-wrap items-center gap-3 mb-4">
             <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.4)]">
               Live Concert
             </span>
          </div>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-2xl">
            {eventData?.name || 'CHƯA CẬP NHẬT'}
          </h1>
          
          <div className="flex flex-wrap gap-6 text-sm md:text-lg text-gray-300 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⏰</span> {eventData?.time || '--:--'} | {eventData?.date || '--.--.----'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">📍</span> {eventData?.location || 'Đang cập nhật địa điểm...'}
            </div>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH: SƠ ĐỒ GHẾ & GIỎ HÀNG */}
      <div className="w-full px-4 md:px-10 mt-8">
        <div className="flex flex-col gap-8">
          
          {/* Banner thông báo đếm ngược */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-4 text-center md:text-left">
                <div className="text-3xl">🛡️</div>
                <div>
                   <h4 className="text-white font-black uppercase text-sm">Hệ thống giữ chỗ thông minh</h4>
                   <p className="text-gray-400 text-xs mt-1">Sau khi chọn ghế, bạn có 10 phút để hoàn tất thanh toán trước khi ghế được nhả ra cho người khác.</p>
                </div>
             </div>
             <div className="bg-black/40 px-6 py-2 rounded-xl border border-gray-700">
                <p className="text-[10px] text-gray-500 uppercase font-bold text-center">Trạng thái kết nối</p>
                <p className="text-green-500 font-black text-xs text-center animate-pulse">● ĐANG TRỰC TUYẾN</p>
             </div>
          </div>

          {/* COMPONENT SƠ ĐỒ GHẾ */}
          <div className="animate-fade-in-up">
            <SeatMatrix 
              eventData={eventData} 
              eventZones={eventData?.zones || []} 
            />
          </div>

          {/* PHẦN CHÚ THÍCH & HỖ TRỢ KỸ THUẬT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t border-gray-800 pt-10">
             <div>
                <h3 className="text-xl font-black text-white uppercase mb-4">Lưu ý khi mua vé</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                   <li className="flex gap-3"><span className="text-yellow-500">✓</span> Mỗi tài khoản có thể chọn nhiều ghế cùng lúc.</li>
                   <li className="flex gap-3"><span className="text-yellow-500">✓</span> Vui lòng kiểm tra kỹ thông tin Họ tên & SĐT trước khi quét mã QR.</li>
                   <li className="flex gap-3"><span className="text-yellow-500">✓</span> Vé điện tử sẽ được lưu trong mục "Tra cứu vé" ngay sau khi thanh toán.</li>
                </ul>
             </div>
             <div className="bg-[#12141A] p-6 rounded-2xl border border-gray-800">
                <h3 className="text-lg font-black text-white uppercase mb-2">Hỗ trợ kỹ thuật</h3>
                <p className="text-sm text-gray-500 mb-4">Nếu gặp sự cố trong quá trình thanh toán hoặc không nhận được vé, vui lòng liên hệ hotline:</p>
                <div className="flex items-center gap-4">
                   <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-black tracking-tighter">1900 8888</div>
                   <div className="text-xs text-gray-400">Hỗ trợ 24/7</div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;