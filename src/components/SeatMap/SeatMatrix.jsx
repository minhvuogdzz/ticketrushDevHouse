import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate, useOutletContext } from 'react-router-dom';
import qrImg from '../../assets/image/qr.png';

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
  
  const [seats, setSeats] = useState([]);
  const [myLockedSeats, setMyLockedSeats] = useState([]);
  const [filterSection, setFilterSection] = useState('ALL');
  
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false); 
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [flyingSeats, setFlyingSeats] = useState([]);
  const cartIconRef = useRef(null); 
  const cartBoxRef = useRef(null);  

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedEndTime = localStorage.getItem('ticketrush_timer_end');
    if (savedEndTime) {
      const remaining = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    const newEndTime = Date.now() + 600 * 1000;
    localStorage.setItem('ticketrush_timer_end', newEndTime.toString());
    return 600;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const savedEndTime = localStorage.getItem('ticketrush_timer_end');
      if (savedEndTime) {
        const remaining = Math.floor((parseInt(savedEndTime) - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(timer);
          setTimeLeft(0);
          handleSessionTimeout(); 
        } else {
          setTimeLeft(remaining);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSessionTimeout = async () => {
    alert("⏳ Đã hết 10 phút! Phiên giao dịch của bạn đã kết thúc để nhường chỗ cho người khác.");
    if (myLockedSeats.length > 0 && user) {
       await Promise.all(myLockedSeats.map(id => 
          axios.post('http://localhost:5001/api/seats/unlock', { seatId: id, userId: user.userId }).catch(()=>{})
       ));
    }
    localStorage.removeItem('ticketrush_user');
    localStorage.removeItem('ticketrush_timer_end');
    window.location.href = '/'; 
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/seats');
        setSeats(response.data);
      } catch (error) {
        console.error('Lỗi khi tải ghế:', error);
      }
    };
    fetchSeats();

    const socket = io('http://localhost:5001');
    socket.on('seatUpdated', (updatedSeat) => {
      setSeats(prevSeats => prevSeats.map(seat => seat.seatId === updatedSeat.seatId ? updatedSeat : seat));
    });
    return () => socket.disconnect();
  }, []);

  const filteredSeats = useMemo(() => {
    if (filterSection === 'ALL') return [];
    return seats.filter(seat => seat.section === filterSection);
  }, [seats, filterSection]);

  const myCartDetails = useMemo(() => {
    return seats.filter(seat => myLockedSeats.includes(seat.seatId));
  }, [seats, myLockedSeats]);

  const totalPrice = myCartDetails.reduce((sum, seat) => sum + seat.price, 0);

  const handleSelectSeat = async (seat, event) => {
    if (!user) {
      alert("Bạn cần đăng nhập để chọn ghế!");
      if(setShowAuth) setShowAuth(true);
      return;
    }
    if (seat.status !== 'available') return;
    try {
      const response = await axios.post('http://localhost:5001/api/seats/lock', { seatId: seat.seatId, userId: user.userId });
      if (response.data.success) {
        const isMobile = window.innerWidth < 1024; 
        const targetRef = isMobile ? cartIconRef : cartBoxRef;

        if (targetRef.current && event) {
          const btnRect = event.target.getBoundingClientRect();
          const targetRect = targetRef.current.getBoundingClientRect();
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

  const handleCheckoutClick = () => setShowQRModal(true); 
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

 const confirmPaymentSuccess = async () => {
    // Validate trước khi chạy hiệu ứng loading
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      alert("⚠️ BẮT BUỘC: Vui lòng nhập Họ Tên và Số điện thoại để hệ thống xuất vé!");
      return;
    }

    setIsVerifyingPayment(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // GỬI KÈM TÊN VÀ SĐT XUỐNG BACKEND
      const response = await axios.post('http://localhost:5001/api/seats/checkout', { 
        seatIds: myLockedSeats, 
        userId: user.userId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone
      });

      if (response.data.success) {
        alert('🎉 Xác nhận từ ngân hàng: Đã nhận được tiền. Vé của bạn đã được xuất thành công!');
        setMyLockedSeats([]); 
        setFilterSection('ALL');
        setIsMobileCartOpen(false);
        setShowQRModal(false);
        localStorage.removeItem('ticketrush_timer_end');
        setCustomerInfo({ name: '', phone: '' }); // Xóa trắng form sau khi mua xong
      }
    } catch (error) {
      alert(`❌ Ngân hàng báo lỗi: ${error.response?.data?.message || 'Chưa nhận được giao dịch. Vui lòng thử lại!'}`);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const renderDetailedSeats = () => {
    const rows = {};
    filteredSeats.forEach(seat => {
      if (!rows[seat.row]) rows[seat.row] = [];
      rows[seat.row].push(seat);
    });

    return (
      <div className="w-full animate-fade-in">
        <button onClick={() => setFilterSection('ALL')} className="mb-6 flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold bg-yellow-900/30 px-4 py-2 rounded-lg transition">
          <span>←</span> Quay lại sơ đồ tổng
        </button>
        <div className="bg-gray-800/50 p-4 md:p-8 rounded-2xl border border-gray-600 shadow-inner w-full">
          <h3 className="text-center text-xl md:text-2xl font-black text-white mb-8 uppercase tracking-widest border-b border-gray-700 pb-4">
            Khu vực {filterSection === 'VIP' ? 'VIP' : `Khán đài ${filterSection}`}
          </h3>
          <div className="flex flex-col gap-6 items-center w-full">
            {Object.keys(rows).map(rowNum => (
              <div key={rowNum} className="flex flex-wrap justify-center gap-2 md:gap-3 items-center w-full">
                <span className="w-6 md:w-8 text-xs md:text-sm text-yellow-500 font-bold text-right pr-2">R{rowNum}</span>
                {rows[rowNum].map(seat => (
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

  const renderZoneBlock = (id, name, price, bgClass, textClass) => (
    <div onClick={() => setFilterSection(id)} className={`${bgClass} border-2 border-gray-600 hover:border-yellow-400 rounded-xl md:rounded-2xl p-2 md:p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] group w-full h-full min-h-[70px] md:min-h-[120px]`}>
      <h4 className={`text-[11px] md:text-2xl font-black ${textClass} group-hover:text-yellow-400 mb-1 md:mb-2 uppercase tracking-tight md:tracking-wide text-center leading-tight`}>{name}</h4>
      <p className="text-gray-300 font-medium text-[9px] md:text-base bg-black/40 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-gray-700 whitespace-nowrap">{price}</p>
    </div>
  );

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
        <>
          <div className="flex flex-col gap-3 max-h-[50vh] md:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
            {myCartDetails.map(seat => (
              <div key={seat.seatId} className="bg-gray-800/80 border-l-4 border-yellow-500 p-3 md:p-4 rounded-r-xl flex justify-between items-center group shadow-md">
                <div>
                  <div className="font-black text-lg md:text-xl text-yellow-400">{seat.seatId}</div>
                  <div className="text-xs text-gray-400 mt-1">{seat.section === 'VIP' ? 'Khu vực VIP' : `Khán đài ${seat.section}`} - R{seat.row}</div>
                  <div className="font-bold text-white mt-1">{seat.price.toLocaleString('vi-VN')} đ</div>
                </div>
                <button onClick={() => handleCancelSeat(seat.seatId)} className="bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center border border-red-800/50">✕ Hủy</button>
              </div>
            ))}
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
        </>
      )}
    </>
  );

  return (
    <div className="relative w-full">
      {flyingSeats.map(flyer => <Flyer key={flyer.id} flyer={flyer} />)}

      <div className="w-full bg-red-950/40 border border-red-500/50 rounded-xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg backdrop-blur-md">
         <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">⏳</span>
            <div>
               <p className="text-red-400 font-bold text-sm">Thời gian giữ phiên làm việc</p>
               <p className="text-gray-300 text-xs mb-1">Vui lòng hoàn tất thanh toán trước khi thời gian kết thúc.</p>
               <p className="text-yellow-400 text-xs font-bold uppercase tracking-wide bg-yellow-900/40 px-2 py-0.5 rounded border border-yellow-700/50 inline-block">
                 ⚠️ Không tải lại trang để tránh trải nghiệm bị gián đoạn
               </p>
            </div>
         </div>
         <div className="bg-black/60 px-6 py-2 rounded-lg border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <span className={`text-3xl font-black tracking-widest ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
              {formatTime(timeLeft)}
            </span>
         </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center animate-fade-in text-gray-900 shadow-2xl relative">
             <button onClick={() => setShowQRModal(false)} disabled={isVerifyingPayment} className="absolute top-4 right-4 text-gray-500 hover:text-black font-bold text-xl disabled:opacity-50">✕</button>
             <h2 className="text-2xl font-black text-red-700 mb-2 uppercase tracking-tight">Thanh toán vé</h2>
             <p className="text-sm font-medium mb-6 text-center text-gray-600">Mở ứng dụng Ngân hàng hoặc Momo để quét mã QR bên dưới.</p>
             <div className="bg-gray-100 p-4 rounded-2xl mb-6 shadow-inner border border-gray-200 w-full flex justify-center">
               <img src={qrImg} alt="QR Code Thanh Toán" className="w-56 h-56 rounded-xl object-contain mix-blend-multiply"/>
             </div>

             {/* ĐÃ THÊM: FORM NHẬP THÔNG TIN KHÁCH HÀNG */}
             <div className="w-full flex flex-col gap-3 mb-6 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <p className="text-xs font-black text-yellow-800 uppercase tracking-wider text-center">Thông tin xuất vé (Bắt buộc)</p>
                <input 
                  type="text" placeholder="Họ và tên người đi xem..." 
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full bg-white border border-yellow-300 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200 transition text-sm font-medium"
                />
                <input 
                  type="tel" placeholder="Số điện thoại..." 
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full bg-white border border-yellow-300 text-gray-900 px-4 py-2.5 rounded-lg focus:outline-none focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200 transition text-sm font-medium"
                />
             </div>
             <div className="w-full bg-red-50 p-4 rounded-xl border border-red-100 mb-8 text-center shadow-sm">
               <p className="text-gray-600 text-sm mb-1 font-medium">Số tiền cần thanh toán</p>
               <p className="text-red-700 font-black text-2xl mb-1 drop-shadow-sm">{totalPrice.toLocaleString('vi-VN')} đ</p>
               <p className="text-gray-500 text-xs mt-2 border-t border-red-100 pt-2">Nội dung chuyển khoản: <br/><b className="text-gray-800">TicketRush {user?.username}</b></p>
             </div>
             <button onClick={confirmPaymentSuccess} disabled={isVerifyingPayment} className={`w-full py-4 font-black text-white rounded-xl transition shadow-lg uppercase tracking-wider flex justify-center items-center gap-2 ${isVerifyingPayment ? 'bg-gray-500 cursor-not-allowed opacity-80' : 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-[1.02] shadow-[0_10px_20px_rgba(34,197,94,0.3)]'}`}>
                {isVerifyingPayment ? <><div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div> Đang kiểm tra giao dịch...</> : 'Xác nhận đã chuyển khoản'}
             </button>
          </div>
        </div>
      )}

      <div className="lg:hidden fixed top-24 right-4 z-[60]">
        <button ref={cartIconRef} onClick={() => setIsMobileCartOpen(true)} className="bg-gradient-to-tr from-yellow-600 to-yellow-400 text-black p-4 rounded-full shadow-[0_5px_25px_rgba(250,204,21,0.5)] flex items-center justify-center relative active:scale-95 transition-transform">
          <span className="text-2xl">🛒</span>
          {myLockedSeats.length > 0 && <span className="absolute -top-2 -left-2 bg-red-600 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-md border-2 border-gray-900">{myLockedSeats.length}</span>}
        </button>
      </div>

      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-gray-900 h-full p-6 shadow-2xl border-l border-gray-700 flex flex-col animate-slide-in-right">
            <button onClick={() => setIsMobileCartOpen(false)} className="absolute top-4 right-6 text-gray-400 hover:text-white text-2xl">✕</button>
            <div className="mt-8 flex-1"><CartContent /></div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
        <div className="flex-1 w-full bg-gray-900/90 p-4 md:p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-xl">
          <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-gray-700 pb-6 w-full">
            <div className="w-full xl:w-auto overflow-x-auto custom-scrollbar pb-2 xl:pb-0">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3">Tra cứu nhanh khu vực</h3>
              <div className="flex gap-2 w-max xl:w-full">
                {[{ id: 'ALL', label: 'Sơ đồ tổng' }, { id: 'VIP', label: 'VIP' }, { id: 'A', label: 'Khán đài A' }, { id: 'B', label: 'Khán đài B' }, { id: 'C', label: 'Khán đài C' }, { id: 'D', label: 'Khán đài D' }].map(sec => (
                  <button key={sec.id} onClick={() => setFilterSection(sec.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterSection === sec.id ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'}`}>{sec.label}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 items-center text-xs md:text-sm text-gray-300 bg-black/40 p-3 rounded-lg border border-gray-800 w-full xl:w-auto justify-center">
               <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-300"></div> Trống</div>
               <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-400"></div> Đang chọn</div>
               <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-600 opacity-60"></div> Đã bán</div>
            </div>
          </div>

          {filterSection === 'ALL' ? (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="w-full max-w-xl mx-auto h-8 md:h-16 bg-gradient-to-b from-yellow-600 to-yellow-900 rounded-t-full mb-6 md:mb-10 flex items-center justify-center border-b-2 md:border-b-4 border-yellow-400 shadow-[0_10px_50px_rgba(250,204,21,0.2)]">
                <span className="text-yellow-100 font-black tracking-[0.15em] md:tracking-[0.3em] text-[10px] md:text-xl drop-shadow-md">SÂN KHẤU CHÍNH</span>
              </div>
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 md:gap-6">
                <div className="grid grid-cols-4 gap-2 md:gap-6 w-full">
                  <div className="col-span-1 flex items-end">{renderZoneBlock('A', 'Khán đài A', '500.000 đ', 'bg-blue-900/30', 'text-blue-300')}</div>
                  <div className="col-span-2">{renderZoneBlock('VIP', 'Khu vực VIP', '600.000 đ', 'bg-yellow-900/30', 'text-yellow-500')}</div>
                  <div className="col-span-1 flex items-end">{renderZoneBlock('B', 'Khán đài B', '500.000 đ', 'bg-blue-900/30', 'text-blue-300')}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 md:gap-6 w-full px-4 md:px-16 mt-1 md:mt-0">
                  <div className="col-span-1">{renderZoneBlock('C', 'Khán đài C', '400.000 đ', 'bg-green-900/30', 'text-green-300')}</div>
                  <div className="col-span-1">{renderZoneBlock('D', 'Khán đài D', '400.000 đ', 'bg-green-900/30', 'text-green-300')}</div>
                </div>
              </div>
            </div>
          ) : renderDetailedSeats()}
        </div>

        <div ref={cartBoxRef} className="hidden lg:block w-[350px] xl:w-[400px] bg-gray-900/90 p-6 rounded-2xl border border-gray-700 shadow-2xl backdrop-blur-xl sticky top-24">
          <CartContent />
        </div>
      </div>
    </div>
  );
};

export default SeatMatrix;