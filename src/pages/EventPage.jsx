import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HeroHeader from '../components/HeroHeader'; 
import LineupSection from '../components/LineupSection';

const EventPage = () => {
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEventInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/event');
        setEventData(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-yellow-500">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans pb-20 relative" fetchpriority="high">
      <HeroHeader eventData={eventData} />
      {/* TRUYỀN DỮ LIỆU XUỐNG DƯỚI CHO LINE-UP */}
      <LineupSection eventData={eventData} />
    </div>
  );
};

export default EventPage;