import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [eventInfo, setEventInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // State quản lý Pop-up xác nhận Hủy vé
  const [ticketToCancel, setTicketToCancel] = useState(null);
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // FETCH DỮ LIỆU
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [seatsRes, eventRes] = await Promise.all([
          axios.get('http://localhost:5001/api/seats'),
          axios.get('http://localhost:5001/api/event')
        ]);
        setSeats(seatsRes.data);
        setEventInfo(eventRes.data);
      } catch (error) {
        console.error('Lỗi tải dữ liệu Admin:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();

    // SOCKET LẮNG NGHE REAL-TIME
    const socket = io('http://localhost:5001');
    socket.on('seatUpdated', () => {
      // Reload lại danh sách vé để lấy data mới nhất (có populate user)
      axios.get('http://localhost:5001/api/seats').then(res => setSeats(res.data));
    });

    return () => socket.disconnect();
  }, []);

  // HÀM XỬ LÝ HỦY VÉ & HOÀN TIỀN
  const confirmCancelTicket = async () => {
    if (!ticketToCancel) return;
    setIsProcessingRefund(true);
    
    try {
      const response = await axios.post('http://localhost:5001/api/seats/admin/cancel', {
        seatId: ticketToCancel.seatId
      });

      if (response.data.success) {
        alert(`✅ Đã hủy vé ${ticketToCancel.seatId} và hoàn ${ticketToCancel.price.toLocaleString('vi-VN')}đ cho khách hàng!`);
        setTicketToCancel(null); 
      }
    } catch (error) {
      alert(`❌ Lỗi: ${error.response?.data?.message || 'Không thể hủy vé!'}`);
    } finally {
      setIsProcessingRefund(false);
    }
  };

  // TÍNH TOÁN THỐNG KÊ
  const totalSeats = seats.length;
  const soldSeats = seats.filter(s => s.status === 'sold').reverse();
  const lockedSeats = seats.filter(s => s.status === 'locked');
  
  const totalRevenue = soldSeats.reduce((sum, seat) => sum + seat.price, 0);
  const occupancyRate = totalSeats > 0 ? Math.round((soldSeats.length / totalSeats) * 100) : 0;

  const totalSold = soldSeats.length || 1; 
  const vipCount = soldSeats.filter(s => s.section === 'VIP').length;
  const abCount = soldSeats.filter(s => ['A', 'B'].includes(s.section)).length;
  const cdCount = soldSeats.filter(s => ['C', 'D'].includes(s.section)).length;

  const vipPct = Math.round((vipCount / totalSold) * 100);
  const abPct = Math.round((abCount / totalSold) * 100);
  const cdPct = Math.round((cdCount / totalSold) * 100);

  if (isLoading) return <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-yellow-500"><div className="animate-spin text-4xl">⏳</div></div>;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 font-sans flex flex-col md:flex-row relative">
      
      {/* POP-UP XÁC NHẬN HỦY VÉ & HOÀN TIỀN */}
      {ticketToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-900/50 text-red-500 flex items-center justify-center text-2xl border border-red-500/30">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase">Xác nhận Hủy Vé</h3>
                  <p className="text-sm text-gray-400">Thao tác này không thể hoàn tác!</p>
                </div>
             </div>
             
             <div className="bg-black/50 rounded-xl p-4 mb-6 border border-gray-800">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Mã vé sẽ hủy:</span>
                  <span className="font-bold text-yellow-400">{ticketToCancel.seatId} (Khu {ticketToCancel.section})</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Khách hàng:</span>
                  <span className="font-bold text-white">{ticketToCancel.customerName || 'Chưa định danh'}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-800 pt-2 mt-2">
                  <span className="text-gray-400">Số tiền hoàn lại:</span>
                  <span className="font-black text-red-400 text-lg">{ticketToCancel.price.toLocaleString('vi-VN')} đ</span>
                </div>
             </div>

             <div className="flex gap-3">
               <button 
                 onClick={() => setTicketToCancel(null)}
                 disabled={isProcessingRefund}
                 className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
               >
                 Hủy bỏ
               </button>
               <button 
                 onClick={confirmCancelTicket}
                 disabled={isProcessingRefund}
                 className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-black transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)] disabled:opacity-50"
               >
                 {isProcessingRefund ? <span className="animate-spin border-2 border-white border-t-transparent w-5 h-5 rounded-full"></span> : 'Hoàn tiền & Xóa'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#12141A] border-r border-gray-800 p-6 flex flex-col gap-6 md:sticky md:top-0 md:h-screen z-10">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 md:mb-10 text-center md:text-left cursor-pointer" onClick={() => navigate('/')}>
          TICKETRUSH <span className="text-sm text-gray-400 block uppercase tracking-widest mt-1">Admin Panel</span>
        </div>
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 custom-scrollbar">
           <button className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-4 py-3 rounded-xl font-bold flex items-center gap-3 whitespace-nowrap">
             <span>📊</span> Tổng quan
           </button>
           <button onClick={() => navigate('/admin/events')} className="text-gray-400 hover:bg-gray-800 hover:text-white px-4 py-3 rounded-xl font-bold transition flex items-center gap-3 whitespace-nowrap">
             <span>⚙️</span> Cấu hình Sự kiện
           </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Real-time Dashboard</h1>
            {/* TÊN SỰ KIỆN ĐỘNG THEO DB */}
            <p className="text-gray-400 text-sm mt-1">Sự kiện: <b className="text-yellow-400">{eventInfo?.name || 'Đang tải...'}</b></p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/30 text-xs font-bold animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live
          </div>
        </header>

        {/* THỐNG KÊ TỔNG QUAN */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-2xl border border-gray-800 shadow-lg">
            <p className="text-gray-400 text-xs font-bold uppercase mb-2">Tổng Doanh Thu</p>
            <h3 className="text-2xl md:text-4xl font-black text-green-400">{totalRevenue.toLocaleString('vi-VN')} đ</h3>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-2xl border border-gray-800 shadow-lg">
            <p className="text-gray-400 text-xs font-bold uppercase mb-2">Vé Đã Bán</p>
            <h3 className="text-2xl md:text-4xl font-black text-yellow-400">{soldSeats.length} <span className="text-sm text-gray-500 font-medium">/ {totalSeats}</span></h3>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-2xl border border-gray-800 shadow-lg">
            <p className="text-gray-400 text-xs font-bold uppercase mb-2">Tỷ lệ lấp đầy</p>
            <h3 className="text-2xl md:text-4xl font-black text-blue-400">{occupancyRate}%</h3>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-2xl border border-gray-800 shadow-lg">
            <p className="text-gray-400 text-xs font-bold uppercase mb-2">Đang giữ chỗ (10p)</p>
            <h3 className="text-2xl md:text-4xl font-black text-red-400">{lockedSeats.length} <span className="text-sm text-gray-500 font-medium">vé</span></h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: LỊCH SỬ GIAO DỊCH */}
          <div className="lg:col-span-2 bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl flex flex-col h-[550px]">
            <h2 className="text-xl font-black text-white mb-4 uppercase flex justify-between items-center">
              Lịch sử giao dịch 
              <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full font-medium">Đã khớp doanh thu</span>
            </h2>
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pr-2">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="sticky top-0 bg-[#12141A] z-10 shadow-sm">
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="pb-3 font-bold uppercase">Mã / Loại</th>
                    <th className="pb-3 font-bold uppercase">Tên Tài Khoản</th>
                    <th className="pb-3 font-bold uppercase">Định danh (Tên - SĐT)</th>
                    <th className="pb-3 font-bold uppercase text-right">Giá vé</th>
                    <th className="pb-3 font-bold uppercase text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {soldSeats.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-600">Chưa có giao dịch nào</td></tr>
                  ) : (
                    soldSeats.map(c => (
                      <tr key={c.seatId} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition">
                        <td className="py-3">
                           <span className="bg-yellow-500/20 text-yellow-400 font-bold px-2 py-1 rounded text-xs mr-2">{c.seatId}</span>
                           <span className="text-gray-400 text-xs">Khu {c.section}</span>
                        </td>
                        <td className="py-3 font-medium text-blue-300">
                           {c.lockedBy?.username ? `@${c.lockedBy.username}` : <span className="text-gray-500 italic">User bị xóa</span>}
                        </td>
                        <td className="py-3">
                           {c.customerName ? (
                             <>
                               <p className="text-white font-bold text-xs">{c.customerName}</p>
                               <p className="text-gray-500 text-[10px] font-mono">{c.customerPhone}</p>
                             </>
                           ) : (
                             <span className="text-red-500/70 italic text-xs">Vé Test cũ</span>
                           )}
                        </td>
                        <td className="py-3 text-right font-bold text-green-400">{c.price.toLocaleString('vi-VN')} đ</td>
                        
                        {/* CỘT THAO TÁC: NÚT HỦY VÉ */}
                        <td className="py-3 text-center">
                           <button 
                             onClick={() => setTicketToCancel(c)}
                             className="bg-red-950 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded border border-red-900/50 transition text-xs font-bold"
                           >
                             Hủy / Hoàn tiền
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CỘT PHẢI: THỐNG KÊ TỶ LỆ HẠNG VÉ */}
          <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl flex flex-col h-[550px]">
             <h2 className="text-xl font-black text-white mb-2 uppercase">Cơ cấu hạng vé</h2>
             <p className="text-gray-500 text-xs mb-8">Tỷ lệ phần trăm các khu vực vé đã bán ra so với tổng doanh số.</p>
             
             <div className="flex-1 flex flex-col gap-8 justify-center">
                <div>
                   <div className="flex justify-between items-end mb-2">
                     <div>
                       <span className="text-yellow-400 font-black text-lg">VIP</span>
                       <p className="text-xs text-gray-500 mt-1">Khu vực trung tâm</p>
                     </div>
                     <div className="text-right">
                       <span className="text-xl font-black text-white">{vipPct}%</span>
                       <p className="text-xs text-gray-500 mt-1">{vipCount} vé</p>
                     </div>
                   </div>
                   <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000" style={{ width: `${vipPct}%` }}></div>
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-end mb-2">
                     <div>
                       <span className="text-blue-400 font-black text-lg">Khán đài A, B</span>
                       <p className="text-xs text-gray-500 mt-1">Góc nhìn hai bên hông</p>
                     </div>
                     <div className="text-right">
                       <span className="text-xl font-black text-white">{abPct}%</span>
                       <p className="text-xs text-gray-500 mt-1">{abCount} vé</p>
                     </div>
                   </div>
                   <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-blue-700 to-blue-400 transition-all duration-1000" style={{ width: `${abPct}%` }}></div>
                   </div>
                </div>

                <div>
                   <div className="flex justify-between items-end mb-2">
                     <div>
                       <span className="text-green-400 font-black text-lg">Khán đài C, D</span>
                       <p className="text-xs text-gray-500 mt-1">Khu vực tiêu chuẩn (Phía sau)</p>
                     </div>
                     <div className="text-right">
                       <span className="text-xl font-black text-white">{cdPct}%</span>
                       <p className="text-xs text-gray-500 mt-1">{cdCount} vé</p>
                     </div>
                   </div>
                   <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-green-700 to-green-400 transition-all duration-1000" style={{ width: `${cdPct}%` }}></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;