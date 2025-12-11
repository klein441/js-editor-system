import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import PPTImageViewer from './PPTImageViewer';

// Word文档PDF查看器组件
const WordPDFViewer = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    loadPDF();
  }, [file.id]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 开始转换Word文档，课件ID:', file.id);
      
      const response = await fetch(`http://localhost:5000/api/courseware/${file.id}/doc-preview`);
      console.log('API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ 转换成功:', data);
      
      setPdfUrl(data.pdfUrl);
      setLoading(false);
    } catch (err) {
      console.error('❌ 转换失败:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.95)', zIndex: 2000,
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{
        background: '#1a1a1a', padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>{file.title}</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href={`http://localhost:5000${file.filePath}`} download={file.fileName}
             style={{
               padding: '8px 16px', background: '#667eea', color: 'white',
               borderRadius: '8px', textDecoration: 'none',
               display: 'flex', alignItems: 'center', gap: '6px'
             }}>
            <Download size={16} /> 下载原文件
          </a>
          <button onClick={onClose} style={{
            padding: '8px 16px', background: '#374151', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <X size={16} /> 关闭
          </button>
        </div>
      </div>
      <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading ? (
          <div style={{ color: 'white', fontSize: '18px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', fontSize: '48px' }}>⏳</div>
            <div>正在转换Word文档为PDF...</div>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
              首次转换需要一些时间，请稍候
            </div>
          </div>
        ) : error ? (
          <div style={{ color: 'white', textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '20px', marginBottom: '12px' }}>转换失败</div>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
              {error}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={loadPDF}
                style={{
                  padding: '12px 24px', background: '#667eea', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '500'
                }}>
                🔄 重试
              </button>
              <a
                href={`http://localhost:5000${file.filePath}`}
                download={file.fileName}
                style={{
                  padding: '12px 24px', background: '#16a34a', color: 'white',
                  borderRadius: '8px', textDecoration: 'none',
                  fontSize: '14px', fontWeight: '500'
                }}>
                下载原文件
              </a>
            </div>
          </div>
        ) : pdfUrl ? (
          <iframe
            src={`http://localhost:5000${pdfUrl}`}
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
            title={file.title}
          />
        ) : null}
      </div>
    </div>
  );
};

const UniversalFileViewer = ({ file, onClose }) => {
  const getFileType = (fileType) => {
    return fileType.toLowerCase();
  };

  const renderViewer = () => {
    const type = getFileType(file.fileType);
    
    // 调试信息
    console.log('🔍 UniversalFileViewer - 文件信息:', {
      id: file.id,
      title: file.title,
      fileType: file.fileType,
      type: type,
      filePath: file.filePath
    });
    
    switch (type) {
      case 'ppt':
      case 'pptx':
        return (
          <PPTImageViewer
            coursewareId={file.id}
            coursewareTitle={file.title}
            onClose={onClose}
          />
        );
      
      case 'pdf':
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)', zIndex: 2000,
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              background: '#1a1a1a', padding: '16px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>{file.title}</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={`http://localhost:5000${file.filePath}`} download={file.fileName}
                   style={{
                     padding: '8px 16px', background: '#667eea', color: 'white',
                     borderRadius: '8px', textDecoration: 'none',
                     display: 'flex', alignItems: 'center', gap: '6px'
                   }}>
                  <Download size={16} /> 下载
                </a>
                <button onClick={onClose} style={{
                  padding: '8px 16px', background: '#374151', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <X size={16} /> 关闭
                </button>
              </div>
            </div>
            <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <iframe
                src={`http://localhost:5000${file.filePath}`}
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                title={file.title}
              />
            </div>
          </div>
        );
      
      case 'doc':
      case 'docx':
        return <WordPDFViewer file={file} onClose={onClose} />;
      
      default:
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
              <h3>不支持的文件类型</h3>
              <p style={{ marginBottom: '24px' }}>请下载文件后查看</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <a href={`http://localhost:5000${file.filePath}`} download={file.fileName}
                   style={{
                     padding: '12px 24px', background: '#667eea', color: 'white',
                     borderRadius: '8px', textDecoration: 'none'
                   }}>
                  下载文件
                </a>
                <button onClick={onClose} style={{
                  padding: '12px 24px', background: '#374151', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer'
                }}>
                  关闭
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderViewer();
};

export default UniversalFileViewer;
