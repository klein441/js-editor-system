-- 创建课件表
CREATE TABLE IF NOT EXISTS courseware (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '课件标题',
    description TEXT COMMENT '课件描述',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型(pdf/ppt/pptx)',
    teacher_id INT COMMENT '上传教师ID',
    homework_id INT COMMENT '关联作业ID(可选)',
    category VARCHAR(100) DEFAULT 'HTML基础' COMMENT '课件分类',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status TINYINT DEFAULT 1 COMMENT '状态: 1-正常 0-已删除',
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE SET NULL,
    INDEX idx_teacher (teacher_id),
    INDEX idx_homework (homework_id),
    INDEX idx_category (category),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课件表';

-- 插入示例数据
INSERT INTO courseware (title, description, file_name, file_path, file_type, category, teacher_id) 
VALUES 
('HTML基础教程', 'HTML标签和语义化标签详解', 'HTML基础教程.pdf', '/uploads/courseware/sample.pdf', 'pdf', 'HTML基础', 1),
('CSS样式设计', 'CSS盒模型、布局和动画', 'CSS样式设计.pptx', '/uploads/courseware/sample.pptx', 'pptx', 'CSS进阶', 1),
('JavaScript入门', 'JavaScript基础语法和DOM操作', 'JavaScript入门.pdf', '/uploads/courseware/sample2.pdf', 'pdf', 'JavaScript', 1);

-- 显示创建结果
SELECT '✅ courseware 表创建成功！' as message;
SELECT COUNT(*) as '示例数据数量' FROM courseware;
