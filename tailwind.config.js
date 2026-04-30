/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',    // Nền tối chủ đạo (Slate 900)
          light: '#f8fafc',   // Chữ sáng (Slate 50)
          primary: '#6366f1', // Màu nhấn chính (Indigo 500)
          secondary: '#ec4899', // Màu nhấn phụ cho nút mua vé (Pink 500)
          accent: '#06b6d4',  // Màu nổi bật (Cyan 500)
        },
        seat: {
          available: '#d1d5db', // Xám nhạt
          locked: '#fcd34d',    // Vàng đang giữ chỗ
          sold: '#ef4444',      // Đỏ đã bán
          selected: '#10b981',  // Xanh lá ghế đang chọn
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}