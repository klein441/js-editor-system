import React, { useState, useEffect } from 'react';
import { Code, LogOut, Calendar, CheckCircle, Edit2, TrendingUp, Clock, Award, BookOpen, MessageCircle, FileText, BarChart3, Target, AlertCircle, Eye, Download, Settings, Bell, RefreshCw, Upload, FileCode } from 'lucide-react';

const StudentDashboard = ({ user, data, onOpenEditor, onLogout }) => {
  const [activeTab, setActiveTab] = useState('all'); // all, pending, completed
  const [selectedAssignment, setSelectedAssignment] = useState(null); // 选中的作业详情
  const [showCourseware, setShowCourseware] = useState(false); // 课件查看器
  const [coursewareList, setCoursewareList] = useState([]); // 课件列表
  const [showProfileModal, setShowProfileModal] = useState(false); // 个人资料模态框
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [showCodeExample, setShowCodeExample] = useState(false); // 示例代码查看器
  const [showQA, setShowQA] = useState(false); // 在线答疑
  const [qaMessage, setQaMessage] = useState(''); // 答疑留言内容
  const [qaMessages, setQaMessages] = useState([]); // 问答列表
  const [showStatsDetail, setShowStatsDetail] = useState(null); // 统计详情弹窗 ('knowledge' | 'time' | 'score' | 'badge')
  const [showResourceLibrary, setShowResourceLibrary] = useState(false); // 学习资源库
  const [showLearningReport, setShowLearningReport] = useState(false); // 学习报告
  const [showSubmitModal, setShowSubmitModal] = useState(false); // 作业提交方式选择
  const [submitType, setSubmitType] = useState(null); // 'code' | 'document'
  const [documentSubmission, setDocumentSubmission] = useState({ content: '', files: [] }); // 文档提交内容
  const [showNotifications, setShowNotifications] = useState(false); // 通知面板
  const [notifications, setNotifications] = useState([]); // 通知列表
  const [unreadCount, setUnreadCount] = useState(0); // 未读通知数
  const [showRedoModal, setShowRedoModal] = useState(false); // 重做申请弹窗
  const [redoReason, setRedoReason] = useState(''); // 重做原因

  // 加载问答列表
  useEffect(() => {
    if (showQA) {
      fetchQAMessages();
    }
  }, [showQA]);

  // 加载课件列表
  useEffect(() => {
    if (showCourseware) {
      fetchCourseware();
    }
  }, [showCourseware]);

  // 加载通知列表
  useEffect(() => {
    fetchNotifications();
    // 每30秒刷新一次通知
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications?userId=${user.id}&userRole=student`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      fetchNotifications();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userRole: 'student' })
      });
      fetchNotifications();
    } catch (error) {
      console.error('标记全部已读失败:', error);
    }
  };

  const fetchCourseware = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courseware');
      if (response.ok) {
        const data = await response.json();
        setCoursewareList(data);
      }
    } catch (error) {
      console.error('加载课件失败:', error);
      setCoursewareList([]);
    }
  };

  const handleViewCourseware = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/courseware/${id}/view`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('更新查看次数失败:', error);
    }
  };

  const handleDownloadCourseware = async (id, filePath, fileName) => {
    try {
      await fetch(`http://localhost:5000/api/courseware/${id}/download`, {
        method: 'POST'
      });
      
      // 触发下载
      const link = document.createElement('a');
      link.href = `http://localhost:5000${filePath}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'ppt':
      case 'pptx': return '📊';
      case 'doc':
      case 'docx': return '📝';
      default: return '📁';
    }
  };

  const fetchQAMessages = async () => {
    try {
      console.log('正在加载问答列表，学生ID:', user.id);
      const response = await fetch(`http://localhost:5000/api/qa/questions?studentId=${user.id}`);
      
      if (response.ok) {
        const questions = await response.json();
        console.log('加载成功，问题数量:', questions.length);
        setQaMessages(questions);
      } else {
        console.error('加载失败，状态码:', response.status);
        const errorData = await response.json();
        console.error('错误信息:', errorData);
      }
    } catch (error) {
      console.error('加载问答失败:', error);
      // 使用默认数据（离线模式）
      setQaMessages([
        {
          id: 1,
          studentId: user.id,
          studentName: user.name,
          question: '示例问题：HTML的语义化标签有哪些？',
          answer: '这是示例回复。请确保后端服务已启动。',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };
  
  const assignments = data.assignments.filter(a => 
    a.targetClass === '所有班级' || a.targetClass === user.class
  );

  // 示例代码数据
  const codeExamples = {
    html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个人简介页面</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>欢迎来到我的个人主页</h1>
        <nav>
            <ul>
                <li><a href="#about">关于我</a></li>
                <li><a href="#skills">技能</a></li>
                <li><a href="#contact">联系方式</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="about">
            <h2>关于我</h2>
            <p>我是一名热爱编程的学生，正在学习Web前端开发。</p>
        </section>
        
        <section id="skills">
            <h2>我的技能</h2>
            <ul>
                <li>HTML5</li>
                <li>CSS3</li>
                <li>JavaScript</li>
            </ul>
        </section>
        
        <section id="contact">
            <h2>联系我</h2>
            <p>Email: student@example.com</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 我的个人主页</p>
    </footer>
</body>
</html>`,
    css: `/* 全局样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f4f4f4;
}

/* 头部样式 */
header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    text-align: center;
}

header h1 {
    margin-bottom: 1rem;
}

nav ul {
    list-style: none;
    display: flex;
    justify-content: center;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background 0.3s;
}

nav a:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* 主内容样式 */
main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

section {
    margin-bottom: 2rem;
}

h2 {
    color: #667eea;
    margin-bottom: 1rem;
    border-bottom: 2px solid #667eea;
    padding-bottom: 0.5rem;
}

/* 底部样式 */
footer {
    text-align: center;
    padding: 1rem;
    background: #333;
    color: white;
    margin-top: 2rem;
}`,
    javascript: `// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成！');
    
    // 平滑滚动到锚点
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 添加技能项的动画效果
    const skillItems = document.querySelectorAll('#skills li');
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100);
        }, index * 200);
    });
});

// 表单验证示例
function validateEmail(email) {
    const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return re.test(email);
}

// 动态添加内容示例
function addSkill(skillName) {
    const skillsList = document.querySelector('#skills ul');
    const newSkill = document.createElement('li');
    newSkill.textContent = skillName;
    skillsList.appendChild(newSkill);
}`
  };

  // 提交答疑留言
  const handleSubmitQA = async () => {
    if (!qaMessage.trim()) {
      alert('请输入您的问题');
      return;
    }
    
    console.log('准备提交问题:', {
      studentId: user.id,
      studentName: user.name,
      question: qaMessage
    });
    
    try {
      const response = await fetch('http://localhost:5000/api/qa/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          question: qaMessage,
          assignmentId: selectedAssignment?.id || null
        })
      });
      
      if (response.ok) {
        const newQuestion = await response.json();
        console.log('提交成功:', newQuestion);
        setQaMessages([newQuestion, ...qaMessages]);
        setQaMessage('');
        alert('✅ 问题已提交！教师会尽快回复。');
      } else {
        const errorData = await response.json();
        console.error('提交失败:', errorData);
        alert(`❌ 提交失败：${errorData.error || '请重试'}`);
      }
    } catch (error) {
      console.error('提交问题失败:', error);
      // 离线模式：本地添加
      const newMessage = {
        id: Date.now(),
        studentId: user.id,
        studentName: user.name,
        question: qaMessage,
        answer: null,
        createdAt: new Date().toISOString()
      };
      setQaMessages([newMessage, ...qaMessages]);
      setQaMessage('');
      alert('⚠️ 后端服务未连接，问题已保存到本地。\n\n请确保：\n1. 后端服务已启动 (cd backend && node index.js)\n2. 数据库表已创建 (cd backend && setup_qa.bat)\n3. 端口5000未被占用\n\n查看浏览器控制台获取详细错误信息。');
    }
  };

  const mySubmissions = data.submissions.filter(s => s.studentId === user.id);
  const completedCount = mySubmissions.length;
  const pendingCount = assignments.length - completedCount;

  // 模拟学习数据
  const learningStats = {
    masteredTopics: 12,
    totalTopics: 20,
    weeklyHours: 8.5,
    averageScore: 85,
    scoreHistory: [78, 82, 85, 88, 85] // 最近5次作业得分
  };

  // 计算即将截止的作业
  const getUrgentAssignments = () => {
    const now = new Date();
    return assignments
      .filter(a => {
        const deadline = new Date(a.deadline);
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        const isCompleted = mySubmissions.some(s => s.assignmentId === a.id);
        return !isCompleted && daysLeft > 0 && daysLeft <= 7;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  };

  const urgentAssignments = getUrgentAssignments();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* 顶部导航 */}
      <header style={{
        background: '#fff', padding: '16px 40px',
        borderBottom: '1px solid #eee',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Code size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: '600', fontSize: '18px', color: '#1a1a2e' }}>编程教学平台</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* 通知图标 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: showNotifications ? '#667eea' : '#f5f5f5',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.3s'
              }}>
              <Bell size={20} color={showNotifications ? 'white' : '#666'} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#ff4d4f',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>{user.avatar || '👤'}</span>
            <div>
              <div style={{ fontWeight: '500', color: '#1a1a2e' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{user.class}</div>
            </div>
          </div>
          <button onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', background: '#f5f5f5', border: 'none',
              borderRadius: '10px', color: '#666', cursor: 'pointer'
            }}>
            <LogOut size={16} /> 退出
          </button>
        </div>
      </header>

      {/* 通知面板 */}
      {showNotifications && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '40px',
          width: '400px',
          maxHeight: '600px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              通知 {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '6px 12px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: '#667eea',
                  fontWeight: '500'
                }}>
                全部已读
              </button>
            )}
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    background: notif.is_read ? 'white' : '#f0f9ff',
                    cursor: notif.is_read ? 'default' : 'pointer',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => !notif.is_read && (e.currentTarget.style.background = '#e0f2fe')}
                  onMouseLeave={(e) => !notif.is_read && (e.currentTarget.style.background = '#f0f9ff')}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: notif.is_read ? '#d1d5db' : '#667eea',
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, marginBottom: '8px' }}>
                        {notif.content}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(notif.created_at).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Bell size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '14px' }}>暂无通知</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 点击外部关闭通知面板 */}
      {showNotifications && (
        <div
          onClick={() => setShowNotifications(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}

      {/* 左下角设置按钮 */}
      <button
        onClick={() => setShowProfileModal(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
          zIndex: 999
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        }}
        title="个人设置">
        <Settings size={24} color="white" />
      </button>

      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* 欢迎卡片 + 学习数据看板 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '32px' }}>
          {/* 左侧：欢迎卡片 */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px', padding: '40px', color: '#fff'
          }}>
            <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
              欢迎回来，{user.name}！
            </h1>
            <p style={{ opacity: 0.9, marginBottom: '24px' }}>继续你的编程学习之旅吧</p>
            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>{completedCount}</div>
                <div style={{ opacity: 0.8 }}>已完成作业</div>
              </div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>{pendingCount}</div>
                <div style={{ opacity: 0.8 }}>待完成作业</div>
              </div>
              <div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>{learningStats.averageScore}</div>
                <div style={{ opacity: 0.8 }}>平均分</div>
              </div>
            </div>
          </div>

          {/* 右侧：待办提醒 */}
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={20} color="#ff4d4f" />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
                即将截止
              </h3>
            </div>
            {urgentAssignments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {urgentAssignments.slice(0, 3).map(assign => {
                  const daysLeft = Math.ceil((new Date(assign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={assign.id} style={{
                      padding: '12px', background: '#fff7e6', borderRadius: '10px',
                      borderLeft: '3px solid #fa8c16'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>
                        {assign.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#fa8c16' }}>
                        ⏰ 还有 {daysLeft} 天截止
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <CheckCircle size={32} color="#52c41a" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '14px' }}>暂无紧急作业</div>
              </div>
            )}
          </div>
        </div>

        {/* 学习数据看板 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {/* 知识点掌握 */}
          <div 
            onClick={() => setShowStatsDetail('knowledge')}
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Target size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {learningStats.masteredTopics}/{learningStats.totalTopics}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>知识点掌握</div>
              </div>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${(learningStats.masteredTopics / learningStats.totalTopics) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #52c41a, #73d13d)',
                transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#667eea', textAlign: 'center' }}>
              点击查看详情 →
            </div>
          </div>

          {/* 本周学习时长 */}
          <div 
            onClick={() => setShowStatsDetail('time')}
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Clock size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {learningStats.weeklyHours}h
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>本周学习</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#52c41a' }}>
              📈 比上周多 1.5 小时
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#667eea', textAlign: 'center' }}>
              点击查看详情 →
            </div>
          </div>

          {/* 作业得分趋势 */}
          <div 
            onClick={() => setShowStatsDetail('score')}
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #fa8c16, #faad14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <TrendingUp size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  {learningStats.averageScore}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>平均得分</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '30px' }}>
              {learningStats.scoreHistory.map((score, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${(score / 100) * 30}px`,
                  background: 'linear-gradient(180deg, #fa8c16, #faad14)',
                  borderRadius: '2px 2px 0 0',
                  transition: 'height 0.3s'
                }} />
              ))}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#667eea', textAlign: 'center' }}>
              点击查看详情 →
            </div>
          </div>

          {/* 学习成就 */}
          <div 
            onClick={() => setShowStatsDetail('badge')}
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #f5222d, #ff4d4f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Award size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                  5
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>获得徽章</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              🏆 代码新星 · 🎯 准时达人
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#667eea', textAlign: 'center' }}>
              点击查看详情 →
            </div>
          </div>
        </div>

        {/* 辅助功能区 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={() => setShowResourceLibrary(true)}
            style={{
              background: '#fff', border: '2px solid #e8e8e8', borderRadius: '12px',
              padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
            <BookOpen size={24} color="#667eea" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>学习资源库</div>
              <div style={{ fontSize: '12px', color: '#888' }}>课件、示例代码、视频教程</div>
            </div>
          </button>

          <button 
            onClick={() => setShowQA(true)}
            style={{
              background: '#fff', border: '2px solid #e8e8e8', borderRadius: '12px',
              padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#52c41a';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
            <MessageCircle size={24} color="#52c41a" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>在线答疑</div>
              <div style={{ fontSize: '12px', color: '#888' }}>联系教师获取帮助</div>
            </div>
          </button>

          <button 
            onClick={() => setShowLearningReport(true)}
            style={{
              background: '#fff', border: '2px solid #e8e8e8', borderRadius: '12px',
              padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#fa8c16';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e8e8e8';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
            <BarChart3 size={24} color="#fa8c16" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>学习报告</div>
              <div style={{ fontSize: '12px', color: '#888' }}>查看详细学习分析</div>
            </div>
          </button>
        </div>

        {/* 作业列表 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
            我的作业
          </h2>
          
          {/* 筛选标签 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'all', label: '全部', count: assignments.length },
              { key: 'pending', label: '待完成', count: pendingCount },
              { key: 'completed', label: '已完成', count: completedCount }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 16px',
                  background: activeTab === tab.key ? '#667eea' : '#f5f5f5',
                  color: activeTab === tab.key ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {assignments
            .filter(assign => {
              const isCompleted = mySubmissions.some(s => s.assignmentId === assign.id);
              if (activeTab === 'completed') return isCompleted;
              if (activeTab === 'pending') return !isCompleted;
              return true;
            })
            .map(assign => {
            const submission = mySubmissions.find(s => s.assignmentId === assign.id);
            const isOverdue = new Date(assign.deadline) < new Date();
            const isCompleted = !!submission;
            
            // 确保submission包含必要的字段
            if (submission) {
              submission.redoCount = submission.redoCount || 0;
              submission.canRedo = submission.canRedo || false;
              submission.id = submission.id || `sub${Math.random()}`;
            }
            
            // 使用真实数据
            const difficulty = ['基础', '进阶', '挑战'][Math.floor(Math.random() * 3)];
            const difficultyColor = { '基础': '#52c41a', '进阶': '#1890ff', '挑战': '#f5222d' };
            const score = submission?.score || null;
            const feedback = submission?.comment || null;

            return (
              <div key={assign.id} className="card-hover" style={{
                background: '#fff', borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
              }}>
                <div style={{
                  height: '8px',
                  background: isCompleted 
                    ? 'linear-gradient(90deg, #52c41a, #73d13d)'
                    : isOverdue 
                      ? 'linear-gradient(90deg, #f5222d, #ff4d4f)'
                      : 'linear-gradient(90deg, #667eea, #764ba2)'
                }} />
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
                      {assign.title}
                    </h3>
                    {isCompleted ? (
                      <span style={{
                        padding: '4px 12px', background: '#f6ffed',
                        color: '#389e0d', borderRadius: '20px', fontSize: '12px',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        <CheckCircle size={12} /> 已完成
                      </span>
                    ) : isOverdue ? (
                      <span style={{
                        padding: '4px 12px', background: '#fff1f0',
                        color: '#cf1322', borderRadius: '20px', fontSize: '12px'
                      }}>
                        已截止
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 12px', background: '#e6f7ff',
                        color: '#1890ff', borderRadius: '20px', fontSize: '12px'
                      }}>
                        进行中
                      </span>
                    )}
                  </div>
                  
                  {/* 难度标签 */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: `${difficultyColor[difficulty]}15`,
                      color: difficultyColor[difficulty],
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {difficulty}
                    </span>
                    {!isCompleted && (
                      <span style={{
                        padding: '4px 10px',
                        background: '#f0f0f0',
                        color: '#666',
                        borderRadius: '6px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FileText size={12} /> 参考资料
                      </span>
                    )}
                  </div>

                  <p style={{ color: '#666', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.6 }}>
                    {assign.description}
                  </p>
                  
                  {/* 已完成作业显示得分和评语 */}
                  {isCompleted && score && (
                    <div style={{
                      background: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      borderRadius: '10px',
                      padding: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#52c41a' }}>
                          得分：{score}/100
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#52c41a' }}>HTML: 28/30</span>
                          <span style={{ fontSize: '12px', color: '#888' }}>|</span>
                          <span style={{ fontSize: '12px', color: '#52c41a' }}>CSS: 25/30</span>
                          <span style={{ fontSize: '12px', color: '#888' }}>|</span>
                          <span style={{ fontSize: '12px', color: '#52c41a' }}>JS: 32/40</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                        💬 {feedback}
                      </div>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontSize: '13px', color: '#888', marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>截止：{assign.deadline}</span>
                    </div>
                    {!isCompleted && !isOverdue && (
                      <span style={{ color: '#fa8c16', fontWeight: '500' }}>
                        ⏰ {Math.ceil((new Date(assign.deadline) - new Date()) / (1000 * 60 * 60 * 24))} 天
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setSelectedAssignment({ ...assign, submission, score, feedback, difficulty, isCompleted, isOverdue })}
                      style={{
                        flex: 1, padding: '14px',
                        background: isCompleted 
                          ? '#f5f5f5' 
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none', borderRadius: '12px',
                        color: isCompleted ? '#666' : '#fff',
                        fontWeight: '500', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCompleted) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                      {isCompleted ? (
                        <><Edit2 size={16} /> 查看详情</>
                      ) : (
                        <><FileText size={16} /> 查看作业</>
                      )}
                    </button>
                    
                    {!isCompleted && (
                      <button
                        onClick={() => setSelectedAssignment({ ...assign, submission, score, feedback, difficulty, isCompleted, isOverdue })}
                        style={{
                          padding: '14px',
                          background: '#fff',
                          border: '2px solid #e8e8e8',
                          borderRadius: '12px',
                          color: '#666',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#667eea';
                          e.currentTarget.style.color = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e8e8e8';
                          e.currentTarget.style.color = '#666';
                        }}
                        title="查看参考资料"
                      >
                        <BookOpen size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 作业详情模态框 */}
      {selectedAssignment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setSelectedAssignment(null)}>
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}>
            
            {/* 头部 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '32px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      padding: '6px 14px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {selectedAssignment.difficulty}
                    </span>
                    {selectedAssignment.isCompleted ? (
                      <span style={{
                        padding: '6px 14px',
                        background: 'rgba(82, 196, 26, 0.2)',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle size={14} /> 已完成
                      </span>
                    ) : selectedAssignment.isOverdue ? (
                      <span style={{
                        padding: '6px 14px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        已截止
                      </span>
                    ) : (
                      <span style={{
                        padding: '6px 14px',
                        background: 'rgba(24, 144, 255, 0.2)',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        进行中
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 12px', lineHeight: 1.3 }}>
                    {selectedAssignment.title}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px', opacity: 0.9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} />
                      <span>截止时间：{selectedAssignment.deadline}</span>
                    </div>
                    {!selectedAssignment.isCompleted && !selectedAssignment.isOverdue && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffd666' }}>
                        <Clock size={16} />
                        <span>还有 {Math.ceil((new Date(selectedAssignment.deadline) - new Date()) / (1000 * 60 * 60 * 24))} 天</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
                  ×
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
              {/* 作业要求 */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FileText size={20} color="#667eea" />
                  作业内容
                </h3>
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  lineHeight: 1.8,
                  color: '#374151',
                  fontSize: '15px'
                }}>
                  {selectedAssignment.description || selectedAssignment.requirements || '暂无详细说明'}
                </div>
              </div>

              {/* 已完成作业显示得分和评语 */}
              {selectedAssignment.isCompleted && selectedAssignment.score && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Award size={20} color="#52c41a" />
                    批改结果
                  </h3>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '2px solid #86efac'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: '#16a34a', marginBottom: '8px' }}>总分</div>
                        <div style={{ fontSize: '36px', fontWeight: '700', color: '#16a34a' }}>
                          {selectedAssignment.score}<span style={{ fontSize: '20px' }}>/100</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>HTML</div>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: '#16a34a' }}>28/30</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>CSS</div>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: '#16a34a' }}>25/30</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>JS</div>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: '#16a34a' }}>32/40</div>
                        </div>
                      </div>
                    </div>
                    <div style={{
                      background: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: 1.6
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#16a34a' }}>
                        💬 教师评语
                      </div>
                      {selectedAssignment.feedback}
                    </div>
                  </div>
                </div>
              )}

              {/* 参考资料 */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a1a2e',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <BookOpen size={20} color="#667eea" />
                  参考资料
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {/* 课件 */}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCourseware(true);
                    }}
                    style={{
                      background: '#f9fafb',
                      borderRadius: '10px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textDecoration: 'none',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.background = '#f5f3ff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📄 课件：HTML基础
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      点击查看相关课件
                    </div>
                  </a>

                  {/* 示例代码 */}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowCodeExample(true);
                    }}
                    style={{
                      background: '#f9fafb',
                      borderRadius: '10px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textDecoration: 'none',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.background = '#f5f3ff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      💻 示例代码
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      查看参考代码示例
                    </div>
                  </a>

                  {/* 视频教程 - Bilibili链接 */}
                  <a
                    href="https://www.bilibili.com/video/BV1uh4y1m7pi/?vd_source=14d92983310b224b266d226be4365922"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #fff5f5 0%, #ffe7e7 100%)',
                      borderRadius: '10px',
                      padding: '16px',
                      border: '1px solid #ffccc7',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textDecoration: 'none',
                      display: 'block',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ff4d4f';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #fff1f0 0%, #ffd6d6 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 79, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#ffccc7';
                      e.currentTarget.style.background = 'linear-gradient(135deg, #fff5f5 0%, #ffe7e7 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🎥 视频教程
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#ff4d4f',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        B站
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      观看配套视频讲解
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.6 }}>
                        <path d="M10 1L2 9M10 1H3M10 1V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </a>

                  {/* 在线答疑 */}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowQA(true);
                    }}
                    style={{
                      background: '#f9fafb',
                      borderRadius: '10px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textDecoration: 'none',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#52c41a';
                      e.currentTarget.style.background = '#f0fdf4';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      💬 在线答疑
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        background: '#52c41a',
                        color: 'white',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        在线
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      联系教师获取帮助
                    </div>
                  </a>
                </div>
              </div>

              {/* 提交详情（如果已完成） */}
              {selectedAssignment.isCompleted && selectedAssignment.submission && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1a1a2e',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileText size={20} color="#667eea" />
                    我的提交
                  </h3>
                  
                  {/* 提交信息 */}
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '4px' }}>
                          提交时间
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                          {new Date(selectedAssignment.submission.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{
                          padding: '6px 12px',
                          background: '#dcfce7',
                          color: '#16a34a',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>
                          按时提交
                        </div>
                        {selectedAssignment.submission.redoCount > 0 && (
                          <div style={{
                            padding: '6px 12px',
                            background: '#fff7e6',
                            color: '#fa8c16',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}>
                            重做 {selectedAssignment.submission.redoCount} 次
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 如果是文档提交，显示内容和文件 */}
                    {selectedAssignment.submission.files && typeof selectedAssignment.submission.files === 'object' && selectedAssignment.submission.files.type === 'document' && (
                      <>
                        {/* 文本内容 */}
                        {selectedAssignment.submission.files.content && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '8px' }}>
                              作业内容
                            </div>
                            <div style={{
                              background: 'white',
                              padding: '16px',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                              fontSize: '14px',
                              color: '#374151',
                              lineHeight: 1.6,
                              whiteSpace: 'pre-wrap'
                            }}>
                              {selectedAssignment.submission.files.content}
                            </div>
                          </div>
                        )}

                        {/* 上传的文件 */}
                        {selectedAssignment.submission.files.files && selectedAssignment.submission.files.files.length > 0 && (
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '8px' }}>
                              附件 ({selectedAssignment.submission.files.files.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {selectedAssignment.submission.files.files.map((file, index) => (
                                <div key={index} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px',
                                  background: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FileText size={20} color="#667eea" />
                                    <div>
                                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                                        {file.originalName}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {(file.fileSize / 1024).toFixed(2)} KB
                                      </div>
                                    </div>
                                  </div>
                                  <a
                                    href={`http://localhost:5000${file.filePath}`}
                                    download
                                    style={{
                                      padding: '6px 12px',
                                      background: '#667eea',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '13px',
                                      fontWeight: '500',
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}>
                                    <Download size={14} /> 下载
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* 如果是代码提交，显示代码文件 */}
                    {selectedAssignment.submission.files && typeof selectedAssignment.submission.files === 'object' && !selectedAssignment.submission.files.type && (
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '8px' }}>
                          代码文件
                        </div>
                        <div style={{
                          background: 'white',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                            已提交 {Object.keys(selectedAssignment.submission.files).length} 个文件
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Object.entries(selectedAssignment.submission.files).map(([fileName, content]) => (
                              <div key={fileName} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FileCode size={16} color="#667eea" />
                                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                                    {fileName}
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    ({content.length} 字符)
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    onOpenEditor({
                                      mode: 'view',
                                      initialFiles: { [fileName]: content },
                                      projectName: `${selectedAssignment.title} - 我的提交`,
                                      readOnly: true
                                    });
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                  <Eye size={12} /> 查看代码
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 申请重做按钮 */}
                  {selectedAssignment.submission.redoCount < 3 && !selectedAssignment.submission.canRedo && (
                    <button
                      onClick={() => {
                        setShowRedoModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'white',
                        border: '2px solid #fa8c16',
                        borderRadius: '10px',
                        color: '#fa8c16',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fff7e6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}>
                      <RefreshCw size={16} /> 申请重做 (剩余 {3 - selectedAssignment.submission.redoCount} 次机会)
                    </button>
                  )}

                  {/* 重做次数用完提示 */}
                  {selectedAssignment.submission.redoCount >= 3 && (
                    <div style={{
                      padding: '12px 16px',
                      background: '#fff1f0',
                      border: '1px solid #ffccc7',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#cf1322',
                      textAlign: 'center'
                    }}>
                      ⚠️ 已达到最大重做次数（3次），无法再次申请
                    </div>
                  )}

                  {/* 已批准重做提示 */}
                  {selectedAssignment.submission.canRedo && (
                    <div style={{
                      padding: '12px 16px',
                      background: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#389e0d',
                      textAlign: 'center'
                    }}>
                      ✓ 教师已批准重做申请，您可以重新提交作业
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 底部操作按钮 */}
            <div style={{
              padding: '24px 32px',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedAssignment(null)}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  color: '#6b7280',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = 'white';
                }}>
                关闭
              </button>
              {!selectedAssignment.isCompleted && (
                <button
                  onClick={() => {
                    setShowSubmitModal(true);
                  }}
                  style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}>
                  <FileText size={18} /> 提交作业
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 作业提交方式选择弹窗 */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1001,
          backdropFilter: 'blur(4px)'
        }}
        onClick={() => setShowSubmitModal(false)}>
          <div style={{
            background: 'white', borderRadius: '20px',
            width: '600px', padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
              选择提交方式
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {/* 代码编辑器提交 */}
              <div
                onClick={() => {
                  onOpenEditor({
                    mode: 'student_work',
                    initialFiles: selectedAssignment.submission ? selectedAssignment.submission.files : selectedAssignment.template,
                    projectName: selectedAssignment.title,
                    assignmentId: selectedAssignment.id
                  });
                  setShowSubmitModal(false);
                  setSelectedAssignment(null);
                }}
                style={{
                  padding: '32px 24px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                <Code size={48} style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  代码编辑器
                </div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>
                  在线编写HTML/CSS/JS代码
                </div>
              </div>

              {/* 文档提交 */}
              <div
                onClick={() => {
                  setSubmitType('document');
                  setShowSubmitModal(false);
                }}
                style={{
                  padding: '32px 24px',
                  background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(82, 196, 26, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                <FileText size={48} style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  文档提交
                </div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>
                  编写文字说明并上传文件
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSubmitModal(false)}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '10px',
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* 文档提交弹窗 */}
      {submitType === 'document' && (
        <DocumentSubmitModal
          assignment={selectedAssignment}
          user={user}
          onClose={() => {
            setSubmitType(null);
            setSelectedAssignment(null);
          }}
          onSubmit={(content, files) => {
            // 提交成功后关闭弹窗
            setSubmitType(null);
            setSelectedAssignment(null);
          }}
        />
      )}

      {/* 重做申请弹窗 */}
      {showRedoModal && selectedAssignment && (
        <RedoRequestModal
          assignment={selectedAssignment}
          user={user}
          onClose={() => setShowRedoModal(false)}
          onSuccess={() => {
            setShowRedoModal(false);
            setSelectedAssignment(null);
            // 刷新通知
            fetchNotifications();
          }}
        />
      )}

      {/* 课件查看器模态框 */}
      {showCourseware && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}
        onClick={() => setShowCourseware(false)}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%',
            maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px', color: 'white', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                📄 课件：HTML基础教程
              </h2>
              <button onClick={() => setShowCourseware(false)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: 'white', cursor: 'pointer', fontSize: '20px'
                }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
              {coursewareList.length === 0 ? (
                <div style={{
                  background: '#f9fafb', borderRadius: '12px',
                  padding: '60px 32px', border: '2px dashed #d1d5db',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
                  <h3 style={{ fontSize: '20px', color: '#1a1a2e', marginBottom: '12px' }}>
                    暂无课件
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                    教师还未上传课件，请稍后查看
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {coursewareList.map(item => (
                    <div key={item.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '36px' }}>{getFileIcon(item.fileType)}</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
                            {item.title}
                          </h4>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {formatFileSize(item.fileSize)} · {item.fileType.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {item.description && (
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>
                          {item.description}
                        </p>
                      )}

                      <div style={{
                        padding: '8px 12px',
                        background: '#f0f9ff',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#0369a1',
                        marginBottom: '12px'
                      }}>
                        📂 {item.category}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                        <span>👁️ {item.viewCount}</span>
                        <span>⬇️ {item.downloadCount}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`http://localhost:5000${item.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleViewCourseware(item.id)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: '#dbeafe',
                            color: '#1e40af',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}>
                          <Eye size={14} /> 在线查看
                        </a>
                        <button
                          onClick={() => handleDownloadCourseware(item.id, item.filePath, item.fileName)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}>
                          <Download size={14} /> 下载
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 示例代码查看器模态框 */}
      {showCodeExample && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}
        onClick={() => setShowCodeExample(false)}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%',
            maxWidth: '1200px', maxHeight: '90vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px', color: 'white', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                💻 示例代码：个人主页制作
              </h2>
              <button onClick={() => setShowCodeExample(false)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: 'white', cursor: 'pointer', fontSize: '20px'
                }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
              {/* HTML代码 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '12px', padding: '8px 12px',
                  background: '#f9fafb', borderRadius: '8px 8px 0 0',
                  borderBottom: '2px solid #667eea'
                }}>
                  <FileText size={18} color="#667eea" />
                  <span style={{ fontWeight: '600', color: '#1a1a2e' }}>index.html</span>
                </div>
                <pre style={{
                  background: '#1e1e1e', color: '#d4d4d4',
                  padding: '20px', borderRadius: '0 0 8px 8px',
                  overflow: 'auto', fontSize: '13px', lineHeight: 1.6,
                  margin: 0, fontFamily: 'Consolas, Monaco, monospace'
                }}>
                  <code>{codeExamples.html}</code>
                </pre>
              </div>

              {/* CSS代码 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '12px', padding: '8px 12px',
                  background: '#f9fafb', borderRadius: '8px 8px 0 0',
                  borderBottom: '2px solid #667eea'
                }}>
                  <FileText size={18} color="#667eea" />
                  <span style={{ fontWeight: '600', color: '#1a1a2e' }}>style.css</span>
                </div>
                <pre style={{
                  background: '#1e1e1e', color: '#d4d4d4',
                  padding: '20px', borderRadius: '0 0 8px 8px',
                  overflow: 'auto', fontSize: '13px', lineHeight: 1.6,
                  margin: 0, fontFamily: 'Consolas, Monaco, monospace'
                }}>
                  <code>{codeExamples.css}</code>
                </pre>
              </div>

              {/* JavaScript代码 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '12px', padding: '8px 12px',
                  background: '#f9fafb', borderRadius: '8px 8px 0 0',
                  borderBottom: '2px solid #667eea'
                }}>
                  <FileText size={18} color="#667eea" />
                  <span style={{ fontWeight: '600', color: '#1a1a2e' }}>script.js</span>
                </div>
                <pre style={{
                  background: '#1e1e1e', color: '#d4d4d4',
                  padding: '20px', borderRadius: '0 0 8px 8px',
                  overflow: 'auto', fontSize: '13px', lineHeight: 1.6,
                  margin: 0, fontFamily: 'Consolas, Monaco, monospace'
                }}>
                  <code>{codeExamples.javascript}</code>
                </pre>
              </div>

              <div style={{
                background: '#e0f2fe', borderRadius: '10px',
                padding: '16px', border: '1px solid #7dd3fc'
              }}>
                <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
                  💡 学习提示
                </div>
                <ul style={{ color: '#0c4a6e', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                  <li>注意HTML的语义化标签使用</li>
                  <li>CSS使用了Flexbox布局和渐变色</li>
                  <li>JavaScript实现了平滑滚动和动画效果</li>
                  <li>可以复制代码到编辑器中运行查看效果</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 在线答疑模态框 */}
      {showQA && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}
        onClick={() => setShowQA(false)}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%',
            maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              padding: '24px', color: 'white', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
                  💬 在线答疑
                </h2>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                  向教师提问，获取学习帮助
                </p>
              </div>
              <button onClick={() => setShowQA(false)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  color: 'white', cursor: 'pointer', fontSize: '20px'
                }}>×</button>
            </div>

            {/* 问答列表 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f9fafb' }}>
              {qaMessages.map(msg => (
                <div key={msg.id} style={{
                  background: 'white', borderRadius: '12px',
                  padding: '20px', marginBottom: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: '600'
                    }}>
                      {(msg.studentName || msg.student || '学').charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{msg.studentName || msg.student}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(msg.createdAt || msg.time).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{
                    background: '#f5f3ff', borderRadius: '8px',
                    padding: '12px', marginBottom: '12px',
                    borderLeft: '3px solid #667eea'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#667eea', marginBottom: '4px' }}>
                      问题：
                    </div>
                    <div style={{ color: '#374151', lineHeight: 1.6 }}>
                      {msg.question}
                    </div>
                  </div>
                  {msg.answer ? (
                    <div style={{
                      background: '#f0fdf4', borderRadius: '8px',
                      padding: '12px', borderLeft: '3px solid #52c41a'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#52c41a', marginBottom: '4px' }}>
                        教师回复：
                      </div>
                      <div style={{ color: '#374151', lineHeight: 1.6 }}>
                        {msg.answer}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      background: '#fef3c7', borderRadius: '8px',
                      padding: '12px', fontSize: '13px', color: '#92400e',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <Clock size={14} />
                      等待教师回复中...
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 提问输入框 */}
            <div style={{
              padding: '24px', borderTop: '1px solid #e5e7eb',
              background: 'white'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block', marginBottom: '8px',
                  fontWeight: '500', color: '#1a1a2e'
                }}>
                  提出您的问题
                </label>
                <textarea
                  value={qaMessage}
                  onChange={(e) => setQaMessage(e.target.value)}
                  placeholder="请详细描述您遇到的问题，教师会尽快回复..."
                  rows={4}
                  style={{
                    width: '100%', padding: '12px',
                    border: '2px solid #e5e7eb', borderRadius: '10px',
                    fontSize: '14px', outline: 'none', resize: 'vertical',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                    lineHeight: 1.6
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#52c41a'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowQA(false)}
                  style={{
                    padding: '10px 20px', background: '#f3f4f6',
                    border: 'none', borderRadius: '8px',
                    color: '#6b7280', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '500'
                  }}>
                  取消
                </button>
                <button onClick={handleSubmitQA}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none', borderRadius: '8px',
                    color: 'white', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                  <MessageCircle size={16} /> 提交问题
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 个人资料编辑模态框 */}
      {showProfileModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1001, padding: '20px'
        }}
        onClick={() => !profileSaving && setShowProfileModal(false)}>
          <div style={{
            background: 'white', borderRadius: '20px',
            width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px', color: 'white'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                个人资料设置
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.9 }}>
                修改您的个人信息
              </p>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                  学号
                </label>
                <input
                  type="text"
                  value={user?.id}
                  disabled
                  style={{
                    width: '100%', padding: '12px', border: '2px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '14px', background: '#f9fafb',
                    color: '#9ca3af', boxSizing: 'border-box'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  学号不可修改
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                  姓名
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  placeholder="请输入姓名"
                  style={{
                    width: '100%', padding: '12px', border: '2px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  placeholder="your@email.com"
                  style={{
                    width: '100%', padding: '12px', border: '2px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                  手机号
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  placeholder="手机号码"
                  style={{
                    width: '100%', padding: '12px', border: '2px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                  新密码（不修改请留空）
                </label>
                <input
                  type="password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                  placeholder="至少6位"
                  style={{
                    width: '100%', padding: '12px', border: '2px solid #e5e7eb',
                    borderRadius: '10px', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {profileForm.password && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    确认新密码
                  </label>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                    placeholder="再次输入新密码"
                    style={{
                      width: '100%', padding: '12px', border: '2px solid #e5e7eb',
                      borderRadius: '10px', fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              )}
            </div>

            <div style={{
              padding: '20px 24px', borderTop: '1px solid #e5e7eb',
              display: 'flex', justifyContent: 'flex-end', gap: '12px',
              background: '#f9fafb'
            }}>
              <button
                onClick={() => setShowProfileModal(false)}
                disabled={profileSaving}
                style={{
                  padding: '12px 24px', background: 'white',
                  border: '2px solid #e5e7eb', borderRadius: '10px',
                  cursor: profileSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '500', color: '#6b7280'
                }}>
                取消
              </button>
              <button
                onClick={async () => {
                  if (!profileForm.name) {
                    alert('请输入姓名');
                    return;
                  }
                  if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
                    alert('两次输入的密码不一致');
                    return;
                  }
                  if (profileForm.password && profileForm.password.length < 6) {
                    alert('密码长度至少为6位');
                    return;
                  }

                  setProfileSaving(true);
                  try {
                    const response = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        role: 'student',
                        name: profileForm.name,
                        email: profileForm.email,
                        phone: profileForm.phone,
                        password: profileForm.password || undefined
                      })
                    });

                    if (response.ok) {
                      alert('✅ 个人信息更新成功！');
                      setShowProfileModal(false);
                      setProfileForm({...profileForm, password: '', confirmPassword: ''});
                      // 可以选择刷新页面或更新本地user对象
                    } else {
                      const error = await response.json();
                      alert(`❌ 更新失败：${error.error}`);
                    }
                  } catch (error) {
                    console.error('更新个人信息失败:', error);
                    alert('❌ 更新失败，请检查网络连接');
                  }
                  setProfileSaving(false);
                }}
                disabled={profileSaving}
                style={{
                  padding: '12px 24px',
                  background: profileSaving ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  cursor: profileSaving ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600',
                  boxShadow: profileSaving ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                {profileSaving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 统计详情弹窗 */}
      {showStatsDetail && (
        <StatsDetailModal 
          type={showStatsDetail}
          onClose={() => setShowStatsDetail(null)}
          learningStats={learningStats}
        />
      )}

      {/* 学习资源库弹窗 */}
      {showResourceLibrary && (
        <ResourceLibraryModal 
          onClose={() => setShowResourceLibrary(false)}
          coursewareList={coursewareList}
          handleViewCourseware={handleViewCourseware}
          handleDownloadCourseware={handleDownloadCourseware}
          formatFileSize={formatFileSize}
          getFileIcon={getFileIcon}
        />
      )}

      {/* 在线答疑弹窗 */}
      {showQA && (
        <QAModal 
          onClose={() => setShowQA(false)}
          qaMessages={qaMessages}
          qaMessage={qaMessage}
          setQaMessage={setQaMessage}
          handleSubmitQA={handleSubmitQA}
          user={user}
        />
      )}

      {/* 学习报告弹窗 */}
      {showLearningReport && (
        <LearningReportModal 
          onClose={() => setShowLearningReport(false)}
          learningStats={learningStats}
          mySubmissions={mySubmissions}
          assignments={assignments}
        />
      )}
    </div>
  );
};

// 统计详情弹窗组件
const StatsDetailModal = ({ type, onClose, learningStats }) => {
  // 模拟数据
  const knowledgeGraph = {
    nodes: [
      { id: 'html', label: 'HTML基础', mastered: true, level: 1 },
      { id: 'css', label: 'CSS样式', mastered: true, level: 1 },
      { id: 'js', label: 'JavaScript', mastered: true, level: 1 },
      { id: 'dom', label: 'DOM操作', mastered: true, level: 2, parent: 'js' },
      { id: 'event', label: '事件处理', mastered: true, level: 2, parent: 'js' },
      { id: 'ajax', label: 'AJAX请求', mastered: false, level: 2, parent: 'js' },
      { id: 'flex', label: 'Flex布局', mastered: true, level: 2, parent: 'css' },
      { id: 'grid', label: 'Grid布局', mastered: true, level: 2, parent: 'css' },
      { id: 'animation', label: 'CSS动画', mastered: false, level: 2, parent: 'css' },
      { id: 'semantic', label: '语义化标签', mastered: true, level: 2, parent: 'html' },
      { id: 'form', label: '表单处理', mastered: true, level: 2, parent: 'html' },
      { id: 'canvas', label: 'Canvas', mastered: false, level: 2, parent: 'html' },
      { id: 'es6', label: 'ES6语法', mastered: true, level: 3, parent: 'js' },
      { id: 'promise', label: 'Promise', mastered: true, level: 3, parent: 'js' },
      { id: 'async', label: 'Async/Await', mastered: false, level: 3, parent: 'js' },
      { id: 'responsive', label: '响应式设计', mastered: true, level: 3, parent: 'css' },
      { id: 'preprocessor', label: 'CSS预处理器', mastered: false, level: 3, parent: 'css' },
      { id: 'accessibility', label: '无障碍访问', mastered: false, level: 3, parent: 'html' },
      { id: 'seo', label: 'SEO优化', mastered: false, level: 3, parent: 'html' },
      { id: 'react', label: 'React框架', mastered: false, level: 4, parent: 'js' }
    ]
  };

  const weeklyTimeData = [
    { day: '周一', hours: 1.5 },
    { day: '周二', hours: 2.0 },
    { day: '周三', hours: 1.2 },
    { day: '周四', hours: 1.8 },
    { day: '周五', hours: 1.0 },
    { day: '周六', hours: 0 },
    { day: '周日', hours: 1.0 }
  ];

  const scoreDetailData = [
    { name: 'HTML个人主页', score: 92, date: '2024-01-15' },
    { name: 'CSS布局练习', score: 88, date: '2024-01-18' },
    { name: 'JS计算器', score: 85, date: '2024-01-22' },
    { name: '响应式网页', score: 90, date: '2024-01-25' },
    { name: 'DOM操作实战', score: 87, date: '2024-01-28' },
    { name: '表单验证', score: 82, date: '2024-02-01' },
    { name: '轮播图组件', score: 89, date: '2024-02-05' },
    { name: 'AJAX应用', score: 78, date: '2024-02-08' }
  ];

  const badges = [
    { id: 1, name: '代码新星', icon: '🌟', desc: '完成首个作业', earned: true, date: '2024-01-15' },
    { id: 2, name: '准时达人', icon: '⏰', desc: '连续5次按时提交', earned: true, date: '2024-01-20' },
    { id: 3, name: '完美主义', icon: '💯', desc: '获得满分作业', earned: true, date: '2024-01-22' },
    { id: 4, name: '学习狂人', icon: '📚', desc: '单周学习超10小时', earned: true, date: '2024-01-28' },
    { id: 5, name: '代码大师', icon: '🏆', desc: '完成所有基础课程', earned: true, date: '2024-02-01' },
    { id: 6, name: '问答达人', icon: '💬', desc: '提问超过10次', earned: false, desc2: '还需提问5次' },
    { id: 7, name: '全勤奖', icon: '📅', desc: '连续30天学习', earned: false, desc2: '已连续15天' },
    { id: 8, name: '进阶者', icon: '🚀', desc: '完成所有进阶课程', earned: false, desc2: '进度 60%' }
  ];

  const maxScore = Math.max(...scoreDetailData.map(d => d.score));
  const maxTime = Math.max(...weeklyTimeData.map(d => d.hours));

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}
    onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '20px',
        width: '900px', maxHeight: '85vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => e.stopPropagation()}>
        
        {/* 知识图谱 */}
        {type === 'knowledge' && (
          <>
            <div style={{
              padding: '32px', borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #52c41a, #73d13d)',
              borderRadius: '20px 20px 0 0'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
                知识点掌握图谱
              </h2>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                已掌握 {knowledgeGraph.nodes.filter(n => n.mastered).length} / {knowledgeGraph.nodes.length} 个知识点
              </p>
            </div>

            <div style={{ padding: '32px' }}>
              {/* 知识图谱可视化 */}
              <div style={{ 
                background: '#f9fafb', 
                borderRadius: '12px', 
                padding: '32px',
                minHeight: '400px',
                position: 'relative'
              }}>
                {/* 第一层 - 基础 */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px', fontWeight: '600' }}>
                    基础知识
                  </div>
                  <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                    {knowledgeGraph.nodes.filter(n => n.level === 1).map(node => (
                      <div key={node.id} style={{
                        padding: '16px 24px',
                        background: node.mastered ? 'linear-gradient(135deg, #52c41a, #73d13d)' : '#e5e7eb',
                        color: node.mastered ? 'white' : '#666',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: node.mastered ? '0 4px 12px rgba(82, 196, 26, 0.3)' : 'none',
                        position: 'relative'
                      }}>
                        {node.mastered && <span style={{ marginRight: '6px' }}>✓</span>}
                        {node.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 第二层 - 进阶 */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px', fontWeight: '600' }}>
                    进阶技能
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {knowledgeGraph.nodes.filter(n => n.level === 2).map(node => (
                      <div key={node.id} style={{
                        padding: '12px 16px',
                        background: node.mastered ? '#f6ffed' : '#fafafa',
                        border: `2px solid ${node.mastered ? '#52c41a' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: node.mastered ? '#389e0d' : '#999',
                        textAlign: 'center'
                      }}>
                        {node.mastered && <span style={{ marginRight: '4px' }}>✓</span>}
                        {node.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 第三层 - 高级 */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px', fontWeight: '600' }}>
                    高级应用
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {knowledgeGraph.nodes.filter(n => n.level === 3).map(node => (
                      <div key={node.id} style={{
                        padding: '12px 16px',
                        background: node.mastered ? '#f6ffed' : '#fafafa',
                        border: `2px solid ${node.mastered ? '#52c41a' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: node.mastered ? '#389e0d' : '#999',
                        textAlign: 'center'
                      }}>
                        {node.mastered && <span style={{ marginRight: '4px' }}>✓</span>}
                        {node.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 第四层 - 框架 */}
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px', fontWeight: '600' }}>
                    框架与工具
                  </div>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    {knowledgeGraph.nodes.filter(n => n.level === 4).map(node => (
                      <div key={node.id} style={{
                        padding: '12px 20px',
                        background: node.mastered ? '#f6ffed' : '#fafafa',
                        border: `2px solid ${node.mastered ? '#52c41a' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: node.mastered ? '#389e0d' : '#999'
                      }}>
                        {node.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#e6f7ff', borderRadius: '10px' }}>
                <div style={{ fontSize: '14px', color: '#1890ff', fontWeight: '500' }}>
                  💡 学习建议
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
                  你已经掌握了大部分基础和进阶知识点！建议接下来重点学习：AJAX请求、CSS动画、Async/Await等内容。
                </div>
              </div>
            </div>
          </>
        )}

        {/* 学习时长详情 */}
        {type === 'time' && (
          <>
            <div style={{
              padding: '32px', borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
              borderRadius: '20px 20px 0 0'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
                本周学习时长
              </h2>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                总计 {learningStats.weeklyHours} 小时 · 比上周增加 21%
              </p>
            </div>

            <div style={{ padding: '32px' }}>
              {/* 折线图 */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '300px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                  {weeklyTimeData.map((data, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1890ff', marginBottom: '4px' }}>
                        {data.hours}h
                      </div>
                      <div style={{
                        width: '100%',
                        height: `${(data.hours / maxTime) * 200}px`,
                        background: 'linear-gradient(180deg, #1890ff, #36cfc9)',
                        borderRadius: '8px 8px 0 0',
                        transition: 'height 0.3s',
                        minHeight: data.hours > 0 ? '20px' : '0'
                      }} />
                      <div style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                        {data.day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 统计卡片 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #bae7ff' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>日均学习</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1890ff' }}>
                    {(learningStats.weeklyHours / 7).toFixed(1)}h
                  </div>
                </div>
                <div style={{ padding: '20px', background: '#f6ffed', borderRadius: '12px', border: '2px solid #b7eb8f' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>最长单日</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#52c41a' }}>
                    {maxTime}h
                  </div>
                </div>
                <div style={{ padding: '20px', background: '#fff7e6', borderRadius: '12px', border: '2px solid #ffd591' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>学习天数</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#fa8c16' }}>
                    {weeklyTimeData.filter(d => d.hours > 0).length}天
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#e6f7ff', borderRadius: '10px' }}>
                <div style={{ fontSize: '14px', color: '#1890ff', fontWeight: '500' }}>
                  📊 学习分析
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
                  本周学习时长较为稳定，周二学习时间最长。建议保持每天至少1小时的学习时间，周末可以适当增加练习。
                </div>
              </div>
            </div>
          </>
        )}

        {/* 成绩详情 */}
        {type === 'score' && (
          <>
            <div style={{
              padding: '32px', borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #fa8c16, #faad14)',
              borderRadius: '20px 20px 0 0'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
                作业成绩分析
              </h2>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                平均分 {learningStats.averageScore} 分 · 最高分 {maxScore} 分
              </p>
            </div>

            <div style={{ padding: '32px' }}>
              {/* 柱状图 */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '280px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                  {scoreDetailData.map((data, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#fa8c16', marginBottom: '4px' }}>
                        {data.score}
                      </div>
                      <div style={{
                        width: '100%',
                        height: `${(data.score / 100) * 200}px`,
                        background: data.score >= 90 ? 'linear-gradient(180deg, #52c41a, #73d13d)' : 
                                   data.score >= 80 ? 'linear-gradient(180deg, #fa8c16, #faad14)' :
                                   'linear-gradient(180deg, #ff4d4f, #ff7875)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s'
                      }} />
                      <div style={{ fontSize: '10px', color: '#666', fontWeight: '500', textAlign: 'center', lineHeight: 1.2, maxWidth: '60px' }}>
                        {data.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 成绩分布 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '20px', background: '#f6ffed', borderRadius: '12px', border: '2px solid #b7eb8f' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>优秀 (90+)</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#52c41a' }}>
                    {scoreDetailData.filter(d => d.score >= 90).length}次
                  </div>
                </div>
                <div style={{ padding: '20px', background: '#fff7e6', borderRadius: '12px', border: '2px solid #ffd591' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>良好 (80-89)</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#fa8c16' }}>
                    {scoreDetailData.filter(d => d.score >= 80 && d.score < 90).length}次
                  </div>
                </div>
                <div style={{ padding: '20px', background: '#fff1f0', borderRadius: '12px', border: '2px solid #ffccc7' }}>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>待提升 (&lt;80)</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#ff4d4f' }}>
                    {scoreDetailData.filter(d => d.score < 80).length}次
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', background: '#fff7e6', borderRadius: '10px' }}>
                <div style={{ fontSize: '14px', color: '#fa8c16', fontWeight: '500' }}>
                  📈 进步趋势
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
                  你的成绩整体呈上升趋势！最近的作业质量有所提升，继续保持这个学习节奏。建议多练习AJAX相关内容。
                </div>
              </div>
            </div>
          </>
        )}

        {/* 徽章详情 */}
        {type === 'badge' && (
          <>
            <div style={{
              padding: '32px', borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #f5222d, #ff4d4f)',
              borderRadius: '20px 20px 0 0'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
                学习成就徽章
              </h2>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                已获得 {badges.filter(b => b.earned).length} / {badges.length} 个徽章
              </p>
            </div>

            <div style={{ padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {badges.map(badge => (
                  <div key={badge.id} style={{
                    padding: '24px',
                    background: badge.earned ? 'linear-gradient(135deg, #fff7e6, #fffbe6)' : '#fafafa',
                    border: `2px solid ${badge.earned ? '#ffd591' : '#e5e7eb'}`,
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    opacity: badge.earned ? 1 : 0.6,
                    transition: 'all 0.3s'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      width: '64px',
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: badge.earned ? 'white' : '#f5f5f5',
                      borderRadius: '12px',
                      boxShadow: badge.earned ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                    }}>
                      {badge.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px' }}>
                        {badge.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                        {badge.desc}
                      </div>
                      {badge.earned ? (
                        <div style={{ fontSize: '12px', color: '#52c41a', fontWeight: '500' }}>
                          ✓ 已获得 · {badge.date}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#fa8c16', fontWeight: '500' }}>
                          🔒 {badge.desc2}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#fff1f0', borderRadius: '10px' }}>
                <div style={{ fontSize: '14px', color: '#f5222d', fontWeight: '500' }}>
                  🎯 下一个目标
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: 1.6 }}>
                  继续努力！再提问5次即可获得"问答达人"徽章，坚持学习15天可获得"全勤奖"徽章。
                </div>
              </div>
            </div>
          </>
        )}

        {/* 关闭按钮 */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5568d3';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

// 学习资源库弹窗组件
const ResourceLibraryModal = ({ onClose, coursewareList, handleViewCourseware, handleDownloadCourseware, formatFileSize, getFileIcon }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = ['all', 'HTML基础', 'CSS样式', 'JavaScript', 'React框架', '其他'];
  const filteredList = activeCategory === 'all' 
    ? coursewareList 
    : coursewareList.filter(c => c.category === activeCategory);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}
    onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '20px',
        width: '1000px', maxHeight: '85vh', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column'
      }}
      onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '32px', borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #667eea, #764ba2)'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
            📚 学习资源库
          </h2>
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            课件、示例代码、视频教程 · 共 {coursewareList.length} 个资源
          </p>
        </div>

        {/* 分类标签 */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 20px',
                  background: activeCategory === cat ? '#667eea' : 'white',
                  color: activeCategory === cat ? 'white' : '#666',
                  border: activeCategory === cat ? 'none' : '2px solid #e5e7eb',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat) {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.color = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#666';
                  }
                }}>
                {cat === 'all' ? '全部' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 资源列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {filteredList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredList.map(item => (
                <div key={item.id} style={{
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '20px',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>
                    {getFileIcon(item.file_type)}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px', lineHeight: 1.4 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px', lineHeight: 1.5, minHeight: '40px' }}>
                    {item.description || '暂无描述'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {formatFileSize(item.file_size)}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      background: '#e6f7ff',
                      color: '#1890ff',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        handleViewCourseware(item.id);
                        window.open(`http://localhost:5000${item.file_path}`, '_blank');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                      <Eye size={14} /> 查看
                    </button>
                    <button
                      onClick={() => handleDownloadCourseware(item.id, item.file_path, item.file_name)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: '#52c41a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                      <Download size={14} /> 下载
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <BookOpen size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                暂无资源
              </div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                该分类下还没有学习资源
              </div>
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

// 在线答疑弹窗组件
const QAModal = ({ onClose, qaMessages, qaMessage, setQaMessage, handleSubmitQA, user }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}
    onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '20px',
        width: '900px', maxHeight: '85vh', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column'
      }}
      onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '32px', borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #52c41a, #73d13d)'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
            💬 在线答疑
          </h2>
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            有问题随时提问，教师会尽快回复
          </p>
        </div>

        {/* 提问区域 */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <textarea
            value={qaMessage}
            onChange={(e) => setQaMessage(e.target.value)}
            placeholder="在这里输入你的问题..."
            style={{
              width: '100%',
              height: '100px',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              marginBottom: '12px'
            }}
            onFocus={(e) => e.target.style.borderColor = '#52c41a'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            onClick={handleSubmitQA}
            style={{
              padding: '10px 24px',
              background: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
            }}>
            提交问题
          </button>
        </div>

        {/* 问答列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {qaMessages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {qaMessages.map(msg => (
                <div key={msg.id} style={{
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600'
                    }}>
                      {msg.studentName?.charAt(0) || user.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                        {msg.studentName || user.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {new Date(msg.createdAt).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151', marginBottom: '16px', lineHeight: 1.6 }}>
                    {msg.question}
                  </div>
                  {msg.answer ? (
                    <div style={{
                      background: '#f6ffed',
                      border: '2px solid #b7eb8f',
                      borderRadius: '12px',
                      padding: '16px',
                      marginTop: '12px'
                    }}>
                      <div style={{ fontSize: '13px', color: '#52c41a', fontWeight: '600', marginBottom: '8px' }}>
                        ✓ 教师回复
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>
                        {msg.answer}
                      </div>
                      {msg.answeredAt && (
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                          {new Date(msg.answeredAt).toLocaleString('zh-CN')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      background: '#fff7e6',
                      border: '2px solid #ffd591',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '13px',
                      color: '#fa8c16',
                      fontWeight: '500'
                    }}>
                      ⏳ 等待教师回复...
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <MessageCircle size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                还没有提问记录
              </div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                在上方输入框提交你的第一个问题吧
              </div>
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              background: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
            }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

// 学习报告弹窗组件
const LearningReportModal = ({ onClose, learningStats, mySubmissions, assignments }) => {
  // 计算统计数据
  const completedCount = mySubmissions.length;
  const pendingCount = assignments.length - completedCount;
  const avgScore = mySubmissions.length > 0 
    ? Math.round(mySubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / mySubmissions.length)
    : 0;
  
  // 按月份统计
  const monthlyData = [
    { month: '1月', completed: 3, avgScore: 82 },
    { month: '2月', completed: 5, avgScore: 85 },
    { month: '3月', completed: 4, avgScore: 88 },
    { month: '4月', completed: 6, avgScore: 87 },
    { month: '5月', completed: 7, avgScore: 90 },
    { month: '6月', completed: 5, avgScore: 89 }
  ];

  const maxCompleted = Math.max(...monthlyData.map(d => d.completed));

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}
    onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '20px',
        width: '1000px', maxHeight: '85vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          padding: '32px', borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #fa8c16, #faad14)'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: 'white' }}>
            📊 学习报告
          </h2>
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
            全面分析你的学习情况和进步轨迹
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {/* 总体统计 */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' }}>
              📈 总体统计
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '16px',
                color: 'white'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>已完成作业</div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>{completedCount}</div>
              </div>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                borderRadius: '16px',
                color: 'white'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>平均分数</div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>{avgScore}</div>
              </div>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
                borderRadius: '16px',
                color: 'white'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>学习时长</div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>{learningStats.weeklyHours}h</div>
              </div>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #fa8c16, #faad14)',
                borderRadius: '16px',
                color: 'white'
              }}>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>知识掌握</div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>
                  {Math.round((learningStats.masteredTopics / learningStats.totalTopics) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* 月度趋势 */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' }}>
              📅 月度学习趋势
            </h3>
            <div style={{
              background: '#f9fafb',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', height: '250px' }}>
                {monthlyData.map((data, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#fa8c16' }}>
                      {data.completed}个
                    </div>
                    <div style={{
                      width: '100%',
                      height: `${(data.completed / maxCompleted) * 180}px`,
                      background: 'linear-gradient(180deg, #fa8c16, #faad14)',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.3s',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '11px',
                        color: '#52c41a',
                        fontWeight: '600'
                      }}>
                        {data.avgScore}分
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
                      {data.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 学习建议 */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '20px' }}>
              💡 学习建议
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{
                padding: '20px',
                background: '#e6f7ff',
                border: '2px solid #91d5ff',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1890ff', marginBottom: '8px' }}>
                  🎯 优势领域
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                  你在HTML和CSS方面表现优秀，基础扎实。建议继续深入学习响应式设计和CSS动画。
                </div>
              </div>
              <div style={{
                padding: '20px',
                background: '#fff7e6',
                border: '2px solid #ffd591',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#fa8c16', marginBottom: '8px' }}>
                  📚 提升方向
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                  JavaScript异步编程需要加强练习，建议多做AJAX和Promise相关的实战项目。
                </div>
              </div>
              <div style={{
                padding: '20px',
                background: '#f6ffed',
                border: '2px solid #b7eb8f',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#52c41a', marginBottom: '8px' }}>
                  ⏰ 学习节奏
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                  保持每天1-2小时的学习时间，周末可以适当增加实战项目练习。
                </div>
              </div>
              <div style={{
                padding: '20px',
                background: '#fff1f0',
                border: '2px solid #ffccc7',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ff4d4f', marginBottom: '8px' }}>
                  🎓 下一步计划
                </div>
                <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                  完成当前JavaScript基础后，可以开始学习React框架，为前端开发打下坚实基础。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 关闭按钮 */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 32px',
              background: '#fa8c16',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(250, 140, 22, 0.3)'
            }}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

// 重做申请模态框组件
const RedoRequestModal = ({ assignment, user, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('请填写重做原因');
      return;
    }

    setSubmitting(true);
    try {
      // 处理submission ID，去掉可能的 'sub' 前缀
      const submissionId = typeof assignment.submission.id === 'string' 
        ? assignment.submission.id.replace('sub', '') 
        : assignment.submission.id;
      
      // 处理homework ID，去掉可能的 'a' 前缀
      const homeworkId = typeof assignment.id === 'string'
        ? assignment.id.replace('a', '')
        : assignment.id;

      console.log('提交重做申请:', { submissionId, studentId: user.id, homeworkId, reason });

      const response = await fetch('http://localhost:5000/api/redo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submissionId,
          studentId: user.id,
          homeworkId: homeworkId,
          reason: reason
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('✅ 重做申请已提交！教师审核后您将收到通知。');
        onSuccess();
      } else {
        const error = await response.json();
        alert(`❌ 提交失败：${error.error}`);
      }
    } catch (error) {
      console.error('提交重做申请失败:', error);
      alert('❌ 提交失败，请检查网络连接');
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001,
      padding: '20px'
    }}
    onClick={() => !submitting && onClose()}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div style={{
          background: 'linear-gradient(135deg, #fa8c16 0%, #faad14 100%)',
          padding: '24px',
          borderRadius: '16px 16px 0 0',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <RefreshCw size={24} />
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              申请重做作业
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            {assignment.title}
          </p>
        </div>

        {/* 内容 */}
        <div style={{ padding: '24px' }}>
          <div style={{
            padding: '16px',
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#ad6800',
            lineHeight: 1.6
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>📋 重做说明</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>每个作业最多可申请重做 3 次</li>
              <li>需要说明重做原因，教师审核后决定是否批准</li>
              <li>批准后可重新提交作业，之前的分数将被清除</li>
              <li>您当前还有 {3 - (assignment.submission?.redoCount || 0)} 次重做机会</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px',
              color: '#1a1a2e'
            }}>
              重做原因 <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="请详细说明您申请重做的原因，例如：对知识点理解不够深入，希望重新学习后再次提交..."
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                lineHeight: 1.6
              }}
              onFocus={(e) => e.target.style.borderColor = '#fa8c16'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              {reason.length}/500 字
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          borderRadius: '0 0 16px 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}>
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            style={{
              padding: '10px 24px',
              background: (submitting || !reason.trim()) ? '#d1d5db' : '#fa8c16',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (submitting || !reason.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
            {submitting ? '提交中...' : '提交申请'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 文档提交模态框组件
const DocumentSubmitModal = ({ assignment, user, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) {
      alert('请至少填写作业内容或上传文件');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('studentId', user.id);
    formData.append('assignmentId', assignment.id);
    formData.append('content', content);
    formData.append('timestamp', new Date().toISOString());

    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/submissions/document', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('✅ 作业提交成功！');
        onSubmit(content, files);
      } else {
        const error = await response.json();
        alert(`❌ 提交失败：${error.error}`);
      }
    } catch (error) {
      console.error('提交作业失败:', error);
      alert('❌ 提交失败，请检查网络连接');
    }

    setUploading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001,
      padding: '20px'
    }}
    onClick={() => !uploading && onClose()}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div style={{
          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Upload size={24} />
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              提交作业（文档方式）
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            {assignment.title}
          </p>
        </div>

        {/* 内容区域 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* 作业内容输入 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px',
              color: '#1a1a2e'
            }}>
              作业内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请在此输入您的作业内容、心得体会或说明..."
              rows={8}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                lineHeight: 1.6
              }}
              onFocus={(e) => e.target.style.borderColor = '#52c41a'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* 文件上传 */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontWeight: '500',
              fontSize: '14px',
              color: '#1a1a2e'
            }}>
              附件上传（可选）
            </label>
            <label style={{
              display: 'block',
              padding: '32px',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: '#fafafa'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#52c41a';
              e.currentTarget.style.background = '#f6ffed';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.background = '#fafafa';
            }}>
              <Upload size={32} color="#52c41a" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '14px', color: '#1a1a2e', marginBottom: '4px', fontWeight: '500' }}>
                点击上传文件
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                支持 Word、PDF、图片等格式，单个文件最大 50MB
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* 已上传文件列表 */}
          {files.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e', marginBottom: '12px' }}>
                已选择 {files.length} 个文件
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {files.map((file, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <FileText size={20} color="#52c41a" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      style={{
                        padding: '6px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#1890ff',
            lineHeight: 1.6
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>💡 提交提示</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>请确保作业内容完整，包含必要的说明和文件</li>
              <li>提交后可以在"已完成"标签页查看提交记录</li>
              <li>教师批改后会显示分数和评语</li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              padding: '12px 24px',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}>
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            style={{
              padding: '12px 32px',
              background: uploading ? '#9ca3af' : '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxShadow: uploading ? 'none' : '0 4px 12px rgba(82, 196, 26, 0.3)'
            }}>
            {uploading ? '提交中...' : '提交作业'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
