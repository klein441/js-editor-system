import React, { useState, useEffect } from 'react';
import { 
  Users, Database, BookOpen, CheckCircle, Plus, Edit2, Trash2,
  Upload, Play, FileCode, Search, Filter, ChevronDown, MoreVertical,
  Home, LogOut as LogOutIcon, User, Settings, Bell, MessageCircle, FileText, Calendar
} from 'lucide-react';

// 工具函数：生成头像颜色
const getAvatarColor = (name) => {
  const colors = ['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac', '#f687b3', '#4299e1'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// 工具函数：格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 工具函数：检查是否已截止
const isOverdue = (deadline) => {
  return new Date(deadline) < new Date();
};

// 学生名单管理组件
const StudentManager = ({ students, setStudents }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addForm, setAddForm] = useState({ id: '', name: '', class: '', email: '', phone: '', password: '' });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const newStudents = lines.map(line => {
        const parts = line.split(/,|，|\t/);
        if(parts.length >= 2) {
          return { id: parts[0].trim(), name: parts[1].trim(), class: parts[2]?.trim() || '未分配', avatar: '👨‍🎓' };
        }
        return null;
      }).filter(Boolean);
      
      const currentIds = new Set(students.map(s => s.id));
      const validNew = newStudents.filter(s => !currentIds.has(s.id));
      setStudents([...students, ...validNew]);
      alert(`解析完成，新增 ${validNew.length} 名学生`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/${deleteTarget}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setStudents(students.filter(s => s.id !== deleteTarget));
        setShowDeleteModal(false);
        setDeleteTarget(null);
      }
    } catch (error) {
      console.error('删除学生失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleBatchDelete = () => {
    if(selectedIds.length === 0) return;
    if(window.confirm(`确定删除选中的 ${selectedIds.length} 名学生吗？`)) {
      setStudents(students.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    }
  };

  const startEdit = (student) => {
    setEditForm({...student, password: ''});
    setShowEditModal(true);
  };

  const handleAddStudent = async () => {
    if (!addForm.id || !addForm.name || !addForm.password) {
      alert('请填写学号、姓名和密码');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      
      if (response.ok) {
        const newStudent = await response.json();
        setStudents([...students, newStudent]);
        setShowAddModal(false);
        setAddForm({ id: '', name: '', class: '', email: '', phone: '', password: '' });
        alert('✅ 学生添加成功！');
      } else {
        const error = await response.json();
        alert(`❌ 添加失败：${error.error}`);
      }
    } catch (error) {
      console.error('添加学生失败:', error);
      alert('添加失败，请重试');
    }
  };

  const handleUpdateStudent = async () => {
    if (!editForm.name) {
      alert('请填写姓名');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/students/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        setStudents(students.map(s => s.id === editForm.id ? editForm : s));
        setShowEditModal(false);
        alert('✅ 学生信息更新成功！');
      } else {
        const error = await response.json();
        alert(`❌ 更新失败：${error.error}`);
      }
    } catch (error) {
      console.error('更新学生失败:', error);
      alert('更新失败，请重试');
    }
  };

  const saveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/students/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        setStudents(students.map(s => s.id === editingId ? editForm : s));
        setEditingId(null);
      }
    } catch (error) {
      console.error('更新学生失败:', error);
      alert('更新失败，请重试');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.includes(searchQuery) || 
    s.id.includes(searchQuery) || 
    s.class.includes(searchQuery)
  );

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* 工具栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        {/* 左侧：搜索和筛选 */}
        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="搜索学号、姓名或班级..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        {/* 右侧：操作按钮 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5568d3'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#667eea'}>
            <Plus size={16}/> 添加学生
          </button>
          <label style={{
            padding: '10px 16px',
            background: '#16a34a',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}>
            <Upload size={16}/> 导入CSV
            <input type="file" accept=".csv" style={{display:'none'}} onChange={handleFileUpload}/>
          </label>
          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.length===0}
            style={{
              padding: '10px 16px',
              background: selectedIds.length ? '#ef4444' : '#e5e7eb',
              color: selectedIds.length ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedIds.length ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => selectedIds.length && (e.currentTarget.style.background = '#dc2626')}
            onMouseLeave={(e) => selectedIds.length && (e.currentTarget.style.background = '#ef4444')}>
            批量删除 {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f9fafb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', color: '#666' }}>
          共 <span style={{ fontWeight: '600', color: '#1a1a2e' }}>{filteredStudents.length}</span> 名学生
          {searchQuery && ` (从 ${students.length} 名中筛选)`}
        </div>
        {selectedIds.length > 0 && (
          <div style={{ fontSize: '14px', color: '#667eea', fontWeight: '500' }}>
            已选择 {selectedIds.length} 名学生
          </div>
        )}
      </div>

      {/* 表格 */}
      {filteredStudents.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{padding:'14px', textAlign: 'left', width: '50px'}}>
                <input
                  type="checkbox"
                  onChange={e => setSelectedIds(e.target.checked ? filteredStudents.map(s=>s.id) : [])}
                  checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>学号</th>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>姓名</th>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>班级</th>
              <th style={{padding:'14px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#6b7280', width: '150px'}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr
                key={s.id}
                style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                <td style={{padding:'14px'}}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={e => {
                      if(e.target.checked) setSelectedIds([...selectedIds, s.id]);
                      else setSelectedIds(selectedIds.filter(id => id !== s.id));
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{padding:'14px', fontSize: '14px', color: '#6b7280'}}>{s.id}</td>
                <td style={{padding:'14px'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: getAvatarColor(s.name),
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {s.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>{s.name}</span>
                  </div>
                </td>
                <td style={{padding:'14px'}}>
                  <span style={{
                    padding: '4px 12px',
                    background: '#ede9fe',
                    color: '#7c3aed',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {s.class}
                  </span>
                </td>
                <td style={{padding:'14px', textAlign: 'right'}}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => startEdit(s)}
                      style={{
                        padding: '6px 12px',
                        background: '#dbeafe',
                        color: '#1e40af',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'background 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}>
                      <Edit2 size={14} /> 编辑
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'background 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
                      <Trash2 size={14} /> 删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        /* Empty State */
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9ca3af'
        }}>
          <Users size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            {searchQuery ? '未找到匹配的学生' : '暂无学生数据'}
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
            {searchQuery ? '尝试使用其他关键词搜索' : '点击上方"导入名单"按钮添加学生'}
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '400px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trash2 size={24} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
                  确认删除
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
                  此操作无法撤销
                </p>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.6 }}>
              确定要删除该学生吗？删除后，该学生的所有作业提交记录也将被清除。
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}>
                取消
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '10px 20px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加学生模态框 */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '16px',
            width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '600', color: '#1a1a2e' }}>
              添加学生
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  学号 *
                </label>
                <input
                  value={addForm.id}
                  onChange={(e) => setAddForm({...addForm, id: e.target.value})}
                  placeholder="请输入学号"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  姓名 *
                </label>
                <input
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  placeholder="请输入姓名"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  班级
                </label>
                <input
                  value={addForm.class}
                  onChange={(e) => setAddForm({...addForm, class: e.target.value})}
                  placeholder="请输入班级"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  placeholder="请输入邮箱"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  手机号
                </label>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                  placeholder="请输入手机号"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  密码 *
                </label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                  placeholder="请输入密码（至少6位）"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm({ id: '', name: '', class: '', email: '', phone: '', password: '' });
                }}
                style={{
                  padding: '10px 20px', background: '#f3f4f6', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#6b7280'
                }}>
                取消
              </button>
              <button
                onClick={handleAddStudent}
                style={{
                  padding: '10px 20px', background: '#667eea', color: 'white', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'
                }}>
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑学生模态框 */}
      {showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '16px',
            width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '600', color: '#1a1a2e' }}>
              编辑学生信息
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  学号
                </label>
                <input
                  value={editForm.id}
                  disabled
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', background: '#f9fafb',
                    color: '#9ca3af', boxSizing: 'border-box'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  学号不可修改
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  姓名 *
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="请输入姓名"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  班级
                </label>
                <input
                  value={editForm.class}
                  onChange={(e) => setEditForm({...editForm, class: e.target.value})}
                  placeholder="请输入班级"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  邮箱
                </label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  placeholder="请输入邮箱"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  手机号
                </label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="请输入手机号"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                  新密码（不修改请留空）
                </label>
                <input
                  type="password"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  placeholder="请输入新密码（至少6位）"
                  style={{
                    width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                    borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '10px 20px', background: '#f3f4f6', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#6b7280'
                }}>
                取消
              </button>
              <button
                onClick={handleUpdateStudent}
                style={{
                  padding: '10px 20px', background: '#667eea', color: 'white', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500'
                }}>
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 代码库管理组件
const CodeRepository = ({ repo, setRepo, onOpenEditor }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [newSnippet, setNewSnippet] = useState({ title: '', category: 'HTML/CSS', content: '' });
  const [filter, setFilter] = useState('');

  const addSnippet = async () => {
    if(!newSnippet.title) return alert('请输入标题');
    if(!newSnippet.content) return alert('请输入代码内容');
    
    try {
      if(editingSnippet) {
        const response = await fetch(`http://localhost:5000/api/code-library/${editingSnippet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSnippet)
        });
        
        if (response.ok) {
          setRepo(repo.map(r => r.id === editingSnippet.id ? { ...newSnippet, id: editingSnippet.id } : r));
        }
      } else {
        const response = await fetch('http://localhost:5000/api/code-library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newSnippet, teacher_id: 1 })
        });
        
        if (response.ok) {
          const newCode = await response.json();
          setRepo([...repo, newCode]);
        }
      }
      
      setShowModal(false);
      setEditingSnippet(null);
      setNewSnippet({ title: '', category: 'HTML/CSS', content: '' });
    } catch (error) {
      console.error('保存代码片段失败:', error);
      alert('保存失败，请重试');
    }
  };

  const deleteSnippet = async (id) => {
    if(window.confirm('删除此代码片段？')) {
      try {
        const response = await fetch(`http://localhost:5000/api/code-library/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setRepo(repo.filter(r => r.id !== id));
        }
      } catch (error) {
        console.error('删除代码片段失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const startEdit = (item) => {
    setEditingSnippet(item);
    setNewSnippet({ title: item.title, category: item.category, content: item.content });
    setShowModal(true);
  };

  const openInEditor = (item) => {
    let fileName = 'index.html';
    if(item.category.includes('JavaScript') || item.category.includes('算法')) {
      fileName = 'script.js';
    } else if(item.category.includes('CSS')) {
      fileName = 'style.css';
    } else if(item.category.includes('React')) {
      fileName = 'App.jsx';
    }

    onOpenEditor({
      mode: 'repo_view',
      initialFiles: { [fileName]: item.content },
      projectName: `代码库 - ${item.title}`,
      onSave: (updatedFiles) => {
        const updatedContent = updatedFiles[fileName] || item.content;
        setRepo(repo.map(r => r.id === item.id ? { ...r, content: updatedContent } : r));
        alert('✅ 代码已保存到代码库');
      }
    });
  };

  const getCategoryIcon = (category) => {
    if (category.includes('HTML')) return '📄';
    if (category.includes('CSS')) return '🎨';
    if (category.includes('JavaScript')) return '⚡';
    if (category.includes('React')) return '⚛️';
    if (category.includes('算法')) return '🧮';
    return '💻';
  };

  const filteredRepo = repo.filter(r => r.title.includes(filter) || r.category.includes(filter));

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
            代码库
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
            共 {repo.length} 个代码片段
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              placeholder="搜索代码..." 
              value={filter} 
              onChange={e=>setFilter(e.target.value)} 
              style={{
                padding:'10px 12px 10px 40px', 
                borderRadius:'8px', 
                border:'2px solid #e5e7eb', 
                width:'250px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <button 
            onClick={() => { setEditingSnippet(null); setNewSnippet({ title: '', category: 'HTML/CSS', content: '' }); setShowModal(true); }} 
            style={{ 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              display:'flex', 
              alignItems:'center', 
              gap:'6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
            <Plus size={16}/> 添加代码
          </button>
        </div>
      </div>

      {/* 代码卡片列表 */}
      {filteredRepo.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9ca3af'
        }}>
          <Database size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            {filter ? '未找到匹配的代码' : '暂无代码片段'}
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            {filter ? '尝试使用其他关键词搜索' : '点击上方"添加代码"按钮创建第一个代码片段'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredRepo.map(item => (
            <div 
              key={item.id} 
              style={{ 
                background: '#f9fafb', 
                borderRadius: '12px', 
                padding: '20px', 
                border: '1px solid #e5e7eb', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              {/* 头部 */}
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>{getCategoryIcon(item.category)}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {item.category}
                  </div>
                </div>
              </div>

              {/* 代码预览 */}
              <div style={{ 
                background: '#1f2937', 
                color: '#d1d5db', 
                padding: '12px', 
                borderRadius: '8px', 
                height: '100px', 
                overflow: 'hidden', 
                fontSize: '12px', 
                fontFamily: 'monospace', 
                marginBottom:'16px', 
                lineHeight: '1.5',
                position: 'relative'
              }}>
                {item.content.slice(0, 200)}...
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '30px',
                  background: 'linear-gradient(transparent, #1f2937)'
                }} />
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button 
                  onClick={() => openInEditor(item)} 
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#dcfce7',
                    color: '#16a34a',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#bbf7d0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#dcfce7'}>
                  <Edit2 size={14}/> 编辑
                </button>
                <button 
                  onClick={() => startEdit(item)} 
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}>
                  <FileCode size={14}/> 修改
                </button>
                <button 
                  onClick={() => deleteSnippet(item.id)} 
                  style={{
                    padding: '10px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.3s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            width: '700px', 
            maxHeight: '85vh', 
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 头部 */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'white' }}>
                {editingSnippet ? '编辑代码片段' : '添加代码片段'}
              </h3>
            </div>

            {/* 内容 */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{display:'block', marginBottom:'8px', fontWeight:'500', fontSize: '14px'}}>标题</label>
                <input 
                  style={{
                    width:'100%', 
                    padding:'10px', 
                    border:'2px solid #e5e7eb', 
                    borderRadius:'8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }} 
                  value={newSnippet.title} 
                  onChange={e=>setNewSnippet({...newSnippet, title:e.target.value})} 
                  placeholder="例如：响应式导航栏"
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{display:'block', marginBottom:'8px', fontWeight:'500', fontSize: '14px'}}>分类</label>
                <select 
                  style={{
                    width:'100%', 
                    padding:'10px', 
                    border:'2px solid #e5e7eb', 
                    borderRadius:'8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }} 
                  value={newSnippet.category} 
                  onChange={e=>setNewSnippet({...newSnippet, category:e.target.value})}>
                  <option>HTML/CSS</option>
                  <option>JavaScript</option>
                  <option>React</option>
                  <option>算法</option>
                  <option>其他</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{display:'block', marginBottom:'8px', fontWeight:'500', fontSize: '14px'}}>代码内容</label>
                <textarea 
                  style={{
                    width:'100%', 
                    height:'300px', 
                    padding:'12px', 
                    fontFamily:'monospace', 
                    fontSize:'13px', 
                    border:'2px solid #e5e7eb', 
                    borderRadius:'8px', 
                    lineHeight:'1.5',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }} 
                  value={newSnippet.content} 
                  onChange={e=>setNewSnippet({...newSnippet, content:e.target.value})}
                  placeholder="在此输入代码..."
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* 底部按钮 */}
            <div style={{ 
              padding: '16px 32px', 
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                onClick={() => { setShowModal(false); setEditingSnippet(null); }} 
                style={{
                  padding:'10px 20px', 
                  border:'none', 
                  background:'white',
                  borderRadius:'8px', 
                  cursor:'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb'
                }}>
                取消
              </button>
              <button 
                onClick={addSnippet} 
                style={{
                  padding:'10px 20px', 
                  background:'#667eea', 
                  color:'white', 
                  border:'none', 
                  borderRadius:'8px', 
                  cursor:'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                {editingSnippet ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 课件管理组件
const CoursewareManagement = () => {
  const [courseware, setCourseware] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'HTML基础',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCourseware();
  }, []);

  const fetchCourseware = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courseware');
      if (response.ok) {
        const data = await response.json();
        setCourseware(data);
      }
    } catch (error) {
      console.error('加载课件失败:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件大小 (50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('文件大小不能超过50MB');
        e.target.value = '';
        return;
      }
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title) {
      alert('请输入课件标题');
      return;
    }
    if (!uploadForm.file) {
      alert('请选择要上传的文件');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('category', uploadForm.category);
    formData.append('teacher_id', 1);

    try {
      const response = await fetch('http://localhost:5000/api/courseware', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('✅ 课件上传成功！');
        setShowUploadModal(false);
        setUploadForm({ title: '', description: '', category: 'HTML基础', file: null });
        fetchCourseware();
      } else {
        const error = await response.json();
        alert(`❌ 上传失败：${error.error}`);
      }
    } catch (error) {
      console.error('上传课件失败:', error);
      alert('❌ 上传失败，请检查网络连接');
    }

    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个课件吗？')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/courseware/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ 课件已删除');
        fetchCourseware();
      }
    } catch (error) {
      console.error('删除课件失败:', error);
      alert('❌ 删除失败');
    }
  };

  const formatFileSize = (bytes) => {
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

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
            课件库
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
            共 {courseware.length} 个课件
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
          <Upload size={16} /> 上传课件
        </button>
      </div>

      {/* 课件列表 */}
      {courseware.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9ca3af'
        }}>
          <FileText size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            暂无课件
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            点击上方"上传课件"按钮添加课件
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {courseware.map(item => (
            <div key={item.id} style={{
              background: '#f9fafb',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>{getFileIcon(item.fileType)}</div>
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

              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                <span>👁️ {item.viewCount} 次查看</span>
                <span>⬇️ {item.downloadCount} 次下载</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`http://localhost:5000${item.filePath}`}
                  download={item.fileName}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'block'
                  }}>
                  下载
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    padding: '8px 12px',
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
            </div>
          ))}
        </div>
      )}

      {/* 上传模态框 */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={() => !uploading && setShowUploadModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '600' }}>
              上传课件
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                课件标题 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="例如：HTML基础教程"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                课件描述
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="简要描述课件内容..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                课件分类
              </label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}>
                <option>HTML基础</option>
                <option>CSS进阶</option>
                <option>JavaScript</option>
                <option>React框架</option>
                <option>其他</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                选择文件 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                支持 PDF、PPT、PPTX、DOC、DOCX 格式，最大50MB
              </div>
              {uploadForm.file && (
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#667eea' }}>
                  ✓ 已选择：{uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}>
                取消
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  padding: '10px 20px',
                  background: uploading ? '#9ca3af' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                {uploading ? '上传中...' : '确认上传'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 在线答疑管理组件
const QAManagement = ({ students }) => {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unanswered, answered
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // 加载问题列表
  React.useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      console.log('教师端：正在加载所有问题...');
      const response = await fetch('http://localhost:5000/api/qa/questions');
      
      if (response.ok) {
        const data = await response.json();
        console.log('教师端：加载成功，问题数量:', data.length);
        setQuestions(data);
      } else {
        console.error('教师端：加载失败，状态码:', response.status);
      }
    } catch (error) {
      console.error('教师端：加载问题失败:', error);
      // 使用模拟数据（离线模式）
      setQuestions([
        {
          id: 1,
          studentId: '2021001',
          studentName: '张三',
          question: '示例问题：HTML的语义化标签有哪些？',
          answer: null,
          createdAt: new Date().toISOString(),
          answeredAt: null
        },
        {
          id: 2,
          studentId: '2021002',
          studentName: '李四',
          question: '示例问题：CSS的盒模型是什么？',
          answer: '这是示例回复。请确保后端服务已启动。',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          answeredAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleReply = async (questionId) => {
    if (!replyText.trim()) {
      alert('请输入回复内容');
      return;
    }

    console.log('教师端：准备回复问题', { questionId, answer: replyText });

    try {
      const response = await fetch(`http://localhost:5000/api/qa/questions/${questionId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answer: replyText,
          teacherId: 1 // 可以从user对象获取
        })
      });

      if (response.ok) {
        console.log('教师端：回复成功');
        setQuestions(questions.map(q => 
          q.id === questionId 
            ? { ...q, answer: replyText, answeredAt: new Date().toISOString() }
            : q
        ));
        setReplyingTo(null);
        setReplyText('');
        alert('✅ 回复成功！学生可以看到您的回复了。');
      } else {
        const errorData = await response.json();
        console.error('教师端：回复失败', errorData);
        alert(`❌ 回复失败：${errorData.error || '请重试'}`);
      }
    } catch (error) {
      console.error('教师端：回复失败', error);
      // 离线模式
      setQuestions(questions.map(q => 
        q.id === questionId 
          ? { ...q, answer: replyText, answeredAt: new Date().toISOString() }
          : q
      ));
      setReplyingTo(null);
      setReplyText('');
      alert('⚠️ 后端服务未连接，回复已保存到本地。\n\n请确保后端服务已启动。');
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'answered') return q.answer;
    if (filter === 'unanswered') return !q.answer;
    return true;
  });

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* 筛选器 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button 
          onClick={() => setFilter('all')}
          style={{
            padding: '10px 16px',
            background: filter === 'all' ? '#667eea' : '#f3f4f6',
            color: filter === 'all' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}>
          全部 ({questions.length})
        </button>
        <button 
          onClick={() => setFilter('unanswered')}
          style={{
            padding: '10px 16px',
            background: filter === 'unanswered' ? '#f59e0b' : '#f3f4f6',
            color: filter === 'unanswered' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}>
          待回复 ({questions.filter(q => !q.answer).length})
        </button>
        <button 
          onClick={() => setFilter('answered')}
          style={{
            padding: '10px 16px',
            background: filter === 'answered' ? '#16a34a' : '#f3f4f6',
            color: filter === 'answered' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s'
          }}>
          已回复 ({questions.filter(q => q.answer).length})
        </button>
      </div>

      {/* 问题列表 */}
      {filteredQuestions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9ca3af'
        }}>
          <MessageCircle size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            {filter === 'all' && '暂无学生提问'}
            {filter === 'answered' && '暂无已回复问题'}
            {filter === 'unanswered' && '暂无待回复问题'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredQuestions.map(q => {
            const student = students.find(s => s.id === q.studentId);
            return (
              <div key={q.id} style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                {/* 学生信息 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: getAvatarColor(q.studentName),
                    color: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: '600', fontSize: '18px'
                  }}>
                    {q.studentName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1a1a2e', marginBottom: '2px' }}>
                      {q.studentName}
                      <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '8px' }}>
                        ({q.studentId})
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {formatDateTime(q.createdAt)}
                    </div>
                  </div>
                  {q.answer ? (
                    <span style={{
                      padding: '6px 12px',
                      background: '#dcfce7',
                      color: '#16a34a',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      ✓ 已回复
                    </span>
                  ) : (
                    <span style={{
                      padding: '6px 12px',
                      background: '#fef3c7',
                      color: '#f59e0b',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      ⏳ 待回复
                    </span>
                  )}
                </div>

                {/* 问题内容 */}
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '12px',
                  borderLeft: '3px solid #667eea'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#667eea', marginBottom: '8px' }}>
                    学生提问：
                  </div>
                  <div style={{ color: '#374151', lineHeight: 1.6, fontSize: '15px' }}>
                    {q.question}
                  </div>
                </div>

                {/* 回复内容或回复框 */}
                {q.answer ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '16px',
                    borderLeft: '3px solid #16a34a'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#16a34a', marginBottom: '8px' }}>
                      您的回复：
                    </div>
                    <div style={{ color: '#374151', lineHeight: 1.6, fontSize: '15px' }}>
                      {q.answer}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                      回复时间：{formatDateTime(q.answeredAt)}
                    </div>
                  </div>
                ) : replyingTo === q.id ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '16px'
                  }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="输入您的回复..."
                      rows={4}
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
                        marginBottom: '12px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#6b7280',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                        取消
                      </button>
                      <button
                        onClick={() => handleReply(q.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#16a34a',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                        提交回复
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(q.id)}
                    style={{
                      padding: '10px 20px',
                      background: '#16a34a',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#15803d'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#16a34a'}>
                    <MessageCircle size={16} /> 回复学生
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 作业批改组件
const SubmissionReview = ({ submissions, students, assignments, onOpenEditor, onScoreUpdate }) => {
  const [scoringSubmission, setScoringSubmission] = useState(null);
  const [scoreForm, setScoreForm] = useState({ score: '', comment: '' });
  const [filter, setFilter] = useState('all'); // all, reviewed, unreviewed

  const handleScoreSubmit = async () => {
    // 验证分数输入
    const score = parseFloat(scoreForm.score);
    if (isNaN(score) || score < 0 || score > 100) {
      alert('请输入有效的分数（0-100）');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/submissions/${scoringSubmission.id}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: score,
          comment: scoreForm.comment || ''
        })
      });

      if (response.ok) {
        onScoreUpdate(scoringSubmission.id, score, scoreForm.comment || '');
        setScoringSubmission(null);
        setScoreForm({ score: '', comment: '' });
        alert('✅ 批改成功！');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '批改失败');
      }
    } catch (error) {
      console.error('批改失败:', error);
      alert('❌ 批改失败：' + error.message);
    }
  };

  const openScoreModal = (submission) => {
    setScoringSubmission(submission);
    setScoreForm({
      score: submission.score || '',
      comment: submission.comment || ''
    });
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'reviewed') return sub.reviewed;
    if (filter === 'unreviewed') return !sub.reviewed;
    return true;
  });

  const getScoreColor = (score) => {
    if (score >= 90) return { color: '#16a34a', bg: '#f0fdf4' };
    if (score >= 80) return { color: '#0e639c', bg: '#dbeafe' };
    if (score >= 60) return { color: '#f59e0b', bg: '#fef3c7' };
    return { color: '#ef4444', bg: '#fee2e2' };
  };

  const getStatusStyle = (reviewed) => {
    if (reviewed) {
      return {
        bg: '#f0fdf4',
        color: '#16a34a',
        text: '✓ 已批改'
      };
    }
    return {
      bg: '#fef3c7',
      color: '#f59e0b',
      text: '⏳ 待批改'
    };
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
      {/* 筛选器 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            background: filter === 'all' ? '#0e639c' : '#f3f4f6',
            color: filter === 'all' ? 'white' : '#666',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          全部 ({submissions.length})
        </button>
        <button 
          onClick={() => setFilter('unreviewed')}
          style={{
            padding: '8px 16px',
            background: filter === 'unreviewed' ? '#f59e0b' : '#f3f4f6',
            color: filter === 'unreviewed' ? 'white' : '#666',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          待批改 ({submissions.filter(s => !s.reviewed).length})
        </button>
        <button 
          onClick={() => setFilter('reviewed')}
          style={{
            padding: '8px 16px',
            background: filter === 'reviewed' ? '#16a34a' : '#f3f4f6',
            color: filter === 'reviewed' ? 'white' : '#666',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          已批改 ({submissions.filter(s => s.reviewed).length})
        </button>
      </div>

      {filteredSubmissions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9ca3af'
        }}>
          <CheckCircle size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            {filter === 'all' && '暂无学生提交'}
            {filter === 'reviewed' && '暂无已批改作业'}
            {filter === 'unreviewed' && '暂无待批改作业'}
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            {filter === 'all' && '学生提交作业后会显示在这里'}
            {filter === 'reviewed' && '已批改的作业会显示在这里'}
            {filter === 'unreviewed' && '等待批改的作业会显示在这里'}
          </div>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{background:'#f9fafb', borderBottom: '2px solid #e5e7eb'}}>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>学生</th>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>班级</th>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>作业</th>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>提交时间</th>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>分数</th>
              <th style={{padding:'14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>状态</th>
              <th style={{padding:'14px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: '#6b7280'}}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map(sub => {
              const student = students.find(s => s.id === sub.studentId);
              const assignment = assignments.find(a => a.id === sub.assignmentId);
              const scoreStyle = sub.score !== null && sub.score !== undefined ? getScoreColor(sub.score) : null;
              const statusStyle = getStatusStyle(sub.reviewed);
              
              return (
                <tr
                  key={sub.id}
                  style={{borderBottom:'1px solid #f3f4f6', transition: 'background 0.2s'}}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{padding:'14px'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: getAvatarColor(student?.name || 'S'),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {student?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {student?.name}
                        </div>
                        <div style={{color:'#9ca3af', fontSize:'12px'}}>
                          {student?.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'14px'}}>
                    <span style={{
                      padding: '4px 12px',
                      background: '#ede9fe',
                      color: '#7c3aed',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {student?.class}
                    </span>
                  </td>
                  <td style={{padding:'14px', fontSize: '14px', color: '#374151', fontWeight: '500'}}>
                    {assignment?.title}
                  </td>
                  <td style={{padding:'14px', fontSize:'13px', color:'#6b7280'}}>
                    {formatDateTime(sub.timestamp)}
                  </td>
                  <td style={{padding:'14px'}}>
                    {scoreStyle ? (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        background: scoreStyle.bg,
                        borderRadius: '8px'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: scoreStyle.color
                        }}>
                          {sub.score}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          color: scoreStyle.color,
                          marginLeft: '2px',
                          fontWeight: '500'
                        }}>
                          分
                        </span>
                      </div>
                    ) : (
                      <span style={{color:'#9ca3af', fontSize:'13px'}}>未批改</span>
                    )}
                  </td>
                  <td style={{padding:'14px'}}>
                    <span style={{
                      padding: '6px 12px',
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {statusStyle.text}
                    </span>
                  </td>
                  <td style={{padding:'14px', textAlign: 'right'}}>
                    <div style={{display:'flex', gap:'8px', justifyContent: 'flex-end'}}>
                      <button 
                        onClick={() => onOpenEditor({
                          mode: 'teacher_review',
                          initialFiles: sub.files,
                          projectName: `${student?.name} - ${assignment?.title}`,
                        })}
                        style={{
                          padding:'8px 14px',
                          background:'#dbeafe',
                          color:'#1e40af',
                          border:'none',
                          borderRadius:'8px',
                          cursor:'pointer',
                          display:'flex',
                          alignItems:'center',
                          gap:'6px',
                          fontSize:'13px',
                          fontWeight: '500',
                          transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}>
                        <Play size={14}/> 查看代码
                      </button>
                      <button 
                        onClick={() => openScoreModal(sub)}
                        style={{
                          padding:'8px 14px',
                          background: sub.reviewed ? '#f3f4f6' : '#dcfce7',
                          color: sub.reviewed ? '#6b7280' : '#16a34a',
                          border:'none',
                          borderRadius:'8px',
                          cursor:'pointer',
                          fontSize:'13px',
                          fontWeight: '500',
                          transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          if (sub.reviewed) {
                            e.currentTarget.style.background = '#e5e7eb';
                          } else {
                            e.currentTarget.style.background = '#bbf7d0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = sub.reviewed ? '#f3f4f6' : '#dcfce7';
                        }}>
                        {sub.reviewed ? '修改分数' : '打分'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* 打分模态框 */}
      {scoringSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{marginTop:0, marginBottom:'20px', fontSize:'20px'}}>
              批改作业
            </h3>

            <div style={{marginBottom:'16px', padding:'12px', background:'#f9fafb', borderRadius:'8px'}}>
              <div style={{fontSize:'14px', color:'#666', marginBottom:'4px'}}>学生</div>
              <div style={{fontSize:'16px', fontWeight:'500'}}>
                {students.find(s => s.id === scoringSubmission.studentId)?.name}
              </div>
            </div>

            <div style={{marginBottom:'16px', padding:'12px', background:'#f9fafb', borderRadius:'8px'}}>
              <div style={{fontSize:'14px', color:'#666', marginBottom:'4px'}}>作业</div>
              <div style={{fontSize:'16px', fontWeight:'500'}}>
                {assignments.find(a => a.id === scoringSubmission.assignmentId)?.title}
              </div>
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block', marginBottom:'8px', fontWeight:'500', fontSize:'14px'}}>
                分数 (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={scoreForm.score}
                onChange={(e) => setScoreForm({...scoreForm, score: e.target.value})}
                placeholder="请输入分数"
                style={{
                  width:'100%',
                  padding:'12px',
                  border:'2px solid #e5e7eb',
                  borderRadius:'8px',
                  fontSize:'16px',
                  outline:'none',
                  boxSizing:'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0e639c'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block', marginBottom:'8px', fontWeight:'500', fontSize:'14px'}}>
                评语（可选）
              </label>
              <textarea
                value={scoreForm.comment}
                onChange={(e) => setScoreForm({...scoreForm, comment: e.target.value})}
                placeholder="写下你的评语..."
                rows={4}
                style={{
                  width:'100%',
                  padding:'12px',
                  border:'2px solid #e5e7eb',
                  borderRadius:'8px',
                  fontSize:'14px',
                  outline:'none',
                  resize:'vertical',
                  fontFamily:'inherit',
                  boxSizing:'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0e639c'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:'12px'}}>
              <button
                onClick={() => {
                  setScoringSubmission(null);
                  setScoreForm({ score: '', comment: '' });
                }}
                style={{
                  padding:'10px 20px',
                  background:'#f3f4f6',
                  border:'none',
                  borderRadius:'8px',
                  cursor:'pointer',
                  fontSize:'14px',
                  fontWeight:'500'
                }}
              >
                取消
              </button>
              <button
                onClick={handleScoreSubmit}
                style={{
                  padding:'10px 20px',
                  background:'#16a34a',
                  color:'white',
                  border:'none',
                  borderRadius:'8px',
                  cursor:'pointer',
                  fontSize:'14px',
                  fontWeight:'500'
                }}
              >
                提交批改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 作业布置组件（卡片式风格）
const AssignmentManager = ({ assignments, setAssignments, repo, students }) => {
  const [showModal, setShowModal] = useState(false);
  const [newAssign, setNewAssign] = useState({ title: '', requirements: '', deadline: '', linkedCodeId: '', targetClass: '所有班级' });

  const handleCreate = async () => {
    if(!newAssign.title) return alert('请输入标题');
    
    try {
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAssign, teacher_id: 1 })
      });
      
      if (response.ok) {
        const newAssignment = await response.json();
        
        let template = { 'index.html': '<!-- 默认模板 -->' };
        if (newAssign.linkedCodeId) {
          const code = repo.find(c => c.id === newAssign.linkedCodeId);
          if (code) {
            const fileName = code.category.includes('Java') ? 'script.js' : 'index.html';
            template = { [fileName]: code.content };
          }
        }
        
        setAssignments([...assignments, { ...newAssignment, template }]);
        setShowModal(false);
        setNewAssign({ title: '', requirements: '', deadline: '', linkedCodeId: '', targetClass: '所有班级' });
      }
    } catch (error) {
      console.error('创建作业失败:', error);
      alert('创建失败，请重试');
    }
  };

  const classes = [...new Set(students.map(s => s.class))];

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* 头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
            作业管理
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
            共 {assignments.length} 个作业
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
          <Plus size={16} /> 发布新作业
        </button>
      </div>

      {/* 作业卡片列表 */}
      {assignments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#9ca3af'
        }}>
          <BookOpen size={64} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
            暂无作业
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>
            点击上方"发布新作业"按钮创建第一个作业
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {assignments.map(a => {
            const linkedCode = repo.find(r => r.id === a.linkedCodeId);
            const isExpired = isOverdue(a.deadline);
            
            return (
              <div key={a.id} style={{
                background: '#f9fafb',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                {/* 状态标签 */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '4px 12px',
                  background: isExpired ? '#fee2e2' : '#dcfce7',
                  color: isExpired ? '#dc2626' : '#16a34a',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {isExpired ? '已截止' : '进行中'}
                </div>

                {/* 作业标题 */}
                <div style={{ marginBottom: '12px', paddingRight: '80px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
                    {a.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
                    {a.requirements || '暂无要求说明'}
                  </p>
                </div>

                {/* 作业信息 */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}>
                    <Calendar size={14} />
                    <span>截止：{formatDateTime(a.deadline)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#6b7280'
                  }}>
                    <Users size={14} />
                    <span>面向：{a.targetClass}</span>
                  </div>
                </div>

                {/* 关联代码 */}
                {linkedCode && (
                  <div style={{
                    padding: '10px 12px',
                    background: '#f5f3ff',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FileCode size={16} color='#667eea' />
                    <span style={{ fontSize: '13px', color: '#667eea', fontWeight: '500' }}>
                      关联代码：{linkedCode.title}
                    </span>
                  </div>
                )}

                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={async () => {
                      if(window.confirm('确定删除该作业吗？')) {
                        try {
                          const response = await fetch(`http://localhost:5000/api/assignments/${a.id}`, {
                            method: 'DELETE'
                          });
                          if (response.ok) {
                            setAssignments(assignments.filter(x=>x.id!==a.id));
                          }
                        } catch (error) {
                          console.error('删除作业失败:', error);
                          alert('删除失败，请重试');
                        }
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
                    <Trash2 size={14} /> 删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 发布作业模态框 */}
      {showModal && (
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
        }}
        onClick={() => setShowModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            {/* 头部 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              color: 'white'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                发布新作业
              </h3>
            </div>

            {/* 内容 */}
            <div style={{ padding: '24px', maxHeight: 'calc(80vh - 140px)', overflow: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    作业标题 <span style={{ color: '#ff4d4f' }}>*</span>
                  </label>
                  <input
                    value={newAssign.title}
                    onChange={e=>setNewAssign({...newAssign, title:e.target.value})}
                    placeholder="例如：制作个人主页"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    作业要求
                  </label>
                  <textarea
                    value={newAssign.requirements}
                    onChange={e=>setNewAssign({...newAssign, requirements:e.target.value})}
                    placeholder="请详细描述作业要求..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                      截止时间 <span style={{ color: '#ff4d4f' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={newAssign.deadline}
                      onChange={e=>setNewAssign({...newAssign, deadline:e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                      发布给
                    </label>
                    <select
                      value={newAssign.targetClass}
                      onChange={e=>setNewAssign({...newAssign, targetClass:e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}>
                      <option>所有班级</option>
                      {classes.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    关联代码案例
                  </label>
                  <select
                    value={newAssign.linkedCodeId}
                    onChange={e=>setNewAssign({...newAssign, linkedCodeId:e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}>
                    <option value="">(无 - 使用空白模板)</option>
                    {repo.map(r => <option key={r.id} value={r.id}>{r.title} ({r.category})</option>)}
                  </select>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    学生打开作业时会自动加载选中的代码模板
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                取消
              </button>
              <button
                onClick={handleCreate}
                style={{
                  padding: '10px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                发布作业
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 教师仪表盘主组件
function TeacherDashboard({ data, setData, onOpenEditor, onLogout, user }) {
  const [activeTab, setActiveTab] = useState('assignments');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  const tabLabels = {
    students: '学生名单管理',
    repository: '代码库管理',
    assignments: '作业布置',
    submissions: '学生作业批阅',
    courseware: '课件管理',
    qa: '在线答疑管理'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f3f4f6', fontFamily: 'Arial' }}>
      {/* 侧边栏 */}
      <div style={{ width: '240px', background: '#1f2937', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '30px', display:'flex', alignItems:'center', gap:'10px' }}>
           <div style={{width:'30px', height:'30px', background:'#0e639c', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px'}}>JS</div>
           教学管理系统
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {[
            { id: 'students', icon: <Users size={18}/>, label: '学生名单' },
            { id: 'repository', icon: <Database size={18}/>, label: '代码库管理' },
            { id: 'assignments', icon: <BookOpen size={18}/>, label: '作业布置' },
            { id: 'submissions', icon: <CheckCircle size={18}/>, label: '作业批阅' },
            { id: 'courseware', icon: <FileText size={18}/>, label: '课件管理' },
            { id: 'qa', icon: <MessageCircle size={18}/>, label: '在线答疑' },
          ].map(item => (
            <div 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              style={{ 
                padding: '12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                background: activeTab === item.id ? '#374151' : 'transparent',
                color: activeTab === item.id ? '#60a5fa' : '#9ca3af',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = '#374151';
                  e.currentTarget.style.color = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }
              }}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </div>
        <button onClick={onLogout} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding:'10px', transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
          <LogOutIcon size={18} /> 退出登录
        </button>
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶部导航栏 */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 面包屑导航 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
            <Home size={16} />
            <span>/</span>
            <span style={{ color: '#667eea', fontWeight: '500' }}>{tabLabels[activeTab]}</span>
          </div>

          {/* 右侧用户菜单 */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.3s',
                background: showUserMenu ? '#f3f4f6' : 'transparent'
              }}
              onMouseEnter={(e) => !showUserMenu && (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={(e) => !showUserMenu && (e.currentTarget.style.background = 'transparent')}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {user?.name?.charAt(0) || 'T'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                  {user?.name || '教师'}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>教师账号</div>
              </div>
              <ChevronDown size={16} color="#9ca3af" style={{
                transition: 'transform 0.3s',
                transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </div>

            {/* 下拉菜单 */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                minWidth: '200px',
                zIndex: 1000,
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ padding: '8px' }}>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowProfileModal(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <User size={16} /> 个人资料
                  </button>
                  <button
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      color: '#374151',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <Settings size={16} /> 系统设置
                  </button>
                  <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 0' }} />
                  <button
                    onClick={onLogout}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      color: '#dc2626',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <LogOutIcon size={16} /> 退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 内容区域 */}
        <div style={{ flex: 1, padding: '30px', overflow: 'auto' }}>

        {activeTab === 'students' && (
          <StudentManager 
            students={data.students} 
            setStudents={newS => setData({...data, students: newS})} 
          />
        )}

        {activeTab === 'repository' && (
          <CodeRepository 
            repo={data.codeRepository || []} 
            setRepo={newR => setData({...data, codeRepository: newR})}
            onOpenEditor={onOpenEditor}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentManager 
            assignments={data.assignments} 
            setAssignments={newA => setData({...data, assignments: newA})}
            repo={data.codeRepository || []}
            students={data.students}
          />
        )}

        {activeTab === 'submissions' && (
          <SubmissionReview 
            submissions={data.submissions}
            students={data.students}
            assignments={data.assignments}
            onOpenEditor={onOpenEditor}
            onScoreUpdate={(submissionId, score, comment) => {
              setData({
                ...data,
                submissions: data.submissions.map(s => 
                  s.id === submissionId 
                    ? { ...s, score, comment, reviewed: true, reviewedAt: new Date() }
                    : s
                )
              });
            }}
          />
        )}

        {activeTab === 'courseware' && (
          <CoursewareManagement />
        )}

        {activeTab === 'qa' && (
          <QAManagement 
            students={data.students}
          />
        )}
        </div>

        {/* 个人资料编辑模态框 */}
        {showProfileModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1001
          }}
          onClick={() => !profileSaving && setShowProfileModal(false)}>
            <div style={{
              background: 'white', borderRadius: '16px',
              width: '500px', maxHeight: '80vh', overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}>
              <div style={{
                padding: '24px', borderBottom: '1px solid #e5e7eb'
              }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a1a2e' }}>
                  个人资料设置
                </h2>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                    用户名
                  </label>
                  <input
                    type="text"
                    value={user?.name || user?.username}
                    disabled
                    style={{
                      width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', background: '#f9fafb',
                      color: '#9ca3af', boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    用户名不可修改
                  </div>
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
                      width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none',
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
                      width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none',
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
                      width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                      borderRadius: '8px', fontSize: '14px', outline: 'none',
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
                        width: '100%', padding: '10px', border: '2px solid #e5e7eb',
                        borderRadius: '8px', fontSize: '14px', outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                )}
              </div>

              <div style={{
                padding: '16px 24px', borderTop: '1px solid #e5e7eb',
                display: 'flex', justifyContent: 'flex-end', gap: '12px'
              }}>
                <button
                  onClick={() => setShowProfileModal(false)}
                  disabled={profileSaving}
                  style={{
                    padding: '10px 20px', background: '#f3f4f6',
                    border: 'none', borderRadius: '8px',
                    cursor: profileSaving ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: '500', color: '#6b7280'
                  }}>
                  取消
                </button>
                <button
                  onClick={async () => {
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
                          role: 'teacher',
                          email: profileForm.email,
                          phone: profileForm.phone,
                          password: profileForm.password || undefined
                        })
                      });

                      if (response.ok) {
                        alert('✅ 个人信息更新成功！');
                        setShowProfileModal(false);
                        setProfileForm({...profileForm, password: '', confirmPassword: ''});
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
                    padding: '10px 20px',
                    background: profileSaving ? '#9ca3af' : '#667eea',
                    color: 'white', border: 'none', borderRadius: '8px',
                    cursor: profileSaving ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: '500'
                  }}>
                  {profileSaving ? '保存中...' : '保存修改'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
