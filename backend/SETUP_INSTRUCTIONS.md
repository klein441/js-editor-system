# JS在线编译平台 - 数据库连接配置指南

## 📋 实验步骤

### 步骤1：安装并启动 MySQL

1. **下载安装 MySQL**
   - 官网下载：https://dev.mysql.com/downloads/mysql/
   - 或使用 XAMPP/WAMP 等集成环境
   - 推荐版本：MySQL 8.0

2. **启动 MySQL 服务**
   ```cmd
   # Windows 命令行（管理员权限）
   net start mysql
   
   # 或在"服务"管理器中启动 MySQL 服务
   ```

3. **测试 MySQL 是否正常运行**
   ```cmd
   mysql -u root -p
   # 输入你的 MySQL root 密码
   ```

### 步骤2：配置数据库连接信息

1. **打开配置文件**
   - 文件位置：`backend/.env`

2. **修改数据库密码**
   ```env
   DB_HOST=127.0.0.1          # 数据库地址（本地）
   DB_PORT=3306               # MySQL端口
   DB_USER=root               # 数据库用户名
   DB_PASSWORD=你的MySQL密码   # ⚠️ 改成你的实际密码
   DB_NAME=js_editor          # 数据库名称
   PORT=5000                  # 后端服务端口
   ```

### 步骤3：创建数据库

**方法A：使用 MySQL 命令行**
```cmd
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE js_editor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 使用数据库
USE js_editor;

# 退出
exit;
```

**方法B：使用 MySQL Workbench**
- 打开 MySQL Workbench
- 连接到本地数据库
- 右键 → Create Schema
- 名称：js_editor
- Charset: utf8mb4
- 点击 Apply

### 步骤4：创建数据库表结构

在 `backend` 目录下，依次执行以下 SQL 文件：

```cmd
cd backend

# 1. 创建基础表（用户、学生、作业等）
mysql -u root -p js_editor < init_data.sql

# 2. 创建在线答疑表
mysql -u root -p js_editor < create_qa_table.sql

# 3. 创建课件表
mysql -u root -p js_editor < create_courseware_table.sql

# 4. 创建通知和重做申请表
mysql -u root -p js_editor < setup_notifications_simple.sql
```

或使用批处理文件（自动化）：
```cmd
cd backend
setup_qa.bat
setup_courseware.bat
setup_notifications.bat
```

### 步骤5：验证数据库连接

1. **安装后端依赖**
   ```cmd
   cd backend
   npm install
   ```

2. **测试数据库连接**
   创建测试文件 `backend/test_db.js`：
   ```javascript
   const pool = require('./db');
   
   async function test() {
     try {
       const [rows] = await pool.query('SELECT 1 + 1 AS result');
       console.log('✅ 数据库连接成功！', rows);
       
       const [tables] = await pool.query('SHOW TABLES');
       console.log('📊 数据库表：', tables);
       
       process.exit(0);
     } catch (error) {
       console.error('❌ 数据库连接失败：', error.message);
       process.exit(1);
     }
   }
   
   test();
   ```
   
   运行测试：
   ```cmd
   node test_db.js
   ```

### 步骤6：启动服务

1. **启动后端服务**
   ```cmd
   cd backend
   npm start
   # 或使用开发模式
   npm run dev
   ```
   
   看到以下信息表示成功：
   ```
   Server running on port 5000
   ```

2. **启动前端服务**（新开一个命令行窗口）
   ```cmd
   # 在项目根目录
   npm start
   ```
   
   浏览器自动打开：http://localhost:3000

### 步骤7：测试功能

1. **注册测试账号**
   - 教师账号：teacher / teacher
   - 学生账号：2024001 / 123456

2. **测试数据库功能**
   - 学生管理
   - 代码库
   - 作业发布
   - 作业提交
   - 在线答疑

## 🔧 常见问题排查

### 问题1：数据库连接失败（ECONNREFUSED）
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方法：**
- 检查 MySQL 服务是否启动：`net start mysql`
- 检查端口是否正确（默认3306）
- 防火墙是否阻止连接

### 问题2：访问被拒绝（Access denied）
```
Error: Access denied for user 'root'@'localhost'
```

**解决方法：**
- 检查 `.env` 文件中的密码是否正确
- 确认 root 用户有访问权限
- 尝试重置 MySQL root 密码

### 问题3：数据库不存在
```
Error: Unknown database 'js_editor'
```

**解决方法：**
```sql
CREATE DATABASE js_editor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题4：表不存在
```
Error: Table 'js_editor.user' doesn't exist
```

**解决方法：**
- 执行 `init_data.sql` 创建基础表
- 检查 SQL 文件是否执行成功

### 问题5：字符编码问题（中文乱码）

**解决方法：**
```sql
-- 检查数据库字符集
SHOW CREATE DATABASE js_editor;

-- 修改数据库字符集
ALTER DATABASE js_editor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修改表字符集
ALTER TABLE user CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📊 数据库表结构说明

系统包含以下数据表：

| 表名 | 说明 |
|------|------|
| user | 用户表（学生、教师账号） |
| student_list | 学生名单表 |
| code_library | 代码库表 |
| homework | 作业表 |
| homework_submit | 作业提交表 |
| redo_requests | 重做申请表 |
| notifications | 通知表 |
| qa_questions | 在线答疑表 |
| courseware | 课件表 |

## 🎯 快速验证

执行以下 SQL 验证数据库是否正常：

```sql
-- 查看所有表
SHOW TABLES;

-- 查看用户数据
SELECT * FROM user;

-- 查看学生数据
SELECT * FROM student_list;

-- 查看作业数据
SELECT * FROM homework;
```

## 📝 初始测试数据

系统已自动创建以下测试账号：

**教师账号：**
- 用户名：teacher
- 密码：teacher

**学生账号：**
- 用户名：2024001 / 密码：123456
- 用户名：2024002 / 密码：123456
- 用户名：2024003 / 密码：123456

## 🚀 下一步

数据库配置完成后：

1. ✅ 启动后端：`cd backend && npm start`
2. ✅ 启动前端：`npm start`
3. ✅ 访问系统：http://localhost:3000
4. ✅ 使用测试账号登录

---

## 方法2：手动执行SQL（如果批处理失败）

### 步骤1：打开MySQL命令行

```powershell
# 使用你的MySQL用户名和密码登录
mysql -u root -p
```

### 步骤2：选择数据库

```sql
USE your_database_name;
```

### 步骤3：复制并执行以下SQL语句

```sql
-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL,
  user_role ENUM('student', 'teacher') NOT NULL,
  type ENUM('redo_request', 'redo_approved', 'redo_rejected', 'assignment_updated', 'score_received', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  related_id INT,
  is_read TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id, user_role),
  INDEX idx_read (is_read)
);

-- 重做申请表
CREATE TABLE IF NOT EXISTS redo_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  student_id INT NOT NULL,
  homework_id INT NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  teacher_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  FOREIGN KEY (submission_id) REFERENCES homework_submit(id),
  FOREIGN KEY (student_id) REFERENCES student_list(id),
  FOREIGN KEY (homework_id) REFERENCES homework(id)
);

-- 检查并添加字段（如果不存在）
-- 注意：如果字段已存在会报错，可以忽略
ALTER TABLE homework_submit ADD COLUMN redo_count INT DEFAULT 0 COMMENT '重做次数';
ALTER TABLE homework_submit ADD COLUMN can_redo TINYINT DEFAULT 0 COMMENT '是否允许重做';
```

### 步骤4：验证表是否创建成功

```sql
-- 查看表结构
SHOW TABLES;

-- 查看notifications表结构
DESC notifications;

-- 查看redo_requests表结构
DESC redo_requests;

-- 查看homework_submit表结构（检查新字段）
DESC homework_submit;
```

## 方法3：使用MySQL Workbench

1. 打开MySQL Workbench
2. 连接到你的数据库
3. 打开 `setup_notifications.sql` 文件
4. 点击执行（闪电图标）
5. 检查是否有错误

## 常见问题

### Q1: 外键约束错误
**错误信息**: `Cannot add foreign key constraint`

**原因**: 引用的表或字段不存在

**解决方法**: 
1. 确保 `homework_submit`、`student_list`、`homework` 表已存在
2. 如果不存在，先创建这些表
3. 或者暂时移除外键约束：

```sql
-- 不带外键的版本
CREATE TABLE IF NOT EXISTS redo_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  student_id INT NOT NULL,
  homework_id INT NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  teacher_reply TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL
);
```

### Q2: 字段已存在错误
**错误信息**: `Duplicate column name 'redo_count'`

**原因**: 字段已经存在

**解决方法**: 这是正常的，可以忽略这个错误

### Q3: 权限不足
**错误信息**: `Access denied`

**原因**: 当前用户没有创建表的权限

**解决方法**: 使用管理员账户登录MySQL

## 验证安装

运行以下SQL检查是否安装成功：

```sql
-- 检查表是否存在
SELECT COUNT(*) as notifications_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'notifications';

SELECT COUNT(*) as redo_requests_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'redo_requests';

-- 检查字段是否存在
SELECT COUNT(*) as redo_count_exists FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'homework_submit' 
AND column_name = 'redo_count';
```

如果返回值都是1，说明安装成功！

## 快速测试

安装完成后，可以插入测试数据：

```sql
-- 插入测试通知
INSERT INTO notifications (user_id, user_role, type, title, content) 
VALUES ('S001', 'student', 'system', '测试通知', '这是一条测试通知');

-- 查询通知
SELECT * FROM notifications WHERE user_id = 'S001';

-- 如果能看到数据，说明安装成功！
```

## 下一步

安装完成后：

1. 重启后端服务：
```bash
cd backend
node index.js
```

2. 登录学生账号测试通知功能

3. 查看右上角通知图标
