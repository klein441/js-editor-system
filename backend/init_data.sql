-- 初始化测试数据
USE js_editor;

-- 清空现有数据（可选）
-- TRUNCATE TABLE homework_submit;
-- TRUNCATE TABLE homework;
-- TRUNCATE TABLE code_library;
-- TRUNCATE TABLE student_list;
-- TRUNCATE TABLE user;

-- 1. 创建教师账号
INSERT INTO user (username, password, role, status) VALUES 
('teacher', 'teacher', 'teacher', 1)
ON DUPLICATE KEY UPDATE username=username;

-- 2. 创建学生账号
INSERT INTO user (username, password, role, status) VALUES 
('2024001', '123456', 'student', 1),
('2024002', '123456', 'student', 1),
('2024003', '123456', 'student', 1)
ON DUPLICATE KEY UPDATE username=username;

-- 3. 添加学生到名单（假设教师 ID 为 1）
INSERT INTO student_list (student_id, name, class_name, teacher_id) VALUES 
('2024001', '张三', '三年二班', 1),
('2024002', '李四', '三年二班', 1),
('2024003', '王五', '三年三班', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. 添加示例代码到代码库
INSERT INTO code_library (teacher_id, title, category, code_content) VALUES 
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
console.log(unique); // [1, 2, 3, 4]

// 使用 filter 去重
const unique2 = arr.filter((item, index) => arr.indexOf(item) === index);
console.log(unique2);'),
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
</html>')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. 创建示例作业
INSERT INTO homework (teacher_id, title, requirement, deadline, code_template_id, status) VALUES 
(1, '个人主页制作', '制作一个包含头像、姓名和自我介绍的个人主页。要求：
1. 使用 HTML 和 CSS
2. 页面背景色为浅灰色
3. 内容居中显示
4. 包含至少一张图片', '2025-12-31 23:59:59', 1, 1),
(1, 'JavaScript 数组操作', '完成以下数组操作练习：
1. 数组去重
2. 数组排序
3. 数组过滤
4. 数组映射', '2025-12-25 23:59:59', 2, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

SELECT '✅ 初始化数据完成！' AS message;
SELECT '教师账号: teacher / teacher' AS info;
SELECT '学生账号: 2024001 / 123456' AS info;
