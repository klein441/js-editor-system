// 应用配置文件

const config = {
  // API配置
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    timeout: 10000,
    retryAttempts: 3
  },
  
  // 功能开关
  features: {
    enableAnchorSystem: true,
    enableVideoUpload: true,
    enableRealTimeAnnotation: false,
    enableVotingSystem: false
  },
  
  // UI配置
  ui: {
    theme: 'light',
    primaryColor: '#1890ff',
    pageSize: 20,
    animationDuration: 300
  },
  
  // 文件上传配置
  upload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'],
    chunkSize: 1024 * 1024 // 1MB chunks
  },
  
  // 开发模式配置
  development: {
    enableDebugMode: process.env.NODE_ENV === 'development',
    showPerformanceMetrics: true,
    enableHotReload: true
  }
};

export default config;