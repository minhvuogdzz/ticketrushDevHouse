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

  // === THÊM: STATE CHO BỘ LỌC VÀ HỦY HÀNG LOẠT ===
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

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
      axios.get('http://localhost:5001/api/seats').then(res => setSeats(res.data));
    });

    return () => socket.disconnect();
  }, []);

  // HÀM XỬ LÝ HỦY VÉ & HOÀN TIỀN (ĐƠN LẺ)
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

  // === THÊM: HÀM HỦY VÉ THEO KHU VỰC ===
  const handleRefundZone = async () => {
    if (selectedZone === 'ALL') return alert("Vui lòng chọn một Khu vực ở bộ lọc trước!");
    const zoneName = eventInfo.zones?.find(z => z.section === selectedZone)?.name || selectedZone;
    if (window.prompt(`CẢNH BÁO: Bạn đang hủy TOÀN BỘ vé đã bán tại khu [${zoneName}].\nNhập 'HUYKHU' để xác nhận:`) !== 'HUYKHU') return;

    setIsProcessingBulk(true);
    try {
      await axios.post('http://localhost:5001/api/seats/admin/refund-zone', { section: selectedZone });
      alert(`✅ Đã hủy và hoàn tiền toàn bộ khu vực ${zoneName}!`);
      // Lấy lại data hoặc để socket tự làm việc
      axios.get('http://localhost:5001/api/seats').then(res => setSeats(res.data));
    } catch (err) {
      alert("❌ Lỗi khi hủy khu vực!");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // === THÊM: HÀM HỦY VÉ TOÀN BỘ SỰ KIỆN ===
  const handleRefundAll = async () => {
    if (window.prompt("🚨 NGUY HIỂM: Hủy TOÀN BỘ vé của sự kiện.\nNhập 'HUYTOANBO' để xác nhận:") !== 'HUYTOANBO') return;

    setIsProcessingBulk(true);
    try {
      await axios.post('http://localhost:5001/api/seats/admin/refund-all');
      alert(`💥 Đã hủy và hoàn tiền TOÀN BỘ SỰ KIỆN!`);
      axios.get('http://localhost:5001/api/seats').then(res => setSeats(res.data));
    } catch (err) {
      alert("❌ Lỗi khi hủy toàn bộ sự kiện!");
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // TÍNH TOÁN THỐNG KÊ CHUNG
  const totalSeats = seats.length;
  const soldSeats = seats.filter(s => s.status === 'sold').reverse();
  const lockedSeats = seats.filter(s => s.status === 'locked');
  
  const totalRevenue = soldSeats.reduce((sum, seat) => sum + seat.price, 0);
  const occupancyRate = totalSeats > 0 ? Math.round((soldSeats.length / totalSeats) * 100) : 0;
  const totalSold = soldSeats.length; 

  // === THÊM: LOGIC LỌC VÉ REAL-TIME ===
  const filteredSoldSeats = soldSeats.filter(seat => {
    // 1. Lọc theo Zone
    const matchZone = selectedZone === 'ALL' || seat.section === selectedZone;
    // 2. Lọc theo Search (Tên đăng nhập, tên thật, sđt)
    const term = searchTerm.toLowerCase().trim();
    const username = seat.lockedBy?.username?.toLowerCase() || '';
    const fullName = seat.customerName?.toLowerCase() || '';
    const phone = seat.customerPhone || '';
    const matchSearch = term === '' || username.includes(term) || fullName.includes(term) || phone.includes(term);
    
    return matchZone && matchSearch;
  });

  // ================= TÍNH TOÁN THỐNG KÊ ĐỘNG TỪNG KHU VỰC =================
  const eventZones = eventInfo.zones || [];
  
  // Bảng màu tự động xoay vòng cho các khu vực
  const DYNAMIC_COLORS = [
    { from: 'from-yellow-600', to: 'to-yellow-400', text: 'text-yellow-400' },
    { from: 'from-blue-700', to: 'to-blue-400', text: 'text-blue-400' },
    { from: 'from-green-700', to: 'to-green-400', text: 'text-green-400' },
    { from: 'from-purple-700', to: 'to-purple-400', text: 'text-purple-400' },
    { from: 'from-pink-700', to: 'to-pink-400', text: 'text-pink-400' },
    { from: 'from-teal-700', to: 'to-teal-400', text: 'text-teal-400' },
  ];

  const dynamicZoneStats = eventZones.map((zone, index) => {
    const count = soldSeats.filter(s => s.section === zone.section).length;
    const pct = totalSold === 0 ? 0 : Math.round((count / totalSold) * 100);
    const color = DYNAMIC_COLORS[index % DYNAMIC_COLORS.length];
    
    return {
      section: zone.section,
      name: zone.name,
      count,
      pct,
      color
    };
  });

  if (isLoading) return <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-yellow-500"><div className="animate-spin text-4xl">⏳</div></div>;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 font-sans flex flex-col md:flex-row relative">
      
      {/* POP-UP XÁC NHẬN HỦY VÉ MỘT LẺ */}
      {ticketToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-900/50 text-red-500 flex items-center justify-center text-2xl border border-red-500/30">⚠️</div>
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
               <button onClick={() => setTicketToCancel(null)} disabled={isProcessingRefund} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50">Hủy bỏ</button>
               <button onClick={confirmCancelTicket} disabled={isProcessingRefund} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-black transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)] disabled:opacity-50">
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

        {/* === THÊM MỚI: THANH CÔNG CỤ TÌM KIẾM VÀ HỦY VÉ === */}
        <div className="bg-[#12141A] p-5 rounded-2xl border border-gray-800 shadow-xl mb-8 flex flex-col xl:flex-row gap-4 justify-between items-end">
          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1">
            <div className="flex-1 max-w-md">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tra cứu khách hàng</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                <input 
                  type="text" 
                  placeholder="Nhập tên đăng nhập, họ tên thật, hoặc SĐT..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-yellow-500 outline-none transition text-sm"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Lọc theo Khu vực</label>
              <select 
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-yellow-500 outline-none cursor-pointer text-sm"
              >
                <option value="ALL">Tất cả khu vực</option>
                {eventZones.map(z => (
                  <option key={z.section} value={z.section}>{z.name} ({z.section})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 w-full xl:w-auto pt-4 xl:pt-0 border-t border-gray-800 xl:border-none">
            <button 
              onClick={handleRefundZone}
              disabled={isProcessingBulk || selectedZone === 'ALL'}
              className={`px-4 py-2.5 rounded-lg font-bold uppercase transition text-sm whitespace-nowrap
                ${selectedZone !== 'ALL' ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_10px_rgba(234,88,12,0.4)]' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
            >
              ⚠️ Hủy vé khu {selectedZone !== 'ALL' ? selectedZone : 'này'}
            </button>
            <button 
              onClick={handleRefundAll}
              disabled={isProcessingBulk}
              className="bg-red-700 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-black uppercase transition shadow-[0_0_15px_rgba(185,28,28,0.4)] text-sm whitespace-nowrap"
            >
              🚨 HỦY TOÀN BỘ SỰ KIỆN
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: LỊCH SỬ GIAO DỊCH (SỬA LẠI MAP BẰNG filteredSoldSeats) */}
          <div className="lg:col-span-2 bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl flex flex-col h-[550px]">
            <h2 className="text-xl font-black text-white mb-4 uppercase flex justify-between items-center">
              Lịch sử giao dịch 
              <span className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full font-medium">Lọc được {filteredSoldSeats.length} vé</span>
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
                  {filteredSoldSeats.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 text-gray-600">Không tìm thấy vé phù hợp</td></tr>
                  ) : (
                    filteredSoldSeats.map(c => (
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

          {/* CỘT PHẢI: THỐNG KÊ TỶ LỆ HẠNG VÉ ĐỘNG (GIỮ NGUYÊN) */}
          <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl flex flex-col h-[550px]">
             <h2 className="text-xl font-black text-white mb-2 uppercase">Cơ cấu hạng vé</h2>
             <p className="text-gray-500 text-xs mb-8">Tỷ lệ phần trăm các khu vực vé đã bán ra so với tổng doanh số.</p>
             
             <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                {eventZones.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-600 italic">
                    Chưa có cấu hình khu vực nào.
                  </div>
                ) : (
                  dynamicZoneStats.map((stat) => (
                    <div key={stat.section}>
                       <div className="flex justify-between items-end mb-2">
                         <div>
                           <span className={`font-black text-lg ${stat.color.text}`}>{stat.name}</span>
                           <p className="text-xs text-gray-500 mt-1">Mã khu: {stat.section}</p>
                         </div>
                         <div className="text-right">
                           <span className="text-xl font-black text-white">{stat.pct}%</span>
                           <p className="text-xs text-gray-500 mt-1">{stat.count} vé</p>
                         </div>
                       </div>
                       <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                         <div 
                           className={`h-full bg-gradient-to-r ${stat.color.from} ${stat.color.to} transition-all duration-1000`} 
                           style={{ width: `${stat.pct}%` }}
                         ></div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;