import React, { useState, useEffect } from 'react';
import { User, Lock, LogIn, Code, Eye, EyeOff, AlertCircle, UserPlus, Mail, Phone } from 'lucide-react';

const LoginPage = ({ onLogin, students }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userType, setUserType] = useState('student');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // 添加 CSS 动画
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes typing {
        0%, 100% { width: 0; }
        50% { width: 100%; }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      @keyframes slideUp {
        0% { transform: translateY(10px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes rotate3d {
        0% { transform: perspective(1000px) rotateY(0deg) rotateX(5deg); }
        50% { transform: perspective(1000px) rotateY(5deg) rotateX(8deg); }
        100% { transform: perspective(1000px) rotateY(0deg) rotateX(5deg); }
      }
      @keyframes particleFloat {
        0%, 100% { transform: translate(0, 0); opacity: 0.6; }
        25% { transform: translate(10px, -10px); opacity: 1; }
        50% { transform: translate(-5px, -20px); opacity: 0.8; }
        75% { transform: translate(-10px, -10px); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  // 注册表单字段
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: userType })
      });
      
      if (!response.ok) {
        const error = await response.json();
        setError(error.error || '登录失败');
        setIsLoading(false);
        return;
      }
      
      const userData = await response.json();
      onLogin(userData);
    } catch (error) {
      console.error('登录错误:', error);
      setError('网络错误，请检查后端服务是否启动（http://localhost:5000）');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 表单验证
    if (!registerData.username || !registerData.password || !registerData.name) {
      setError('请填写必填项');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }
    
    if (registerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      setError('邮箱格式不正确');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerData.username,
          password: registerData.password,
          name: registerData.name,
          email: registerData.email,
          phone: registerData.phone,
          role: userType
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        setError(error.error || '注册失败');
        setIsLoading(false);
        return;
      }
      
      setSuccess('注册成功！即将跳转到登录...');
      setTimeout(() => {
        setIsRegisterMode(false);
        setUsername(registerData.username);
        setRegisterData({
          username: '', password: '', confirmPassword: '',
          name: '', email: '', phone: ''
        });
        setSuccess('');
      }, 1500);
    } catch (error) {
      console.error('注册错误:', error);
      setError('网络错误，请检查后端服务是否启动（http://localhost:5000）');
    }
    
    setIsLoading(false);
  };

  const switchMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccess('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* 左侧装饰区域 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 背景代码纹理 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.08,
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.8',
          color: '#fff',
          padding: '20px',
          overflow: 'hidden',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          {`function learn() {\n  const code = "Hello World";\n  return code;\n}\n\n01010011 01010101 01000011 01000011\n\nif (student.ready) {\n  student.code();\n}\n\nconst skills = ['HTML', 'CSS', 'JS'];\nskills.map(skill => learn(skill));\n\n<div className="future">\n  <Code />\n</div>\n\nwhile (learning) {\n  knowledge++;\n}\n\n01001100 01000101 01000001 01010010\n\nfunction teach() {\n  return knowledge.share();\n}`}
        </div>

        {/* 装饰性几何图形 */}
        <div style={{
          position: 'absolute',
          top: '10%', right: '10%',
          width: '200px', height: '200px',
          border: '2px solid rgba(255,255,255,0.1)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%', left: '8%',
          width: '150px', height: '150px',
          border: '2px solid rgba(255,255,255,0.1)',
          borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />

        {/* 主内容区域 - 玻璃拟态效果 */}
        <div style={{
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '50px 60px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          {/* 3D 风格的代码图标容器 - 带动态插画 */}
          <div style={{
            width: '180px', height: '180px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
            borderRadius: '35px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
            position: 'relative',
            animation: 'rotate3d 6s ease-in-out infinite'
          }}>
            {/* 动态粒子效果 */}
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: '6px',
                height: '6px',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '50%',
                top: `${20 + i * 15}%`,
                left: `${10 + (i % 2) * 70}%`,
                animation: `particleFloat ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                boxShadow: '0 0 10px rgba(255,255,255,0.8)'
              }} />
            ))}

            {/* 内部发光效果 */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px', height: '120px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 3s ease-in-out infinite'
            }} />

            {/* 代码符号装饰 */}
            <div style={{
              position: 'absolute',
              top: '15px', left: '15px',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              animation: 'slideUp 2s ease-in-out infinite'
            }}>{'<'}</div>
            <div style={{
              position: 'absolute',
              top: '15px', right: '15px',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              animation: 'slideUp 2s ease-in-out infinite 0.5s'
            }}>{'>'}</div>
            <div style={{
              position: 'absolute',
              bottom: '15px', left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              animation: 'slideUp 2s ease-in-out infinite 1s'
            }}>{'{}'}</div>

            {/* 主图标 */}
            <Code size={80} color="#fff" style={{
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
            }} />

            {/* 打字机效果的代码行 */}
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: 'rgba(255,255,255,0.7)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              borderRight: '2px solid rgba(255,255,255,0.7)',
              animation: 'typing 4s steps(20) infinite, blink 0.7s step-end infinite',
              paddingRight: '2px'
            }}>
              console.log("Hello");
            </div>
          </div>

          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '16px',
            textShadow: '0 2px 20px rgba(0,0,0,0.2)',
            letterSpacing: '-0.5px'
          }}>
            Singer课程教学平台
          </h1>
          <p style={{
            fontSize: '18px',
            opacity: 0.95,
            maxWidth: '400px',
            lineHeight: 1.8,
            textShadow: '0 1px 10px rgba(0,0,0,0.1)'
          }}>
            在线编写、运行代码<br />
            轻松完成编程作业<br />
            <span style={{ fontSize: '16px', opacity: 0.8 }}>💻 实时编译 · 📊 可视化 · 🎯 智能评分</span>
          </p>
        </div>

        {/* 底部装饰点 */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          display: 'flex',
          gap: '12px'
        }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              animation: `pulse 2s ease-in-out infinite ${i * 0.3}s`
            }} />
          ))}
        </div>
      </div>

      {/* 右侧登录/注册区域 */}
      <div style={{
        width: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        background: '#fff',
        overflowY: 'auto'
      }}>
        <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }}>
            {isRegisterMode ? '创建账户' : '欢迎回来'}
          </h2>
          <p style={{ color: '#666', marginBottom: '32px' }}>
            {isRegisterMode ? '填写信息完成注册' : '请登录您的账户'}
          </p>

          {/* 用户类型切换 */}
          <div style={{
            display: 'flex',
            background: '#f5f5f5',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setUserType('student')}
              style={{
                flex: 1, padding: '12px',
                background: userType === 'student' ? '#fff' : 'transparent',
                border: 'none', borderRadius: '10px',
                fontWeight: '500', cursor: 'pointer',
                color: userType === 'student' ? '#667eea' : '#666',
                boxShadow: userType === 'student' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              👨‍🎓 学生登录
            </button>
            <button
              onClick={() => setUserType('teacher')}
              style={{
                flex: 1, padding: '12px',
                background: userType === 'teacher' ? '#fff' : 'transparent',
                border: 'none', borderRadius: '10px',
                fontWeight: '500', cursor: 'pointer',
                color: userType === 'teacher' ? '#667eea' : '#666',
                boxShadow: userType === 'teacher' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              👨‍🏫 教师登录
            </button>
          </div>

          {/* 登录表单 */}
          {!isRegisterMode ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                  {userType === 'student' ? '学号' : '用户名'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={userType === 'student' ? '请输入学号' : '请输入用户名'}
                    style={{
                      width: '100%', padding: '14px 16px 14px 48px',
                      border: '2px solid #eee', borderRadius: '12px',
                      fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.3s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>密码</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    style={{
                      width: '100%', padding: '14px 48px 14px 48px',
                      border: '2px solid #eee', borderRadius: '12px',
                      fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.3s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPassword ? <Eye size={18} color="#999" /> : <EyeOff size={18} color="#999" />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '12px 16px', background: '#fff5f5', border: '1px solid #ffccc7',
                  borderRadius: '10px', marginBottom: '20px', color: '#cf1322',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {success && (
                <div style={{
                  padding: '12px 16px', background: '#f6ffed', border: '1px solid #b7eb8f',
                  borderRadius: '10px', marginBottom: '20px', color: '#52c41a',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <AlertCircle size={16} /> {success}
                </div>
              )}

              <button type="submit" disabled={isLoading}
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontSize: '16px', fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'opacity 0.3s'
                }}>
                {isLoading ? (
                  <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> 登录中...</>
                ) : (
                  <><LogIn size={18} /> 登 录</>
                )}
              </button>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <span style={{ color: '#666' }}>还没有账户？</span>
                <button type="button" onClick={switchMode}
                  style={{
                    background: 'none', border: 'none', color: '#667eea',
                    fontWeight: '600', cursor: 'pointer', marginLeft: '8px',
                    textDecoration: 'underline'
                  }}>
                  立即注册
                </button>
              </div>
            </form>
          ) : (
            /* 注册表单 */
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                  {userType === 'student' ? '学号' : '用户名'} <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                    placeholder={userType === 'student' ? '请输入学号' : '请输入用户名'}
                    style={{
                      width: '100%', padding: '12px 16px 12px 48px',
                      border: '2px solid #eee', borderRadius: '12px',
                      fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.3s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                  姓名 <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    placeholder="请输入真实姓名"
                    style={{
                      width: '100%', padding: '12px 16px 12px 48px',
                      border: '2px solid #eee', borderRadius: '12px',
                      fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.3s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                  密码 <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    placeholder="至少6位密码"
                    style={{
                      width: '100%', padding: '12px 48px 12px 48px',
                      border: '2px solid #eee', borderRadius: '12px',
                      fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.3s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                  <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showRegisterPassword ? <Eye size={18} color="#999" /> : <EyeOff size={18} color="#999" />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                  确认密码 <span style={{ color: '#ff4d4f' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    placeholder="再次输入密码"
                    style={{
                      width: '100%', padding: '12px 48px 12px 48px',
                      border: '2px solid #eee', borderRadius: '12px',
                      fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.3s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showConfirmPassword ? <Eye size={18} color="#999" /> : <EyeOff size={18} color="#999" />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>邮箱</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    placeholder="选填：your@email.com"
                    style={{
                      width: '100%', padding: '12px 16px 12px 48px',
                      border: '2px solid #eee', borderRadius: '12px',
                      fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.3s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>手机号</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    placeholder="选填：手机号码"
                    style={{
                      width: '100%', padding: '12px 16px 12px 48px',
                      border: '2px solid #eee', borderRadius: '12px',
                      fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.3s', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '12px 16px', background: '#fff5f5', border: '1px solid #ffccc7',
                  borderRadius: '10px', marginBottom: '16px', color: '#cf1322',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {success && (
                <div style={{
                  padding: '12px 16px', background: '#f6ffed', border: '1px solid #b7eb8f',
                  borderRadius: '10px', marginBottom: '16px', color: '#52c41a',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <AlertCircle size={16} /> {success}
                </div>
              )}

              <button type="submit" disabled={isLoading}
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontSize: '16px', fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'opacity 0.3s'
                }}>
                {isLoading ? (
                  <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> 注册中...</>
                ) : (
                  <><UserPlus size={18} /> 注 册</>
                )}
              </button>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <span style={{ color: '#666' }}>已有账户？</span>
                <button type="button" onClick={switchMode}
                  style={{
                    background: 'none', border: 'none', color: '#667eea',
                    fontWeight: '600', cursor: 'pointer', marginLeft: '8px',
                    textDecoration: 'underline'
                  }}>
                  立即登录
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
