import React, { useState, useEffect } from 'react';
import { 
  Home, BookOpen, FileText, MessageCircle, BarChart3, Settings, 
  LogOut, Bell, User, Calendar, CheckCircle, Clock, Award, 
  Target, TrendingUp, AlertCircle, Eye, Download, Upload,
  Code, Edit2, RefreshCw, Play, Video, Anchor
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitch from '../i18n/LanguageSwitch';
import AIAssistant from './AIAssistant';

const NewStudentDashboard = ({ user, data, onOpenEditor, onLogout }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // 新增功能状态
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStatsDetail, setShowStatsDetail] = useState(null);
  const [showCodeExample, setShowCodeExample] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [selectedAssignmentForAction, setSelectedAssignmentForAction] = useState(null);
  
  // 加载通知
  useEffect(() => {
    fetchNotifications();
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

  // 计算统计数据
  const mySubmissions = data.submissions.filter(s => s.studentId === user.id);
  const assignments = data.assignments.filter(a => 
    a.targetClass === '所有班级' || a.targetClass === user.class
  );
  const completedCount = mySubmissions.length;
  const pendingCount = assignments.length - completedCount;

  // 模拟学习数据
  const learningStats = {
    masteredTopics: 12,
    totalTopics: 20,
    weeklyHours: 8.5,
    averageScore: 85,
    scoreHistory: [78, 82, 85, 88, 85]
  };

  // 菜单项配置
  const menuItems = [
    { id: 'dashboard', icon: <Home size={18}/>, label: t('learningProgress') },
    { id: 'assignments', icon: <FileText size={18}/>, label: t('myAssignments') },
    { id: 'courseware', icon: <BookOpen size={18}/>, label: t('resourceLibrary') },
    { id: 'qa', icon: <MessageCircle size={18}/>, label: t('onlineQA') },
    { id: 'reports', icon: <BarChart3 size={18}/>, label: t('learningReport') }
  ];

  const tabLabels = {
    dashboard: t('learningProgress'),
    assignments: t('myAssignments'), 
    courseware: t('resourceLibrary'),
    qa: t('onlineQA'),
    reports: t('learningReport')
  };

  return (  
  <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      {/* 左侧导航栏 */}
      <div style={{
        width: '280px',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        {/* Logo区域 */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Code size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
              {t('codingPlatform')}
            </h2>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('studentDashboard')}</p>
          </div>
        </div>

        {/* 导航菜单 */}
        <div style={{ flex: 1, padding: '16px 0' }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: activeTab === item.id ? '#f3f4f6' : 'transparent',
                border: 'none',
                borderLeft: activeTab === item.id ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === item.id ? '#667eea' : '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: activeTab === item.id ? '600' : '500',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.color = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* 底部操作 */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                flex: 1,
                padding: '10px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              <Settings size={14} />
              设置
            </button>
            <button
              onClick={onLogout}
              style={{
                padding: '10px',
                background: '#fee2e2',
                border: 'none',
                borderRadius: '8px',
                color: '#dc2626',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div style={{ marginLeft: '280px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶部栏 */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
              {tabLabels[activeTab]}
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0' }}>
              {activeTab === 'dashboard' && t('viewDetailedAnalysis')}
              {activeTab === 'assignments' && t('myAssignments')}
              {activeTab === 'courseware' && t('resourceLibrary')}
              {activeTab === 'qa' && t('contactTeacherForHelp')}
              {activeTab === 'reports' && t('viewDetailedAnalysis')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* 语言切换按钮 */}
            <LanguageSwitch />
            
            {/* 通知铃铛 */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: showNotifications ? '#667eea' : '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
              >
                <Bell size={18} color={showNotifications ? 'white' : '#6b7280'} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#ff4d4f',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* 用户头像 */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {user.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardContent 
            user={user} 
            assignments={assignments}
            mySubmissions={mySubmissions}
            completedCount={completedCount}
            pendingCount={pendingCount}
            learningStats={learningStats}
            setShowStatsDetail={setShowStatsDetail}
          />}
          {activeTab === 'assignments' && <AssignmentsContent 
            assignments={assignments}
            mySubmissions={mySubmissions}
            user={user}
            onOpenEditor={onOpenEditor}
            setSelectedAssignmentForAction={setSelectedAssignmentForAction}
            setShowRedoModal={setShowRedoModal}
            setShowSubmitModal={setShowSubmitModal}
          />}
          {activeTab === 'courseware' && <CoursewareContent setShowCodeExample={setShowCodeExample} />}
          {activeTab === 'qa' && <QAContent user={user} />}
          {activeTab === 'reports' && <ReportsContent learningStats={learningStats} />}
        </main>
      </div>

      {/* 通知面板 */}
      {showNotifications && (
        <NotificationPanel 
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={fetchNotifications}
          user={user}
        />
      )}

      {/* 个人资料编辑弹窗 */}
      {showProfileModal && (
        <ProfileModal 
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* 统计详情弹窗 */}
      {showStatsDetail && (
        <StatsDetailModal 
          type={showStatsDetail}
          onClose={() => setShowStatsDetail(null)}
        />
      )}

      {/* 示例代码查看器 */}
      {showCodeExample && (
        <CodeExampleModal 
          onClose={() => setShowCodeExample(false)}
        />
      )}

      {/* 作业提交方式选择弹窗 */}
      {showSubmitModal && selectedAssignmentForAction && (
        <SubmitMethodModal 
          assignment={selectedAssignmentForAction}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedAssignmentForAction(null);
          }}
          onOpenEditor={onOpenEditor}
        />
      )}

      {/* 重做申请弹窗 */}
      {showRedoModal && selectedAssignmentForAction && (
        <RedoRequestModal 
          assignment={selectedAssignmentForAction}
          user={user}
          onClose={() => {
            setShowRedoModal(false);
            setSelectedAssignmentForAction(null);
          }}
        />
      )}

      {/* AI 助手 */}
      <AIAssistant userRole="student" userName={user.name} />
    </div>
  );
};

// 学习概览组件
const DashboardContent = ({ user, assignments, mySubmissions, completedCount, pendingCount, learningStats, setShowStatsDetail }) => {
  const { t } = useLanguage();
  
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
    <div>
      {/* 欢迎卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: '#fff',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
          {t('welcomeBack')}，{user.name}！
        </h2>
        <p style={{ opacity: 0.9, marginBottom: '24px', fontSize: '16px' }}>
          {t('continueYourJourney')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div 
            onClick={() => setShowStatsDetail('completed')}
            style={{ 
              textAlign: 'center',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {completedCount}
            </div>
            <div style={{ opacity: 0.8, fontSize: '14px' }}>{t('completedAssignments')}</div>
          </div>
          <div 
            onClick={() => setShowStatsDetail('pending')}
            style={{ 
              textAlign: 'center',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {pendingCount}
            </div>
            <div style={{ opacity: 0.8, fontSize: '14px' }}>{t('pendingAssignments')}</div>
          </div>
          <div 
            onClick={() => setShowStatsDetail('score')}
            style={{ 
              textAlign: 'center',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {learningStats.averageScore}
            </div>
            <div style={{ opacity: 0.8, fontSize: '14px' }}>{t('averageScore')}</div>
          </div>
        </div>
      </div>

      {/* 学习数据卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {/* 知识点掌握 */}
        <div 
          onClick={() => setShowStatsDetail('knowledge')}
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #52c41a, #73d13d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }}>
                {learningStats.masteredTopics}/{learningStats.totalTopics}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>{t('knowledgeMastery')}</div>
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
        </div>

        {/* 本周学习时长 */}
        <div 
          onClick={() => setShowStatsDetail('time')}
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }}>
                {learningStats.weeklyHours}h
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>{t('weeklyStudyTime')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2px', height: '40px', alignItems: 'end' }}>
            {[3, 5, 2, 4, 6, 3, 2].map((hours, index) => (
              <div key={index} style={{
                flex: 1,
                height: `${(hours / 6) * 100}%`,
                background: index === 6 ? '#1890ff' : '#e6f7ff',
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.3s'
              }} />
            ))}
          </div>
        </div>

        {/* 作业得分趋势 */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #722ed1, #9254de)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }}>
                {learningStats.averageScore}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>{t('averageScore')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2px', height: '40px', alignItems: 'end' }}>
            {learningStats.scoreHistory.map((score, index) => (
              <div key={index} style={{
                flex: 1,
                height: `${score}%`,
                background: index === learningStats.scoreHistory.length - 1 ? '#722ed1' : '#f9f0ff',
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.3s'
              }} />
            ))}
          </div>
        </div>

        {/* 学习成就 */}
        <div 
          onClick={() => setShowStatsDetail('badge')}
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #fa8c16, #ffa940)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e' }}>
                3
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>{t('earnedBadges')}</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            🏆 {t('codingRisingStar')} · 🎯 {t('punctualPerson')}
          </div>
        </div>
      </div>

      {/* 即将截止的作业 */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={20} color="#ff4d4f" />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>
            {t('dueSoon')}
          </h3>
        </div>
        
        {urgentAssignments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {urgentAssignments.slice(0, 3).map(assign => {
              const daysLeft = Math.ceil((new Date(assign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={assign.id} style={{
                  padding: '16px',
                  border: '1px solid #ffccc7',
                  borderRadius: '12px',
                  background: '#fff2f0'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    {assign.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#ff4d4f', margin: 0 }}>
                    {t('daysLeft', { days: daysLeft })}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#52c41a' }}>
            <CheckCircle size={48} color="#52c41a" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>{t('excellent')}</div>
            <div style={{ fontSize: '14px' }}>{t('noUrgentAssignments')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// 作业管理组件
const AssignmentsContent = ({ assignments, mySubmissions, user, onOpenEditor, setSelectedAssignmentForAction, setShowRedoModal, setShowSubmitModal }) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const filteredAssignments = assignments.filter(assign => {
    const isCompleted = mySubmissions.some(s => s.assignmentId === assign.id);
    if (activeFilter === 'completed') return isCompleted;
    if (activeFilter === 'pending') return !isCompleted;
    return true;
  });

  const completedCount = mySubmissions.length;
  const pendingCount = assignments.length - completedCount;

  return (
    <div>
      {/* 筛选器 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          { key: 'all', label: t('allAssignments'), count: assignments.length },
          { key: 'pending', label: t('pending'), count: pendingCount },
          { key: 'completed', label: t('completed'), count: completedCount }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            style={{
              padding: '12px 20px',
              background: activeFilter === filter.key ? '#667eea' : '#fff',
              color: activeFilter === filter.key ? '#fff' : '#666',
              border: activeFilter === filter.key ? 'none' : '1px solid #e5e7eb',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {filter.label}
            <span style={{
              background: activeFilter === filter.key ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
              color: activeFilter === filter.key ? '#fff' : '#666',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '12px'
            }}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* 作业列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {filteredAssignments.map(assign => {
          const submission = mySubmissions.find(s => s.assignmentId === assign.id);
          const isOverdue = new Date(assign.deadline) < new Date();
          const isCompleted = !!submission;
          const daysLeft = Math.ceil((new Date(assign.deadline) - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <div key={assign.id} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: isOverdue && !isCompleted ? '1px solid #ffccc7' : '1px solid #e5e7eb',
              position: 'relative'
            }}>
              {/* 状态标签 */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                background: isCompleted ? '#f6ffed' : isOverdue ? '#fff2f0' : '#f0f9ff',
                color: isCompleted ? '#52c41a' : isOverdue ? '#ff4d4f' : '#1890ff'
              }}>
                {isCompleted ? t('completed') : isOverdue ? t('overdue') : t('daysLeft', { days: daysLeft })}
              </div>

              {/* 作业信息 */}
              <div style={{ marginBottom: '16px', paddingRight: '80px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>
                  {assign.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5, marginBottom: '12px' }}>
                  {assign.description || t('noDescription')}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#9ca3af' }}>
                  <span>📅 截止：{assign.deadline}</span>
                  <span>👥 {assign.targetClass}</span>
                </div>
              </div>

              {/* 得分显示 */}
              {isCompleted && submission?.score && (
                <div style={{
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#52c41a', marginBottom: '4px' }}>
                    {t('grade')}：{submission.score}/100
                  </div>
                  {submission.comment && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      💬 {submission.comment}
                    </div>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSelectedAssignment(assign)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: isCompleted ? '#f5f5f5' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: isCompleted ? '#666' : '#fff',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  {isCompleted ? (
                    <><Eye size={16} /> {t('viewDetails')}</>
                  ) : (
                    <><FileText size={16} /> {t('submitAssignment')}</>
                  )}
                </button>

                {/* 重做申请按钮 - 仅对已完成的作业显示 */}
                {isCompleted && (
                  <button
                    onClick={() => {
                      setSelectedAssignmentForAction(assign);
                      setShowRedoModal(true);
                    }}
                    style={{
                      padding: '12px',
                      background: '#fff',
                      border: '1px solid #f59e0b',
                      borderRadius: '10px',
                      color: '#f59e0b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <RefreshCw size={14} />
                    重做
                  </button>
                )}

                {/* 提交方式选择按钮 - 仅对未完成的作业显示 */}
                {!isCompleted && (
                  <button
                    onClick={() => {
                      setSelectedAssignmentForAction(assign);
                      setShowSubmitModal(true);
                    }}
                    style={{
                      padding: '12px',
                      background: '#fff',
                      border: '1px solid #16a34a',
                      borderRadius: '10px',
                      color: '#16a34a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Upload size={14} />
                    {t('submit')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 作业详情弹窗 */}
      {selectedAssignment && (
        <AssignmentDetailModal 
          assignment={selectedAssignment}
          submission={mySubmissions.find(s => s.assignmentId === selectedAssignment.id)}
          onClose={() => setSelectedAssignment(null)}
          onOpenEditor={onOpenEditor}
        />
      )}
    </div>
  );
};

// 学习资源组件 - 完整实现
const CoursewareContent = ({ setShowCodeExample }) => {
  const { t } = useLanguage();
  const [coursewareList, setCoursewareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchCourseware();
  }, []);

  const fetchCourseware = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courseware');
      if (response.ok) {
        const data = await response.json();
        setCoursewareList(data);
      }
    } catch (error) {
      console.error('加载课件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourseware = async (item) => {
    try {
      await fetch(`http://localhost:5000/api/courseware/${item.id}/view`, {
        method: 'POST'
      });
      // 打开新窗口查看
      window.open(`http://localhost:5000${item.filePath}`, '_blank');
    } catch (error) {
      console.error('查看失败:', error);
    }
  };

  const handleDownloadCourseware = async (item) => {
    try {
      await fetch(`http://localhost:5000/api/courseware/${item.id}/download`, {
        method: 'POST'
      });
      
      const link = document.createElement('a');
      link.href = `http://localhost:5000${item.filePath}`;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'ppt':
      case 'pptx': return '📊';
      case 'doc':
      case 'docx': return '📝';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const categories = ['all', 'HTML', 'CSS', 'JavaScript', 'React', t('other')];
  const filteredCourseware = selectedCategory === 'all' 
    ? coursewareList 
    : coursewareList.filter(item => item.category === selectedCategory);

  return (
    <div>
      {/* 分类筛选和功能按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === category ? '#667eea' : '#fff',
                color: selectedCategory === category ? '#fff' : '#666',
                border: selectedCategory === category ? 'none' : '1px solid #e5e7eb',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>
        
        {/* 示例代码按钮 */}
        <button
          onClick={() => setShowCodeExample(true)}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <Code size={16} />
          {t('codeExample')}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <div style={{ fontSize: '16px' }}>加载中...</div>
        </div>
      ) : filteredCourseware.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCourseware.map(item => (
            <div key={item.id} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>{getFileIcon(item.fileType)}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                    {formatFileSize(item.fileSize)} · {item.fileType?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#667eea', background: '#f0f9ff', padding: '2px 8px', borderRadius: '12px', display: 'inline-block' }}>
                    {item.category}
                  </div>
                </div>
              </div>

              {item.description && (
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5, marginBottom: '16px' }}>
                  {item.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
                <span>👁️ {item.viewCount || 0} 次查看</span>
                <span>⬇️ {item.downloadCount || 0} 次下载</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleViewCourseware(item)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Eye size={16} />
                  查看
                </button>
                <button
                  onClick={() => handleDownloadCourseware(item)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#fff',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={16} />
                  {t('download')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <BookOpen size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>{t('noCourseware')}</div>
          <div style={{ fontSize: '14px' }}>{t('contactTeacherForHelp')}</div>
        </div>
      )}
    </div>
  );
};

// 在线答疑组件 - 完整实现
const QAContent = ({ user }) => {
  const { t } = useLanguage();
  const [qaMessages, setQaMessages] = useState([]);
  const [qaMessage, setQaMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQAMessages();
  }, []);

  const fetchQAMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/qa/questions?studentId=${user.id}`);
      
      if (response.ok) {
        const questions = await response.json();
        setQaMessages(questions);
      }
    } catch (error) {
      console.error('加载问答失败:', error);
      // 使用示例数据
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!qaMessage.trim()) {
      alert(t('enterQuestionContent'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/qa/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          question: qaMessage.trim()
        })
      });

      if (response.ok) {
        alert(t('submitSuccess'));
        setQaMessage('');
        fetchQAMessages();
      } else {
        const errorData = await response.json();
        alert(t('submitFailed'));
      }
    } catch (error) {
      console.error('提交问题失败:', error);
      alert(t('networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* 提问区域 */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a2e' }}>
          💬 提出问题
        </h3>
        <textarea
          value={qaMessage}
          onChange={(e) => setQaMessage(e.target.value)}
          placeholder={t('askAnytimeTeacherReply')}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            marginBottom: '12px'
          }}
        />
        <button
          onClick={handleSubmitQuestion}
          disabled={submitting || !qaMessage.trim()}
          style={{
            padding: '12px 24px',
            background: submitting ? '#9ca3af' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {submitting ? (
            <>
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              {t('submitting')}
            </>
          ) : (
            <>
              <Upload size={16} />
              {t('submitQuestion')}
            </>
          )}
        </button>
      </div>

      {/* 问答列表 */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1a1a2e' }}>
          📋 我的问题
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <div style={{ fontSize: '16px' }}>加载中...</div>
          </div>
        ) : qaMessages.length > 0 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {qaMessages.map(qa => (
              <div key={qa.id} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                border: '1px solid #e5e7eb'
              }}>
                {/* 问题 */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {qa.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                        {qa.studentName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(qa.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#374151'
                  }}>
                    {qa.question}
                  </div>
                </div>

                {/* 回答 */}
                {qa.answer ? (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        T
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                          {t('reply')}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {qa.answeredAt ? new Date(qa.answeredAt).toLocaleString() : '刚刚'}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      background: '#f6ffed',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#374151'
                    }}>
                      {qa.answer}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    {t('waitingForTeacherReplyShort')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <MessageCircle size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>{t('noQuestionsYet')}</div>
            <div style={{ fontSize: '14px' }}>{t('askAnytimeTeacherReply')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// 学习报告组件 - 完整实现
const ReportsContent = ({ learningStats }) => {
  const { t } = useLanguage();
  
  return (
    <div>
      {/* 学习概况 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: '#fff',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
          📊 {t('learningAnalysis')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {Math.round((learningStats.masteredTopics / learningStats.totalTopics) * 100)}%
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>{t('knowledgeMastery')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {learningStats.weeklyHours}h
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>{t('weeklyStudyTime')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {learningStats.averageScore}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>{t('averageScoreLabel')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
              {learningStats.masteredTopics}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>{t('masteredKnowledgePoints')}</div>
          </div>
        </div>
      </div>

      {/* 详细数据 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
        {/* 知识点掌握详情 */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>
            🎯 {t('knowledgeGraphTitle')}
          </h3>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>HTML {t('basicSkills')}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#52c41a' }}>90%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '90%', height: '100%', background: 'linear-gradient(90deg, #52c41a, #73d13d)' }} />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>CSS</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1890ff' }}>75%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #1890ff, #40a9ff)' }} />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>JavaScript</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#722ed1' }}>60%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #722ed1, #9254de)' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>React</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#fa8c16' }}>45%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, #fa8c16, #ffa940)' }} />
            </div>
          </div>
        </div>

        {/* 学习时长趋势 */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>
            ⏰ {t('weeklyStudyTimeTitle')}
          </h3>
          <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '200px' }}>
            {[
              { day: t('monday'), hours: 1.5 },
              { day: t('tuesday'), hours: 2.0 },
              { day: t('wednesday'), hours: 1.0 },
              { day: t('thursday'), hours: 2.5 },
              { day: t('friday'), hours: 1.5 },
              { day: t('saturday'), hours: 0 },
              { day: t('sunday'), hours: 0 }
            ].map((item, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '100%',
                  height: `${(item.hours / 3) * 100}%`,
                  background: item.hours > 0 ? 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                  borderRadius: '4px 4px 0 0',
                  minHeight: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {item.hours > 0 ? `${item.hours}h` : ''}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 成绩趋势 */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1a1a2e' }}>
          📈 {t('assignmentScoreAnalysis')}
        </h3>
        <div style={{ display: 'flex', alignItems: 'end', gap: '4px', height: '150px' }}>
          {learningStats.scoreHistory.map((score, index) => (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#667eea' }}>{score}</div>
              <div style={{
                width: '100%',
                height: `${score}%`,
                background: index === learningStats.scoreHistory.length - 1 
                  ? 'linear-gradient(180deg, #52c41a 0%, #73d13d 100%)'
                  : 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '4px 4px 0 0',
                minHeight: '20px'
              }} />
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>作业{index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 作业详情弹窗组件
const AssignmentDetailModal = ({ assignment, submission, onClose, onOpenEditor }) => {
  const { t } = useLanguage();
  
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
      zIndex: 1000,
      padding: '20px'
    }}
    onClick={onClose}>
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '800px',
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
          padding: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px' }}>
                {assignment.title}
              </h2>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {t('deadline')}：{assignment.deadline}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px'
              }}>
              ×
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{t('assignmentRequirements')}</h3>
            <div style={{
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#374151'
            }}>
              {assignment.description || assignment.requirements || t('noDescription')}
            </div>
          </div>

          {submission && submission.score && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{t('gradingResult')}</h3>
              <div style={{
                background: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#52c41a', marginBottom: '8px' }}>
                  {t('grade')}：{submission.score}/100
                </div>
                {submission.comment && (
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    💬 {submission.comment}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 文件上传区域 */}
          {!submission && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{t('submitAssignment')}</h3>
              <FileUploadArea assignment={assignment} onClose={onClose} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            {!submission && (
              <button
                onClick={() => {
                  onOpenEditor({
                    mode: 'student_work',
                    assignmentId: assignment.id,
                    template: assignment.template || { 'index.html': '<!-- 开始编写你的代码 -->' }
                  });
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Code size={16} />
                在线编程
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 文件上传组件
const FileUploadArea = ({ assignment, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert(t('uploadFiles'));
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('assignmentId', assignment.id);
    formData.append('timestamp', new Date().toISOString());

    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/submissions/document', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert(t('submitSuccess'));
        onClose();
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(t('submitFailed'));
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert(t('networkError'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* 文件拖拽上传区域 */}
      <div
        style={{
          border: `2px dashed ${dragOver ? '#667eea' : '#d1d5db'}`,
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          background: dragOver ? '#f8faff' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '16px'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <Upload size={32} color={dragOver ? '#667eea' : '#9ca3af'} style={{ marginBottom: '12px' }} />
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
          点击选择文件或拖拽文件到此处
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          支持多种文件格式：.zip, .rar, .pdf, .doc, .docx, .txt, .js, .html, .css
        </div>
        <input
          id="file-input"
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          accept=".zip,.rar,.pdf,.doc,.docx,.txt,.js,.html,.css,.png,.jpg,.jpeg"
        />
      </div>

      {/* 已选择的文件列表 */}
      {selectedFiles.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            已选择文件 ({selectedFiles.length})
          </h4>
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {selectedFiles.map((file, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '4px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="#6b7280" />
                  <span>{file.name}</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={uploading || selectedFiles.length === 0}
        style={{
          width: '100%',
          padding: '12px',
          background: uploading ? '#9ca3af' : '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {uploading ? (
          <>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
            {t('submitting')}
          </>
        ) : (
          <>
            <Upload size={16} />
            {t('submitAssignment')}
          </>
        )}
      </button>
    </div>
  );
};

// 通知面板组件
const NotificationPanel = ({ notifications, onClose, onMarkAsRead, user }) => {
  const { t } = useLanguage();
  
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      onMarkAsRead();
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
      onMarkAsRead();
    } catch (error) {
      console.error('标记全部已读失败:', error);
    }
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
      />
      
      {/* 通知面板 */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '32px',
        width: '380px',
        maxHeight: '500px',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        zIndex: 1000,
        overflow: 'hidden'
      }}>
        {/* 头部 */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{t('notifications')}</h3>
          <button
            onClick={markAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('markAllRead')}
          </button>
        </div>

        {/* 通知列表 */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  background: notification.is_read ? 'white' : '#f8faff',
                  cursor: notification.is_read ? 'default' : 'pointer'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: notification.is_read ? '500' : '600',
                    color: notification.is_read ? '#6b7280' : '#1f2937'
                  }}>
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#667eea'
                    }} />
                  )}
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: 1.4
                }}>
                  {notification.message}
                </p>
                <div style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginTop: '8px'
                }}>
                  {new Date(notification.created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9ca3af'
            }}>
              {t('noNotifications')}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// 个人资料编辑弹窗
const ProfileModal = ({ user, onClose }) => {
  const { t } = useLanguage();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      alert(t('passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        alert('✅ 个人信息更新成功！');
        onClose();
      } else {
        alert('❌ 更新失败，请重试');
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert('❌ 网络错误，请重试');
    } finally {
      setSaving(false);
    }
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
      zIndex: 1000,
      padding: '20px'
    }}
    onClick={onClose}>
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '500px',
          padding: '32px'
        }}
        onClick={(e) => e.stopPropagation()}>
        
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>
          {t('profileSettings')}
        </h2>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              {t('name')}
            </label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              {t('email')}
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              {t('phone')}
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              {t('newPassword')}
            </label>
            <input
              type="password"
              value={profileForm.password}
              onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              {t('confirmNewPassword')}
            </label>
            <input
              type="password"
              value={profileForm.confirmPassword}
              onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px',
              background: saving ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

// 统计详情弹窗组件 - 完整实现
const StatsDetailModal = ({ type, onClose }) => {
  const { t } = useLanguage();
  
  const getContent = () => {
    switch(type) {
      case 'completed':
        return {
          title: '✅ 已完成作业',
          icon: <CheckCircle size={48} color="#52c41a" />,
          data: [
            { label: t('thisWeekCompleted'), value: '3', color: '#52c41a' },
            { label: t('thisMonthCompleted'), value: '12', color: '#1890ff' },
            { label: t('totalCompleted'), value: '45', color: '#722ed1' },
            { label: t('completionRate'), value: '90%', color: '#fa8c16' }
          ]
        };
      case 'pending':
        return {
          title: '⏳ 待完成作业',
          icon: <Clock size={48} color="#fa8c16" />,
          data: [
            { label: t('todayPending'), value: '1', color: '#ff4d4f' },
            { label: t('thisWeekPending'), value: '2', color: '#fa8c16' },
            { label: t('dueSoon'), value: '0', color: '#52c41a' },
            { label: t('totalPending'), value: '5', color: '#1890ff' }
          ]
        };
      case 'score':
        return {
          title: '📊 ' + t('averageScoreLabel') + t('learningAnalysis'),
          icon: <TrendingUp size={48} color="#667eea" />,
          data: [
            { label: t('highestScore'), value: '95', color: '#52c41a' },
            { label: t('lowestScore'), value: '72', color: '#ff4d4f' },
            { label: t('averageScore'), value: '85', color: '#667eea' },
            { label: t('progressTrend'), value: '+8', color: '#1890ff' }
          ]
        };
      case 'knowledge':
        return {
          title: '🎯 知识点掌握详情',
          icon: <Target size={48} color="#52c41a" />,
          data: [
            { label: `HTML ${t('basicSkills')}`, value: '90%', color: '#52c41a' },
            { label: 'CSS', value: '75%', color: '#1890ff' },
            { label: 'JavaScript', value: '60%', color: '#722ed1' },
            { label: 'React', value: '45%', color: '#fa8c16' }
          ]
        };
      case 'time':
        return {
          title: '⏰ 学习时长统计',
          icon: <Clock size={48} color="#1890ff" />,
          data: [
            { label: t('todayStudy'), value: '2.5h', color: '#52c41a' },
            { label: t('thisWeekStudy'), value: '8.5h', color: '#1890ff' },
            { label: t('thisMonthStudy'), value: '32h', color: '#722ed1' },
            { label: t('totalStudy'), value: '156h', color: '#fa8c16' }
          ]
        };
      case 'badge':
        return {
          title: '🏆 学习成就',
          icon: <Award size={48} color="#fa8c16" />,
          data: [
            { label: '代码新星', value: '已获得', color: '#52c41a' },
            { label: '准时达人', value: '已获得', color: '#1890ff' },
            { label: '学习标兵', value: '进行中', color: '#fa8c16' },
            { label: '全勤奖章', value: '未获得', color: '#d9d9d9' }
          ]
        };
      default:
        return {
          title: '统计详情',
          icon: <BarChart3 size={48} color="#667eea" />,
          data: []
        };
    }
  };

  const content = getContent();

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
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            {content.icon}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
            {content.title}
          </h2>
        </div>

        {/* 数据列表 */}
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          {content.data.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e5e7eb'
            }}>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                {item.label}
              </span>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: item.color
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* 关闭按钮 */}
        <button onClick={onClose} style={{
          width: '100%',
          padding: '12px',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {t('close')}
        </button>
      </div>
    </div>
  );
};

const CodeExampleModal = ({ onClose }) => {
  const { t } = useLanguage();
  
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
    zIndex: 1000
  }} onClick={onClose}>
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      maxWidth: '800px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto'
    }} onClick={(e) => e.stopPropagation()}>
      <h2>{t('codeExample')}</h2>
      <pre style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '14px'
      }}>
{`<!DOCTYPE html>
<html>
<head>
    <title>个人主页</title>
</head>
<body>
    <h1>欢迎来到我的主页</h1>
    <p>这是一个示例页面</p>
</body>
</html>`}
      </pre>
      <button onClick={onClose} style={{
        padding: '10px 20px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '20px'
      }}>
        {t('close')}
      </button>
    </div>
  </div>
  );
};

const SubmitMethodModal = ({ assignment, onClose, onOpenEditor }) => {
  const { t } = useLanguage();
  
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
    zIndex: 1000
  }} onClick={onClose}>
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '32px',
      maxWidth: '500px',
      width: '90%'
    }} onClick={(e) => e.stopPropagation()}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{t('submitAssignment')}</h2>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        <button
          onClick={() => {
            onOpenEditor({
              mode: 'student_work',
              assignmentId: assignment.id,
              template: assignment.template || { 'index.html': '<!-- 开始编写你的代码 -->' }
            });
            onClose();
          }}
          style={{
            padding: '20px',
            border: '2px solid #667eea',
            borderRadius: '12px',
            background: 'white',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <Code size={32} color="#667eea" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>在线编程</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>使用内置编辑器编写代码</div>
        </button>

        <button
          onClick={() => {
            alert('请在作业详情中上传文件');
            onClose();
          }}
          style={{
            padding: '20px',
            border: '2px solid #16a34a',
            borderRadius: '12px',
            background: 'white',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <Upload size={32} color="#16a34a" style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{t('uploadFiles')}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>{t('submitAssignment')}</div>
        </button>
      </div>

      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '12px',
          background: '#f3f4f6',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        {t('cancel')}
      </button>
    </div>
  </div>
  );
};

const RedoRequestModal = ({ assignment, user, onClose }) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert(t('redoReason'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/redo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          assignmentId: assignment.id,
          reason: reason.trim()
        })
      });

      if (response.ok) {
        alert(t('submitSuccess'));
        onClose();
      } else {
        alert(t('submitFailed'));
      }
    } catch (error) {
      console.error('提交重做申请失败:', error);
      alert(t('networkError'));
    } finally {
      setSubmitting(false);
    }
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
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: '20px' }}>{t('applyForRedoAssignment')}</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          {t('assignmentTitle')}：{assignment.title}
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            {t('redoReason')}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('redoReasonPlaceholder')}
            style={{
              width: '100%',
              height: '120px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              background: submitting ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? t('submitting') : t('submitRedoRequest')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewStudentDashboard;