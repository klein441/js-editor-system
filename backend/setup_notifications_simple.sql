-- 简化版数据库初始化脚本（无外键约束）
-- 如果遇到外键错误，使用这个版本

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 重做申请表（无外键约束版本）
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
  INDEX idx_submission (submission_id),
  INDEX idx_student (student_id),
  INDEX idx_homework (homework_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 检查homework_submit表是否存在redo_count字段
-- 如果不存在则添加
SET @col_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
  AND table_name = 'homework_submit' 
  AND column_name = 'redo_count'
);

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE homework_submit ADD COLUMN redo_count INT DEFAULT 0 COMMENT "重做次数"',
  'SELECT "redo_count字段已存在" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查homework_submit表是否存在can_redo字段
-- 如果不存在则添加
SET @col_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
  AND table_name = 'homework_submit' 
  AND column_name = 'can_redo'
);

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE homework_submit ADD COLUMN can_redo TINYINT DEFAULT 0 COMMENT "是否允许重做"',
  'SELECT "can_redo字段已存在" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 显示创建结果
SELECT 'notifications表创建成功' as message;
SELECT 'redo_requests表创建成功' as message;
SELECT 'homework_submit表字段添加完成' as message;

-- 显示表结构
SHOW TABLES LIKE 'notifications';
SHOW TABLES LIKE 'redo_requests';
