// App.js - 主应用入口
import React, { useState } from 'react';
import FullEditor from './FullEditor';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import NewStudentDashboard from './components/NewStudentDashboard';
import SimpleStudentDashboard from './components/SimpleStudentDashboard';
import TestAnchorDemo from './components/TestAnchorDemo';
import { LanguageProvider } from './i18n/LanguageContext';

// 全局样式
const globalStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  .card-hover {
    transition: all 0.3s ease;
  }
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }
`;

// 初始数据
const INITIAL_DATA = {
  students: [],
  assignments: [],
  submissions: [],
  codeRepository: []
};

// 主应用组件
function App() {
  const [data, setData] = useState(INITIAL_DATA);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [editorConfig, setEditorConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 添加测试模式
  const [showTest, setShowTest] = useState(false);

  // 加载教师数据
  const loadTeacherData = async (teacherId) => {
    setLoading(true);
    try {
      const [students, assignments, submissions, codeRepo] = await Promise.all([
        fetch(`http://localhost:5000/api/students?teacher_id=${teacherId}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/assignments?teacher_id=${teacherId}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/submissions?teacher_id=${teacherId}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/code-library?teacher_id=${teacherId}`).then(r => r.json())
      ]);
      
      setData({
        students,
        assignments,
        submissions,
        codeRepository: codeRepo
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  // 加载学生数据
  const loadStudentData = async (studentId) => {
    setLoading(true);
    try {
      const [assignments, submissions] = await Promise.all([
        fetch(`http://localhost:5000/api/assignments`).then(r => r.json()),
        fetch(`http://localhost:5000/api/submissions?student_id=${studentId}`).then(r => r.json())
      ]);
      
      setData(prev => ({
        ...prev,
        assignments,
        submissions
      }));
    } catch (error) {
      console.error('加载数据失败:', error);
      alert('加载数据失败，请检查后端服务是否启动');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmission = async (selectedFiles) => {
    const assign = data.assignments.find(a => a.id === editorConfig?.assignmentId);
    if (assign && user?.role === 'student') {
      const newSub = {
        studentId: user.id,
        assignmentId: assign.id,
        files: selectedFiles,
        timestamp: Date.now()
      };
      
      try {
        const response = await fetch('http://localhost:5000/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSub)
        });
        
        if (response.ok) {
          alert('✅ 作业提交成功！');
          // 重新加载提交记录
          await loadStudentData(user.id);
        } else {
          throw new Error('提交失败');
        }
      } catch (e) {
        console.error('提交失败:', e);
        alert('❌ 作业提交失败，请重试');
      }
    }
  };

  const handleLogin = async (userData) => {
    setUser(userData);
    setView('dashboard');
    
    // 根据角色加载数据
    if (userData.role === 'teacher') {
      await loadTeacherData(userData.id);
    } else if (userData.role === 'student') {
      await loadStudentData(userData.id);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setData(INITIAL_DATA);
    setView('login');
  };

  const handleOpenEditor = (config) => {
    setEditorConfig(config);
    setView('editor');
  };

  const handleBackFromEditor = () => {
    setView('dashboard');
  };

  const handleSubmitFromEditor = (files) => {
    handleSubmission(files);
    setView('dashboard');
  };

  // 根据当前视图渲染对应组件
  const renderView = () => {
    // 测试模式
    if (showTest) {
      return (
        <div>
          <button 
            onClick={() => setShowTest(false)}
            style={{
              position: 'fixed',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              padding: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            退出测试
          </button>
        </div>
      );
    }
    
    if (view === 'login') {
      return (
        <div>
          <button 
            onClick={() => setShowTest(true)}
            style={{
              position: 'fixed',
              top: '10px',
              right: '10px',
              zIndex: 1000,
              padding: '5px 10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            测试模式
          </button>
          <LoginPage 
            key="login"
            onLogin={handleLogin}
            students={data.students}
          />
        </div>
      );
    }

    if (view === 'editor' && editorConfig) {
      return (
        <FullEditor
          key="editor"
          {...editorConfig}
          onBack={handleBackFromEditor}
          onSubmit={handleSubmitFromEditor}
        />
      );
    }

    if (view === 'dashboard' && user) {
      if (user.role === 'teacher') {
        return (
          <TeacherDashboard
            key="teacher-dashboard"
            data={data}
            setData={setData}
            user={user}
            onOpenEditor={handleOpenEditor}
            onLogout={handleLogout}
          />
        );
      }
      
      if (user.role === 'student') {
        return (
          <NewStudentDashboard
            key="student-dashboard"
            user={user}
            data={data}
            onOpenEditor={handleOpenEditor}
            onLogout={handleLogout}
          />
        );
      }
    }

    // 默认返回登录页
    return (
      <LoginPage 
        key="login-default"
        onLogin={handleLogin}
        students={data.students}
      />
    );
  };

  return (
    <LanguageProvider>
      <div style={{ minHeight: '100vh' }}>
        <style>{globalStyles}</style>
        {renderView()}
      </div>
    </LanguageProvider>
  );
}

export default App;
