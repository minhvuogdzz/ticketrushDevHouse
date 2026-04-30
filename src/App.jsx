import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import CustomerLayout from './components/layout/CustomerLayout';
import './App.css'

function App() {
  return (
    <CustomerLayout>
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-700 rounded-xl">
        <h1 className="text-4xl font-bold mb-4">Chào mừng đến với TicketRush</h1>
        <p className="text-gray-400">Dev House thiếu 2 thằng l Lâm Hải!</p>
      </div>
    </CustomerLayout>
  );
}

export default App;