const express = require('express');
const router = express.Router();
const pool = require('../db');

// 获取作业的所有提交
router.get('/assignment/:assignmentId', async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId.replace('a', '');
    
    const [submissions] = await pool.query(`
      SELECT 
        hs.*,
        sl.student_id,
        sl.name as student_name,
        h.title as homework_title,
        h.deadline
      FROM homework_submit hs
      JOIN student_list sl ON hs.student_id = sl.id
      JOIN homework h ON hs.homework_id = h.id
      WHERE h.id = ?
      ORDER BY hs.submit_time DESC
    `, [assignmentId]);
    
    // 格式化提交数据
    const formatted = submissions.map(sub => ({
      id: sub.id,
      studentId: sub.student_id,
      studentName: sub.student_name,
      homeworkTitle: sub.homework_title,
      codeContent: sub.code_content,
      docContent: sub.doc_content,
      submitTime: sub.submit_time,
      modifyCount: sub.modify_count,
      isLate: sub.is_late,
      isRework: sub.is_rework,
      score: sub.score || null,
      feedback: null, // 暂时不使用feedback字段
      deadline: sub.deadline
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('获取作业提交失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个提交详情
router.get('/:submissionId', async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    
    const [submissions] = await pool.query(`
      SELECT 
        hs.*,
        sl.student_id,
        sl.name as student_name,
        h.title as homework_title,
        h.requirement as requirements,
        h.deadline
      FROM homework_submit hs
      JOIN student_list sl ON hs.student_id = sl.id
      JOIN homework h ON hs.homework_id = h.id
      WHERE hs.id = ?
    `, [submissionId]);
    
    if (submissions.length === 0) {
      return res.status(404).json({ error: '提交不存在' });
    }
    
    const sub = submissions[0];
    const formatted = {
      id: sub.id,
      studentId: sub.student_id,
      studentName: sub.student_name,
      homeworkTitle: sub.homework_title,
      requirements: sub.requirements,
      codeContent: sub.code_content,
      docContent: sub.doc_content,
      submitTime: sub.submit_time,
      modifyCount: sub.modify_count,
      isLate: sub.is_late,
      isRework: sub.is_rework,
      score: sub.score || null,
      feedback: null, // 暂时不使用feedback字段
      deadline: sub.deadline
    };
    
    res.json(formatted);
  } catch (error) {
    console.error('获取提交详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 批阅作业（打分和评语）
router.put('/:submissionId/grade', async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    const { score, feedback } = req.body;
    
    // 处理分数值，确保不是undefined
    const finalScore = (score !== undefined && score !== null && score !== '' && !isNaN(parseFloat(score))) 
      ? parseFloat(score) : null;
    
    // 验证分数范围
    if (finalScore !== null && (finalScore < 0 || finalScore > 100)) {
      return res.status(400).json({ error: '分数必须在0-100之间' });
    }

    console.log('准备更新分数:', { submissionId, originalScore: score, finalScore });

    // 先检查并添加必要的字段
    try {
      await pool.query(`
        ALTER TABLE homework_submit 
        ADD COLUMN IF NOT EXISTS score INT DEFAULT NULL COMMENT '作业分数(0-100)'
      `);
    } catch (alterError) {
      console.log('score字段可能已存在:', alterError.message);
    }
    
    // 更新分数
    try {
      const [result] = await pool.query(`
        UPDATE homework_submit 
        SET score = ?
        WHERE id = ?
      `, [finalScore, submissionId]);
      
      console.log('更新结果:', result);
    } catch (updateError) {
      console.error('更新分数失败:', updateError);
      throw updateError;
    }
    
    res.json({ 
      success: true, 
      message: '批阅完成',
      score: finalScore,
      feedback: feedback || null
    });
  } catch (error) {
    console.error('批阅作业失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 允许学生重做
router.put('/:submissionId/allow-redo', async (req, res) => {
  try {
    const submissionId = req.params.submissionId;
    
    await pool.query(`
      UPDATE homework_submit 
      SET can_redo = 1
      WHERE id = ?
    `, [submissionId]);
    
    res.json({ 
      success: true, 
      message: '已允许学生重做'
    });
  } catch (error) {
    console.error('设置重做权限失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;