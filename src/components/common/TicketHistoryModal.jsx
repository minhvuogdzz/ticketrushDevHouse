import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TICKET_BENEFITS = {
  VIP: {
    color: 'from-yellow-600 to-yellow-400',
    badge: 'bg-yellow-500 text-black',
    location: 'Ngồi/đứng khu vực trung tâm sát sân khấu, tầm nhìn không bị che chắn, dễ dàng tương tác trực tiếp với nghệ sĩ.',
    gifts: ['Vòng tay LED phát sáng đồng bộ theo âm nhạc', 'Lightstick Official Concert', 'Bộ Card/Poster độc quyền', 'Túi Tote/Vòng tay cao su kỉ niệm'],
    perks: 'Lối đi check-in VIP riêng (Fast-track), miễn xếp hàng. Có khu vực F&B và WC riêng biệt.'
  },
  A: {
    color: 'from-blue-700 to-blue-500',
    badge: 'bg-blue-500 text-white',
    location: 'Cánh trái sân khấu, góc nhìn chéo bao quát toàn bộ hiệu ứng ánh sáng.',
    gifts: ['Vòng tay giấy phát sáng', 'Poster Concert Âm Vang Tổ Quốc'],
    perks: 'Lối đi check-in ưu tiên (Zone A).'
  },
  B: {
    color: 'from-blue-700 to-blue-500',
    badge: 'bg-blue-500 text-white',
    location: 'Cánh phải sân khấu, góc nhìn chéo bao quát toàn bộ hiệu ứng ánh sáng.',
    gifts: ['Vòng tay giấy phát sáng', 'Poster Concert Âm Vang Tổ Quốc'],
    perks: 'Lối đi check-in ưu tiên (Zone B).'
  },
  C: {
    color: 'from-green-700 to-green-500',
    badge: 'bg-green-500 text-white',
    location: 'Khu vực phía sau, ngắm trọn vẹn toàn cảnh sân khấu, laser và pháo sáng.',
    gifts: ['Vòng tay giấy check-in sự kiện'],
    perks: 'Check-in tại cổng tiêu chuẩn (Zone C).'
  },
  D: {
    color: 'from-green-700 to-green-500',
    badge: 'bg-green-500 text-white',
    location: 'Khu vực phía sau, ngắm trọn vẹn toàn cảnh sân khấu, laser và pháo sáng.',
    gifts: ['Vòng tay giấy check-in sự kiện'],
    perks: 'Check-in tại cổng tiêu chuẩn (Zone D).'
  }
};

const TicketHistoryModal = ({ isOpen, onClose, user }) => {
  const [myTickets, setMyTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

      const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5001/api/seats');
        
        // ÉP KIỂU STRING ĐỂ SO SÁNH CHÍNH XÁC 100%
        const userTickets = response.data.filter(seat => {
          if (!seat.lockedBy || !user || !user.userId) return false;
          
          // Trích xuất ID an toàn dù nó là Object hay String
          const ownerId = seat.lockedBy._id || seat.lockedBy; 
          
          // So sánh bằng cách ép kiểu String
          const isMine = String(ownerId) === String(user.userId);
          
          return isMine && (seat.status === 'locked' || seat.status === 'sold');
        });
        
        setMyTickets(userTickets);
      } catch (error) {
        console.error('Lỗi tải lịch sử vé:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#12141A] w-full max-w-4xl max-h-[85vh] rounded-3xl border border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-slide-in-right">
        <div className="bg-gradient-to-r from-red-800 to-red-600 p-6 flex justify-between items-center border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-wider">Tra cứu vé của tôi</h2>
            <p className="text-gray-200 text-sm mt-1">Khách hàng: <span className="font-bold">{user.username}</span></p>
          </div>
          <button onClick={onClose} className="text-white hover:text-yellow-400 text-3xl transition-transform hover:rotate-90">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0B0C10]">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : myTickets.length === 0 ? (
            <div className="text-center py-20 opacity-60">
              <span className="text-6xl grayscale mb-4 block">🎫</span>
              <p className="text-xl text-gray-300 font-bold">Bạn chưa có vé nào trong hệ thống.</p>
              <p className="text-gray-500 mt-2">Hãy vào Sơ đồ ghế để chọn ngay một vị trí đẹp nhé!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myTickets.map(ticket => {
                const benefit = TICKET_BENEFITS[ticket.section] || TICKET_BENEFITS['C']; 
                return (
                  <div key={ticket.seatId} className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden shadow-lg flex flex-col">
                    <div className={`p-4 bg-gradient-to-r ${benefit.color} flex justify-between items-center`}>
                      <div>
                        <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Mã ghế</span>
                        <h3 className="text-3xl font-black text-white drop-shadow-md">{ticket.seatId}</h3>
                      </div>
                      <div className="text-right">
                        {ticket.status === 'sold' ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">Đã thanh toán</span>
                        ) : (
                          <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">Chờ thanh toán</span>
                        )}
                        <p className="text-white font-bold mt-2 text-lg">{ticket.price.toLocaleString('vi-VN')} đ</p>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col gap-4 flex-1">
                      <div className="inline-block">
                         <span className={`${benefit.badge} px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider`}>
                           Khu vực {ticket.section === 'VIP' ? 'VIP' : `Khán đài ${ticket.section}`}
                         </span>
                      </div>
                      {/* ĐÃ THÊM: KHU VỰC HIỂN THỊ ĐỊNH DANH CHỦ VÉ */}
                      {ticket.status === 'sold' && (
                        <div className="bg-black/40 border border-gray-700 rounded-lg p-3 flex flex-col gap-1">
                           <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Chủ sở hữu vé (Chính chủ)</p>
                           <p className="text-white font-bold text-sm">👤 Họ tên: <span className="text-yellow-400">{ticket.customerName}</span></p>
                           <p className="text-white font-bold text-sm">📞 SĐT: <span className="text-yellow-400">{ticket.customerPhone}</span></p>
                           <p className="text-gray-500 text-[10px] italic mt-1">*Vui lòng mang theo giấy tờ tùy thân khớp với thông tin này khi đến cổng soát vé.</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-yellow-500 text-sm font-bold flex items-center gap-2 mb-1"><span className="text-lg">📍</span> Vị trí</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{benefit.location}</p>
                      </div>
                      <div>
                        <h4 className="text-yellow-500 text-sm font-bold flex items-center gap-2 mb-1"><span className="text-lg">🎁</span> Quà tặng</h4>
                        <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
                          {benefit.gifts.map((gift, idx) => <li key={idx}>{gift}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-yellow-500 text-sm font-bold flex items-center gap-2 mb-1"><span className="text-lg">⭐</span> Trải nghiệm</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{benefit.perks}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketHistoryModal;