const express = require('express');
const pool = require('./db');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
dotenv.config();

const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

// 引入锚点路由
const anchorRoutes = require('./routes/anchors');
app.use('/api', anchorRoutes);

// 引入作业提交路由
const submissionRoutes = require('./routes/submissions');
app.use('/api/submissions', submissionRoutes);

// 引入可视化示例路由
const visualizationExamplesRoutes = require('./routes/visualizationExamples');
app.use('/api/visualization-examples', visualizationExamplesRoutes);

// 静态文件服务 - 用于下载课件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ⭐ 添加这一行 - 用于访问PPT转换后的图片
app.use('/uploads/converted', express.static(path.join(__dirname, 'uploads', 'converted')));

// 静态文件服务 - 用于访问上传的视频
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads', 'videos')));

// 静态文件服务 - 用于访问PPT转换后的图片
app.use('/uploads/ppt-images', express.static(path.join(__dirname, 'uploads', 'ppt-images')));

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads', 'courseware');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 确保作业提交目录存在
const submissionDir = path.join(__dirname, 'uploads', 'submissions');
if (!fs.existsSync(submissionDir)) {
  fs.mkdirSync(submissionDir, { recursive: true });
}

// 配置课件文件上传
const coursewareStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳_原文件名
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '_' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: coursewareStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制50MB
  },
  fileFilter: function (req, file, cb) {
    // 允许的文件类型
    const allowedTypes = /pdf|ppt|pptx|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传 PDF、PPT、PPTX、DOC、DOCX 格式的文件'));
    }
  }
});

// 配置作业提交文件上传（支持更多格式）
const submissionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, submissionDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '_' + uniqueSuffix + ext);
  }
});

const submissionUpload = multer({
  storage: submissionStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 限制50MB
  }
});

const PORT = process.env.PORT || 5000;

// ========== 用户注册 ==========
app.post('/api/register', async (req, res) => {
  const { username, password, name, email, phone, role } = req.body;
  
  try {
    // 检查用户名是否已存在
    const [existingUsers] = await pool.query(
      'SELECT * FROM user WHERE username = ? AND role = ?',
      [username, role]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: '该用户名已被注册' });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 插入用户表
    await pool.query(
      'INSERT INTO user (username, password, role, status) VALUES (?, ?, ?, 1)',
      [username, hashedPassword, role]
    );
    
    // 如果是学生，同时插入学生名单表
    if (role === 'student') {
      await pool.query(
        'INSERT INTO student_list (student_id, name, class_name, email, phone, teacher_id) VALUES (?, ?, ?, ?, ?, ?)',
        [username, name, '未分配', email || null, phone || null, null]
      );
    }
    
    res.json({ 
      success: true, 
      message: '注册成功',
      username,
      role
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '注册失败：' + error.message });
  }
});

// ========== 用户登录 ==========
app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    const [users] = await pool.query(
      'SELECT * FROM user WHERE username = ? AND role = ?',
      [username, role]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    const user = users[0];
    
    // 密码验证（支持明文和加密密码）
    let passwordMatch = false;
    if (password === user.password) {
      // 明文密码匹配（兼容旧数据）
      passwordMatch = true;
    } else {
      // bcrypt 加密密码匹配
      try {
        passwordMatch = await bcrypt.compare(password, user.password);
      } catch (err) {
        passwordMatch = false;
      }
    }
    
    if (!passwordMatch) {
      return res.status(401).json({ error: '密码错误' });
    }
    
    // 如果是学生，获取学生详细信息
    if (role === 'student') {
      const [students] = await pool.query(
        'SELECT * FROM student_list WHERE student_id = ?',
        [username]
      );
      
      if (students.length > 0) {
        return res.json({
          role: 'student',
          id: students[0].student_id,
          name: students[0].name,
          class: students[0].class_name || '未分配',
          avatar: '👨‍🎓'
        });
      }
    }
    
    res.json({
      role: user.role,
      id: user.id,
      name: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 学生管理 ==========
app.get('/api/students', async (req, res) => {
  const { teacher_id } = req.query;
  
  try {
    let query = 'SELECT * FROM student_list';
    let params = [];
    
    if (teacher_id) {
      query += ' WHERE teacher_id = ?';
      params.push(teacher_id);
    }
    
    const [students] = await pool.query(query, params);
    
    const formatted = students.map(s => ({
      id: s.student_id,
      name: s.name,
      class: s.class_name || '未分配',
      avatar: '👨‍🎓'
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { students, teacher_id } = req.body;
  
  try {
    for (const student of students) {
      await pool.query(
        'INSERT INTO student_list (student_id, name, class_name, teacher_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), class_name = VALUES(class_name)',
        [student.id, student.name, student.class, teacher_id]
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Add students error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM student_list WHERE student_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { name, class: className } = req.body;
  
  try {
    await pool.query(
      'UPDATE student_list SET name = ?, class_name = ? WHERE student_id = ?',
      [name, className, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 代码库管理 ==========
app.get('/api/code-library', async (req, res) => {
  const { teacher_id } = req.query;
  
  try {
    let query = 'SELECT * FROM code_library';
    let params = [];
    
    if (teacher_id) {
      query += ' WHERE teacher_id = ?';
      params.push(teacher_id);
    }
    
    const [codes] = await pool.query(query, params);
    
    const formatted = codes.map(c => ({
      id: `c${c.id}`,
      title: c.title,
      category: c.category || 'HTML/CSS',
      content: c.code_content
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Get code library error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/code-library', async (req, res) => {
  const { title, category, content, teacher_id } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO code_library (teacher_id, title, category, code_content) VALUES (?, ?, ?, ?)',
      [teacher_id, title, category, content]
    );
    
    res.json({ id: `c${result.insertId}`, title, category, content });
  } catch (error) {
    console.error('Add code library error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/code-library/:id', async (req, res) => {
  const { title, category, content } = req.body;
  const id = req.params.id.replace('c', '');
  
  try {
    await pool.query(
      'UPDATE code_library SET title = ?, category = ?, code_content = ? WHERE id = ?',
      [title, category, content, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update code library error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/code-library/:id', async (req, res) => {
  const id = req.params.id.replace('c', '');
  
  try {
    await pool.query('DELETE FROM code_library WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete code library error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 作业管理 ==========
app.get('/api/assignments', async (req, res) => {
  const { teacher_id, student_class } = req.query;
  
  try {
    let query = 'SELECT * FROM homework WHERE status = 1';
    let params = [];
    
    if (teacher_id) {
      query += ' AND teacher_id = ?';
      params.push(teacher_id);
    }
    
    const [assignments] = await pool.query(query, params);
    
    const formatted = await Promise.all(assignments.map(async a => {
      let template = { 'index.html': '<!-- 默认模板 -->' };
      
      if (a.code_template_id) {
        const [codes] = await pool.query('SELECT code_content, category FROM code_library WHERE id = ?', [a.code_template_id]);
        if (codes.length > 0) {
          const fileName = codes[0].category?.includes('Java') ? 'script.js' : 'index.html';
          template = { [fileName]: codes[0].code_content };
        }
      }
      
      return {
        id: `a${a.id}`,
        title: a.title,
        description: a.requirement?.substring(0, 100) || '',
        requirements: a.requirement,
        deadline: a.deadline,
        linkedCodeId: a.code_template_id ? `c${a.code_template_id}` : '',
        targetClass: '所有班级',
        template,
        createdAt: a.create_time
      };
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  const { title, requirements, deadline, linkedCodeId, targetClass, teacher_id } = req.body;
  const templateId = linkedCodeId ? linkedCodeId.replace('c', '') : null;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO homework (teacher_id, title, requirement, deadline, code_template_id) VALUES (?, ?, ?, ?, ?)',
      [teacher_id, title, requirements, deadline, templateId]
    );
    
    res.json({ id: `a${result.insertId}`, title, requirements, deadline, linkedCodeId, targetClass });
  } catch (error) {
    console.error('Add assignment error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/assignments/:id', async (req, res) => {
  const id = req.params.id.replace('a', '');
  
  try {
    await pool.query('UPDATE homework SET status = 0 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 作业提交 ==========
app.post('/api/submissions', async (req, res) => {
  const { studentId, assignmentId, files, timestamp } = req.body;
  
  try {
    const [students] = await pool.query(
      'SELECT id FROM student_list WHERE student_id = ?',
      [studentId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ error: '学生不存在' });
    }
    
    const student_list_id = students[0].id;
    const homework_id = assignmentId.replace('a', '');
    const code_content = JSON.stringify(files);
    
    const [homework] = await pool.query('SELECT deadline FROM homework WHERE id = ?', [homework_id]);
    const is_late = homework.length > 0 && new Date(timestamp) > new Date(homework[0].deadline) ? 1 : 0;
    
    const [existing] = await pool.query(
      'SELECT id, modify_count FROM homework_submit WHERE student_id = ? AND homework_id = ?',
      [student_list_id, homework_id]
    );
    
    if (existing.length > 0) {
      await pool.query(
        'UPDATE homework_submit SET code_content = ?, submit_time = ?, modify_count = modify_count + 1 WHERE id = ?',
        [code_content, new Date(timestamp), existing[0].id]
      );
      res.json({ success: true, id: existing[0].id });
    } else {
      const [result] = await pool.query(
        'INSERT INTO homework_submit (student_id, homework_id, code_content, is_late, submit_time) VALUES (?, ?, ?, ?, ?)',
        [student_list_id, homework_id, code_content, is_late, new Date(timestamp)]
      );
      res.json({ success: true, id: result.insertId });
    }
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/submissions', async (req, res) => {
  const { teacher_id, student_id } = req.query;
  
  try {
    let query = `
      SELECT hs.*, sl.student_id, sl.name, h.title, h.teacher_id
      FROM homework_submit hs
      JOIN student_list sl ON hs.student_id = sl.id
      JOIN homework h ON hs.homework_id = h.id
      WHERE 1=1
    `;
    let params = [];
    
    if (teacher_id) {
      query += ' AND h.teacher_id = ?';
      params.push(teacher_id);
    }
    
    if (student_id) {
      query += ' AND sl.student_id = ?';
      params.push(student_id);
    }
    
    const [submissions] = await pool.query(query, params);
    
    const formatted = submissions.map(s => ({
      id: `sub${s.id}`,
      studentId: s.student_id,
      studentName: s.name,
      assignmentId: `a${s.homework_id}`,
      assignmentTitle: s.title,
      files: JSON.parse(s.code_content),
      timestamp: new Date(s.submit_time).getTime(),
      score: s.score,
      comment: s.comment,
      reviewedAt: s.reviewed_at,
      reviewed: s.score !== null
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 批改作业（打分）
app.put('/api/submissions/:id/score', async (req, res) => {
  const submissionId = req.params.id.replace('sub', '');
  const { score, comment } = req.body;
  
  try {
    // 验证分数值
    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({ error: '分数必须是0-100之间的数字' });
    }
    
    await pool.query(
      'UPDATE homework_submit SET score = ?, comment = ?, reviewed_at = NOW() WHERE id = ?',
      [numericScore, comment || '', submissionId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 文档作业提交 ==========
app.post('/api/submissions/document', submissionUpload.array('files', 10), async (req, res) => {
  const { studentId, assignmentId, content, timestamp } = req.body;
  
  try {
    // 获取学生ID
    const [students] = await pool.query(
      'SELECT id FROM student_list WHERE student_id = ?',
      [studentId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ error: '学生不存在' });
    }
    
    const student_list_id = students[0].id;
    const homework_id = assignmentId.replace('a', '');
    
    // 处理上传的文件
    const uploadedFiles = req.files ? req.files.map(file => ({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: `/uploads/submissions/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype
    })) : [];
    
    // 构建提交内容（包含文本和文件信息）
    const submissionData = {
      type: 'document',
      content: content || '',
      files: uploadedFiles,
      submittedAt: timestamp || new Date().toISOString()
    };
    
    const code_content = JSON.stringify(submissionData);
    
    // 检查是否逾期
    const [homework] = await pool.query('SELECT deadline FROM homework WHERE id = ?', [homework_id]);
    const is_late = homework.length > 0 && new Date(timestamp || new Date()) > new Date(homework[0].deadline) ? 1 : 0;
    
    // 检查是否已提交
    const [existing] = await pool.query(
      'SELECT id, modify_count FROM homework_submit WHERE student_id = ? AND homework_id = ?',
      [student_list_id, homework_id]
    );
    
    if (existing.length > 0) {
      // 更新已有提交
      await pool.query(
        'UPDATE homework_submit SET code_content = ?, submit_time = ?, modify_count = modify_count + 1, is_late = ? WHERE id = ?',
        [code_content, new Date(timestamp || new Date()), is_late, existing[0].id]
      );
      res.json({ 
        success: true, 
        id: existing[0].id,
        message: '作业已更新'
      });
    } else {
      // 新建提交
      const [result] = await pool.query(
        'INSERT INTO homework_submit (student_id, homework_id, code_content, is_late, submit_time) VALUES (?, ?, ?, ?, ?)',
        [student_list_id, homework_id, code_content, is_late, new Date(timestamp || new Date())]
      );
      res.json({ 
        success: true, 
        id: result.insertId,
        message: '作业提交成功'
      });
    }
  } catch (error) {
    console.error('Submit document assignment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 重做申请管理 ==========
// 提交重做申请
app.post('/api/redo-requests', async (req, res) => {
  const { submissionId, studentId, homeworkId, reason } = req.body;
  
  try {
    // 获取学生ID
    const [students] = await pool.query(
      'SELECT id FROM student_list WHERE student_id = ?',
      [studentId]
    );
    
    if (students.length === 0) {
      return res.status(404).json({ error: '学生不存在' });
    }
    
    const student_list_id = students[0].id;
    const submission_id = submissionId.replace('sub', '');
    const homework_id = homeworkId.replace('a', '');
    
    // 检查是否已有待处理的申请
    const [existing] = await pool.query(
      'SELECT id FROM redo_requests WHERE submission_id = ? AND status = "pending"',
      [submission_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: '已有待处理的重做申请' });
    }
    
    // 检查重做次数
    const [submission] = await pool.query(
      'SELECT redo_count FROM homework_submit WHERE id = ?',
      [submission_id]
    );
    
    if (submission.length > 0 && submission[0].redo_count >= 3) {
      return res.status(400).json({ error: '已达到最大重做次数（3次）' });
    }
    
    // 创建重做申请
    const [result] = await pool.query(
      'INSERT INTO redo_requests (submission_id, student_id, homework_id, reason, status) VALUES (?, ?, ?, ?, "pending")',
      [submission_id, student_list_id, homework_id, reason]
    );
    
    // 创建通知给教师
    const [homework] = await pool.query('SELECT teacher_id, title FROM homework WHERE id = ?', [homework_id]);
    if (homework.length > 0) {
      await pool.query(
        'INSERT INTO notifications (user_id, user_role, type, title, content, related_id) VALUES (?, "teacher", "redo_request", ?, ?, ?)',
        [
          homework[0].teacher_id,
          '学生申请重做作业',
          `学生 ${studentId} 申请重做作业《${homework[0].title}》`,
          result.insertId
        ]
      );
    }
    
    res.json({ success: true, id: result.insertId, message: '重做申请已提交' });
  } catch (error) {
    console.error('Submit redo request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取重做申请列表（教师端）
app.get('/api/redo-requests', async (req, res) => {
  const { teacherId, status } = req.query;
  
  try {
    let query = `
      SELECT rr.*, sl.student_id, sl.name as student_name, h.title as homework_title
      FROM redo_requests rr
      JOIN student_list sl ON rr.student_id = sl.id
      JOIN homework h ON rr.homework_id = h.id
      WHERE h.teacher_id = ?
    `;
    let params = [teacherId];
    
    if (status) {
      query += ' AND rr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY rr.created_at DESC';
    
    const [requests] = await pool.query(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Get redo requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 处理重做申请（教师端）
app.put('/api/redo-requests/:id', async (req, res) => {
  const requestId = req.params.id;
  const { status, teacherReply } = req.body;
  
  try {
    // 获取申请信息
    const [request] = await pool.query(
      'SELECT * FROM redo_requests WHERE id = ?',
      [requestId]
    );
    
    if (request.length === 0) {
      return res.status(404).json({ error: '申请不存在' });
    }
    
    // 更新申请状态
    await pool.query(
      'UPDATE redo_requests SET status = ?, teacher_reply = ?, reviewed_at = NOW() WHERE id = ?',
      [status, teacherReply, requestId]
    );
    
    // 如果批准，更新提交记录
    if (status === 'approved') {
      await pool.query(
        'UPDATE homework_submit SET can_redo = 1, score = NULL, comment = NULL, reviewed_at = NULL WHERE id = ?',
        [request[0].submission_id]
      );
    }
    
    // 创建通知给学生
    const [student] = await pool.query(
      'SELECT student_id FROM student_list WHERE id = ?',
      [request[0].student_id]
    );
    
    if (student.length > 0) {
      const notifType = status === 'approved' ? 'redo_approved' : 'redo_rejected';
      const notifTitle = status === 'approved' ? '重做申请已批准' : '重做申请被拒绝';
      const notifContent = status === 'approved' 
        ? `您的重做申请已被批准，现在可以重新提交作业了。${teacherReply ? '教师回复：' + teacherReply : ''}`
        : `您的重做申请被拒绝。${teacherReply ? '原因：' + teacherReply : ''}`;
      
      await pool.query(
        'INSERT INTO notifications (user_id, user_role, type, title, content, related_id) VALUES (?, "student", ?, ?, ?, ?)',
        [student[0].student_id, notifType, notifTitle, notifContent, request[0].homework_id]
      );
    }
    
    res.json({ success: true, message: '处理成功' });
  } catch (error) {
    console.error('Process redo request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 通知管理 ==========
// 获取通知列表
app.get('/api/notifications', async (req, res) => {
  const { userId, userRole, unreadOnly } = req.query;
  
  try {
    let query = 'SELECT * FROM notifications WHERE user_id = ? AND user_role = ?';
    let params = [userId, userRole];
    
    if (unreadOnly === 'true') {
      query += ' AND is_read = 0';
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const [notifications] = await pool.query(query, params);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 标记通知为已读
app.put('/api/notifications/:id/read', async (req, res) => {
  const notificationId = req.params.id;
  
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ?',
      [notificationId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 标记所有通知为已读
app.put('/api/notifications/read-all', async (req, res) => {
  const { userId, userRole } = req.body;
  
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND user_role = ? AND is_read = 0',
      [userId, userRole]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 作业编辑 ==========
// 更新作业信息
app.put('/api/assignments/:id', async (req, res) => {
  const assignmentId = req.params.id.replace('a', '');
  const { title, requirements, deadline, targetClass } = req.body;
  
  try {
    await pool.query(
      'UPDATE homework SET title = ?, requirements = ?, deadline = ?, target_class = ? WHERE id = ?',
      [title, requirements, deadline, targetClass, assignmentId]
    );
    
    // 创建通知给相关学生
    const [students] = await pool.query(
      'SELECT student_id FROM student_list WHERE class_name = ? OR ? = "所有班级"',
      [targetClass, targetClass]
    );
    
    for (const student of students) {
      await pool.query(
        'INSERT INTO notifications (user_id, user_role, type, title, content, related_id) VALUES (?, "student", "assignment_updated", ?, ?, ?)',
        [
          student.student_id,
          '作业信息已更新',
          `作业《${title}》的信息已更新，请查看最新要求`,
          assignmentId
        ]
      );
    }
    
    res.json({ success: true, message: '作业信息已更新' });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 在线答疑管理 ==========
// 获取问题列表
app.get('/api/qa/questions', async (req, res) => {
  const { studentId } = req.query;
  
  try {
    let query = `
      SELECT q.*, sl.student_id, sl.name as student_name
      FROM qa_questions q
      JOIN student_list sl ON q.student_list_id = sl.id
      WHERE 1=1
    `;
    let params = [];
    
    // 如果指定了学生ID，只返回该学生的问题
    if (studentId) {
      query += ' AND sl.student_id = ?';
      params.push(studentId);
    }
    
    query += ' ORDER BY q.created_at DESC';
    
    const [questions] = await pool.query(query, params);
    
    const formatted = questions.map(q => ({
      id: q.id,
      studentId: q.student_id,
      studentName: q.student_name,
      question: q.question,
      answer: q.answer,
      assignmentId: q.homework_id ? `a${q.homework_id}` : null,
      createdAt: q.created_at,
      answeredAt: q.answered_at
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Get QA questions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 学生提交问题
app.post('/api/qa/questions', async (req, res) => {
  const { studentId, studentName, question, assignmentId } = req.body;
  
  try {
    console.log('收到提问请求:', { studentId, studentName, question, assignmentId });
    
    // 获取学生的 student_list_id
    const [students] = await pool.query(
      'SELECT id FROM student_list WHERE student_id = ?',
      [studentId]
    );
    
    if (students.length === 0) {
      console.error('学生不存在:', studentId);
      return res.status(404).json({ error: `学生不存在: ${studentId}` });
    }
    
    const student_list_id = students[0].id;
    const homework_id = assignmentId ? parseInt(assignmentId.replace('a', '')) : null;
    
    console.log('准备插入数据:', { student_list_id, question, homework_id });
    
    const [result] = await pool.query(
      'INSERT INTO qa_questions (student_list_id, question, homework_id, created_at) VALUES (?, ?, ?, NOW())',
      [student_list_id, question, homework_id]
    );
    
    console.log('插入成功，ID:', result.insertId);
    
    res.json({
      id: result.insertId,
      studentId,
      studentName,
      question,
      answer: null,
      assignmentId,
      createdAt: new Date().toISOString(),
      answeredAt: null
    });
  } catch (error) {
    console.error('Submit QA question error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 教师回复问题
app.put('/api/qa/questions/:id/answer', async (req, res) => {
  const { answer, teacherId } = req.body;
  const questionId = req.params.id;
  
  try {
    console.log('收到回复请求:', { questionId, answer, teacherId });
    
    await pool.query(
      'UPDATE qa_questions SET answer = ?, answered_at = NOW(), teacher_id = ? WHERE id = ?',
      [answer, teacherId || null, questionId]
    );
    
    console.log('回复成功');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Answer QA question error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 删除问题
app.delete('/api/qa/questions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM qa_questions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete QA question error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== 课件管理 ==========
// 获取课件列表
app.get('/api/courseware', async (req, res) => {
  const { category, homework_id } = req.query;
  
  try {
    let query = 'SELECT * FROM courseware WHERE status = 1';
    let params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (homework_id) {
      query += ' AND homework_id = ?';
      params.push(homework_id.replace('a', ''));
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [courseware] = await pool.query(query, params);
    
    const formatted = courseware.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      fileName: c.file_name,
      filePath: c.file_path,
      fileSize: c.file_size,
      fileType: c.file_type,
      category: c.category,
      downloadCount: c.download_count,
      viewCount: c.view_count,
      createdAt: c.created_at,
      homeworkId: c.homework_id ? `a${c.homework_id}` : null
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Get courseware error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 上传课件
app.post('/api/courseware', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }
    
    const { title, description, category, homework_id, teacher_id } = req.body;
    
    console.log('上传课件:', {
      title,
      fileName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });
    
    const filePath = `/uploads/courseware/${req.file.filename}`;
    const fileType = path.extname(req.file.originalname).substring(1).toLowerCase();
    
    const [result] = await pool.query(
      `INSERT INTO courseware (title, description, file_name, file_path, file_size, file_type, category, homework_id, teacher_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        req.file.originalname,
        filePath,
        req.file.size,
        fileType,
        category || 'HTML基础',
        homework_id ? homework_id.replace('a', '') : null,
        teacher_id || 1
      ]
    );
    
    console.log('课件上传成功，ID:', result.insertId);
    
    res.json({
      id: result.insertId,
      title,
      description,
      fileName: req.file.originalname,
      filePath,
      fileSize: req.file.size,
      fileType,
      category: category || 'HTML基础',
      message: '课件上传成功'
    });
  } catch (error) {
    console.error('Upload courseware error:', error);
    // 如果数据库插入失败，删除已上传的文件
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// 删除课件
app.delete('/api/courseware/:id', async (req, res) => {
  try {
    const [courseware] = await pool.query('SELECT * FROM courseware WHERE id = ?', [req.params.id]);
    
    if (courseware.length === 0) {
      return res.status(404).json({ error: '课件不存在' });
    }
    
    // 软删除
    await pool.query('UPDATE courseware SET status = 0 WHERE id = ?', [req.params.id]);
    
    // 可选：删除物理文件
    // const filePath = path.join(__dirname, courseware[0].file_path);
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }
    
    res.json({ success: true, message: '课件已删除' });
  } catch (error) {
    console.error('Delete courseware error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 增加查看次数
app.post('/api/courseware/:id/view', async (req, res) => {
  try {
    await pool.query('UPDATE courseware SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update view count error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 增加下载次数
app.post('/api/courseware/:id/download', async (req, res) => {
  try {
    await pool.query('UPDATE courseware SET download_count = download_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update download count error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PPT转图片预览（真实转换）
const pptConverter = require('./utils/pptConverter');
const docConverter = require('./utils/docConverter');

app.get('/api/courseware/:id/preview', async (req, res) => {
  try {
    const [courseware] = await pool.query('SELECT * FROM courseware WHERE id = ?', [req.params.id]);
    
    if (courseware.length === 0) {
      return res.status(404).json({ error: '课件不存在' });
    }
    
    const item = courseware[0];
    
    // 检查文件类型，只处理PPT文件
    const fileType = item.file_type.toLowerCase();
    if (fileType !== 'ppt' && fileType !== 'pptx') {
      return res.status(400).json({ 
        error: '不支持的文件类型',
        message: '预览API仅支持PPT和PPTX文件',
        fileType: item.file_type
      });
    }
    
    const outputName = `courseware-${item.id}`;
    
    // 检查是否已经转换过
    const isConverted = await pptConverter.isConverted(outputName);
    
    let slides;
    if (isConverted) {
      // 使用缓存的图片
      console.log('✅ 使用缓存的图片，课件ID:', item.id);
      slides = await pptConverter.getConvertedImages(outputName);
    } else {
      // 转换PPT
      console.log('🔄 开始转换PPT，课件ID:', item.id);
      const pptPath = path.join(__dirname, item.file_path);
      
      console.log('PPT文件路径:', pptPath);
      
      // 检查文件是否存在
      if (!fs.existsSync(pptPath)) {
        console.error('❌ PPT文件不存在:', pptPath);
        return res.status(404).json({ error: 'PPT文件不存在: ' + pptPath });
      }
      
      console.log('✅ PPT文件存在，开始转换...');
      slides = await pptConverter.convertToImages(pptPath, outputName);
      console.log('✅ 转换完成，生成', slides.length, '张图片');
    }
    
    res.json({
      id: item.id,
      title: item.title,
      totalSlides: slides.length,
      slides: slides
    });
  } catch (error) {
    console.error('❌ Preview error:', error);
    console.error('错误详情:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: '转换失败。请检查：1) LibreOffice已安装 2) ImageMagick已安装 3) PPT文件存在'
    });
  }
});

// Word转PDF预览
app.get('/api/courseware/:id/doc-preview', async (req, res) => {
  try {
    const [courseware] = await pool.query('SELECT * FROM courseware WHERE id = ?', [req.params.id]);
    
    if (courseware.length === 0) {
      return res.status(404).json({ error: '课件不存在' });
    }
    
    const item = courseware[0];
    
    // 检查文件类型，只处理Word文件
    const fileType = item.file_type.toLowerCase();
    if (fileType !== 'doc' && fileType !== 'docx') {
      return res.status(400).json({ 
        error: '不支持的文件类型',
        message: 'Word预览API仅支持DOC和DOCX文件',
        fileType: item.file_type
      });
    }
    
    const outputName = `courseware-${item.id}`;
    
    // 检查是否已经转换过
    const isConverted = docConverter.isConverted(outputName);
    
    let pdfUrl;
    if (isConverted) {
      // 使用缓存的PDF
      console.log('✅ 使用缓存的PDF，课件ID:', item.id);
      pdfUrl = docConverter.getConvertedPDF(outputName);
    } else {
      // 转换Word为PDF
      console.log('🔄 开始转换Word文档，课件ID:', item.id);
      const docPath = path.join(__dirname, item.file_path);
      
      console.log('Word文件路径:', docPath);
      
      // 检查文件是否存在
      if (!fs.existsSync(docPath)) {
        console.error('❌ Word文件不存在:', docPath);
        return res.status(404).json({ error: 'Word文件不存在: ' + docPath });
      }
      
      console.log('✅ Word文件存在，开始转换...');
      pdfUrl = await docConverter.convertToPDF(docPath, outputName);
      console.log('✅ 转换完成，PDF URL:', pdfUrl);
    }
    
    res.json({
      id: item.id,
      title: item.title,
      pdfUrl: pdfUrl
    });
  } catch (error) {
    console.error('❌ Word转PDF error:', error);
    console.error('错误详情:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: '转换失败。请检查：1) LibreOffice已安装 2) Word文件存在'
    });
  }
});

// ========== 个人资料管理 ==========
// 获取用户信息
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.query;
  
  try {
    if (role === 'student') {
      const [students] = await pool.query(
        'SELECT * FROM student_list WHERE student_id = ?',
        [userId]
      );
      
      if (students.length === 0) {
        return res.status(404).json({ error: '学生不存在' });
      }
      
      const student = students[0];
      res.json({
        id: student.student_id,
        name: student.name,
        class: student.class_name,
        email: student.email,
        phone: student.phone,
        role: 'student'
      });
    } else if (role === 'teacher') {
      const [users] = await pool.query(
        'SELECT * FROM user WHERE id = ? AND role = ?',
        [userId, 'teacher']
      );
      
      if (users.length === 0) {
        return res.status(404).json({ error: '教师不存在' });
      }
      
      const user = users[0];
      res.json({
        id: user.id,
        username: user.username,
        name: user.username,
        email: user.email || '',
        phone: user.phone || '',
        role: 'teacher'
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新用户信息
app.put('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { role, name, email, phone, password } = req.body;
  
  try {
    if (role === 'student') {
      // 更新学生信息
      await pool.query(
        'UPDATE student_list SET name = ?, email = ?, phone = ? WHERE student_id = ?',
        [name, email || null, phone || null, userId]
      );
      
      // 如果提供了新密码，更新密码
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          'UPDATE user SET password = ? WHERE username = ? AND role = ?',
          [hashedPassword, userId, 'student']
        );
      }
      
      res.json({ success: true, message: '个人信息更新成功' });
    } else if (role === 'teacher') {
      // 更新教师信息
      const updates = [];
      const params = [];
      
      if (email !== undefined) {
        updates.push('email = ?');
        params.push(email || null);
      }
      
      if (phone !== undefined) {
        updates.push('phone = ?');
        params.push(phone || null);
      }
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        params.push(hashedPassword);
      }
      
      if (updates.length > 0) {
        params.push(userId);
        await pool.query(
          `UPDATE user SET ${updates.join(', ')} WHERE id = ? AND role = 'teacher'`,
          params
        );
      }
      
      res.json({ success: true, message: '个人信息更新成功' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'JS Editor API Server' }));

app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
  console.log(`📝 Database: ${process.env.DB_NAME || 'js_editor'}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
});
