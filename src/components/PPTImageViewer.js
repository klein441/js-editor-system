import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut } from 'lucide-react';

const PPTImageViewer = ({ coursewareId, coursewareTitle, onClose }) => {
  const [slides, setSlides] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalSlides, setTotalSlides] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreview();
  }, [coursewareId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('正在加载预览，课件ID:', coursewareId);
      
      const response = await fetch(`http://localhost:5000/api/courseware/${coursewareId}/preview`);
      console.log('API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('加载的数据:', data);
      
      setSlides(data.slides || []);
      setTotalSlides(data.totalSlides || 0);
      setLoading(false);
    } catch (err) {
      console.error('加载预览失败:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalSlides - 1, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部工具栏 */}
      <div style={{
        background: '#1a1a1a',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333'
      }}>
        <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
          {coursewareTitle}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={zoomOut} style={toolbarButtonStyle}>
            <ZoomOut size={20} />
          </button>
          <span style={{ color: 'white', minWidth: '60px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} style={toolbarButtonStyle}>
            <ZoomIn size={20} />
          </button>
          <div style={{ width: '1px', height: '24px', background: '#444' }} />
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={20} /> 关闭
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
        padding: '20px'
      }}>
        {loading ? (
          <div style={{ color: 'white', fontSize: '18px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', fontSize: '48px' }}>⏳</div>
            <div>正在加载PPT预览...</div>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
              课件ID: {coursewareId}
            </div>
          </div>
        ) : error ? (
          <div style={{ color: 'white', textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '20px', marginBottom: '12px' }}>加载失败</div>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
              {error}
            </div>
            <button
              onClick={loadPreview}
              style={{
                padding: '12px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '12px'
              }}
            >
              🔄 重试
            </button>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '16px' }}>
              <div>可能的原因：</div>
              <div>• 后端服务未启动</div>
              <div>• 课件不存在</div>
              <div>• 网络连接问题</div>
            </div>
          </div>
        ) : slides.length > 0 ? (
          <>
            {console.log('🖼️ 当前显示图片:', {
              currentPage,
              imageUrl: slides[currentPage]?.imageUrl,
              fullUrl: `http://localhost:5000${slides[currentPage]?.imageUrl}`
            })}
            <img
              src={`http://localhost:5000${slides[currentPage]?.imageUrl}`}
              alt={`Slide ${currentPage + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${scale})`,
                transition: 'transform 0.3s',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                background: 'white'
              }}
              onError={(e) => {
                console.error('❌ 图片加载失败:', slides[currentPage]?.imageUrl);
                console.log('尝试的URL:', e.target.src);
              }}
              onLoad={() => {
                console.log('✅ 图片加载成功:', slides[currentPage]?.imageUrl);
              }}
            />
          </>
        ) : (
          <div style={{ color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '18px' }}>暂无预览</div>
          </div>
        )}
      </div>

      {/* 底部导航栏 */}
      {!loading && slides.length > 0 && (
        <div style={{
          background: '#1a1a1a',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          borderTop: '1px solid #333'
        }}>
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            style={{
              ...navButtonStyle,
              opacity: currentPage === 0 ? 0.5 : 1,
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={20} /> 上一页
          </button>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              max={totalSlides}
              value={currentPage + 1}
              onChange={(e) => {
                const page = parseInt(e.target.value) - 1;
                if (page >= 0 && page < totalSlides) {
                  setCurrentPage(page);
                }
              }}
              style={{
                width: '60px',
                padding: '8px',
                background: '#374151',
                color: 'white',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '14px'
              }}
            />
            <span style={{ color: 'white', fontSize: '16px' }}>
              / {totalSlides}
            </span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalSlides - 1}
            style={{
              ...navButtonStyle,
              opacity: currentPage >= totalSlides - 1 ? 0.5 : 1,
              cursor: currentPage >= totalSlides - 1 ? 'not-allowed' : 'pointer'
            }}
          >
            下一页 <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* 缩略图栏（可选） */}
      {!loading && slides.length > 0 && (
        <div style={{
          background: '#1a1a1a',
          padding: '12px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderTop: '1px solid #333'
        }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              onClick={() => setCurrentPage(index)}
              style={{
                minWidth: '100px',
                height: '75px',
                border: currentPage === index ? '3px solid #667eea' : '2px solid #374151',
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== index) {
                  e.currentTarget.style.borderColor = '#667eea';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== index) {
                  e.currentTarget.style.borderColor = '#374151';
                }
              }}
            >
              <img
                src={slide.thumbnail}
                alt={`Slide ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const toolbarButtonStyle = {
  padding: '8px 12px',
  background: '#374151',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'background 0.3s'
};

const closeButtonStyle = {
  padding: '8px 16px',
  background: '#374151',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background 0.3s'
};

const navButtonStyle = {
  padding: '10px 20px',
  background: '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background 0.3s'
};

export default PPTImageViewer;
