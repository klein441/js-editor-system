const express = require('express');
const router = express.Router();

// 获取用户信息
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // 这里可以添加数据库查询逻辑
    const userData = {
      id: userId,
      name: '测试用户',
      email: 'test@example.com',
      createdAt: new Date().toISOString()
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