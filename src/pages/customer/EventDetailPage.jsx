import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import SeatMatrix from '../../components/SeatMap/SeatMatrix'; 

// 1. call API get layout
import HeroHeader from '../../components/HeroHeader';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      
      {/* 2. SỬ DỤNG COMPONENT: Truyền data xuống và ra lệnh giấu cái nút mua vé đi */}
      <HeroHeader eventData={eventData} hideButton={true} />

      {/* NỘI DUNG CHÍNH: SƠ ĐỒ GHẾ & GIỎ HÀNG */}
      <div className="w-full px-4 md:px-10 mt-8">
        <div className="flex flex-col gap-8">
          
          {/* Banner thông báo đếm ngược */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
             <div className="flex items-center gap-4 text-center md:text-left">
                <div className="text-3xl drop-shadow-md">🛡️</div>
                <div>
                   <h4 className="text-white font-black uppercase text-sm tracking-wide">Hệ thống giữ chỗ thông minh</h4>
                   <p className="text-gray-400 text-xs mt-1">Sau khi chọn ghế, bạn có 10 phút để hoàn tất thanh toán trước khi ghế được nhả ra cho người khác.</p>
                </div>
             </div>
             <div className="bg-black/40 px-6 py-2 rounded-xl border border-gray-700 shadow-inner">
                <p className="text-[10px] text-gray-500 uppercase font-bold text-center tracking-widest mb-1">Trạng thái kết nối</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <p className="text-green-500 font-black text-xs text-center tracking-wide">ĐANG TRỰC TUYẾN</p>
                </div>
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
                <h3 className="text-xl font-black text-white uppercase mb-4 tracking-wide">Lưu ý khi mua vé</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                   <li className="flex gap-3 items-start"><span className="text-yellow-500 text-lg leading-none">✓</span> <span className="pt-0.5">Mỗi tài khoản có thể chọn nhiều ghế cùng lúc.</span></li>
                   <li className="flex gap-3 items-start"><span className="text-yellow-500 text-lg leading-none">✓</span> <span className="pt-0.5">Vui lòng kiểm tra kỹ thông tin Họ tên & SĐT trước khi quét mã QR.</span></li>
                   <li className="flex gap-3 items-start"><span className="text-yellow-500 text-lg leading-none">✓</span> <span className="pt-0.5">Vé điện tử sẽ được lưu trong mục "Tra cứu vé" ngay sau khi thanh toán.</span></li>
                </ul>
             </div>
             <div className="bg-[#12141A] p-6 rounded-2xl border border-gray-800 shadow-xl">
                <h3 className="text-lg font-black text-white uppercase mb-2 tracking-wide">Hỗ trợ kỹ thuật</h3>
                <p className="text-sm text-gray-500 mb-4">Nếu gặp sự cố trong quá trình thanh toán hoặc không nhận được vé, vui lòng liên hệ hotline:</p>
                <div className="flex items-center gap-4">
                   <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-5 py-2.5 rounded-lg font-black tracking-tighter shadow-lg text-lg">1900 8888</div>
                   <div className="text-xs text-gray-400 font-medium uppercase tracking-widest border border-gray-700 px-3 py-1 rounded-full">Hỗ trợ 24/7</div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;