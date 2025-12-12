const express = require('express');
const router = express.Router();

// 获取用户信息 - 我随便改改试试
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 我添加了一些随机的改动
    console.log('正在获取用户信息，ID:', userId);
    
    // 这里可以添加数据库查询逻辑
    const userData = {
      id: userId,
      name: '我改了这个名字',
      email: 'my-new-email@example.com',
      createdAt: new Date().toISOString(),
      randomField: '我随便加的字段',
      timestamp: Date.now()
    };
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 创建新用户
router.post('/user', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // 这里可以添加数据库插入逻辑
    const newUser = {
      id: Date.now(),
      name,
      email,
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: '用户创建成功',
      data: newUser
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({
      success: false,
      message: '创建用户失败'
    });
  }
});

module.exports = router;