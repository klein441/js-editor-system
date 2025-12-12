import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Clock, FileText, Star, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const AssignmentGrading = ({ assignmentId, onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  // 获取作业提交列表
  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/submissions/assignment/${assignmentId}`);
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('获取提交列表失败:', error);
      alert('获取提交列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取单个提交详情
  const fetchSubmissionDetail = async (submissionId) => {
    try {
      console.log('获取提交详情:', submissionId);
      const response = await fetch(`http://localhost:5000/api/submissions/${submissionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '获取提交详情失败');
      }
      
      const data = await response.json();
      console.log('提交详情数据:', data);
      setSelectedSubmission(data);
      setScore(data.score || '');
      setFeedback(data.feedback || '');
    } catch (error) {
      console.error('获取提交详情失败:', error);
      alert('获取提交详情失败: ' + error.message);
    }
  };

  // 提交批阅
  const handleGrade = async () => {
    if (!selectedSubmission) {
      alert('请先选择一个提交');
      return;
    }
    
    if (!selectedSubmission.id) {
      alert('提交ID无效');
      console.error('selectedSubmission:', selectedSubmission);
      return;
    }
    
    try {
      setGrading(true);
      console.log('正在批阅提交:', selectedSubmission.id);
      const response = await fetch(`http://localhost:5000/api/submissions/${selectedSubmission.id}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: score && !isNaN(parseInt(score)) ? parseInt(score) : null,
          feedback: feedback.trim() || null
        })
      });
      
      if (response.ok) {
        alert('批阅完成！');
        // 更新本地数据
        setSubmissions(prev => prev.map(sub => 
          sub.id === selectedSubmission.id 
            ? { ...sub, score: score && !isNaN(parseInt(score)) ? parseInt(score) : null, feedback: feedback.trim() || null }
            : sub
        ));
        setSelectedSubmission(prev => ({
          ...prev,
          score: score && !isNaN(parseInt(score)) ? parseInt(score) : null,
          feedback: feedback.trim() || null
        }));
      } else {
        const error = await response.json();
        alert('批阅失败: ' + error.error);
      }
    } catch (error) {
      console.error('批阅失败:', error);
      alert('批阅失败，请重试');
    } finally {
      setGrading(false);
    }
  };

  // 允许重做
  const handleAllowRedo = async (submissionId) => {
    if (!window.confirm('确定允许该学生重做作业吗？')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/submissions/${submissionId}/allow-redo`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        alert('已允许学生重做');
        fetchSubmissions(); // 刷新列表
      } else {
        alert('操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 格式化时间
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取分数颜色
  const getScoreColor = (score) => {
    if (score >= 90) return '#16a34a';
    if (score >= 80) return '#ca8a04';
    if (score >= 60) return '#ea580c';
    return '#dc2626';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 头部 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#374151'
          }}
        >
          <ArrowLeft size={16} />
          返回作业列表
        </button>
        <h2 style={{ margin: '0 0 0 16px', fontSize: '20px', fontWeight: '600' }}>
          作业批阅 ({submissions.length} 份提交)
        </h2>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* 左侧：提交列表 */}
        <div style={{ flex: '0 0 400px' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              background: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              学生提交列表
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {submissions.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  暂无学生提交
                </div>
              ) : (
                submissions.map(submission => (
                  <div
                    key={submission.id}
                    onClick={() => fetchSubmissionDetail(submission.id)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: selectedSubmission?.id === submission.id ? '#f0f9ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSubmission?.id !== submission.id) {
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSubmission?.id !== submission.id) {
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <User size={16} color="#6b7280" />
                      <span style={{ fontWeight: '500', fontSize: '14px' }}>
                        {submission.studentName} ({submission.studentId})
                      </span>
                      {submission.score !== null && (
                        <span style={{
                          padding: '2px 8px',
                          background: getScoreColor(submission.score),
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {submission.score}分
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Clock size={14} color="#6b7280" />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatDateTime(submission.submitTime)}
                      </span>
                      {submission.isLate && (
                        <span style={{
                          padding: '2px 6px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          迟交
                        </span>
                      )}
                    </div>
                    
                    {submission.modifyCount > 0 && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        修改次数: {submission.modifyCount}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右侧：提交详情和批阅 */}
        <div style={{ flex: 1 }}>
          {selectedSubmission ? (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {/* 学生信息 */}
              <div style={{
                padding: '20px',
                background: '#f9fafb',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: '600' }}>
                  {selectedSubmission.studentName} 的作业
                </h3>
                <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280' }}>
                  <span>学号: {selectedSubmission.studentId}</span>
                  <span>提交时间: {formatDateTime(selectedSubmission.submitTime)}</span>
                  {selectedSubmission.isLate && (
                    <span style={{ color: '#dc2626', fontWeight: '500' }}>⚠️ 迟交</span>
                  )}
                </div>
              </div>

              {/* 代码内容 */}
              <div style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} />
                  提交的代码
                </h4>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  fontFamily: 'Monaco, Consolas, monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedSubmission.codeContent || '无代码内容'}
                </div>
              </div>

              {/* 批阅区域 */}
              <div style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                background: '#fafbfc'
              }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} />
                  作业批阅
                </h4>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: '0 0 120px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      分数 (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="请打分"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                      评语
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="请输入评语..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleGrade}
                    disabled={grading}
                    style={{
                      padding: '10px 20px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: grading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: grading ? 0.6 : 1
                    }}
                  >
                    <CheckCircle size={16} />
                    {grading ? '批阅中...' : '提交批阅'}
                  </button>
                  
                  <button
                    onClick={() => handleAllowRedo(selectedSubmission.id)}
                    style={{
                      padding: '10px 20px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <MessageSquare size={16} />
                    允许重做
                  </button>
                </div>
                
                {/* 显示当前批阅状态 */}
                {selectedSubmission.score !== null && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      当前评分: {selectedSubmission.score}分
                    </div>
                    {selectedSubmission.feedback && (
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        评语: {selectedSubmission.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              padding: '60px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px' }}>请选择一个学生提交进行批阅</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentGrading;