import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, Plus, Upload, Download, Trash2, X, AlertCircle 
} from 'lucide-react';

const StudentManagement = ({ data, setData }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', class: '', id: '' });
  const fileInputRef = React.useRef(null);

  // 处理Excel文件导入
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 查找表头行
        let headerRowIndex = -1;
        let nameCol = -1, classCol = -1, idCol = -1;

        for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
          const row = jsonData[i];
          if (!row) continue;
          
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || '').trim().toLowerCase();
            if (cell.includes('姓名') || cell === 'name') nameCol = j;
            if (cell.includes('班级') || cell === 'class') classCol = j;
            if (cell.includes('学号') || cell === 'id' || cell.includes('编号')) idCol = j;
          }
          
          if (nameCol !== -1 && classCol !== -1 && idCol !== -1) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          setImportError('无法识别表头，请确保Excel包含"姓名"、"班级"、"学号"列');
          setImportPreview([]);
          return;
        }

        // 解析学生数据
        const students = [];
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || !row[nameCol]) continue;
          
          const student = {
            name: String(row[nameCol] || '').trim(),
            class: String(row[classCol] || '').trim(),
            id: String(row[idCol] || '').trim(),
            avatar: '👨‍🎓'
          };
          
          if (student.name && student.id) {
            students.push(student);
          }
        }

        if (students.length === 0) {
          setImportError('未找到有效的学生数据');
          setImportPreview([]);
          return;
        }

        setImportPreview(students);
        setImportError('');
        setShowImportModal(true);
      } catch (err) {
        setImportError('文件解析失败：' + err.message);
        setImportPreview([]);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // 确认导入学生
  const confirmImport = () => {
    const existingIds = new Set(data.students.map(s => s.id));
    const newStudents = importPreview.filter(s => !existingIds.has(s.id));
    const duplicates = importPreview.length - newStudents.length;

    setData(prev => ({
      ...prev,
      students: [...prev.students, ...newStudents]
    }));

    setShowImportModal(false);
    setImportPreview([]);
    
    if (duplicates > 0) {
      alert(`✅ 成功导入 ${newStudents.length} 名学生！\n⚠️ 跳过 ${duplicates} 名重复学生（学号已存在）`);
    } else {
      alert(`✅ 成功导入 ${newStudents.length} 名学生！`);
    }
  };

  // 手动添加单个学生
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.class || !newStudent.id) {
      alert('请填写完整信息');
      return;
    }
    
    if (data.students.find(s => s.id === newStudent.id)) {
      alert('学号已存在');
      return;
    }

    setData(prev => ({
      ...prev,
      students: [...prev.students, { ...newStudent, avatar: '👨‍🎓' }]
    }));
    
    setNewStudent({ name: '', class: '', id: '' });
    setShowAddModal(false);
    alert('✅ 学生添加成功！');
  };

  // 删除学生
  const handleDeleteStudent = (studentId) => {
    if (window.confirm('确定要删除该学生吗？')) {
      setData(prev => ({
        ...prev,
        students: prev.students.filter(s => s.id !== studentId)
      }));
    }
  };

  // 清空所有学生
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有学生数据吗？此操作不可恢复！')) {
      setData(prev => ({ ...prev, students: [] }));
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    const templateData = [
      ['姓名', '班级', '学号'],
      ['张三', '三年二班', '2024001'],
      ['李四', '三年二班', '2024002'],
      ['王五', '三年三班', '2024003']
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '学生名单');
    XLSX.writeFile(wb, '学生名单模板.xlsx');
  };

  // 获取所有班级列表
  const classList = [...new Set(data.students.map(s => s.class))].filter(Boolean);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a2e', margin: 0 }}>学生管理</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={downloadTemplate}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', background: '#fff', border: '2px solid #eee',
              borderRadius: '12px', color: '#666', fontWeight: '500', cursor: 'pointer'
            }}>
            <Download size={18} /> 下载模板
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', background: '#52c41a',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontWeight: '500', cursor: 'pointer'
            }}>
            <Upload size={18} /> 导入Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontWeight: '500', cursor: 'pointer'
            }}>
            <Plus size={18} /> 添加学生
          </button>
        </div>
      </div>

      {/* 导入错误提示 */}
      {importError && (
        <div style={{
          padding: '16px 20px', background: '#fff2f0', border: '1px solid #ffccc7',
          borderRadius: '12px', marginBottom: '20px', color: '#cf1322',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <AlertCircle size={18} /> {importError}
        </div>
      )}

      {/* 学生统计 */}
      {data.students.length > 0 && (
        <div style={{
          display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'
        }}>
          <div style={{
            padding: '16px 24px', background: '#f0f5ff', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <Users size={20} color="#667eea" />
            <span style={{ color: '#667eea', fontWeight: '500' }}>
              总人数：{data.students.length}
            </span>
          </div>
          {classList.map(cls => (
            <div key={cls} style={{
              padding: '16px 24px', background: '#f6ffed', borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ color: '#52c41a', fontWeight: '500' }}>
                {cls}：{data.students.filter(s => s.class === cls).length}人
              </span>
            </div>
          ))}
          <button onClick={handleClearAll}
            style={{
              padding: '16px 24px', background: '#fff1f0', borderRadius: '12px',
              border: 'none', color: '#cf1322', cursor: 'pointer', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
            <Trash2 size={16} /> 清空全部
          </button>
        </div>
      )}

      {/* 学生列表 */}
      {data.students.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '60px',
          textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <Users size={48} color="#ddd" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#888', marginBottom: '24px' }}>暂无学生数据</p>
          <p style={{ color: '#aaa', fontSize: '14px' }}>
            点击"导入Excel"导入学生名单，或点击"添加学生"手动添加
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9ff' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>学生</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>学号</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>班级</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#1a1a2e' }}>提交数</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600', color: '#1a1a2e' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map(student => (
                <tr key={student.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{student.avatar || '👤'}</span>
                      <span style={{ fontWeight: '500' }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>{student.id}</td>
                  <td style={{ padding: '16px 24px', color: '#666' }}>{student.class}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 12px', background: '#f6ffed',
                      color: '#389e0d', borderRadius: '20px', fontSize: '13px'
                    }}>
                      {data.submissions.filter(s => s.studentId === student.id).length}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button onClick={() => handleDeleteStudent(student.id)}
                      style={{
                        padding: '8px', background: '#fff1f0', border: 'none',
                        borderRadius: '8px', cursor: 'pointer'
                      }}>
                      <Trash2 size={16} color="#cf1322" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 导入预览模态框 */}
      {showImportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', width: '600px',
            maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              padding: '24px 28px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                确认导入 ({importPreview.length} 名学生)
              </h2>
              <button onClick={() => { setShowImportModal(false); setImportPreview([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={24} color="#999" />
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9ff', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600' }}>姓名</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600' }}>学号</th>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600' }}>班级</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((student, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 20px' }}>{student.name}</td>
                      <td style={{ padding: '12px 20px', color: '#666' }}>{student.id}</td>
                      <td style={{ padding: '12px 20px', color: '#666' }}>{student.class}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              padding: '20px 28px', borderTop: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'flex-end', gap: '12px'
            }}>
              <button onClick={() => { setShowImportModal(false); setImportPreview([]); }}
                style={{
                  padding: '12px 24px', background: '#f5f5f5', border: 'none',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: '500'
                }}>
                取消
              </button>
              <button onClick={confirmImport}
                style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  cursor: 'pointer', fontWeight: '500'
                }}>
                确认导入
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
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '440px' }}>
            <div style={{
              padding: '24px 28px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>添加学生</h2>
              <button onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={24} color="#999" />
              </button>
            </div>
            
            <div style={{ padding: '28px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>姓名</label>
                <input
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="请输入学生姓名"
                  style={{
                    width: '100%', padding: '12px 16px', border: '2px solid #eee',
                    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>学号</label>
                <input
                  value={newStudent.id}
                  onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
                  placeholder="请输入学号"
                  style={{
                    width: '100%', padding: '12px 16px', border: '2px solid #eee',
                    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>班级</label>
                <input
                  value={newStudent.class}
                  onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                  placeholder="例如：三年二班"
                  style={{
                    width: '100%', padding: '12px 16px', border: '2px solid #eee',
                    borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: '20px 28px', borderTop: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'flex-end', gap: '12px'
            }}>
              <button onClick={() => setShowAddModal(false)}
                style={{
                  padding: '12px 24px', background: '#f5f5f5', border: 'none',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: '500'
                }}>
                取消
              </button>
              <button onClick={handleAddStudent}
                style={{
                  padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  cursor: 'pointer', fontWeight: '500'
                }}>
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
