-- 为anchor_resources表的resource_type字段添加'editor'类型

ALTER TABLE anchor_resources 
MODIFY COLUMN resource_type ENUM('video', 'code', 'syntax', 'editor') NOT NULL;

-- 验证修改
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'js_editor' 
  AND TABLE_NAME = 'anchor_resources' 
  AND COLUMN_NAME = 'resource_type';
