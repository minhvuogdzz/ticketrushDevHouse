import React from 'react';

const CustomerLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-brand-dark border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent cursor-pointer">
            TicketRush
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="hover:text-brand-primary transition-colors">Sự kiện</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Tra cứu vé</a>
          </nav>
          <button className="bg-brand-primary hover:bg-brand-secondary transition-colors px-4 py-2 rounded-md font-semibold">
            Đăng nhập
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 text-center text-gray-400">
        <p>© 2026 TicketRush - Group 17. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CustomerLayout;