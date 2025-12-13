const express = require('express');
const pool = require('../db');
const router = express.Router();

// 获取所有可视化示例
router.get('/', async (req, res) => {
  try {
    const [examples] = await pool.query(`
      SELECT * FROM visualization_examples
      ORDER BY created_at DESC
    `);
    
    // 解析JSON字段
    const parsedExamples = examples.map(example => ({
      ...example,
      files: typeof example.files === 'string' ? JSON.parse(example.files) : example.files
    }));
    
    res.json(parsedExamples);
  } catch (error) {
    console.error('获取可视化示例失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 根据ID获取可视化示例
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [examples] = await pool.query(`
      SELECT * FROM visualization_examples
      WHERE id = ?
    `, [id]);
    
    if (examples.length === 0) {
      return res.status(404).json({ error: '示例不存在' });
    }
    
    const example = examples[0];
    example.files = typeof example.files === 'string' ? JSON.parse(example.files) : example.files;
    
    res.json(example);
  } catch (error) {
    console.error('获取可视化示例失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 创建新的可视化示例
router.post('/', async (req, res) => {
  try {
    const { title, description, category, files, created_by } = req.body;
    
    if (!title || !files) {
      return res.status(400).json({ error: '标题和文件内容为必填项' });
    }
    
    // 将files对象转换为JSON字符串
    const filesJson = JSON.stringify(files);
    
    const [result] = await pool.query(`
      INSERT INTO visualization_examples 
      (title, description, category, files, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description || '', category || '其他', filesJson, created_by || null]);
    
    const [newExample] = await pool.query(
      'SELECT * FROM visualization_examples WHERE id = ?',
      [result.insertId]
    );
    
    const example = newExample[0];
    example.files = typeof example.files === 'string' ? JSON.parse(example.files) : example.files;
    
    res.json({
      success: true,
      example: example,
      message: '可视化示例创建成功'
    });
  } catch (error) {
    console.error('创建可视化示例失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新可视化示例
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, files } = req.body;
    
    const filesJson = files ? JSON.stringify(files) : undefined;
    
    const updates = [];
    const values = [];
    
    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category) {
      updates.push('category = ?');
      values.push(category);
    }
    if (filesJson) {
      updates.push('files = ?');
      values.push(filesJson);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有要更新的内容' });
    }
    
    values.push(id);
    
    const [result] = await pool.query(`
      UPDATE visualization_examples 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '示例不存在' });
    }
    
    res.json({ success: true, message: '可视化示例更新成功' });
  } catch (error) {
    console.error('更新可视化示例失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除可视化示例
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM visualization_examples WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '示例不存在' });
    }
    
    res.json({ success: true, message: '可视化示例删除成功' });
  } catch (error) {
    console.error('删除可视化示例失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 根据分类获取可视化示例
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const [examples] = await pool.query(`
      SELECT * FROM visualization_examples
      WHERE category = ?
      ORDER BY created_at DESC
    `, [category]);
    
    const parsedExamples = examples.map(example => ({
      ...example,
      files: typeof example.files === 'string' ? JSON.parse(example.files) : example.files
    }));
    
    res.json(parsedExamples);
  } catch (error) {
    console.error('获取分类示例失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
