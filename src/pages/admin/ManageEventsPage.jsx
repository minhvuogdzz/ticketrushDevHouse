import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageEventsPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const [eventInfo, setEventInfo] = useState({ name: '', date: '', time: '', location: '' });
  const [zones, setZones] = useState([]);
  
  // State quản lý lưới 3x3 (Mảng 9 phần tử, chứa section ID)
  const [layout, setLayout] = useState(Array(9).fill(null));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/event');
        setEventInfo({ name: res.data.name || '', date: res.data.date || '', time: res.data.time || '', location: res.data.location || '' });
        
        if (res.data.zones?.length > 0) setZones(res.data.zones);
        else setZones([{ section: 'VIP', name: 'Khu vực VIP', rows: 5, seatsPerRow: 20, price: 600000 }]);

        if (res.data.layout?.length === 9) setLayout(res.data.layout);
      } catch (err) { console.error("Lỗi load event"); }
    };
    fetchData();
  }, []);

  const handleSaveConfig = async () => {
    setIsProcessing(true);
    try {
      await axios.post('http://localhost:5001/api/event/update', { ...eventInfo, zones, layout });
      alert("✅ Đã lưu Cấu hình & Bố cục Sơ đồ thành công!");
    } catch (err) { alert("❌ Lỗi lưu thông tin!"); }
    finally { setIsProcessing(false); }
  };

  const handleZoneChange = (index, field, value) => {
    const newZones = [...zones];
    newZones[index][field] = (field === 'rows' || field === 'seatsPerRow' || field === 'price') ? Number(value) : value;
    setZones(newZones);
    
    // Nếu đổi mã section (ID), phải update lại cả trong layout
    if (field === 'section') {
       const oldSection = zones[index].section;
       const newLayout = layout.map(cell => cell === oldSection ? value : cell);
       setLayout(newLayout);
    }
  };

  const handleAddZone = () => {
    setZones([...zones, { section: `Z${Date.now().toString().slice(-4)}`, name: 'Khu mới', rows: 5, seatsPerRow: 10, price: 100000 }]);
  };

  const handleRemoveZone = (index) => {
    if (window.confirm("Xóa khu vực này khỏi cấu hình?")) {
      const removedSection = zones[index].section;
      setZones(zones.filter((_, i) => i !== index));
      // Xóa luôn khỏi grid nếu đang nằm trên đó
      setLayout(layout.map(cell => cell === removedSection ? null : cell));
    }
  };

  // ================= THUẬT TOÁN KÉO THẢ (DRAG & DROP) =================
  const handleDragStart = (e, sectionId) => {
    e.dataTransfer.setData('sectionId', sectionId);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedSectionId = e.dataTransfer.getData('sectionId');
    
    const newLayout = [...layout];
    // Tìm xem khối này đang đứng ở ô nào (để xóa đi)
    const oldIndex = newLayout.indexOf(draggedSectionId);
    
    // Hoán đổi: Lấy cái đang nằm ở ô đích chuyển về ô cũ của thằng vừa kéo
    const targetCellContent = newLayout[targetIndex]; 
    
    if (oldIndex !== -1) {
      newLayout[oldIndex] = targetCellContent; // Nếu kéo từ ô này sang ô khác trên Grid
    } 
    // Nếu targetCellContent có data nhưng mình kéo từ ngoài vào, thì thằng ở targetCell bị đá ra ngoài (thành null)
    
    newLayout[targetIndex] = draggedSectionId; // Đặt khối vừa kéo vào vị trí mới
    setLayout(newLayout);
  };

  const handleRemoveFromGrid = (index) => {
    const newLayout = [...layout];
    newLayout[index] = null;
    setLayout(newLayout);
  };

  // Những khu vực chưa được xếp vào Grid
  const unplacedZones = zones.filter(z => !layout.includes(z.section));

  const handleGenerateMap = async () => {
    if (window.prompt("Nhập 'XACNHAN' để tạo sơ đồ thực tế:") !== "XACNHAN") return;
    setIsProcessing(true);
    try {
      await axios.post('http://localhost:5001/api/event/update', { ...eventInfo, zones, layout });
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
          <h1 className="text-3xl font-black text-white uppercase">Cấu hình Sơ đồ</h1>
          <button onClick={handleSaveConfig} disabled={isProcessing} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg">
            {isProcessing ? 'Đang lưu...' : '💾 Lưu mọi thay đổi'}
          </button>
        </header>

        {/* BẢNG TẠO KHU VỰC VÀ GIÁ (Giữ nguyên như trước) */}
        <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl mb-8">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-black text-white uppercase">🎟️ Danh sách Khu vực (Zones)</h2>
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
            <div className="mt-6 border-t border-gray-800 pt-6">
                <button onClick={handleGenerateMap} className="bg-red-600 w-full text-white py-3 rounded-xl font-bold uppercase hover:bg-red-500 shadow-lg">⚠️ Reset toàn bộ ghế & Khởi tạo Sơ đồ</button>
                <p className="text-xs text-gray-500 text-center mt-2">Bấm nút này sẽ tạo ra từng chiếc vé vật lý dưới Database dựa vào Số hàng x Số ghế ở bảng trên.</p>
            </div>
        </div>

        {/* ================= BẢNG KÉO THẢ VỊ TRÍ 3x3 ================= */}
        <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl">
           <h2 className="text-lg font-black text-white mb-2 uppercase">🗺️ Bố cục Trực quan (Drag & Drop)</h2>
           <p className="text-gray-400 text-sm mb-6">Kéo các Khu vực từ danh sách bên trái thả vào mô hình lưới 3x3 bên phải để tạo hình cho sơ đồ thật.</p>

           <div className="flex flex-col xl:flex-row gap-8">
              
              {/* VÙNG CHỨA CÁC KHU VỰC CHƯA XẾP */}
              <div className="xl:w-1/3 bg-black/40 p-4 rounded-xl border border-gray-800 h-max">
                 <h3 className="text-yellow-500 font-bold uppercase text-sm mb-4">Các khu chưa phân bổ</h3>
                 {unplacedZones.length === 0 ? (
                    <p className="text-gray-600 text-sm italic">Tất cả khu vực đã được lên sơ đồ.</p>
                 ) : (
                   <div className="flex flex-wrap gap-2">
                     {unplacedZones.map(zone => (
                       <div 
                         key={zone.section} 
                         draggable 
                         onDragStart={(e) => handleDragStart(e, zone.section)}
                         className="bg-gray-800 border border-gray-600 px-4 py-3 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-700 transition w-full shadow-md"
                       >
                         <p className="font-bold text-white">{zone.name}</p>
                         <p className="text-xs text-yellow-400">Kéo tôi đi ↔</p>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              {/* VÙNG GRID 3x3 (MÔ PHỎNG SÂN VẬN ĐỘNG) */}
              <div className="xl:w-2/3 flex flex-col items-center">
                 {/* Khối Sân khấu */}
                 <div className="w-full max-w-lg h-12 bg-gradient-to-b from-yellow-600 to-yellow-900 rounded-t-full mb-6 flex items-center justify-center border-b-4 border-yellow-400 shadow-[0_10px_30px_rgba(250,204,21,0.2)]">
                   <span className="text-yellow-100 font-black tracking-[0.3em] text-sm">SÂN KHẤU CHÍNH</span>
                 </div>

                 {/* Grid 3x3 chứa 9 ô vuông */}
                 <div className="grid grid-cols-3 gap-2 md:gap-4 w-full max-w-lg bg-black/40 p-4 rounded-2xl border border-gray-800">
                    {layout.map((cellSectionId, index) => {
                       const zoneObj = zones.find(z => z.section === cellSectionId);
                       return (
                         <div 
                           key={index}
                           onDragOver={(e) => e.preventDefault()}
                           onDrop={(e) => handleDrop(e, index)}
                           className={`h-24 md:h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative transition-all
                             ${zoneObj ? 'border-yellow-500 bg-yellow-900/30' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'}`
                           }
                         >
                           {zoneObj ? (
                             <div 
                               draggable 
                               onDragStart={(e) => handleDragStart(e, zoneObj.section)}
                               className="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing group relative p-2"
                             >
                               <span className="font-black text-yellow-400 text-center text-sm md:text-base leading-tight break-words w-full px-1">{zoneObj.name}</span>
                               <button 
                                 onClick={() => handleRemoveFromGrid(index)} 
                                 className="absolute top-1 right-1 md:top-2 md:right-2 w-5 h-5 md:w-6 md:h-6 bg-red-600 rounded-full text-white text-xs md:text-sm font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                               >✕</button>
                             </div>
                           ) : (
                             <span className="text-gray-600 text-xs text-center px-2">Thả khu vực vào đây</span>
                           )}
                         </div>
                       );
                    })}
                 </div>
              </div>

           </div>
        </div>
      </main>
    </div>
  );
};

export default ManageEventsPage;