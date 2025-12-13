-- 可视化示例表
CREATE TABLE IF NOT EXISTS visualization_examples (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '示例标题',
  description TEXT COMMENT '示例描述',
  category VARCHAR(50) DEFAULT '其他' COMMENT '示例分类：条形图、折线图、饼图等',
  files JSON NOT NULL COMMENT '文件内容，JSON格式存储多个文件',
  created_by INT COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_created_by (created_by)
) COMMENT='可视化示例表';

-- 注意：默认示例数据将通过应用程序初始化脚本插入
