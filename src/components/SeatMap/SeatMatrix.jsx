import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate, useOutletContext } from 'react-router-dom';
import qrImg from '../../assets/image/qr.png';

// --- COMPONENT HIỆU ỨNG BAY ---
const Flyer = ({ flyer }) => {
  const [style, setStyle] = useState({ left: flyer.startX, top: flyer.startY, opacity: 1, transform: 'scale(1)' });
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setStyle({ left: flyer.endX, top: flyer.endY, opacity: 0, transform: 'scale(0.1) rotate(720deg)' });
    });
    return () => cancelAnimationFrame(timer);
  }, [flyer]);
  return (
    <div className="fixed z-[9999] bg-yellow-400 text-yellow-900 w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md flex items-center justify-center font-bold text-xs shadow-[0_0_30px_yellow] pointer-events-none transition-all duration-[700ms] ease-in-out" style={style}>
      {flyer.text}
    </div>
  );
};

const SeatMatrix = () => {
  const navigate = useNavigate();
  const { user, setShowAuth } = useOutletContext() || {};

  // ================= STATE HÀNG CHỜ ẢO =================
  const [queueInfo, setQueueInfo] = useState({ isChecking: true, allowed: false, position: 0 });

  const [seats, setSeats] = useState([]);
  const [myLockedSeats, setMyLockedSeats] = useState([]);
  const [filterSection, setFilterSection] = useState('ALL');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const [flyingSeats, setFlyingSeats] = useState([]);
  const cartIconRef = useRef(null);

  // ================= LOGIC HÀNG CHỜ ẢO (VIRTUAL QUEUE) =================
  useEffect(() => {
    if (!user) {
      setQueueInfo({ isChecking: false, allowed: true, position: 0 });
      return;
    }

    let intervalId;

    const joinVirtualQueue = async () => {
      try {
        const res = await axios.post('http://localhost:5001/api/queue/join', { userId: user.userId });
        if (res.data.allowed) {
          setQueueInfo({ isChecking: false, allowed: true, position: 0 });
        } else {
          setQueueInfo({ isChecking: false, allowed: false, position: res.data.position });
          startPolling();
        }
      } catch (error) {
        console.error("Lỗi kết nối hàng chờ", error);
        // ĐÃ FIX: Lỗi server (500, quá tải) thì nhốt vào phòng chờ ảo chứ không thả cửa
        setQueueInfo({ isChecking: false, allowed: false, position: 999 });
        startPolling(); 
      }
    };

    const startPolling = () => {
      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:5001/api/queue/status/${user.userId}`);
          if (res.data.allowed) {
            setQueueInfo({ isChecking: false, allowed: true, position: 0 });
            clearInterval(intervalId);
          } else {
            setQueueInfo(prev => ({ ...prev, position: res.data.position }));
          }
        } catch (error) {
          console.error("Lỗi check queue status", error);
        }
      }, 5000); 
    };

    joinVirtualQueue();

    // HÀM DỌN DẸP KHI THOÁT COMPONENT / TẮT TAB
    return () => {
      if (intervalId) clearInterval(intervalId);
      
      // ĐÃ FIX: Dùng fetch với keepalive để đảm bảo API bắn tới đích dù trình duyệt bị đóng ngang
      if (user && user.userId) {
        fetch('http://localhost:5001/api/queue/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId }),
          keepalive: true
        }).catch(err => console.log("Lỗi nhả slot", err));
      }
    };
  }, [user]);

  // --- FETCH DỮ LIỆU EVENT ---
  const [eventData, setEventData] = useState(null);
  useEffect(() => {
    axios.get('http://localhost:5001/api/event')
      .then(res => setEventData(res.data))
      .catch(err => console.error("Lỗi tải event", err));
  }, []);

  const eventZones = eventData?.zones || [];

  // --- FETCH GHẾ & WEBSOCKET ---
  useEffect(() => {
    if (!queueInfo.allowed) return;

    const fetchSeats = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/seats');
        const allSeats = response.data;
        setSeats(allSeats);

        if (user) {
          const myLocked = allSeats.filter(s => {
            if (!s.lockedBy || !user || !user.userId) return false;
            const ownerId = s.lockedBy._id || s.lockedBy;
            return String(ownerId) === String(user.userId) && s.status === 'locked';
          });
          setMyLockedSeats(myLocked.map(s => s.seatId));
        }
      } catch (error) {
        console.error('Lỗi khi tải ghế:', error);
      }
    };
    fetchSeats();

    const socket = io('http://localhost:5001');
    socket.on('seatUpdated', (updatedSeat) => {
      if (updatedSeat.type === 'RELOAD') {
        fetchSeats();
        return;
      }
      setSeats(prevSeats => prevSeats.map(seat => seat.seatId === updatedSeat.seatId ? updatedSeat : seat));

      if (updatedSeat.status === 'available') {
        setMyLockedSeats(prev => prev.filter(id => id !== updatedSeat.seatId));
      }
    });
    return () => socket.disconnect();
  }, [user, queueInfo.allowed]);

  const filteredSeats = useMemo(() => {
    if (filterSection === 'ALL') return [];
    return seats.filter(seat => seat.section === filterSection);
  }, [seats, filterSection]);

  const myCartDetails = useMemo(() => {
    return seats.filter(seat => myLockedSeats.includes(seat.seatId));
  }, [seats, myLockedSeats]);

  const totalPrice = myCartDetails.reduce((sum, seat) => sum + seat.price, 0);

  // --- LOGIC CHỌN / HỦY VÉ ---
  const handleSelectSeat = async (seat, event) => {
    if (!user) {
      alert("Bạn cần đăng nhập để chọn ghế!");
      if (setShowAuth) setShowAuth(true);
      return;
    }
    if (seat.status !== 'available') return;
    try {
      const response = await axios.post('http://localhost:5001/api/seats/lock', { seatId: seat.seatId, userId: user.userId });
      if (response.data.success) {
        if (cartIconRef.current && event) {
          const btnRect = event.target.getBoundingClientRect();
          const targetRect = cartIconRef.current.getBoundingClientRect();
          const flyer = {
            id: Date.now(), text: seat.number,
            startX: btnRect.left, startY: btnRect.top,
            endX: targetRect.left + targetRect.width / 2 - 20,
            endY: targetRect.top + targetRect.height / 2 - 20,
          };
          setFlyingSeats(prev => [...prev, flyer]);
          setTimeout(() => {
            setFlyingSeats(prev => prev.filter(f => f.id !== flyer.id));
            setMyLockedSeats(prev => [...prev, seat.seatId]);
          }, 700);
        } else {
          setMyLockedSeats(prev => [...prev, seat.seatId]);
        }
      }
    } catch (error) {
      alert(`Ghế ${seat.seatId} vừa bị người khác giữ mất rồi!`);
    }
  };

  const handleCancelSeat = async (seatId) => {
    try {
      const response = await axios.post('http://localhost:5001/api/seats/unlock', { seatId, userId: user.userId });
      if (response.data.success) {
        setMyLockedSeats(prev => prev.filter(id => id !== seatId));
      }
    } catch (error) {
      alert(`Không thể hủy ghế: ${error.response?.data?.message}`);
    }
  };

  // --- LOGIC THANH TOÁN ---
  const handleCheckoutClick = () => {
    setIsCartOpen(false); 
    setShowQRModal(true);
  };

  const confirmPaymentSuccess = async () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      alert("⚠️ BẮT BUỘC: Vui lòng nhập Họ Tên và Số điện thoại để hệ thống xuất vé!");
      return;
    }
    setIsVerifyingPayment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const response = await axios.post('http://localhost:5001/api/seats/checkout', {
        seatIds: myLockedSeats,
        userId: user.userId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone
      });

      if (response.data.success) {
        // GỌI API TRẢ SLOT KHI ĐÃ MUA THÀNH CÔNG ĐỂ NHƯỜNG CHỖ CHO NGƯỜI KHÁC
        axios.post('http://localhost:5001/api/queue/leave', { userId: user.userId }).catch(() => {});

        alert('🎉 Xác nhận từ ngân hàng: Đã nhận được tiền. Vé của bạn đã được xuất thành công!');
        setMyLockedSeats([]);
        setFilterSection('ALL');
        setIsCartOpen(false);
        setShowQRModal(false);
        localStorage.removeItem('ticketrush_session_end'); 
        setCustomerInfo({ name: '', phone: '' });
        
        // Cố tình kick user ra ngoài sau khi thanh toán xong
        window.location.reload(); 
      }
    } catch (error) {
      alert(`❌ Ngân hàng báo lỗi: ${error.response?.data?.message || 'Chưa nhận được giao dịch. Vui lòng thử lại!'}`);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // --- GIAO DIỆN KHÁN ĐÀI ĐỘNG ---
  const ZONE_COLORS = [
    { bg: 'bg-yellow-900/30', text: 'text-yellow-500', border: 'border-yellow-500' },
    { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-500' },
    { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-500' },
    { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-500' },
    { bg: 'bg-pink-900/30', text: 'text-pink-400', border: 'border-pink-500' },
    { bg: 'bg-teal-900/30', text: 'text-teal-400', border: 'border-teal-500' }
  ];

  const renderZoneBlock = (id, name, price, index) => {
    const color = ZONE_COLORS[index % ZONE_COLORS.length];
    return (
      <div
        key={id} onClick={() => setFilterSection(id)}
        className={`${color.bg} border-2 border-gray-600 hover:${color.border} rounded-xl md:rounded-2xl p-4 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group w-full min-h-[100px] md:min-h-[140px]`}
      >
        <h4 className={`text-[12px] md:text-xl lg:text-2xl font-black ${color.text} mb-2 uppercase tracking-tight text-center leading-tight`}>{name}</h4>
        <p className="text-gray-300 font-medium text-[10px] md:text-base bg-black/40 px-3 py-1 rounded-full border border-gray-700">{price.toLocaleString('vi-VN')} đ</p>
      </div>
    );
  };

  const renderDetailedSeats = () => {
    const rows = {};
    filteredSeats.forEach(seat => {
      if (!rows[seat.row]) rows[seat.row] = [];
      rows[seat.row].push(seat);
    });

    const activeZoneName = eventZones.find(z => z.section === filterSection)?.name || filterSection;

    return (
      <div className="w-full animate-fade-in">
        <button onClick={() => setFilterSection('ALL')} className="mb-6 flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold bg-yellow-900/30 px-4 py-2 rounded-lg transition">
          <span>←</span> Quay lại sơ đồ tổng
        </button>
        <div className="bg-gray-800/50 p-4 md:p-8 rounded-2xl border border-gray-600 shadow-inner w-full">
          <h3 className="text-center text-xl md:text-2xl font-black text-white mb-8 uppercase tracking-widest border-b border-gray-700 pb-4">
            {activeZoneName}
          </h3>
          <div className="flex flex-col gap-6 items-center w-full">
            {Object.keys(rows).sort((a, b) => Number(a) - Number(b)).map(rowNum => (
              <div key={rowNum} className="flex flex-wrap justify-center gap-2 md:gap-3 items-center w-full">
                <span className="w-6 md:w-8 text-xs md:text-sm text-yellow-500 font-bold text-right pr-2">R{rowNum}</span>

                {rows[rowNum].sort((a, b) => a.number - b.number).map(seat => (
                  <button
                    key={seat.seatId}
                    onClick={(e) => handleSelectSeat(seat, e)}
                    disabled={seat.status !== 'available' && !myLockedSeats.includes(seat.seatId)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md font-bold text-xs md:text-sm transition-all duration-200 flex items-center justify-center
                      ${myLockedSeats.includes(seat.seatId)
                        ? 'bg-yellow-400 text-yellow-900 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-10 border-2 border-white' :
                        seat.status === 'available' ? 'bg-gray-300 text-gray-800 hover:bg-white hover:-translate-y-1 shadow-md' : 'bg-red-600 text-white opacity-40 cursor-not-allowed shadow-none'
                      }
                    `}
                  >
                    {seat.number}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CartContent = () => (
    <>
      <h3 className="text-xl md:text-2xl font-black mb-6 text-white flex justify-between items-center border-b border-gray-700 pb-4">
        <span>🛒 Giỏ hàng</span>
        <span className="bg-yellow-500 text-black text-sm px-3 py-1 rounded-full">{myLockedSeats.length} vé</span>
      </h3>
      {myCartDetails.length === 0 ? (
        <div className="text-center py-12 opacity-60">
          <div className="text-6xl mb-4 grayscale">🎫</div>
          <p className="text-gray-300 font-medium">Bạn chưa chọn ghế nào.</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar mb-6">
            {myCartDetails.map(seat => {
              const zoneName = eventZones.find(z => z.section === seat.section)?.name || seat.section;
              return (
                <div key={seat.seatId} className="bg-gray-800/80 border-l-4 border-yellow-500 p-3 md:p-4 rounded-r-xl flex justify-between items-center group shadow-md">
                  <div>
                    <div className="font-black text-lg md:text-xl text-yellow-400">{seat.seatId}</div>
                    <div className="text-xs text-gray-400 mt-1">{zoneName} - R{seat.row}</div>
                    <div className="font-bold text-white mt-1">{seat.price.toLocaleString('vi-VN')} đ</div>
                  </div>
                  <button onClick={() => handleCancelSeat(seat.seatId)} className="bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center border border-red-800/50">✕ Hủy</button>
                </div>
              )
            })}
          </div>
          <div className="border-t border-gray-700 pt-4 mb-6">
            <div className="flex justify-between items-end text-gray-300 font-bold mb-2">
              <span>Tổng thanh toán:</span>
              <span className="text-2xl md:text-3xl font-black text-yellow-400 drop-shadow-md">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
          <button onClick={handleCheckoutClick} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 text-black py-4 rounded-xl font-black text-lg transition shadow-[0_0_20px_rgba(250,204,21,0.4)] uppercase">
            Thanh toán QR Code
          </button>
        </div>
      )}
    </>
  );

  // ================= RENDER CÁC TRẠNG THÁI HÀNG CHỜ =================
  if (queueInfo.isChecking) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-[#0a0a0a] text-yellow-500">
        <div className="animate-spin text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Đang kết nối hệ thống...</h2>
      </div>
    );
  }

  if (!queueInfo.allowed) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
        <div className="bg-[#12141A] p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 animate-pulse"></div>
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase mb-2">Hệ thống đang quá tải</h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Hàng ngàn người đang cùng truy cập. Để đảm bảo trải nghiệm mua vé tốt nhất, bạn đã được đưa vào hàng chờ ảo.
          </p>
          <div className="bg-black/50 p-6 rounded-2xl border border-gray-800 mb-6 shadow-inner">
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Vị trí của bạn hiện tại</p>
            <p className="text-5xl font-black text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
              #{queueInfo.position}
            </p>
          </div>
          <p className="text-red-500 text-xs font-bold uppercase animate-pulse">
            ⚠️ Vui lòng giữ nguyên trang này, hệ thống sẽ tự động chuyển hướng khi đến lượt!
          </p>
        </div>
      </div>
    );
  }

  // ================= MAIN RENDER SƠ ĐỒ GHẾ =================
  return (
    <div className="relative w-full">
      {flyingSeats.map(flyer => <Flyer key={flyer.id} flyer={flyer} />)}

      {showQRModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center animate-fade-in text-gray-900 shadow-2xl relative">
            <button onClick={() => setShowQRModal(false)} disabled={isVerifyingPayment} className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl disabled:opacity-50">✕</button>
            <h2 className="text-2xl font-black text-red-700 mb-2 uppercase tracking-tight">Thanh toán vé</h2>
            <p className="text-sm font-medium mb-4 text-center text-gray-600">Mở ứng dụng Ngân hàng hoặc Momo để quét mã QR bên dưới.</p>

            <div className="bg-gray-100 p-4 rounded-2xl mb-4 shadow-inner border border-gray-200 w-full flex justify-center">
              <img src={qrImg} alt="QR Code Thanh Toán" className="w-56 h-56 rounded-xl object-contain mix-blend-multiply" />
            </div>

            <div className="w-full flex flex-col gap-3 mb-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <p className="text-xs font-black text-yellow-800 uppercase tracking-wider text-center">Thông tin xuất vé (Bắt buộc)</p>
              <input type="text" placeholder="Họ và tên người đi xem..." value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="w-full bg-white border border-yellow-300 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200 transition text-sm font-medium" />
              <input type="tel" placeholder="Số điện thoại..." value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="w-full bg-white border border-yellow-300 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200 transition text-sm font-medium" />
            </div>

            <div className="w-full bg-red-50 p-4 rounded-xl border border-red-100 mb-8 text-center shadow-sm">
              <p className="text-gray-600 text-sm mb-1 font-medium">Số tiền cần thanh toán</p>
              <p className="text-red-700 font-black text-2xl mb-1 drop-shadow-sm">{totalPrice.toLocaleString('vi-VN')} đ</p>
              <p className="text-gray-500 text-xs mt-2 border-t border-red-100 pt-2">Nội dung chuyển khoản: <br /><b className="text-gray-800">TicketRush {user?.username}</b></p>
            </div>

            <button onClick={confirmPaymentSuccess} disabled={isVerifyingPayment} className={`w-full py-4 font-black text-white rounded-xl transition shadow-lg uppercase tracking-wider flex justify-center items-center gap-2 ${isVerifyingPayment ? 'bg-gray-500 cursor-not-allowed opacity-80' : 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-[1.02] shadow-[0_10px_20px_rgba(34,197,94,0.3)]'}`}>
              {isVerifyingPayment ? <><div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div> Đang kiểm tra giao dịch...</> : 'Xác nhận đã chuyển khoản'}
            </button>
          </div>
        </div>
      )}

      <div className="fixed top-20 right-6 md:right-10 z-[60]">
        <button ref={cartIconRef} onClick={() => setIsCartOpen(true)} className="bg-gradient-to-tr from-yellow-600 to-yellow-400 text-black p-4 rounded-full shadow-[0_5px_25px_rgba(250,204,21,0.5)] flex items-center justify-center relative active:scale-95 hover:scale-110 transition-transform">
          <span className="text-2xl md:text-3xl">🛒</span>
          {myLockedSeats.length > 0 && <span className="absolute -top-2 -left-2 md:-top-3 md:-left-3 bg-red-600 text-white text-xs md:text-sm font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full animate-bounce shadow-md border-2 border-gray-900">{myLockedSeats.length}</span>}
        </button>
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#12141A] h-full p-6 shadow-2xl border-l border-gray-700 flex flex-col animate-slide-in-right">
            <button onClick={() => setIsCartOpen(false)} className="absolute top-4 right-6 text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 w-8 h-8 rounded-full flex items-center justify-center transition">✕</button>
            <div className="mt-8 flex-1 h-full overflow-hidden flex flex-col"><CartContent /></div>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="w-full bg-[#12141A] p-4 md:p-8 rounded-2xl shadow-xl border border-gray-800">
          <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-gray-800 pb-6 w-full">
            <div className="w-full xl:w-auto overflow-x-auto custom-scrollbar pb-2 xl:pb-0">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 uppercase tracking-wide">Tra cứu nhanh khu vực</h3>
              <div className="flex gap-2 w-max xl:w-full">
                <button onClick={() => setFilterSection('ALL')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filterSection === 'ALL' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'}`}>Sơ đồ tổng</button>
                {eventZones.map(sec => (
                  <button key={sec.section} onClick={() => setFilterSection(sec.section)} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filterSection === sec.section ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'}`}>{sec.name}</button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 items-center text-xs md:text-sm text-gray-300 bg-black/40 px-4 py-3 rounded-xl border border-gray-800 w-full xl:w-auto justify-center shadow-inner">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-600"></div> Trống</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div> Đang chọn</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600 opacity-60"></div> Đã bán</div>
            </div>
          </div>

          {filterSection === 'ALL' ? (
            <div className="w-full flex flex-col items-center animate-fade-in-up">
              <div className="w-full max-w-3xl mx-auto h-12 md:h-16 bg-gradient-to-b from-yellow-600 to-yellow-900 rounded-t-full mb-8 md:mb-12 flex items-center justify-center border-b-4 border-yellow-400 shadow-[0_10px_50px_rgba(250,204,21,0.2)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300/40 via-transparent to-transparent"></div>
                <span className="relative z-10 text-yellow-100 font-black tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-xl drop-shadow-lg uppercase">Sân khấu chính</span>
              </div>

              <div
                className="w-full max-w-5xl mx-auto grid gap-3 md:gap-6 md:px-10 transition-all duration-500"
                style={{ gridTemplateColumns: `repeat(${eventData?.gridCols || 3}, minmax(0, 1fr))` }}
              >
                {eventData?.layout?.map((cellSectionId, index) => {
                  const zone = eventZones.find(z => z.section === cellSectionId);
                  if (!zone) return <div key={`empty-${index}`} className="w-full min-h-[120px] md:min-h-[160px] rounded-2xl border-2 border-dashed border-gray-800/40 bg-black/10"></div>;
                  return <div key={`zone-${zone.section}`}>{renderZoneBlock(zone.section, zone.name, zone.price, index)}</div>;
                })}
              </div>
            </div>
          ) : renderDetailedSeats()}
        </div>
      </div>
    </div>
  );
};

export default SeatMatrix;