import React, { useState, useRef } from 'react';
import { Upload, Video, X, Check } from 'lucide-react';

const VideoUploader = ({ anchorId, onSuccess, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    resource_url: ''
  });
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'
  
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        alert('请选择支持的视频格式 (MP4, AVI, MOV, WMV, WebM)');
        return;
      }
      
      // 验证文件大小 (500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert('视频文件大小不能超过 500MB');
        return;
      }
      
      setVideoFile(file);
      // 自动填充标题
      if (!videoForm.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setVideoForm(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const uploadVideo = async () => {
    if (uploadMethod === 'url') {
      // URL方式
      if (!videoForm.resource_url.trim()) {
        alert('请输入视频链接');
        return;
      }
      if (!videoForm.title.trim()) {
        alert('请输入视频标题');
        return;
      }
      
      setUploading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/anchors/${anchorId}/resources/video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(videoForm)
        });

        if (response.ok) {
          const result = await response.json();
          alert('视频资源添加成功');
          onSuccess(result.resource);
        } else {
          const error = await response.json();
          alert('添加失败: ' + error.error);
        }
      } catch (error) {
        console.error('添加视频资源失败:', error);
        alert('添加失败，请重试');
      } finally {
        setUploading(false);
      }
    } else {
      // 文件上传方式
      if (!videoFile) {
        alert('请选择视频文件');
        return;
      }
      if (!videoForm.title.trim()) {
        alert('请输入视频标题');
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('title', videoForm.title);
        formData.append('description', videoForm.description);

        const xhr = new XMLHttpRequest();
        
        // 监听上传进度
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        // 处理响应
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            alert('视频上传成功');
            onSuccess(result.resource);
          } else {
            const error = JSON.parse(xhr.responseText);
            alert('上传失败: ' + error.error);
          }
          setUploading(false);
        });

        xhr.addEventListener('error', () => {
          alert('上传失败，请检查网络连接');
          setUploading(false);
        });

        xhr.open('POST', `http://localhost:5000/api/anchors/${anchorId}/resources/video`);
        xhr.send(formData);
      } catch (error) {
        console.error('上传视频失败:', error);
        alert('上传失败，请重试');
        setUploading(false);
      }
    }
  };

  return (
    <div style={{
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      maxWidth: '500px',
      margin: '20px auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={20} />
          添加视频资源
        </h4>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* 上传方式选择 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          选择添加方式:
        </label>
        <div style={{ display: 'flex', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="uploadMethod"
              value="url"
              checked={uploadMethod === 'url'}
              onChange={(e) => setUploadMethod(e.target.value)}
            />
            视频链接 (B站等)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="uploadMethod"
              value="file"
              checked={uploadMethod === 'file'}
              onChange={(e) => setUploadMethod(e.target.value)}
            />
            上传视频文件
          </label>
        </div>
      </div>

      {/* 视频标题 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          视频标题 *
        </label>
        <input
          type="text"
          value={videoForm.title}
          onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
          placeholder="例如：CSS盒模型详解"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>

      {/* URL输入或文件选择 */}
      {uploadMethod === 'url' ? (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            视频链接 *
          </label>
          <input
            type="url"
            value={videoForm.resource_url}
            onChange={(e) => setVideoForm({ ...videoForm, resource_url: e.target.value })}
            placeholder="https://www.bilibili.com/video/BV..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            支持B站、YouTube等主流视频平台链接
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            选择视频文件 *
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #ddd',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: videoFile ? '#f0f8ff' : 'white',
              transition: 'all 0.3s ease'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#007bff';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#ddd';
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const file = files[0];
                handleFileSelect({ target: { files: [file] } });
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {videoFile ? (
              <div>
                <Check size={32} color="#28a745" style={{ marginBottom: '10px' }} />
                <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                  已选择: {videoFile.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  大小: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                <div style={{ fontSize: '12px', color: '#007bff', marginTop: '10px' }}>
                  点击重新选择文件
                </div>
              </div>
            ) : (
              <div>
                <Upload size={32} color="#666" style={{ marginBottom: '10px' }} />
                <div style={{ color: '#666' }}>
                  点击选择视频文件或拖拽到此处
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  支持 MP4, AVI, MOV, WMV, WebM 格式，最大 500MB
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 视频描述 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          视频描述
        </label>
        <textarea
          value={videoForm.description}
          onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
          placeholder="简要描述视频内容..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      </div>

      {/* 上传进度 */}
      {uploading && uploadMethod === 'file' && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '5px'
          }}>
            <span style={{ fontSize: '14px' }}>上传进度</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{uploadProgress}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={uploadVideo}
          disabled={uploading}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: uploading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {uploading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              {uploadMethod === 'file' ? '上传中...' : '添加中...'}
            </>
          ) : (
            <>
              <Video size={16} />
              {uploadMethod === 'file' ? '上传视频' : '添加链接'}
            </>
          )}
        </button>
        
        <button
          onClick={onCancel}
          disabled={uploading}
          style={{
            padding: '12px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          取消
        </button>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default VideoUploader;