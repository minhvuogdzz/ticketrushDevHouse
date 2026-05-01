import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WaitingRoomPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [position, setPosition] = useState(location.state?.position || 0);

  useEffect(() => {
    const savedUser = localStorage.getItem('ticketrush_user');
    if (!savedUser) {
      navigate('/');
      return;
    }

    const user = JSON.parse(savedUser);

    const checkQueueStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/queue/status/${user.userId}`);
        if (response.data.allowed) {
          // Đến lượt rồi, quay lại trang chọn ghế
          navigate('/event/1'); // Đổi '1' thành ID sự kiện động nếu có
        } else {
          setPosition(response.data.position);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra hàng chờ:', error);
      }
    };

    // Hỏi lại Backend mỗi 5 giây
    const pollingInterval = setInterval(checkQueueStatus, 5000);

    return () => clearInterval(pollingInterval);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-20 bg-[#0B0C10] px-4">
      <div className="bg-gray-900/80 p-12 rounded-3xl border border-gray-700 shadow-2xl flex flex-col items-center w-full max-w-2xl text-center">
        <div className="w-24 h-24 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(236,72,153,0.2)]"></div>
        <h2 className="text-3xl font-bold text-white mb-4">Hệ thống đang quá tải</h2>
        <h3 className="text-xl text-gray-300 mb-8">Bạn đang ở trong phòng chờ mua vé</h3>
        
        <div className="flex items-center gap-4 mb-10">
          <span className="text-lg text-gray-400">Vị trí của bạn:</span>
          <span className="bg-brand-secondary text-white px-8 py-3 rounded-xl font-black text-4xl shadow-lg border border-pink-500">
            {position}
          </span>
        </div>

        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl w-full">
          <p className="text-red-400 font-bold mb-2 flex justify-center items-center gap-2 text-lg">
            ⚠️ KHÔNG TẢI LẠI (F5) TRANG WEB
          </p>
          <p className="text-gray-400 text-sm">
            Hệ thống sẽ tự động chuyển bạn đến sơ đồ ghế khi đến lượt. Việc tải lại trang sẽ khiến bạn bị đẩy xuống cuối hàng và phải xếp hàng lại từ đầu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoomPage;