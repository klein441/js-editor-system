import React, { useState, useEffect } from 'react';
import { Play, ArrowLeft, Video, Code, BookOpen } from 'lucide-react';

const AnchorDemo = ({ coursewareId, onBack, onOpenEditor }) => {
  const [slides, setSlides] = useState([]);
  const [anchors, setAnchors] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showResource, setShowResource] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoursewareData();
  }, [coursewareId]);

  // 添加键盘导航
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showResource) return; // 在资源页面时不响应键盘
      
      switch (e.key) {
        case 'ArrowLeft':
          if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
          }
          break;
        case 'ArrowRight':
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
          }
          break;
        case 'Escape':
          onBack();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length, showResource, onBack]);

  const loadCoursewareData = async () => {
    try {
      setLoading(true);
      console.log('🎬 AnchorDemo - 开始加载课件数据, coursewareId:', coursewareId);
      
      // 加载课件预览
      console.log('📊 正在获取课件预览...');
      const slideResponse = await fetch(`http://localhost:5000/api/courseware/${coursewareId}/preview`);
      console.log('📊 课件预览响应状态:', slideResponse.status);
      
      if (slideResponse.ok) {
        const slideData = await slideResponse.json();
        console.log('📊 获取到幻灯片数据:', slideData);
        
        // 处理幻灯片数据格式
        let slideUrls = [];
        if (slideData.slides && Array.isArray(slideData.slides)) {
          slideUrls = slideData.slides.map(slide => {
            // 如果slide是对象，提取imageUrl；如果是字符串，直接使用
            if (typeof slide === 'object' && slide.imageUrl) {
              return `http://localhost:5000${slide.imageUrl}`;
            } else if (typeof slide === 'string') {
              return slide.startsWith('http') ? slide : `http://localhost:5000${slide}`;
            }
            return slide;
          });
        }
        
        console.log('📊 处理后的幻灯片URLs:', slideUrls);
        setSlides(slideUrls);
      } else {
        const errorData = await slideResponse.json();
        console.error('📊 获取课件预览失败:', errorData);
        alert('获取课件预览失败: ' + (errorData.error || '未知错误'));
        return;
      }
      
      // 加载所有锚点
      console.log('🔗 正在获取锚点数据...');
      const anchorResponse = await fetch(`http://localhost:5000/api/courseware/${coursewareId}/anchors`);
      console.log('🔗 锚点响应状态:', anchorResponse.status);
      
      if (anchorResponse.ok) {
        const anchorData = await anchorResponse.json();
        console.log('🔗 获取到锚点数据:', anchorData);
        setAnchors(anchorData || []);
      } else {
        const errorData = await anchorResponse.json();
        console.error('🔗 获取锚点失败:', errorData);
        // 锚点获取失败不阻止演示，只是没有锚点而已
        setAnchors([]);
      }
      
    } catch (error) {
      console.error('❌ 加载课件数据失败:', error);
      alert('加载失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSlideAnchors = () => {
    return anchors.filter(anchor => anchor.slide_number === currentSlide + 1);
  };

  const handleAnchorClick = async (anchor) => {
    try {
      // 获取锚点的资源
      const response = await fetch(`http://localhost:5000/api/anchors/${anchor.id}/resources`);
      if (response.ok) {
        const resources = await response.json();
        if (resources.length > 0) {
          // 如果有多个资源，显示第一个，或者可以让用户选择
          setSelectedResource({ anchor, resources });
          setShowResource(true);
        } else {
          alert('该锚点暂无关联资源');
        }
      }
    } catch (error) {
      console.error('获取锚点资源失败:', error);
      alert('获取资源失败，请重试');
    }
  };

  const renderResource = (resource) => {
    switch (resource.resource_type) {
      case 'video':
        return (
          <div>
            <h4>{resource.title}</h4>
            {resource.description && <p>{resource.description}</p>}
            {resource.resource_url ? (
              <div>
                <p>视频链接: <a href={resource.resource_url} target="_blank" rel="noopener noreferrer">
                  {resource.resource_url}
                </a></p>
                <iframe 
                  width="100%" 
                  height="400" 
                  src={resource.resource_url.replace('bilibili.com/video/', 'player.bilibili.com/player.html?bvid=')}
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            ) : resource.file_path ? (
              <video 
                width="100%" 
                height="400" 
                controls
                src={`http://localhost:5000${resource.file_path}`}
              >
                您的浏览器不支持视频播放
              </video>
            ) : (
              <p>视频资源不可用</p>
            )}
          </div>
        );
      
      case 'code':
        return (
          <div>
            <h4>{resource.title}</h4>
            {resource.description && <p>{resource.description}</p>}
            <pre style={{
              backgroundColor: '#f4f4f4',
              padding: '15px',
              borderRadius: '5px',
              overflow: 'auto',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              {resource.resource_content}
            </pre>
          </div>
        );
      
      case 'syntax':
        return (
          <div>
            <h4>{resource.title}</h4>
            {resource.description && <p>{resource.description}</p>}
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '15px',
              borderRadius: '5px',
              borderLeft: '4px solid #007bff'
            }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {resource.resource_content}
              </pre>
            </div>
          </div>
        );
      
      case 'editor':
        return (
          <div>
            <h4>{resource.title}</h4>
            {resource.description && <p>{resource.description}</p>}
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '30px',
              borderRadius: '12px',
              border: '2px solid #0ea5e9',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>💻</div>
              <h3 style={{ color: '#0369a1', marginBottom: '10px' }}>在线编译系统</h3>
              <p style={{ color: '#0c4a6e', marginBottom: '20px' }}>
                点击下方按钮打开JS在线编译器，开始编写和运行代码
              </p>
              <button
                onClick={() => {
                  if (onOpenEditor) {
                    // 准备初始代码模板
                    const template = resource.resource_content ? {
                      'index.html': resource.resource_content
                    } : undefined;
                    
                    onOpenEditor({
                      mode: 'practice',
                      title: resource.title,
                      template: template
                    });
                    
                    // 关闭资源弹窗
                    setShowResource(false);
                  } else {
                    alert('编辑器功能暂不可用');
                  }
                }}
                style={{
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Code size={20} />
                打开编译器
              </button>
              {resource.resource_content && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  textAlign: 'left'
                }}>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                    📝 初始代码模板预览：
                  </p>
                  <pre style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    maxHeight: '200px'
                  }}>
                    {resource.resource_content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return <p>未知资源类型</p>;
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        加载中...
      </div>
    );
  }

  if (showResource && selectedResource) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 1000,
        overflow: 'auto'
      }}>
        {/* 返回按钮 */}
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#007bff',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10
        }}>
          <button
            onClick={() => setShowResource(false)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <ArrowLeft size={16} />
            返回演示 (第{currentSlide + 1}页)
          </button>
          <span>知识点: {selectedResource.anchor.anchor_name}</span>
        </div>

        {/* 资源内容 */}
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          {selectedResource.resources.map((resource, index) => (
            <div key={resource.id} style={{ marginBottom: '30px' }}>
              {renderResource(resource)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'black',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部控制栏 */}
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <ArrowLeft size={16} />
          退出演示
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>第 {currentSlide + 1} / {slides.length} 页</span>
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '2px'
          }}>
            <div style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
              height: '100%',
              backgroundColor: 'white',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* 幻灯片显示区域 */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        {slides.length > 0 && (
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img
              src={slides[currentSlide]}
              alt={`幻灯片 ${currentSlide + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            
            {/* 显示当前幻灯片的锚点 */}
            {getCurrentSlideAnchors().map((anchor) => (
              <button
                key={anchor.id}
                onClick={() => handleAnchorClick(anchor)}
                style={{
                  position: 'absolute',
                  left: `${anchor.x_position}%`,
                  top: `${anchor.y_position}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  animation: 'pulse 2s infinite'
                }}
                title={`点击查看: ${anchor.anchor_name}`}
              >
                <Play size={12} />
                {anchor.anchor_name}
              </button>
            ))}
          </div>
        )}

        {/* 导航按钮 */}
        {currentSlide > 0 && (
          <button
            onClick={() => setCurrentSlide(currentSlide - 1)}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ‹
          </button>
        )}
        
        {currentSlide < slides.length - 1 && (
          <button
            onClick={() => setCurrentSlide(currentSlide + 1)}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* 底部信息栏 */}
      <div style={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px 20px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            当前页锚点: {getCurrentSlideAnchors().length} 个
          </div>
          <div>
            使用 ← → 键或点击按钮切换幻灯片，点击红色锚点查看相关资源
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 2px 10px rgba(255, 68, 68, 0.3); }
            50% { box-shadow: 0 2px 20px rgba(255, 68, 68, 0.6); }
            100% { box-shadow: 0 2px 10px rgba(255, 68, 68, 0.3); }
          }
        `}
      </style>
    </div>
  );
};

export default AnchorDemo;