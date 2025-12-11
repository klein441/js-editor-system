-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(50) NOT NULL,
  user_role ENUM('student', 'teacher') NOT NULL,
  type ENUM('redo_request', 'redo_approved', 'redo_rejected', 'assignment_updated', 'score_received', 'system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  related_id INT,  -- 关联的作业ID或提交ID
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

-- 修改homework_submit表，添加修改次数字段（如果不存在）
ALTER TABLE homework_submit 
ADD COLUMN IF NOT EXISTS redo_count INT DEFAULT 0 COMMENT '重做次数';

-- 修改homework_submit表，添加是否允许重做字段
ALTER TABLE homework_submit 
ADD COLUMN IF NOT EXISTS can_redo TINYINT DEFAULT 0 COMMENT '是否允许重做';
