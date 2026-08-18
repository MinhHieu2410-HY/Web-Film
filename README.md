# XPTT-Web

# Website Xem Phim Trực Tuyến

## Giới thiệu đề tài

* **Bài toán:** Xây dựng website xem phim trực tuyến cho phép người dùng tìm kiếm, xem phim, đánh giá, lưu phim yêu thích và quản lý lịch sử xem.
* **Mục tiêu:** Phát triển một hệ thống Full-stack giúp người dùng có trải nghiệm xem phim thuận tiện, đồng thời hỗ trợ quản trị viên quản lý dữ liệu phim và người dùng.
* **Ý nghĩa thực tiễn:** Cung cấp nền tảng xem phim trực tuyến với đầy đủ chức năng từ quản lý nội dung, xác thực người dùng đến gợi ý và đánh giá phim.
<img width="1900" height="873" alt="Screenshot 2026-08-18 115711" src="https://github.com/user-attachments/assets/f803209c-ee58-4260-bde3-e12226c31e75" />
<img width="1901" height="870" alt="Screenshot 2026-08-18 115655" src="https://github.com/user-attachments/assets/bf7ee44b-026a-44c6-a269-d0816da4a1e4" />
<img width="1902" height="878" alt="Screenshot 2026-08-18 115641" src="https://github.com/user-attachments/assets/378264a4-6201-496c-8ec6-7656a17dbc00" />

---

## Chức năng chính

### Người dùng

* Đăng ký, đăng nhập bằng JWT hoặc Google OAuth.
* Xem phim và trailer.
* Tìm kiếm phim theo tên.
* Xem danh sách tất cả phim.
* Đánh giá phim.
* Lưu phim yêu thích.
* Quản lý lịch sử xem phim.
* Gợi ý phim bằng AI.
* Truy cập nội dung VIP (đối với tài khoản VIP).

### Quản trị viên

* Quản lý phim (Thêm, sửa, xóa).
* Quản lý thể loại.
* Quản lý người dùng.
* Quản lý quyền VIP.
* Gửi email thông báo.

---

## Công nghệ sử dụng

### Frontend

* React 19
* Vite
* React Router
* Tailwind CSS
* Axios
* Swiper
* Lucide React

### Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* Google OAuth
* Nodemailer
* Multer

---

## Kiến trúc hệ thống

Hệ thống được xây dựng theo mô hình **Client - Server**.

### Frontend

* React + Vite
* Xây dựng giao diện người dùng.
* Gửi yêu cầu API đến Backend.

### Backend

* Express.js
* Xử lý nghiệp vụ.
* Xác thực người dùng.
* Kết nối MySQL.
* Quản lý dữ liệu và trả kết quả về Frontend.

### Database

* MySQL
* Lưu trữ:

  * Người dùng
  * Phim
  * Thể loại
  * Đánh giá
  * Lịch sử xem
  * Danh sách yêu thích

---

## Các chức năng Backend

* Authentication
* Movie Management
* Search Movie
* Category Management
* Rating Management
* Favorite Management
* Watch History
* Streaming Movie
* User Management
* Email Service

---

## Các chức năng Frontend

* Home
* HomeIn
* Watch Film
* Watch Trailer
* Search Film
* All Film
* Favorite Movies
* Watch History
* AI Recommendation
* Ratings
* User Profile
* VIP
* Admin Dashboard

---

## Hướng dẫn cài đặt

### Yêu cầu

* Node.js
* MySQL
* npm

### Backend

Di chuyển vào thư mục Server

```bash
cd Server
```

Cài đặt thư viện

```bash
npm install
```

Tạo file `.env` và cấu hình:

* Database
* JWT Secret
* Google OAuth
* Email

Chạy Backend

```bash
npm start
```

---

### Frontend

Di chuyển vào thư mục XPTT

```bash
cd XPTT
```

Cài đặt thư viện

```bash
npm install
```

Chạy ứng dụng

```bash
npm run dev
```

Mặc định ứng dụng chạy tại:

```text
http://localhost:5173
```

---

## Cấu trúc thư mục

```text
XPTT-Web/
│
├── Server/
│   ├── Routes/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Models/
│   └── .env
│
├── XPTT/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── services/
│
├── Film/
│   ├── Poster/
│   ├── Trailer/
│   └── Video/
│
├── README.md
└── package.json
```
---
## Hướng phát triển
* Tích hợp AI gợi ý phim thông minh hơn.
* Bổ sung hệ thống bình luận theo thời gian thực.
* Hỗ trợ thanh toán trực tuyến để nâng cấp tài khoản VIP.
* Xây dựng ứng dụng Mobile.
* Tối ưu hiệu năng và bảo mật hệ thống.
---
## Tác giả
* **Họ tên:** Nguyễn Minh Hiếu
* **Mã SV:** 12423049
