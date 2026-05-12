import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// IMPORT 2 COMPONENT CON
import EventBuild from './EventBuild';
import MatrixSeatBuild from './MatrixSeatBuild';

const ManageEventsPage = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // STATE CHUNG
  const [eventInfo, setEventInfo] = useState({ 
    name: '', date: '', time: '', location: '', description: '',
    lineupTitle: '', lineupDescription: '', athleteTitle: '', athleteDescription: '' 
  });
  const [zones, setZones] = useState([]);
  const [banners, setBanners] = useState([]);
  const [lineupBanners, setLineupBanners] = useState([]);
  const [athleteBanners, setAthleteBanners] = useState([]);
  const [urlInputs, setUrlInputs] = useState({ hero: '', lineup: '', athlete: '' });
  const [gridConfig, setGridConfig] = useState({ rows: 3, cols: 3 });
  const [layout, setLayout] = useState(Array(9).fill(null));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/event');
        setEventInfo({
          name: res.data.name || '', date: res.data.date || '',
          time: res.data.time || '', location: res.data.location || '',
          description: res.data.description || '',
          lineupTitle: res.data.lineupTitle || '', lineupDescription: res.data.lineupDescription || '',
          athleteTitle: res.data.athleteTitle || '', athleteDescription: res.data.athleteDescription || ''
        });
        if (res.data.banners) setBanners(res.data.banners);
        if (res.data.lineupBanners) setLineupBanners(res.data.lineupBanners);
        if (res.data.athleteBanners) setAthleteBanners(res.data.athleteBanners);
        if (res.data.zones?.length > 0) setZones(res.data.zones);
        const rows = res.data.gridRows || 3;
        const cols = res.data.gridCols || 3;
        setGridConfig({ rows, cols });
        setLayout(res.data.layout?.length === (rows * cols) ? res.data.layout : Array(rows * cols).fill(null));
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const handleSaveConfig = async () => {
    setIsProcessing(true);
    try {
      await axios.post('http://localhost:5001/api/event/update', {
        ...eventInfo, banners, lineupBanners, athleteBanners, zones, layout, gridRows: gridConfig.rows, gridCols: gridConfig.cols
      });
      alert("✅ Đã lưu cấu hình thành công!");
    } catch (err) { alert("❌ Lỗi lưu!"); }
    finally { setIsProcessing(false); }
  };

  // LOGIC BANNER (Dùng cho EventBuild)
  const handleAddUrl = (type) => {
    const url = urlInputs[type].trim();
    if (!url) return;
    if (type === 'hero') setBanners([...banners, url]);
    if (type === 'lineup') setLineupBanners([...lineupBanners, url]);
    if (type === 'athlete') setAthleteBanners([...athleteBanners, url]);
    setUrlInputs({ ...urlInputs, [type]: '' });
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'hero') setBanners([...banners, reader.result]);
      if (type === 'lineup') setLineupBanners([...lineupBanners, reader.result]);
      if (type === 'athlete') setAthleteBanners([...athleteBanners, reader.result]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (type, index) => {
    if (type === 'hero') setBanners(banners.filter((_, i) => i !== index));
    if (type === 'lineup') setLineupBanners(lineupBanners.filter((_, i) => i !== index));
    if (type === 'athlete') setAthleteBanners(athleteBanners.filter((_, i) => i !== index));
  };

  const handleUrlInputChange = (type, value) => setUrlInputs({ ...urlInputs, [type]: value });

  // LOGIC MATRIX & ZONES (Dùng cho MatrixSeatBuild)
  const handleGridResize = (type, value) => {
    let val = Math.max(1, Math.min(10, Number(value)));
    const newConfig = { ...gridConfig, [type]: val };
    setGridConfig(newConfig);
    const newSize = newConfig.rows * newConfig.cols;
    const newLayout = Array(newSize).fill(null);
    layout.forEach((cell, idx) => { if (idx < newSize) newLayout[idx] = cell; });
    setLayout(newLayout);
  };

  const handleZoneChange = (idx, field, value) => {
    const newZones = [...zones];
    newZones[idx][field] = (field === 'rows' || field === 'seatsPerRow' || field === 'price') ? Number(value) : value;
    setZones(newZones);
    if (field === 'section') {
      const oldSection = zones[idx].section;
      setLayout(layout.map(cell => cell === oldSection ? value : cell));
    }
  };

  const handleAddZone = () => setZones([...zones, { section: `Z${Date.now().toString().slice(-4)}`, name: 'Khu mới', rows: 5, seatsPerRow: 10, price: 100000 }]);
  const handleRemoveZone = (idx) => {
    const removedSection = zones[idx].section;
    setZones(zones.filter((_, i) => i !== idx));
    setLayout(layout.map(cell => cell === removedSection ? null : cell));
  };

  const handleDragStart = (e, id) => e.dataTransfer.setData('sectionId', id);
  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('sectionId');
    const newLayout = [...layout];
    const oldIdx = newLayout.indexOf(id);
    if (oldIdx !== -1) newLayout[oldIdx] = newLayout[targetIdx];
    newLayout[targetIdx] = id;
    setLayout(newLayout);
  };
  const handleRemoveFromGrid = (idx) => { const newLayout = [...layout]; newLayout[idx] = null; setLayout(newLayout); };

  const handleUpdatePrices = async () => { /* Logic gọi API giống file cũ */ };
  const handleGenerateMap = async () => { /* Logic gọi API giống file cũ */ };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-gray-200 font-sans flex flex-col md:flex-row pb-20 md:pb-0">
      <aside className="w-full md:w-64 bg-[#12141A] border-r border-gray-800 p-6 flex flex-col gap-6 md:sticky md:top-0 md:h-screen">
        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-10 cursor-pointer" onClick={() => navigate('/')}>TICKETRUSH</div>
        <nav className="flex md:flex-col gap-2">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:bg-gray-800 px-4 py-3 rounded-xl font-bold transition text-left">📊 Tổng quan</button>
          <button className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-4 py-3 rounded-xl font-bold text-left">⚙️ Cấu hình Sự kiện</button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-black text-white uppercase">Cấu hình Sự kiện & Sơ đồ</h1>
          <button onClick={handleSaveConfig} disabled={isProcessing} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg">
            {isProcessing ? 'Đang lưu...' : '💾 Lưu mọi thay đổi'}
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1">
            <EventBuild 
              eventInfo={eventInfo} setEventInfo={setEventInfo}
              banners={banners} lineupBanners={lineupBanners} athleteBanners={athleteBanners}
              urlInputs={urlInputs} handleUrlInputChange={handleUrlInputChange}
              handleAddUrl={handleAddUrl} handleFileUpload={handleFileUpload} handleRemoveImage={handleRemoveImage}
            />
          </div>
          <div className="xl:col-span-2">
            <MatrixSeatBuild 
              gridConfig={gridConfig} handleGridResize={handleGridResize}
              layout={layout} handleDragStart={handleDragStart} handleDrop={handleDrop} handleRemoveFromGrid={handleRemoveFromGrid}
              zones={zones} handleZoneChange={handleZoneChange} handleAddZone={handleAddZone} handleRemoveZone={handleRemoveZone}
              totalCapacity={zones.reduce((sum, z) => sum + (z.rows * z.seatsPerRow), 0)}
              handleUpdatePrices={handleUpdatePrices} handleGenerateMap={handleGenerateMap} isProcessing={isProcessing}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageEventsPage;