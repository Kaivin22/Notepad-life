# Note App Project
Dự án được xây dựng với hệ sinh thái **React, NodeJS, và MySQL**. Bạn có thể quản lý các Ghi chú của mình thông qua hệ thống Thư mục.

## Cấu trúc thư mục
- `/backend`: Node.js, Express, kết nối MySQL. Chứa hệ thống tạo cấu trúc bảng tự động và các APIs (CRUD) cho Node và thư mục.
- `/frontend`: React + Vite + Vanilla CSS. Giao diện File Explorer đẹp mắt sử dụng Glassmorphism và màu sắc hiện đại. Có tính năng Tải Note về dạng `.txt`.
- `database.sql`: Chứa cấu trúc database sơ khởi và dữ liệu mẫu. Có thể dễ dàng copy vào phpMyAdmin/MySQL Workbench để chạy thủ công.
- `docker-compose.yml`: Triển khai 3 container (MySQL, Backend, Frontend).

## Hướng dẫn sử dụng

### Lựa chọn 1: Chạy bằng Docker
1. Cài đặt Docker và Docker Compose.
2. Từ thư mục `H:\Note`, chạy lệnh sau để build và khởi động toàn bộ hệ thống:
   ```bash
   docker-compose up --build -d
   ```
3. Truy cập vào `http://localhost:3000` để sử dụng App.

*(Lưu ý: Backend sẽ luôn tự động tạo các bảng CSDL cần thiết nếu nó chưa tồn tại).*

### Lựa chọn 2: Chạy cục bộ bằng tay để Devevlopment
1. Tạo MySQL database:
   Copy toàn bộ lệnh trong `database.sql` và chạy trên Server MySQL của bạn (hoặc tạo DB rỗng `notedb`, tool sẽ tự động render các bảng).
2. Chạy Backend:
   ```bash
   cd backend
   npm install
   npm start # (hoặc node index.js)
   ```
   (Chạy mặc định ở port 5000)
3. Chạy Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Sau đó truy cập đường link localhost (ví dụ `http://localhost:5173`) mà terminal in ra.

## Tính năng mới
- **Quản lý Thư mục nâng cao:** Có thể lồng các thư mục với nhau. Có Breadcrumbs để dễ dàng quay lại thư mục cha.
- **Tải file txt trực tiếp:** Nhấn vào icon tải ở giao diện hiển thị List note, hệ thống sẽ trigger tải file *.txt* với đúng định dạng nội dung note.
- **Phòng chống Xóa nhầm:** Cảnh báo trước khi bạn chuẩn bị xóa một thư mục. (Tính năng Cascade delete ở Backend sẽ giúp dọn sạch note và folder con bên trong).
- **Thiết kế Premium:** Responsive Layout, CSS variables system, hiệu ứng mờ kính (Glassmorphism), màu sắc tối (Dark Theme) làm nổi bật text.
