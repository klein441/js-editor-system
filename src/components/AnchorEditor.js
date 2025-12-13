import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Video, Code, BookOpen, Save, X } from 'lucide-react';

const AnchorEditor = ({ coursewareId, slides, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // 调试信息
  useEffect(() => {
    console.log('🔧 AnchorEditor - 接收到的数据:', {
      coursewareId,
      slidesCount: slides?.length,
      slidesData: slides,
      currentSlide
    });
  }, [coursewareId, slides, currentSlide]);
  const [anchors, setAnchors] = useState([]);
  const [showAnchorForm, setShowAnchorForm] = useState(false);
  const [editingAnchor, setEditingAnchor] = useState(null);
  const [anchorForm, setAnchorForm] = useState({
    anchor_name: '',
    description: '',
    x_position: 50,
    y_position: 50
  });
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resourceType, setResourceType] = useState('video');
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    resource_content: '',
    resource_url: ''
  });
  const [selectedAnchorId, setSelectedAnchorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewAnchor, setPreviewAnchor] = useState(null);
  const [codeLibrary, setCodeLibrary] = useState([]);
  const [selectedCodeSnippet, setSelectedCodeSnippet] = useState('');
  
  const slideRef = useRef(null);

  // 处理幻灯片图片URL
  const getSlideImageUrl = (slide) => {
    if (!slide) return '';
    
    // 如果slide是对象，提取imageUrl
    if (typeof slide === 'object' && slide.imageUrl) {
      return slide.imageUrl.startsWith('http') ? slide.imageUrl : `http://localhost:5000${slide.imageUrl}`;
    }
    
    // 如果slide是字符串URL
    if (typeof slide === 'string') {
      return slide.startsWith('http') ? slide : `http://localhost:5000${slide}`;
    }
    
    return '';
  };

  // 加载当前幻灯片的锚点
  useEffect(() => {
    loadAnchors();
  }, [currentSlide, coursewareId]);

  const loadAnchors = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/courseware/${coursewareId}/slide/${currentSlide + 1}/anchors`
      );
      if (response.ok) {
        const data = await response.json();
        setAnchors(data);
      }
    } catch (error) {
      console.error('加载锚点失败:', error);
    }
  };

  // 加载代码库
  const loadCodeLibrary = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/code-library');
      if (response.ok) {
        const data = await response.json();
        setCodeLibrary(data);
      }
    } catch (error) {
      console.error('加载代码库失败:', error);
    }
  };

  // 当打开资源表单且选择编译系统类型时，加载代码库
  useEffect(() => {
    if (showResourceForm && resourceType === 'editor') {
      loadCodeLibrary();
    }
  }, [showResourceForm, resourceType]);

  // 在幻灯片上点击添加锚点
  const handleSlideClick = (e) => {
    if (showAnchorForm || editingAnchor) return;
    
    const rect = slideRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // 确保坐标在有效范围内
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    const newAnchor = {
      anchor_name: '',
      description: '',
      x_position: Math.round(clampedX * 100) / 100,
      y_position: Math.round(clampedY * 100) / 100
    };
    
    setAnchorForm(newAnchor);
    setPreviewAnchor(newAnchor); // 显示预览
    setShowAnchorForm(true);
    setEditingAnchor(null);
    
    console.log(`📍 在幻灯片上添加锚点: (${clampedX.toFixed(2)}%, ${clampedY.toFixed(2)}%)`);
  };

  // 保存锚点
  const saveAnchor = async () => {
    if (!anchorForm.anchor_name.trim()) {
      alert('请输入锚点名称');
      return;
    }

    setLoading(true);
    try {
      const url = editingAnchor 
        ? `http://localhost:5000/api/anchors/${editingAnchor.id}`
        : 'http://localhost:5000/api/anchors';
      
      const method = editingAnchor ? 'PUT' : 'POST';
      const body = editingAnchor 
        ? anchorForm
        : { ...anchorForm, courseware_id: coursewareId, slide_number: currentSlide + 1 };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await loadAnchors();
        setShowAnchorForm(false);
        setEditingAnchor(null);
        setPreviewAnchor(null); // 清除预览
        setAnchorForm({
          anchor_name: '',
          description: '',
          x_position: 50,
          y_position: 50
        });
        alert(editingAnchor ? '锚点更新成功' : '锚点创建成功');
      } else {
        const error = await response.json();
        alert('保存失败: ' + error.error);
      }
    } catch (error) {
      console.error('保存锚点失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 编辑锚点
  const editAnchor = (anchor) => {
    setAnchorForm({
      anchor_name: anchor.anchor_name,
      description: anchor.description || '',
      x_position: anchor.x_position,
      y_position: anchor.y_position
    });
    setEditingAnchor(anchor);
    setShowAnchorForm(true);
  };

  // 删除锚点
  const deleteAnchor = async (anchorId) => {
    if (!window.confirm('确定要删除这个锚点吗？这将同时删除所有关联的资源。')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/anchors/${anchorId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadAnchors();
        alert('锚点删除成功');
      } else {
        const error = await response.json();
        alert('删除失败: ' + error.error);
      }
    } catch (error) {
      console.error('删除锚点失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 添加资源
  const addResource = async () => {
    if (!resourceForm.title.trim()) {
      alert('请输入资源标题');
      return;
    }

    if (resourceType === 'code' || resourceType === 'syntax') {
      if (!resourceForm.resource_content.trim()) {
        alert('请输入内容');
        return;
      }
    }

    if (resourceType === 'video' && !resourceForm.resource_url.trim()) {
      alert('请输入视频链接或上传视频文件');
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:5000/api/anchors/${selectedAnchorId}/resources/${resourceType}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceForm)
      });

      if (response.ok) {
        setShowResourceForm(false);
        setResourceForm({
          title: '',
          description: '',
          resource_content: '',
          resource_url: ''
        });
        alert('资源添加成功');
        await loadAnchors(); // 重新加载以更新资源计数
      } else {
        const error = await response.json();
        alert('添加失败: ' + error.error);
      }
    } catch (error) {
      console.error('添加资源失败:', error);
      alert('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 1000,
      display: 'flex'
    }}>
      {/* 左侧幻灯片区域 */}
      <div style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '800px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3>锚点编辑器 - 第 {currentSlide + 1} 页</h3>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}>
              <X size={24} />
            </button>
          </div>

          {/* 幻灯片导航 */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: currentSlide === index ? '#007bff' : 'white',
                  color: currentSlide === index ? 'white' : 'black',
                  cursor: 'pointer'
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* 幻灯片显示区域 */}
          <div style={{
            position: 'relative',
            border: '2px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: showAnchorForm || editingAnchor ? 'default' : 'crosshair',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseMove={(e) => {
            // 显示十字准线位置提示
            if (!showAnchorForm && !editingAnchor) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.title = `点击添加锚点 (${x.toFixed(1)}%, ${y.toFixed(1)}%)`;
            }
          }}>
            
            {slides && slides.length > 0 ? (
              <img
                ref={slideRef}
                src={getSlideImageUrl(slides[currentSlide])}
                alt={`幻灯片 ${currentSlide + 1}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
                onClick={handleSlideClick}
                onLoad={() => {
                  console.log('✅ 幻灯片图片加载成功:', getSlideImageUrl(slides[currentSlide]));
                }}
                onError={(e) => {
                  console.error('❌ 幻灯片图片加载失败:', e.target.src);
                  e.target.style.backgroundColor = '#f0f0f0';
                  e.target.style.height = '400px';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.alt = '图片加载失败';
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '16px'
              }}>
                <div style={{ marginBottom: '10px' }}>📄</div>
                <div>正在加载幻灯片...</div>
                <div style={{ fontSize: '12px', marginTop: '5px' }}>
                  课件ID: {coursewareId}
                </div>
              </div>
            )}
            
            {/* 显示锚点 */}
            {anchors.map((anchor) => (
              <div
                key={anchor.id}
                style={{
                  position: 'absolute',
                  left: `${anchor.x_position}%`,
                  top: `${anchor.y_position}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
              >
                {/* 锚点圆圈 */}
                <div
                  className="anchor-point"
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ff4444',
                    borderRadius: '50%',
                    border: '3px solid white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    animation: 'pulse 2s infinite',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    editAnchor(anchor);
                  }}
                  title={`点击编辑: ${anchor.anchor_name}`}
                >
                  {anchor.resource_count || '0'}
                </div>
                
                {/* 锚点标签 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    pointerEvents: 'none'
                  }}
                >
                  {anchor.anchor_name}
                </div>
                
                {/* 连接线 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    width: '1px',
                    height: '5px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            ))}
            
            {/* 预览锚点 */}
            {previewAnchor && (
              <div
                style={{
                  position: 'absolute',
                  left: `${previewAnchor.x_position}%`,
                  top: `${previewAnchor.y_position}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 15,
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#28a745',
                    borderRadius: '50%',
                    border: '3px solid white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    animation: 'pulse 1s infinite'
                  }}
                >
                  +
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(40, 167, 69, 0.9)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  新锚点位置
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            💡 点击幻灯片任意位置添加锚点，点击现有锚点进行编辑
          </div>
        </div>
      </div>

      {/* 右侧控制面板 */}
      <div style={{
        width: '400px',
        backgroundColor: 'white',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <h4>当前幻灯片锚点</h4>
        
        {anchors.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            暂无锚点，点击幻灯片添加
          </p>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            {anchors.map((anchor) => (
              <div key={anchor.id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <strong>{anchor.anchor_name}</strong>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => {
                        setSelectedAnchorId(anchor.id);
                        setShowResourceForm(true);
                        setSelectedCodeSnippet(''); // 重置代码库选择
                        setResourceForm({
                          title: '',
                          description: '',
                          resource_content: '',
                          resource_url: ''
                        });
                      }}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #28a745',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        color: '#28a745',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="添加资源"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => editAnchor(anchor)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        color: '#007bff',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="编辑锚点"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => deleteAnchor(anchor.id)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #dc3545',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="删除锚点"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {anchor.description && (
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    {anchor.description}
                  </p>
                )}
                <div style={{ fontSize: '12px', color: '#888' }}>
                  位置: ({anchor.x_position}%, {anchor.y_position}%) | 
                  资源: {anchor.resource_count} 个
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 锚点表单 */}
        {showAnchorForm && (
          <div style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#f8f9fa'
          }}>
            <h5>{editingAnchor ? '编辑锚点' : '新建锚点'}</h5>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                锚点名称 *
              </label>
              <input
                type="text"
                value={anchorForm.anchor_name}
                onChange={(e) => setAnchorForm({
                  ...anchorForm,
                  anchor_name: e.target.value
                })}
                placeholder="例如：CSS盒模型"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                描述
              </label>
              <textarea
                value={anchorForm.description}
                onChange={(e) => setAnchorForm({
                  ...anchorForm,
                  description: e.target.value
                })}
                placeholder="详细描述这个知识点..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  X坐标 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={anchorForm.x_position}
                  onChange={(e) => {
                    const newX = parseFloat(e.target.value);
                    const newForm = {
                      ...anchorForm,
                      x_position: newX
                    };
                    setAnchorForm(newForm);
                    // 实时更新预览位置
                    if (previewAnchor) {
                      setPreviewAnchor(newForm);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  Y坐标 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={anchorForm.y_position}
                  onChange={(e) => {
                    const newY = parseFloat(e.target.value);
                    const newForm = {
                      ...anchorForm,
                      y_position: newY
                    };
                    setAnchorForm(newForm);
                    // 实时更新预览位置
                    if (previewAnchor) {
                      setPreviewAnchor(newForm);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#666',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              💡 提示: 可以直接在幻灯片上点击设置位置，或手动输入精确坐标
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={saveAnchor}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <Save size={16} />
                {loading ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => {
                  setShowAnchorForm(false);
                  setEditingAnchor(null);
                  setPreviewAnchor(null); // 清除预览
                }}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 资源表单 */}
        {showResourceForm && (
          <div style={{
            border: '2px solid #28a745',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#f8fff8',
            marginTop: '20px'
          }}>
            <h5>添加资源</h5>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                资源类型
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="video">视频资源</option>
                <option value="code">代码示例</option>
                <option value="syntax">语法说明</option>
                <option value="editor">编译系统</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                标题 *
              </label>
              <input
                type="text"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({
                  ...resourceForm,
                  title: e.target.value
                })}
                placeholder="资源标题"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {resourceType === 'video' && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  视频链接 (B站等)
                </label>
                <input
                  type="url"
                  value={resourceForm.resource_url}
                  onChange={(e) => setResourceForm({
                    ...resourceForm,
                    resource_url: e.target.value
                  })}
                  placeholder="https://www.bilibili.com/video/..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            {resourceType === 'editor' && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{
                  padding: '15px',
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>💻</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1' }}>
                      在线编译系统
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#0c4a6e', margin: 0 }}>
                    点击此资源将打开JS在线编译器，学生可以直接在浏览器中编写和运行代码
                  </p>
                </div>

                {/* 从代码库选择 */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                    从代码库选择（可选）
                  </label>
                  <select
                    value={selectedCodeSnippet}
                    onChange={(e) => {
                      const snippetId = e.target.value;
                      setSelectedCodeSnippet(snippetId);
                      
                      if (snippetId) {
                        const snippet = codeLibrary.find(item => item.id === parseInt(snippetId));
                        if (snippet) {
                          setResourceForm({
                            ...resourceForm,
                            title: snippet.title,
                            description: snippet.description || '',
                            resource_content: snippet.content
                          });
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  >
                    <option value="">-- 选择代码库中的资源 --</option>
                    {codeLibrary.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.title} ({item.language})
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>
                    选择后将自动填充标题、描述和代码内容
                  </p>
                </div>

                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  初始代码模板（可选）
                </label>
                <textarea
                  value={resourceForm.resource_content}
                  onChange={(e) => setResourceForm({
                    ...resourceForm,
                    resource_content: e.target.value
                  })}
                  placeholder="可以输入初始代码模板，或从代码库选择..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            {(resourceType === 'code' || resourceType === 'syntax') && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                  {resourceType === 'code' ? '代码内容 *' : '语法说明 *'}
                </label>
                <textarea
                  value={resourceForm.resource_content}
                  onChange={(e) => setResourceForm({
                    ...resourceForm,
                    resource_content: e.target.value
                  })}
                  placeholder={resourceType === 'code' ? '输入代码...' : '输入语法说明...'}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: resourceType === 'code' ? 'monospace' : 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                描述
              </label>
              <textarea
                value={resourceForm.description}
                onChange={(e) => setResourceForm({
                  ...resourceForm,
                  description: e.target.value
                })}
                placeholder="资源描述..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={addResource}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                {resourceType === 'video' && <Video size={16} />}
                {resourceType === 'code' && <Code size={16} />}
                {resourceType === 'syntax' && <BookOpen size={16} />}
                {loading ? '添加中...' : '添加资源'}
              </button>
              <button
                onClick={() => {
                  setShowResourceForm(false);
                  setResourceForm({
                    title: '',
                    description: '',
                    resource_content: '',
                    resource_url: ''
                  });
                }}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS动画样式 */}
      <style>
        {`
          @keyframes pulse {
            0% { 
              transform: translate(-50%, -50%) scale(1);
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
            50% { 
              transform: translate(-50%, -50%) scale(1.1);
              box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            }
            100% { 
              transform: translate(-50%, -50%) scale(1);
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            }
          }
          
          .anchor-point:hover {
            transform: translate(-50%, -50%) scale(1.2) !important;
            transition: transform 0.2s ease;
          }
        `}
      </style>
    </div>
  );
};

export default AnchorEditor;