const express = require('express');
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 确保视频上传目录存在
const videoUploadDir = path.join(__dirname, '..', 'uploads', 'videos');
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

// 配置视频文件上传
const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, videoUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '_' + uniqueSuffix + ext);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 限制500MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传视频文件 (mp4, avi, mov, wmv, flv, webm, mkv)'));
    }
  }
});

// 获取课件的所有锚点
router.get('/courseware/:coursewareId/anchors', async (req, res) => {
  try {
    const { coursewareId } = req.params;
    
    const [anchors] = await pool.query(`
      SELECT ka.*, 
             COUNT(ar.id) as resource_count
      FROM knowledge_anchors ka
      LEFT JOIN anchor_resources ar ON ka.id = ar.anchor_id
      WHERE ka.courseware_id = ?
      GROUP BY ka.id
      ORDER BY ka.slide_number, ka.created_at
    `, [coursewareId]);
    
    res.json(anchors);
  } catch (error) {
    console.error('获取锚点失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取指定幻灯片的锚点
router.get('/courseware/:coursewareId/slide/:slideNumber/anchors', async (req, res) => {
  try {
    const { coursewareId, slideNumber } = req.params;
    
    const [anchors] = await pool.query(`
      SELECT ka.*, 
             COUNT(ar.id) as resource_count
      FROM knowledge_anchors ka
      LEFT JOIN anchor_resources ar ON ka.id = ar.anchor_id
      WHERE ka.courseware_id = ? AND ka.slide_number = ?
      GROUP BY ka.id
      ORDER BY ka.created_at
    `, [coursewareId, slideNumber]);
    
    res.json(anchors);
  } catch (error) {
    console.error('获取幻灯片锚点失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新的知识点锚点
router.post('/anchors', async (req, res) => {
  try {
    const { 
      courseware_id, 
      slide_number, 
      anchor_name, 
      description, 
      x_position, 
      y_position 
    } = req.body;
    
    // 验证必填字段
    if (!courseware_id || !slide_number || !anchor_name) {
      return res.status(400).json({ error: '课件ID、幻灯片编号和锚点名称为必填项' });
    }
    
    // 验证课件是否存在
    const [courseware] = await pool.query(
      'SELECT id FROM courseware WHERE id = ?', 
      [courseware_id]
    );
    
    if (courseware.length === 0) {
      return res.status(404).json({ error: '课件不存在' });
    }
    
    const [result] = await pool.query(`
      INSERT INTO knowledge_anchors 
      (courseware_id, slide_number, anchor_name, description, x_position, y_position)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      courseware_id, 
      slide_number, 
      anchor_name, 
      description || '', 
      x_position || 50.00, 
      y_position || 50.00
    ]);
    
    // 获取创建的锚点信息
    const [newAnchor] = await pool.query(
      'SELECT * FROM knowledge_anchors WHERE id = ?',
      [result.insertId]
    );
    
    res.json({
      success: true,
      anchor: newAnchor[0],
      message: '锚点创建成功'
    });
  } catch (error) {
    console.error('创建锚点失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新锚点信息
router.put('/anchors/:anchorId', async (req, res) => {
  try {
    const { anchorId } = req.params;
    const { anchor_name, description, x_position, y_position } = req.body;
    
    const [result] = await pool.query(`
      UPDATE knowledge_anchors 
      SET anchor_name = ?, description = ?, x_position = ?, y_position = ?
      WHERE id = ?
    `, [anchor_name, description, x_position, y_position, anchorId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '锚点不存在' });
    }
    
    res.json({ success: true, message: '锚点更新成功' });
  } catch (error) {
    console.error('更新锚点失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除锚点
router.delete('/anchors/:anchorId', async (req, res) => {
  try {
    const { anchorId } = req.params;
    
    // 删除锚点会自动删除关联的资源（CASCADE）
    const [result] = await pool.query(
      'DELETE FROM knowledge_anchors WHERE id = ?',
      [anchorId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '锚点不存在' });
    }
    
    res.json({ success: true, message: '锚点删除成功' });
  } catch (error) {
    console.error('删除锚点失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取锚点的所有资源
router.get('/anchors/:anchorId/resources', async (req, res) => {
  try {
    const { anchorId } = req.params;
    
    const [resources] = await pool.query(
      'SELECT * FROM anchor_resources WHERE anchor_id = ? ORDER BY created_at',
      [anchorId]
    );
    
    res.json(resources);
  } catch (error) {
    console.error('获取锚点资源失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 为锚点添加视频资源
router.post('/anchors/:anchorId/resources/video', videoUpload.single('video'), async (req, res) => {
  try {
    const { anchorId } = req.params;
    const { title, description, resource_url } = req.body;
    
    let filePath = null;
    let fileSize = null;
    
    // 如果上传了文件
    if (req.file) {
      filePath = `/uploads/videos/${req.file.filename}`;
      fileSize = req.file.size;
    }
    
    // 验证至少有一个视频源
    if (!req.file && !resource_url) {
      return res.status(400).json({ error: '请上传视频文件或提供视频链接' });
    }
    
    const [result] = await pool.query(`
      INSERT INTO anchor_resources 
      (anchor_id, resource_type, resource_url, title, description, file_path, file_size)
      VALUES (?, 'video', ?, ?, ?, ?, ?)
    `, [anchorId, resource_url || '', title, description || '', filePath, fileSize]);
    
    const [newResource] = await pool.query(
      'SELECT * FROM anchor_resources WHERE id = ?',
      [result.insertId]
    );
    
    res.json({
      success: true,
      resource: newResource[0],
      message: '视频资源添加成功'
    });
  } catch (error) {
    console.error('添加视频资源失败:', error);
    // 如果数据库操作失败，删除已上传的文件
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('删除上传文件失败:', err);
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// 为锚点添加代码资源
router.post('/anchors/:anchorId/resources/code', async (req, res) => {
  try {
    const { anchorId } = req.params;
    const { title, description, resource_content } = req.body;
    
    if (!title || !resource_content) {
      return res.status(400).json({ error: '标题和代码内容为必填项' });
    }
    
    const [result] = await pool.query(`
      INSERT INTO anchor_resources 
      (anchor_id, resource_type, resource_content, title, description)
      VALUES (?, 'code', ?, ?, ?)
    `, [anchorId, resource_content, title, description || '']);
    
    const [newResource] = await pool.query(
      'SELECT * FROM anchor_resources WHERE id = ?',
      [result.insertId]
    );
    
    res.json({
      success: true,
      resource: newResource[0],
      message: '代码资源添加成功'
    });
  } catch (error) {
    console.error('添加代码资源失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 为锚点添加语法说明资源
router.post('/anchors/:anchorId/resources/syntax', async (req, res) => {
  try {
    const { anchorId } = req.params;
    const { title, description, resource_content } = req.body;
    
    if (!title || !resource_content) {
      return res.status(400).json({ error: '标题和语法说明内容为必填项' });
    }
    
    const [result] = await pool.query(`
      INSERT INTO anchor_resources 
      (anchor_id, resource_type, resource_content, title, description)
      VALUES (?, 'syntax', ?, ?, ?)
    `, [anchorId, resource_content, title, description || '']);
    
    const [newResource] = await pool.query(
      'SELECT * FROM anchor_resources WHERE id = ?',
      [result.insertId]
    );
    
    res.json({
      success: true,
      resource: newResource[0],
      message: '语法说明资源添加成功'
    });
  } catch (error) {
    console.error('添加语法说明资源失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新资源
router.put('/resources/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { title, description, resource_content, resource_url } = req.body;
    
    const [result] = await pool.query(`
      UPDATE anchor_resources 
      SET title = ?, description = ?, resource_content = ?, resource_url = ?
      WHERE id = ?
    `, [title, description, resource_content, resource_url, resourceId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '资源不存在' });
    }
    
    res.json({ success: true, message: '资源更新成功' });
  } catch (error) {
    console.error('更新资源失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除资源
router.delete('/resources/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    // 获取资源信息，如果有文件需要删除
    const [resources] = await pool.query(
      'SELECT file_path FROM anchor_resources WHERE id = ?',
      [resourceId]
    );
    
    const [result] = await pool.query(
      'DELETE FROM anchor_resources WHERE id = ?',
      [resourceId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '资源不存在' });
    }
    
    // 删除关联的文件
    if (resources.length > 0 && resources[0].file_path) {
      const filePath = path.join(__dirname, '..', resources[0].file_path);
      fs.unlink(filePath, (err) => {
        if (err) console.error('删除文件失败:', err);
      });
    }
    
    res.json({ success: true, message: '资源删除成功' });
  } catch (error) {
    console.error('删除资源失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;