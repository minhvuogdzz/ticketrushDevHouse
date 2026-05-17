import React from 'react';
import qrImg from '../../assets/image/qr.png'; // Sửa lại đường dẫn nếu cần

const CheckoutModal = ({ 
  showQRModal, 
  setShowQRModal, 
  isVerifyingPayment, 
  customerInfo, 
  setCustomerInfo, 
  totalPrice, 
  user, 
  confirmPaymentSuccess 
}) => {
  if (!showQRModal) return null;

  return (
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
          {isVerifyingPayment ? <><div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div> Đang xử lý...</> : 'Xác nhận đã chuyển khoản'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutModal;