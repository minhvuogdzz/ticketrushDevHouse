import React from 'react';

const ImageUploaderBlock = ({ 
  title, type, dataArray, titleField, descriptionField, ratioLabel,
  eventInfo, setEventInfo, urlInput, setUrlInput, onAddUrl, onFileUpload, onRemoveImage 
}) => (
  <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-black text-white uppercase flex items-center gap-2"><span>🖼️</span> {title}</h2>
      {ratioLabel && <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-[10px] font-bold">{ratioLabel}</span>}
    </div>
    
    {titleField && (
      <div className="mb-4">
        <label className="text-xs font-bold text-gray-500 uppercase">Tiêu đề (Heading)</label>
        <input
          value={eventInfo[titleField] || ''}
          onChange={(e) => setEventInfo({ ...eventInfo, [titleField]: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mt-1 focus:border-yellow-500 outline-none"
          placeholder="Nhập tiêu đề..."
        />
      </div>
    )}

    {descriptionField && (
      <div className="mb-4">
        <label className="text-xs font-bold text-gray-500 uppercase">Mô tả hiển thị</label>
        <textarea
          value={eventInfo[descriptionField] || ''}
          onChange={(e) => setEventInfo({ ...eventInfo, [descriptionField]: e.target.value })}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white mt-1 h-20 resize-none focus:border-yellow-500 outline-none"
          placeholder="Nhập đoạn văn mô tả..."
        ></textarea>
      </div>
    )}

    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Thêm từ Link URL</label>
        <div className="flex gap-2 mt-1">
          <input 
            className="flex-1 bg-gray-900 border border-gray-700 p-2 rounded-lg text-sm text-white focus:border-yellow-500 outline-none" 
            placeholder="https://..." 
            value={urlInput} 
            onChange={e => setUrlInput(type, e.target.value)} 
          />
          <button onClick={() => onAddUrl(type)} className="bg-gray-800 hover:bg-gray-700 text-yellow-500 border border-gray-700 px-4 py-2 rounded-lg font-bold">Thêm</button>
        </div>
      </div>
      
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tải ảnh lên (Max 5MB)</label>
        <label className="flex items-center justify-center w-full bg-gray-900 border-2 border-dashed border-gray-700 hover:border-yellow-500 rounded-lg p-4 cursor-pointer transition">
          <span className="text-sm text-gray-400 font-bold">📁 Chọn file ảnh từ máy</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, type)} />
        </label>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {dataArray.map((url, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-gray-800">
              <img src={url} alt={`img-${idx}`} className="w-16 h-8 object-cover rounded bg-gray-800" />
              <span className="flex-1 text-[10px] text-gray-500 truncate">{url}</span>
              <button onClick={() => onRemoveImage(type, idx)} className="w-6 h-6 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded transition">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const EventBuild = ({ 
  eventInfo, setEventInfo, banners, lineupBanners, athleteBanners, 
  urlInputs, handleUrlInputChange, handleAddUrl, handleFileUpload, handleRemoveImage 
}) => {
  return (
    <div className="space-y-6">
      {/* BOX THÔNG TIN CHUNG */}
      <div className="bg-[#12141A] rounded-2xl border border-gray-800 p-6 shadow-xl mb-6">
        <h2 className="text-lg font-black text-white mb-6 uppercase flex items-center gap-2"><span>📝</span> Thông tin chung</h2>
        <div className="space-y-4">
          <input type="text" value={eventInfo.name} onChange={(e) => setEventInfo({ ...eventInfo, name: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none" placeholder="Tên sự kiện" />
          <textarea value={eventInfo.description} onChange={(e) => setEventInfo({ ...eventInfo, description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white h-20 resize-none focus:border-yellow-500 outline-none" placeholder="Mô tả sự kiện..."></textarea>
          <input type="text" value={eventInfo.location} onChange={(e) => setEventInfo({ ...eventInfo, location: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none" placeholder="Địa điểm" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={eventInfo.date} onChange={(e) => setEventInfo({ ...eventInfo, date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none" placeholder="Ngày (DD.MM.YYYY)" />
            <input type="text" value={eventInfo.time} onChange={(e) => setEventInfo({ ...eventInfo, time: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 outline-none" placeholder="Giờ (HH:MM)" />
          </div>
        </div>
      </div>

      {/* 3 KHỐI UPLOAD ẢNH */}
      <ImageUploaderBlock 
        title="Banner Hero (Header)" type="hero" dataArray={banners} ratioLabel="Tỉ lệ 5:4"
        eventInfo={eventInfo} setEventInfo={setEventInfo} urlInput={urlInputs.hero} setUrlInput={handleUrlInputChange} onAddUrl={handleAddUrl} onFileUpload={handleFileUpload} onRemoveImage={handleRemoveImage}
      />
      <ImageUploaderBlock 
        title="Poster Dàn Line-up" type="lineup" dataArray={lineupBanners} titleField="lineupTitle" descriptionField="lineupDescription" ratioLabel="Tỉ lệ 3:1"
        eventInfo={eventInfo} setEventInfo={setEventInfo} urlInput={urlInputs.lineup} setUrlInput={handleUrlInputChange} onAddUrl={handleAddUrl} onFileUpload={handleFileUpload} onRemoveImage={handleRemoveImage}
      />
      <ImageUploaderBlock 
        title="Poster Vận Động Viên" type="athlete" dataArray={athleteBanners} titleField="athleteTitle" descriptionField="athleteDescription" ratioLabel="Tỉ lệ 3:1"
        eventInfo={eventInfo} setEventInfo={setEventInfo} urlInput={urlInputs.athlete} setUrlInput={handleUrlInputChange} onAddUrl={handleAddUrl} onFileUpload={handleFileUpload} onRemoveImage={handleRemoveImage}
      />
    </div>
  );
};

export default EventBuild;