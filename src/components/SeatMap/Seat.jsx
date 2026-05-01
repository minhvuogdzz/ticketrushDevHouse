import React from 'react';

const Seat = ({ id, status, onSelect }) => {
  // Xác định màu sắc dựa trên trạng thái ghế
  const getSeatColor = () => {
    switch (status) {
      case 'Available': return 'bg-gray-300 hover:bg-green-400 cursor-pointer'; // Ghế trống
      case 'Locked': return 'bg-yellow-400 cursor-not-allowed'; // Đang bị người khác giữ
      case 'Sold': return 'bg-red-500 cursor-not-allowed'; // Đã bán
      case 'Selected': return 'bg-green-500'; // Ghế bạn đang chọn
      default: return 'bg-gray-300';
    }
  };

  return (
    <div 
      onClick={() => {
        if (status === 'Available' || status === 'Selected') onSelect(id);
      }}
      className={`w-8 h-8 rounded-t-lg mx-1 mb-2 flex items-center justify-center text-xs font-bold text-gray-800 transition-colors ${getSeatColor()}`}
      title={`Ghế ${id} - ${status}`}
    >
      {id}
    </div>
  );
};

export default Seat;