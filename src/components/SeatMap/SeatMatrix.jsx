import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate, useOutletContext } from 'react-router-dom';

// IMPORT CÁC COMPONENT CON ĐÃ TÁCH
import Flyer from './Flyer';
import QueueScreens from './QueueScreens';
import CheckoutModal from './CheckoutModal';
import CartDrawer from './Addtocart';
import SeatMap from './SeatMap';

const SeatMatrix = () => {
  const navigate = useNavigate();
  const { user, setShowAuth } = useOutletContext() || {};

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

  // --- LOGIC HÀNG CHỜ ẢO ---
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

    return () => {
      if (intervalId) clearInterval(intervalId);
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

  // --- FETCH SỰ KIỆN & GHẾ ---
  const [eventData, setEventData] = useState(null);
  useEffect(() => {
    axios.get('http://localhost:5001/api/event').then(res => setEventData(res.data)).catch(err => console.error(err));
  }, []);

  const eventZones = eventData?.zones || [];

  useEffect(() => {
    if (!queueInfo.allowed) return;

    const fetchSeats = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/seats');
        setSeats(response.data);
        if (user) {
          const myLocked = response.data.filter(s => s.lockedBy && s.status === 'locked' && String(s.lockedBy._id || s.lockedBy) === String(user.userId));
          setMyLockedSeats(myLocked.map(s => s.seatId));
        }
      } catch (error) {
        console.error('Lỗi tải ghế:', error);
      }
    };
    fetchSeats();

    const socket = io('http://localhost:5001');
    socket.on('seatUpdated', (updatedSeat) => {
      if (updatedSeat.type === 'RELOAD') return fetchSeats();
      setSeats(prev => prev.map(seat => seat.seatId === updatedSeat.seatId ? updatedSeat : seat));
      if (updatedSeat.status === 'available') {
        setMyLockedSeats(prev => prev.filter(id => id !== updatedSeat.seatId));
      }
    });
    return () => socket.disconnect();
  }, [user, queueInfo.allowed]);

  const filteredSeats = useMemo(() => filterSection === 'ALL' ? [] : seats.filter(seat => seat.section === filterSection), [seats, filterSection]);
  const myCartDetails = useMemo(() => seats.filter(seat => myLockedSeats.includes(seat.seatId)), [seats, myLockedSeats]);
  const totalPrice = myCartDetails.reduce((sum, seat) => sum + seat.price, 0);

  // --- LOGIC XỬ LÝ (CHỌN/HỦY/THANH TOÁN) ---
  const handleSelectSeat = async (seat, event) => {
    if (!user) return setShowAuth ? setShowAuth(true) : alert("Bạn cần đăng nhập!");
    if (seat.status !== 'available') return;
    try {
      const res = await axios.post('http://localhost:5001/api/seats/lock', { seatId: seat.seatId, userId: user.userId });
      if (res.data.success) {
        if (cartIconRef.current && event) {
          const btnRect = event.target.getBoundingClientRect();
          const targetRect = cartIconRef.current.getBoundingClientRect();
          const flyer = { id: Date.now(), text: seat.number, startX: btnRect.left, startY: btnRect.top, endX: targetRect.left + targetRect.width / 2 - 20, endY: targetRect.top + targetRect.height / 2 - 20 };
          setFlyingSeats(prev => [...prev, flyer]);
          setTimeout(() => {
            setFlyingSeats(prev => prev.filter(f => f.id !== flyer.id));
            setMyLockedSeats(prev => [...prev, seat.seatId]);
          }, 700);
        } else {
          setMyLockedSeats(prev => [...prev, seat.seatId]);
        }
      }
    } catch (err) { alert(`Ghế ${seat.seatId} vừa bị người khác giữ mất rồi!`); }
  };

  const handleCancelSeat = async (seatId) => {
    try {
      const res = await axios.post('http://localhost:5001/api/seats/unlock', { seatId, userId: user.userId });
      if (res.data.success) setMyLockedSeats(prev => prev.filter(id => id !== seatId));
    } catch (err) { alert(`Không thể hủy ghế: ${err.response?.data?.message}`); }
  };

  const handleCheckoutClick = () => { setIsCartOpen(false); setShowQRModal(true); };

  const confirmPaymentSuccess = async () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) return alert("⚠️ Vui lòng nhập Họ Tên và Số điện thoại!");
    setIsVerifyingPayment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const res = await axios.post('http://localhost:5001/api/seats/checkout', { seatIds: myLockedSeats, userId: user.userId, customerName: customerInfo.name, customerPhone: customerInfo.phone });
      if (res.data.success) {
        axios.post('http://localhost:5001/api/queue/leave', { userId: user.userId }).catch(() => {});
        alert('🎉 Thanh toán thành công!');
        setMyLockedSeats([]);
        setFilterSection('ALL');
        setIsCartOpen(false);
        setShowQRModal(false);
        localStorage.removeItem('ticketrush_session_end'); 
        setCustomerInfo({ name: '', phone: '' });
        window.location.reload(); 
      }
    } catch (err) { alert(`❌ Lỗi: ${err.response?.data?.message}`); } 
    finally { setIsVerifyingPayment(false); }
  };

  // ================= MAIN RENDER =================
  if (!queueInfo.allowed) return <QueueScreens queueInfo={queueInfo} />;

  return (
    <div className="relative w-full">
      {flyingSeats.map(flyer => <Flyer key={flyer.id} flyer={flyer} />)}
      
      <CheckoutModal 
        showQRModal={showQRModal} setShowQRModal={setShowQRModal} isVerifyingPayment={isVerifyingPayment} 
        customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} totalPrice={totalPrice} user={user} confirmPaymentSuccess={confirmPaymentSuccess}
      />

      <CartDrawer 
        cartIconRef={cartIconRef} isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}
        myLockedSeats={myLockedSeats} myCartDetails={myCartDetails} eventZones={eventZones}
        totalPrice={totalPrice} handleCancelSeat={handleCancelSeat} handleCheckoutClick={handleCheckoutClick}
      />

      <div className="w-full">
        <SeatMap 
          filterSection={filterSection} setFilterSection={setFilterSection} eventData={eventData} eventZones={eventZones}
          filteredSeats={filteredSeats} myLockedSeats={myLockedSeats} handleSelectSeat={handleSelectSeat}
        />
      </div>
    </div>
  );
};

export default SeatMatrix;