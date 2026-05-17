import React from 'react';

const QueueScreens = ({ queueInfo }) => {
  if (queueInfo.isChecking) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-[#0a0a0a] text-yellow-500">
        <div className="animate-spin text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">Đang kết nối hệ thống...</h2>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <div className="bg-[#12141A] p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 animate-pulse"></div>
        <div className="text-6xl mb-6">🚧</div>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase mb-2">Hệ thống đang quá tải</h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Hàng ngàn người đang cùng truy cập. Để đảm bảo trải nghiệm mua vé tốt nhất, hãy chờ đến lượt!
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
};

export default QueueScreens;