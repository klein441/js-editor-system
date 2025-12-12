import React, { useState, useEffect } from 'react';

const SimpleStudentDashboard = ({ user, data, onOpenEditor, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('SimpleStudentDashboard mounted');
    console.log('User:', user);
    console.log('Data:', data);
    setLoading(false);
  }, [user, data]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>加载中...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>错误: {error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 头部 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>学生仪表板</h1>
              <p>欢迎回来，{user?.name || '学生'}！</p>
            </div>
            <button 
              onClick={onLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3>我的作业</h3>
            <p>总作业数: {data?.assignments?.length || 0}</p>
            <p>已完成: {data?.submissions?.filter(s => s.studentId === user?.id)?.length || 0}</p>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3>学习进度</h3>
            <p>本周学习时间: 8.5小时</p>
            <p>平均分数: 85分</p>
          </div>
        </div>

        {/* 作业列表 */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>作业列表</h3>
          {data?.assignments?.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {data.assignments.slice(0, 5).map(assignment => (
                <div key={assignment.id} style={{
                  padding: '15px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4>{assignment.title}</h4>
                    <p>截止时间: {assignment.deadline}</p>
                  </div>
                  <button
                    onClick={() => onOpenEditor && onOpenEditor({
                      assignmentId: assignment.id,
                      title: assignment.title,
                      description: assignment.description,
                      initialCode: assignment.initialCode || ''
                    })}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    开始作业
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>暂无作业</p>
          )}
        </div>

        {/* 调试信息 */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
          fontSize: '12px',
          color: '#666'
        }}>
          <h4>调试信息:</h4>
          <p>用户ID: {user?.id}</p>
          <p>用户角色: {user?.role}</p>
          <p>作业数量: {data?.assignments?.length || 0}</p>
          <p>提交数量: {data?.submissions?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleStudentDashboard;