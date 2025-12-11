-- 为作业提交表添加分数和评语字段

USE js_editor;

-- 添加分数字段（0-100分）
ALTER TABLE homework_submit 
ADD COLUMN score INT DEFAULT NULL COMMENT '作业分数（0-100）',
ADD COLUMN comment TEXT DEFAULT NULL COMMENT '教师评语',
ADD COLUMN reviewed_at DATETIME DEFAULT NULL COMMENT '批改时间';

-- 添加索引
ALTER TABLE homework_submit 
ADD INDEX idx_score (score);

SELECT '✅ 分数字段添加成功！' AS message;
