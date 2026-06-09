export default function Footer() {
  return (
    <footer className="bg-black py-10 border-t border-gray-800 px-4 md:px-10">
      <div className="container mx-auto text-white pl-18">
        <p className="mb-4 text-center md:text-left">Bạn có câu hỏi? Liên hệ với chúng tôi.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
          <a href="#" className="hover:text-white">Câu hỏi thường gặp</a>
          <a href="#" className="hover:text-white">Trung tâm trợ giúp</a>
          <a href="#" className="hover:text-white">Điều khoản sử dụng</a>
          <a href="#" className="hover:text-white">Chính sách quyền riêng tư</a>
        </div>
      </div>
    </footer>
  );
}
