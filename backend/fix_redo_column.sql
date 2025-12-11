-- Use the correct database
USE js_editor;

-- Check if columns exist before adding
SET @exist_redo_count := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'js_editor' 
  AND TABLE_NAME = 'homework_submit' 
  AND COLUMN_NAME = 'redo_count'
);

SET @exist_can_redo := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'js_editor' 
  AND TABLE_NAME = 'homework_submit' 
  AND COLUMN_NAME = 'can_redo'
);

-- Add redo_count if not exists
SET @sql_redo_count = IF(@exist_redo_count = 0,
  'ALTER TABLE homework_submit ADD COLUMN redo_count INT DEFAULT 0 COMMENT "Redo count"',
  'SELECT "Column redo_count already exists" AS message'
);
PREPARE stmt FROM @sql_redo_count;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add can_redo if not exists
SET @sql_can_redo = IF(@exist_can_redo = 0,
  'ALTER TABLE homework_submit ADD COLUMN can_redo TINYINT(1) DEFAULT 0 COMMENT "Can redo"',
  'SELECT "Column can_redo already exists" AS message'
);
PREPARE stmt FROM @sql_can_redo;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create redo_requests table if not exists
CREATE TABLE IF NOT EXISTS redo_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL COMMENT 'Submission ID',
  student_id INT NOT NULL COMMENT 'Student ID',
  homework_id INT NOT NULL COMMENT 'Homework ID',
  reason TEXT NOT NULL COMMENT 'Redo reason',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Request status',
  teacher_reply TEXT COMMENT 'Teacher reply',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Created time',
  reviewed_at TIMESTAMP NULL COMMENT 'Reviewed time',
  INDEX idx_submission (submission_id),
  INDEX idx_student (student_id),
  INDEX idx_homework (homework_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Redo requests';

-- Show table structure
SELECT 'homework_submit table structure:' AS info;
DESCRIBE homework_submit;

SELECT 'redo_requests table structure:' AS info;
DESCRIBE redo_requests;

SELECT 'Setup completed successfully!' AS result;
