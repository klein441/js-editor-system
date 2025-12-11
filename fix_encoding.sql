-- 修复字符编码问题

-- 1. 删除旧数据库
DROP DATABASE IF EXISTS `js_editor`;

-- 2. 创建数据库（指定 utf8mb4）
CREATE DATABASE `js_editor` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `js_editor`;

-- 3. 设置会话字符集
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;
SET CHARACTER_SET_CONNECTION = utf8mb4;
SET CHARACTER_SET_RESULTS = utf8mb4;

-- 4. 创建表（确保使用 utf8mb4）
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `student_list` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `class_name` VARCHAR(50) DEFAULT NULL,
  `teacher_id` INT NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_student_id` (`student_id`),
  KEY `idx_student_teacher` (`teacher_id`),
  CONSTRAINT `fk_student_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `code_library` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `teacher_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) DEFAULT NULL,
  `code_content` TEXT NOT NULL,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_code_teacher` (`teacher_id`),
  CONSTRAINT `fk_codelib_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `homework` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `teacher_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `requirement` TEXT NOT NULL,
  `deadline` DATETIME NOT NULL,
  `code_template_id` INT DEFAULT NULL,
  `status` TINYINT NOT NULL DEFAULT 1,
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_homework_teacher` (`teacher_id`),
  KEY `idx_homework_template` (`code_template_id`),
  CONSTRAINT `fk_homework_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `user`(`id`),
  CONSTRAINT `fk_homework_template` FOREIGN KEY (`code_template_id`) REFERENCES `code_library`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `homework_submit` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL,
  `homework_id` INT NOT NULL,
  `code_content` TEXT NOT NULL,
  `doc_content` TEXT DEFAULT NULL,
  `submit_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modify_count` INT NOT NULL DEFAULT 0,
  `is_late` TINYINT NOT NULL DEFAULT 0,
  `is_rework` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_submit_student` (`student_id`),
  KEY `idx_submit_homework` (`homework_id`),
  CONSTRAINT `fk_submit_student` FOREIGN KEY (`student_id`) REFERENCES `student_list`(`id`),
  CONSTRAINT `fk_submit_homework` FOREIGN KEY (`homework_id`) REFERENCES `homework`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 插入测试数据
INSERT INTO `user` (username, password, role) VALUES 
('teacher', 'teacher', 'teacher'),
('2024001', '123456', 'student'),
('2024002', '123456', 'student'),
('2024003', '123456', 'student');

INSERT INTO `student_list` (student_id, name, class_name, teacher_id) VALUES 
('2024001', '张三', '三年二班', 1),
('2024002', '李四', '三年二班', 1),
('2024003', '王五', '三年三班', 1);

INSERT INTO `code_library` (teacher_id, title, category, code_content) VALUES 
(1, '经典 HTML 布局', 'HTML/CSS', '<!DOCTYPE html>
<html>
<head>
  <title>布局示例</title>
  <style>
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Flex 布局示例</h1>
  </div>
</body>
</html>'),
(1, '数组去重算法', 'JavaScript', '// 使用 Set 去重
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)];
console.log(unique);'),
(1, '响应式导航栏', 'HTML/CSS', '<!DOCTYPE html>
<html>
<head>
  <style>
    nav {
      background: #333;
      padding: 1rem;
    }
    nav ul {
      list-style: none;
      display: flex;
      gap: 2rem;
    }
    nav a {
      color: white;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <nav>
    <ul>
      <li><a href="#">首页</a></li>
      <li><a href="#">关于</a></li>
      <li><a href="#">联系</a></li>
    </ul>
  </nav>
</body>
</html>');

INSERT INTO `homework` (teacher_id, title, requirement, deadline, code_template_id) VALUES 
(1, '个人主页制作', '制作一个包含头像、姓名和自我介绍的个人主页。要求：
1. 使用 HTML 和 CSS
2. 页面背景色为浅灰色
3. 内容居中显示
4. 包含至少一张图片', '2025-12-31 23:59:59', 1),
(1, 'JavaScript 数组操作', '完成以下数组操作练习：
1. 数组去重
2. 数组排序
3. 数组过滤
4. 数组映射', '2025-12-25 23:59:59', 2);

SELECT '✅ 数据库创建完成，中文应该正常显示了！' AS message;
SELECT * FROM student_list;
