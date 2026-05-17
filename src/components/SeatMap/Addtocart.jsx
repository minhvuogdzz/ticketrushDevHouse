import React from 'react';

const CartDrawer = ({ 
  cartIconRef, 
  isCartOpen, 
  setIsCartOpen, 
  myLockedSeats, 
  myCartDetails, 
  eventZones, 
  totalPrice, 
  handleCancelSeat, 
  handleCheckoutClick 
}) => {
  return (
    <>
      {/* ICON GIỎ HÀNG NỔI */}
      <div className="fixed top-20 right-6 md:right-10 z-[60]">
        <button 
          ref={cartIconRef} 
          onClick={() => setIsCartOpen(true)} 
          className="bg-gradient-to-tr from-yellow-600 to-yellow-400 text-black p-4 rounded-full shadow-[0_5px_25px_rgba(250,204,21,0.5)] flex items-center justify-center relative active:scale-95 hover:scale-110 transition-transform"
        >
          <span className="text-2xl md:text-3xl">🛒</span>
          {myLockedSeats.length > 0 && (
            <span className="absolute -top-2 -left-2 md:-top-3 md:-left-3 bg-red-600 text-white text-xs md:text-sm font-black w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full animate-bounce shadow-md border-2 border-gray-900">
              {myLockedSeats.length}
            </span>
          )}
        </button>
      </div>

      {/* DRAWER GIỎ HÀNG */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-[#12141A] h-full p-6 shadow-2xl border-l border-gray-700 flex flex-col animate-slide-in-right">
            <button onClick={() => setIsCartOpen(false)} className="absolute top-4 right-6 text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 w-8 h-8 rounded-full flex items-center justify-center transition">✕</button>
            <div className="mt-8 flex-1 h-full overflow-hidden flex flex-col">
              
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;