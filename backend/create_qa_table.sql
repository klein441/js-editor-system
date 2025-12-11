-- 创建在线答疑表
CREATE TABLE IF NOT EXISTS qa_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_list_id INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    homework_id INT,
    teacher_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    answered_at DATETIME,
    FOREIGN KEY (student_list_id) REFERENCES student_list(id) ON DELETE CASCADE,
    FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE SET NULL,
    INDEX idx_student (student_list_id),
    INDEX idx_homework (homework_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='在线答疑问题表';

-- 插入示例数据（仅在有学生数据时）
INSERT INTO qa_questions (student_list_id, question, answer, created_at, answered_at) 
SELECT 
    sl.id,
    'HTML的语义化标签有哪些？',
    '常用的语义化标签包括：<header>、<nav>、<main>、<article>、<section>、<aside>、<footer>等。使用语义化标签可以让代码更易读，也有利于SEO。',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    NOW()
FROM student_list sl
WHERE sl.id IS NOT NULL
LIMIT 1;

INSERT INTO qa_questions (student_list_id, question, created_at) 
SELECT 
    sl.id,
    'CSS的盒模型是什么？如何使用？',
    NOW()
FROM student_list sl
WHERE sl.id IS NOT NULL
LIMIT 1;

-- 显示创建结果
SELECT '✅ qa_questions 表创建成功！' as message;
SELECT COUNT(*) as '示例数据数量' FROM qa_questions;
