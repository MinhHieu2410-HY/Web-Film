import { useState } from 'react';

export default function HeroSection() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
const handleStartClick = (e) => {
  e.preventDefault();
  if (!email) {
    setError('Vui lòng nhập địa chỉ email');
    return;
  }
  if (!validateEmail(email)) {
    setError('Vui lòng nhập địa chỉ email hợp lệ');
    return;
  }

  localStorage.setItem('userEmail', email);

  window.location.href = '/login'; 
};


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value) {
      setError('');
    }
  };

  return (
    <section className="relative h-screen bg-cover bg-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style={{ backgroundImage: `url(/movie.jpg)` }}
      >
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Phim, chương trình TV không giới hạn và hơn thế nữa
          </h1>
          <p className="text-lg md:text-xl mb-4 text-white">
            Xem ở bất cứ đâu. Hủy bất kỳ lúc nào.
          </p>
          <p className="text-lg md:text-xl mb-6 text-white">
            Sẵn sàng xem chưa? Nhập email để bắt đầu hoặc tiếp tục tư cách thành viên.
          </p>
          <form className="flex flex-col md:flex-row justify-center items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 max-w-lg mx-auto w-full">
            <div className="w-full md:w-2/3 relative">
              <input
                type="email"
                placeholder="Địa chỉ email"
                className={`w-full bg-gray-800 text-white px-4 py-3 rounded focus:outline-none focus:ring-2 ${
                  error ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-red-600'
                }`}
                aria-label="Nhập địa chỉ email"
                value={email}
                onChange={handleEmailChange}
              />
              {error && (
                <p className="absolute text-sm text-white-400 mt-1 left-1 top-full">
                  {error}
                </p>
              )}
            </div>
            <button
              onClick={handleStartClick}
              className="bg-red-600 text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition-colors"
            >
              Bắt đầu
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
