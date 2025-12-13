-- 知识点锚点表
CREATE TABLE IF NOT EXISTS knowledge_anchors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  courseware_id INT NOT NULL,
  slide_number INT NOT NULL,
  anchor_name VARCHAR(100) NOT NULL,
  description TEXT,
  x_position DECIMAL(5,2) DEFAULT 50.00, -- 锚点在幻灯片中的X坐标(百分比)
  y_position DECIMAL(5,2) DEFAULT 50.00, -- 锚点在幻灯片中的Y坐标(百分比)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (courseware_id) REFERENCES courseware(id) ON DELETE CASCADE,
  INDEX idx_courseware_slide (courseware_id, slide_number)
);

-- 锚点关联资源表
CREATE TABLE IF NOT EXISTS anchor_resources (
  id INT PRIMARY KEY AUTO_INCREMENT,
  anchor_id INT NOT NULL,
  resource_type ENUM('video', 'code', 'syntax', 'editor') NOT NULL,
  resource_url VARCHAR(500), -- B站链接或内部视频路径
  resource_content TEXT, -- 代码内容、语法说明或编译器初始模板
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_path VARCHAR(500), -- 上传的视频文件路径
  file_size BIGINT, -- 文件大小
  duration INT, -- 视频时长(秒)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (anchor_id) REFERENCES knowledge_anchors(id) ON DELETE CASCADE,
  INDEX idx_anchor_type (anchor_id, resource_type)
);