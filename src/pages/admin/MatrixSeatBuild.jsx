import React from 'react';

const MatrixSeatBuild = ({ 
  gridConfig, handleGridResize, layout, handleDragStart, handleDrop, handleRemoveFromGrid, 
  zones, handleZoneChange, handleAddZone, handleRemoveZone, totalCapacity, 
  handleUpdatePrices, handleGenerateMap, isProcessing 
}) => {
  const unplacedZones = zones.filter(z => !layout.includes(z.section));

  return (
    <div className="space-y-8">
      {/* GRID MAP */}
      <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl">
        <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-lg font-black text-white uppercase">🗺️ Bố cục Trực quan (Drag & Drop)</h2>
          <div className="flex gap-2 items-center bg-black/50 p-2 rounded-lg border border-gray-700">
            <span className="text-xs text-gray-400 uppercase font-bold">Grid:</span>
            <input type="number" min="1" max="10" value={gridConfig.cols} onChange={(e) => handleGridResize('cols', e.target.value)} className="w-12 bg-gray-900 border border-gray-600 rounded text-center text-white font-bold outline-none" /> x
            <input type="number" min="1" max="10" value={gridConfig.rows} onChange={(e) => handleGridResize('rows', e.target.value)} className="w-12 bg-gray-900 border border-gray-600 rounded text-center text-white font-bold outline-none" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 bg-black/40 p-4 rounded-xl border border-gray-800">
            <h3 className="text-yellow-500 font-bold uppercase text-xs mb-4">Chờ xếp chỗ:</h3>
            <div className="flex flex-wrap gap-2">
              {unplacedZones.map(zone => (
                <div key={zone.section} draggable onDragStart={(e) => handleDragStart(e, zone.section)} className="bg-gray-800 border border-gray-600 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-700 w-full transition font-bold text-white text-sm">
                  {zone.name}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 flex flex-col items-center">
            <div className="w-full h-8 bg-gradient-to-b from-yellow-600 to-yellow-900 rounded-t-full mb-4 flex items-center justify-center border-b-2 border-yellow-400"><span className="text-yellow-100 font-black tracking-[0.2em] text-xs">SÂN KHẤU CHÍNH</span></div>
            <div className="grid gap-2 w-full bg-black/40 p-3 rounded-xl border border-gray-800 transition-all duration-300" style={{ gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))` }}>
              {layout.map((cellId, idx) => {
                const zoneObj = zones.find(z => z.section === cellId);
                return (
                  <div key={idx} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, idx)} className={`h-20 border-2 border-dashed rounded-lg flex items-center justify-center relative ${zoneObj ? 'border-yellow-500 bg-yellow-900/30' : 'border-gray-700'}`}>
                    {zoneObj ? (
                      <div draggable onDragStart={(e) => handleDragStart(e, zoneObj.section)} className="w-full h-full flex items-center justify-center cursor-grab group p-1">
                        <span className="font-bold text-yellow-400 text-center text-[10px] break-words leading-tight">{zoneObj.name}</span>
                        <button onClick={() => handleRemoveFromGrid(idx)} className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-white text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition">✕</button>
                      </div>
                    ) : <span className="text-gray-600 text-[9px]">Trống</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ZONES TABLE */}
      <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-white uppercase">🎟️ Số lượng ghế & Giá vé</h2>
          <button onClick={handleAddZone} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/40 px-3 py-1.5 rounded-lg text-sm font-bold Transition">+ Thêm khu vực</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-gray-500 border-b border-gray-800">
              <tr><th className="pb-4">Mã</th><th className="pb-4">Tên</th><th className="pb-4">Hàng</th><th className="pb-4">Ghế/Hàng</th><th className="pb-4">Giá (VND)</th><th className="pb-4">Xóa</th></tr>
            </thead>
            <tbody>
              {zones.map((zone, idx) => (
                <tr key={idx} className="border-b border-gray-800/50">
                  <td className="py-2"><input type="text" value={zone.section} onChange={(e) => handleZoneChange(idx, 'section', e.target.value)} className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-yellow-400 font-bold focus:border-yellow-500 outline-none" /></td>
                  <td className="py-2"><input type="text" value={zone.name} onChange={(e) => handleZoneChange(idx, 'name', e.target.value)} className="w-32 lg:w-48 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white focus:border-yellow-500 outline-none" /></td>
                  <td className="py-2"><input type="number" value={zone.rows} onChange={(e) => handleZoneChange(idx, 'rows', e.target.value)} className="w-14 bg-gray-900 border border-gray-700 rounded py-1 text-center focus:border-yellow-500 outline-none" /></td>
                  <td className="py-2"><input type="number" value={zone.seatsPerRow} onChange={(e) => handleZoneChange(idx, 'seatsPerRow', e.target.value)} className="w-14 bg-gray-900 border border-gray-700 rounded py-1 text-center focus:border-yellow-500 outline-none" /></td>
                  <td className="py-2"><input type="number" value={zone.price} onChange={(e) => handleZoneChange(idx, 'price', e.target.value)} className="w-24 lg:w-32 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-green-400 text-right font-bold focus:border-yellow-500 outline-none" /></td>
                  <td className="py-2 text-center"><button onClick={() => handleRemoveZone(idx)} className="text-red-500 font-bold text-lg hover:text-red-400 transition">✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-right text-gray-400 text-sm">
          Tổng sức chứa: <span className="font-bold text-yellow-500 text-lg">{totalCapacity.toLocaleString()}</span> vé
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-800 pt-6">
          <button onClick={handleUpdatePrices} disabled={isProcessing} className="border border-yellow-500/50 text-yellow-500 py-4 rounded-xl font-bold uppercase hover:bg-yellow-500/10 transition">Cập nhật giá vé</button>
          <button onClick={handleGenerateMap} disabled={isProcessing} className="bg-red-600 text-white py-4 rounded-xl font-bold uppercase hover:bg-red-500 shadow-lg transition">⚠️ Reset & Sinh Sơ đồ</button>
        </div>
      </div>
    </div>
  );
};

export default MatrixSeatBuild;