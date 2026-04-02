-- Script tạo cơ sở dữ liệu cho Note App

CREATE DATABASE IF NOT EXISTS notedb;
USE notedb;

-- Bảng thư mục
CREATE TABLE IF NOT EXISTS folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Bảng ghi chú
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  folder_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Thêm một số dữ liệu mẫu ban đầu
INSERT INTO folders (name) VALUES ('Công việc'), ('Cá nhân'), ('Học tập');

-- Lấy IDs để insert notes mẫu
-- Giả sử ID 1, 2, 3 lần lượt cho Công việc, Cá nhân, Học tập
INSERT INTO notes (title, content, folder_id) VALUES
('Họp team', 'Lên kế hoạch sprint mới vào thứ 2 lúc 9h sáng', 1),
('Danh sách mua sắm', 'Mua sữa, bánh mì, trái cây', 2),
('Bài giảng ReactJS', 'Cần xem lại hooks và context API', 3);
