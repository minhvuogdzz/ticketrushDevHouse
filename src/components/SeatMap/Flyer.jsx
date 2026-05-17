import React, { useState, useEffect } from 'react';

const Flyer = ({ flyer }) => {
  const [style, setStyle] = useState({ left: flyer.startX, top: flyer.startY, opacity: 1, transform: 'scale(1)' });
  
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setStyle({ left: flyer.endX, top: flyer.endY, opacity: 0, transform: 'scale(0.1) rotate(720deg)' });
    });
    return () => cancelAnimationFrame(timer);
  }, [flyer]);

  return (
    <div 
      className="fixed z-[9999] bg-yellow-400 text-yellow-900 w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md flex items-center justify-center font-bold text-xs shadow-[0_0_30px_yellow] pointer-events-none transition-all duration-[700ms] ease-in-out" 
      style={style}
    >
      {flyer.text}
    </div>
  );
};

export default Flyer;