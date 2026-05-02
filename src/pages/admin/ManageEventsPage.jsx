import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageEventsPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [eventInfo, setEventInfo] = useState({ name: '', date: '', time: '', location: '' });
  const [zones, setZones] = useState([]);

  // ĐÃ THÊM: State quản lý Số dòng x Số cột của Lưới
  const [gridConfig, setGridConfig] = useState({ rows: 3, cols: 3 });
  const [layout, setLayout] = useState(Array(9).fill(null));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/event');
        setEventInfo({
          name: res.data.name || '', date: res.data.date || '',
          time: res.data.time || '', location: res.data.location || ''
        });

        if (res.data.zones?.length > 0) setZones(res.data.zones);
        else setZones([{ section: 'VIP', name: 'Khu vực VIP', rows: 5, seatsPerRow: 20, price: 600000 }]);

        // Khôi phục lưới động
        const rows = res.data.gridRows || 3;
        const cols = res.data.gridCols || 3;
        setGridConfig({ rows, cols });

        if (res.data.layout?.length === (rows * cols)) {
          setLayout(res.data.layout);
        } else {
          setLayout(Array(rows * cols).fill(null));
        }
      } catch (err) { console.error("Lỗi load event"); }
    };
    fetchData();
  }, []);

  const handleSaveConfig = async () => {
    setIsProcessing(true);
    try {
      await axios.post('http://localhost:5001/api/event/update', {
        ...eventInfo, zones, layout, gridRows: gridConfig.rows, gridCols: gridConfig.cols
      });
      alert("✅ Đã lưu Cấu hình Sự kiện & Sơ đồ vào hệ thống thành công!");
    } catch (err) { alert("❌ Lỗi lưu thông tin!"); }
    finally { setIsProcessing(false); }
  };

  // --- HÀM THAY ĐỔI KÍCH THƯỚC LƯỚI ---
  const handleGridResize = (type, value) => {
    let val = Number(value);
    if (val < 1) val = 1; // Tối thiểu 1
    if (val > 10) val = 10; // Tối đa 10 cho khỏi nát giao diện

    const newConfig = { ...gridConfig, [type]: val };
    setGridConfig(newConfig);

    // Tạo mảng layout mới dựa trên kích thước mới
    const newSize = newConfig.rows * newConfig.cols;
    const newLayout = Array(newSize).fill(null);

    // Giữ lại vị trí cũ (nếu có thể) chuyển sang mảng mới
    layout.forEach((cell, index) => {
      if (index < newSize) newLayout[index] = cell;
    });

    setLayout(newLayout);
  };

  // --- LOGIC ZONE ---
  const handleZoneChange = (index, field, value) => {
    const newZones = [...zones];
    newZones[index][field] = (field === 'rows' || field === 'seatsPerRow' || field === 'price') ? Number(value) : value;
    setZones(newZones);
    if (field === 'section') {
      const oldSection = zones[index].section;
      setLayout(layout.map(cell => cell === oldSection ? value : cell));
    }
  };

  const handleAddZone = () => {
    setZones([...zones, { section: `Z${Date.now().toString().slice(-4)}`, name: 'Khu mới', rows: 5, seatsPerRow: 10, price: 100000 }]);
  };

  const handleRemoveZone = (index) => {
    if (window.confirm("Xóa khu vực này khỏi cấu hình?")) {
      const removedSection = zones[index].section;
      setZones(zones.filter((_, i) => i !== index));
      setLayout(layout.map(cell => cell === removedSection ? null : cell));
    }
  };

  const totalCapacity = zones.reduce((sum, z) => sum + (z.rows * z.seatsPerRow), 0);

  // --- KÉO THẢ GRID ---
  const handleDragStart = (e, sectionId) => e.dataTransfer.setData('sectionId', sectionId);

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedSectionId = e.dataTransfer.getData('sectionId');
    const newLayout = [...layout];
    const oldIndex = newLayout.indexOf(draggedSectionId);
    const targetCellContent = newLayout[targetIndex];
    if (oldIndex !== -1) newLayout[oldIndex] = targetCellContent;
    newLayout[targetIndex] = draggedSectionId;
    setLayout(newLayout);
  };

  const handleRemoveFromGrid = (index) => {
    const newLayout = [...layout];
    newLayout[index] = null;
    setLayout(newLayout);
  };

  const unplacedZones = zones.filter(z => !layout.includes(z.section));

  // --- NÚT HÀNH ĐỘNG ---
  const handleUpdatePrices = async () => {
    if (!window.confirm("Cập nhật giá mới cho các vé chưa bán?")) return;
    setIsProcessing(true);
    try {
      await axios.post('http://localhost:5001/api/event/update', { ...eventInfo, zones, layout, gridRows: gridConfig.rows, gridCols: gridConfig.cols });
      await axios.post('http://localhost:5001/api/seats/admin/update-prices', { zones });
      alert("✅ Đã cập nhật giá vé mới!");
    } catch (err) { alert("❌ Lỗi cập nhật giá!"); }
    finally { setIsProcessing(false); }
  };

  const handleGenerateMap = async () => {
    if (window.prompt("Nhập 'XACNHAN' để tạo sơ đồ thực tế:") !== "XACNHAN") return;
    setIsProcessing(true);
    try {
      await axios.post('http://localhost:5001/api/event/update', { ...eventInfo, zones, layout, gridRows: gridConfig.rows, gridCols: gridConfig.cols });
      await axios.post('http://localhost:5001/api/seats/admin/generate-map', { zones });
      alert("🎉 Đã khởi tạo sơ đồ mới thành công!");
    } catch (err) { alert("❌ Lỗi tạo sơ đồ!"); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 font-sans flex flex-col md:flex-row pb-20 md:pb-0">

      <aside className="w-full md:w-64 bg-[#12141A] border-r border-gray-800 p-6 flex flex-col gap-6 md:sticky md:top-0 md:h-screen">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-10 cursor-pointer" onClick={() => navigate('/')}>TICKETRUSH</div>
        <nav className="flex md:flex-col gap-2">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:bg-gray-800 px-4 py-3 rounded-xl font-bold transition">📊 Tổng quan</button>
          <button className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-4 py-3 rounded-xl font-bold">⚙️ Cấu hình Sự kiện</button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-black text-white uppercase">Cấu hình Sơ đồ & Sự kiện</h1>
          <button onClick={handleSaveConfig} disabled={isProcessing} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg">
            {isProcessing ? 'Đang lưu...' : '💾 Lưu mọi thay đổi'}
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

          <div className="xl:col-span-1 space-y-6">
            <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl h-full">
              <h2 className="text-lg font-black text-white mb-6 uppercase flex items-center gap-2"><span>📝</span> Thông tin chung</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Tên sự kiện</label>
                  <input type="text" value={eventInfo.name} onChange={(e) => setEventInfo({ ...eventInfo, name: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Mô tả sự kiện</label>
                  <textarea
                    value={eventInfo.description}
                    onChange={(e) => setEventInfo({ ...eventInfo, description: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mt-1 h-20 resize-none"
                    placeholder="Nhập mô tả sự kiện (hiển thị ở trang chủ)..."
                  ></textarea>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Địa điểm</label>
                  <input type="text" value={eventInfo.location} onChange={(e) => setEventInfo({ ...eventInfo, location: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Ngày</label>
                    <input type="text" value={eventInfo.date} onChange={(e) => setEventInfo({ ...eventInfo, date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Giờ</label>
                    <input type="text" value={eventInfo.time} onChange={(e) => setEventInfo({ ...eventInfo, time: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mt-1" />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">Sức chứa dự kiến hệ thống:</p>
                  <p className="text-3xl font-black text-yellow-500">{totalCapacity.toLocaleString()} vé</p>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase">🗺️ Bố cục Trực quan (Drag & Drop)</h2>
                <p className="text-gray-400 text-sm">Kéo các Khu vực vào lưới để tạo hình cho sơ đồ thực tế.</p>
              </div>
              {/* TOOL ĐỔI KÍCH THƯỚC LƯỚI */}
              <div className="flex gap-2 items-center bg-black/50 p-2 rounded-lg border border-gray-700">
                <span className="text-xs text-gray-400 uppercase font-bold">Kích thước Grid:</span>
                <input type="number" min="1" max="10" value={gridConfig.cols} onChange={(e) => handleGridResize('cols', e.target.value)} className="w-12 bg-gray-900 border border-gray-600 rounded text-center text-white font-bold" title="Số cột (Ngang)" />
                <span className="text-gray-500">x</span>
                <input type="number" min="1" max="10" value={gridConfig.rows} onChange={(e) => handleGridResize('rows', e.target.value)} className="w-12 bg-gray-900 border border-gray-600 rounded text-center text-white font-bold" title="Số hàng (Dọc)" />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/3 bg-black/40 p-4 rounded-xl border border-gray-800">
                <h3 className="text-yellow-500 font-bold uppercase text-xs mb-4">Chờ xếp chỗ:</h3>
                {unplacedZones.length === 0 ? (
                  <p className="text-gray-600 text-xs italic">Tất cả đã được lên sơ đồ.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {unplacedZones.map(zone => (
                      <div key={zone.section} draggable onDragStart={(e) => handleDragStart(e, zone.section)} className="bg-gray-800 border border-gray-600 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-700 w-full">
                        <p className="font-bold text-white text-sm">{zone.name}</p>
                        <p className="text-[10px] text-yellow-400 mt-1">Kéo tôi ↔</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:w-2/3 flex flex-col items-center">
                <div className="w-full h-8 bg-gradient-to-b from-yellow-600 to-yellow-900 rounded-t-full mb-4 flex items-center justify-center border-b-2 border-yellow-400 shadow-[0_5px_15px_rgba(250,204,21,0.2)]">
                  <span className="text-yellow-100 font-black tracking-[0.2em] text-xs">SÂN KHẤU CHÍNH</span>
                </div>
                {/* ĐÃ FIX: LƯỚI GRID ĐỘNG VỚI INLINE STYLE */}
                <div
                  className="grid gap-2 w-full bg-black/40 p-3 rounded-xl border border-gray-800 transition-all duration-300"
                  style={{ gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))` }}
                >
                  {layout.map((cellSectionId, index) => {
                    const zoneObj = zones.find(z => z.section === cellSectionId);
                    return (
                      <div key={index} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, index)} className={`h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center relative transition-all ${zoneObj ? 'border-yellow-500 bg-yellow-900/30' : 'border-gray-700 hover:border-gray-500'}`}>
                        {zoneObj ? (
                          <div draggable onDragStart={(e) => handleDragStart(e, zoneObj.section)} className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing group relative p-1">
                            <span className="font-bold text-yellow-400 text-center text-[10px] md:text-xs break-words w-full leading-tight">{zoneObj.name}</span>
                            <button onClick={() => handleRemoveFromGrid(index)} className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center">✕</button>
                          </div>
                        ) : <span className="text-gray-600 text-[9px] text-center">Thả vào đây</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-white uppercase">🎟️ Cấu hình Số lượng ghế & Giá vé</h2>
            <button onClick={handleAddZone} className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/40 px-3 py-1.5 rounded-lg text-sm font-bold border border-yellow-500/50">+ Thêm khu vực</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-gray-500 border-b border-gray-800">
                <tr>
                  <th className="pb-4">Mã Khu</th>
                  <th className="pb-4">Tên hiển thị</th>
                  <th className="pb-4 text-center">Hàng</th>
                  <th className="pb-4 text-center">Ghế/Hàng</th>
                  <th className="pb-4 text-right">Giá (VND)</th>
                  <th className="pb-4 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone, index) => (
                  <tr key={index} className="border-b border-gray-800/50">
                    <td className="py-2"><input type="text" value={zone.section} onChange={(e) => handleZoneChange(index, 'section', e.target.value)} className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-yellow-400 font-bold uppercase" /></td>
                    <td className="py-2"><input type="text" value={zone.name} onChange={(e) => handleZoneChange(index, 'name', e.target.value)} className="w-32 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white" /></td>
                    <td className="py-2 text-center"><input type="number" value={zone.rows} onChange={(e) => handleZoneChange(index, 'rows', e.target.value)} className="w-14 bg-gray-900 border border-gray-700 text-center rounded py-1" /></td>
                    <td className="py-2 text-center"><input type="number" value={zone.seatsPerRow} onChange={(e) => handleZoneChange(index, 'seatsPerRow', e.target.value)} className="w-14 bg-gray-900 border border-gray-700 text-center rounded py-1" /></td>
                    <td className="py-2 text-right"><input type="number" value={zone.price} onChange={(e) => handleZoneChange(index, 'price', e.target.value)} className="w-24 bg-gray-900 border border-gray-700 text-right px-2 rounded py-1 text-green-400 font-bold" /></td>
                    <td className="py-2 text-center"><button onClick={() => handleRemoveZone(index)} className="text-red-500 hover:text-red-400 font-bold text-lg">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-800 pt-6">
            <button onClick={handleUpdatePrices} disabled={isProcessing} className="border border-yellow-500/50 text-yellow-500 py-4 rounded-xl font-bold uppercase hover:bg-yellow-500/10">Cập nhật giá vé (Không xóa vé)</button>
            <button onClick={handleGenerateMap} disabled={isProcessing} className="bg-red-600 text-white py-4 rounded-xl font-bold uppercase hover:bg-red-500 shadow-lg">⚠️ Reset toàn bộ & Tạo Sơ đồ Mới</button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ManageEventsPage;