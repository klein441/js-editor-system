-- 为 student_list 表添加邮箱和手机号字段
USE js_editor;

-- 添加 email 字段（如果已存在会报错，可以忽略）
ALTER TABLE student_list ADD COLUMN email VARCHAR(100) DEFAULT NULL COMMENT '邮箱' AFTER class_name;

-- 添加 phone 字段（如果已存在会报错，可以忽略）
ALTER TABLE student_list ADD COLUMN phone VARCHAR(20) DEFAULT NULL COMMENT '手机号' AFTER email;

-- 为 email 添加索引
CREATE INDEX idx_email ON student_list(email);

SELECT '✅ 数据库字段添加完成！' AS message;
