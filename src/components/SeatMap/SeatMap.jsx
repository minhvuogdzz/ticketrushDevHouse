import React from 'react';

const ZONE_COLORS = [
  { bg: 'bg-yellow-900/30', text: 'text-yellow-500', border: 'border-yellow-500' },
  { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-500' },
  { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-500' },
  { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-500' },
  { bg: 'bg-pink-900/30', text: 'text-pink-400', border: 'border-pink-500' },
  { bg: 'bg-teal-900/30', text: 'text-teal-400', border: 'border-teal-500' }
];

const SeatMap = ({ 
  filterSection, 
  setFilterSection, 
  eventData, 
  eventZones, 
  filteredSeats, 
  myLockedSeats, 
  handleSelectSeat 
}) => {

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

  return (
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
  );
};

export default SeatMap;