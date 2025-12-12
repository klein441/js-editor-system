# 🚀 Windows服务器部署指南

## 📋 部署前准备

### 系统要求
- Windows Server 2016+ 或 Windows 10+
- Node.js 18+ 
- MySQL 8.0+
- IIS 10+ (可选，用于反向代理)
- LibreOffice (用于PPT转换)
- ImageMagick (用于图片处理)

### 必要软件安装
1. **Node.js**: 从官网下载并安装 LTS 版本
2. **MySQL**: 安装并配置数据库
3. **LibreOffice**: 用于PPT转PDF转换
4. **ImageMagick**: 用于PDF转图片
5. **PM2**: 进程管理器 `npm install -g pm2`

## 📁 项目结构

```
js-editor-system/
├── frontend/                 # React前端项目
│   ├── build/               # 构建后的静态文件
│   ├── src/
│   └── package.json
├── backend/                 # Node.js后端项目
│   ├── index.js
│   ├── routes/
│   ├── uploads/
│   ├── .env
│   └── package.json
├── database/                # 数据库脚本
│   ├── init.sql
│   └── anchor_tables.sql
└── deploy/                  # 部署脚本
    ├── deploy.bat
    ├── start.bat
    └── ecosystem.config.js
```

## 🔧 部署步骤

### 第一步：准备服务器环境

#### 1.1 创建部署目录
```cmd
mkdir C:\inetpub\js-editor-system
cd C:\inetpub\js-editor-system
```

#### 1.2 创建用户和权限
```cmd
# 创建专用用户（可选）
net user jseditor YourPassword123! /add
net localgroup "IIS_IUSRS" jseditor /add
```

### 第二步：数据库配置

#### 2.1 创建数据库
```sql
-- 连接MySQL并执行
CREATE DATABASE js_editor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jseditor'@'localhost' IDENTIFIED BY 'YourDBPassword123!';
GRANT ALL PRIVILEGES ON js_editor.* TO 'jseditor'@'localhost';
FLUSH PRIVILEGES;
```

#### 2.2 导入数据表
```cmd
# 导入基础表结构
mysql -u jseditor -p js_editor < database/init.sql

# 导入锚点相关表
mysql -u jseditor -p js_editor < database/anchor_tables.sql
```

### 第三步：后端部署

#### 3.1 复制后端文件
```cmd
# 将backend目录复制到服务器
xcopy /E /I backend C:\inetpub\js-editor-system\backend
```

#### 3.2 配置环境变量
创建 `C:\inetpub\js-editor-system\backend\.env.production`：
```env
# 生产环境配置
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=jseditor
DB_PASSWORD=YourDBPassword123!
DB_NAME=js_editor
PORT=5000

# 文件上传配置
UPLOAD_MAX_SIZE=50MB
VIDEO_MAX_SIZE=500MB

# 安全配置
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=http://your-domain.com
```

#### 3.3 安装依赖
```cmd
cd C:\inetpub\js-editor-system\backend
npm install --production
```

#### 3.4 创建必要目录
```cmd
mkdir uploads\courseware
mkdir uploads\videos
mkdir uploads\ppt-images
mkdir uploads\submissions
mkdir logs
```

### 第四步：前端构建和部署

#### 4.1 构建前端项目
```cmd
# 在开发机器上构建
npm run build

# 或在服务器上构建
cd C:\inetpub\js-editor-system\frontend
npm install
npm run build
```

#### 4.2 配置生产环境API地址
创建 `frontend\.env.production`：
```env
REACT_APP_API_URL=http://your-domain.com:5000
REACT_APP_WS_URL=ws://your-domain.com:5000
```

### 第五步：进程管理配置

#### 5.1 创建PM2配置文件
创建 `C:\inetpub\js-editor-system\ecosystem.config.js`：
```javascript
module.exports = {
  apps: [
    {
      name: 'js-editor-backend',
      script: './backend/index.js',
      cwd: 'C:\\inetpub\\js-editor-system',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

#### 5.2 启动后端服务
```cmd
cd C:\inetpub\js-editor-system
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 第六步：Web服务器配置

#### 6.1 使用IIS部署前端 (推荐)

1. **安装IIS和必要模块**：
   - 启用IIS
   - 安装URL Rewrite模块
   - 安装Application Request Routing (ARR)

2. **创建网站**：
```cmd
# 使用IIS管理器或命令行
%windir%\system32\inetsrv\appcmd add site /name:"JS-Editor" /bindings:"http/*:80:" /physicalPath:"C:\inetpub\js-editor-system\frontend\build"
```

3. **配置web.config**：
创建 `frontend\build\web.config`：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <!-- React Router支持 -->
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
        <!-- API代理 -->
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:5000/api/{R:1}" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- 静态文件缓存 -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="30.00:00:00" />
    </staticContent>
    
    <!-- 压缩 -->
    <httpCompression>
      <dynamicTypes>
        <add mimeType="application/json" enabled="true" />
        <add mimeType="application/javascript" enabled="true" />
      </dynamicTypes>
      <staticTypes>
        <add mimeType="text/css" enabled="true" />
        <add mimeType="application/javascript" enabled="true" />
      </staticTypes>
    </httpCompression>
  </system.webServer>
</configuration>
```

#### 6.2 使用Nginx (替代方案)

创建 `nginx.conf`：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root C:/inetpub/js-editor-system/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 文件上传大小限制
    client_max_body_size 500M;
}
```

### 第七步：SSL证书配置 (生产环境)

#### 7.1 获取SSL证书
```cmd
# 使用Let's Encrypt (需要安装Certbot)
certbot --iis -d your-domain.com
```

#### 7.2 配置HTTPS重定向
在IIS中添加HTTPS绑定和重定向规则。

### 第八步：防火墙和安全配置

#### 8.1 配置Windows防火墙
```cmd
# 允许HTTP和HTTPS
netsh advfirewall firewall add rule name="HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="HTTPS" dir=in action=allow protocol=TCP localport=443

# 允许Node.js端口（仅本地访问）
netsh advfirewall firewall add rule name="Node.js API" dir=in action=allow protocol=TCP localport=5000 remoteip=127.0.0.1
```

#### 8.2 文件权限设置
```cmd
# 设置上传目录权限
icacls "C:\inetpub\js-editor-system\backend\uploads" /grant "IIS_IUSRS:(OI)(CI)F"
icacls "C:\inetpub\js-editor-system\logs" /grant "IIS_IUSRS:(OI)(CI)F"
```

## 🔄 部署脚本

### 自动部署脚本
创建 `deploy\deploy.bat`：
```batch
@echo off
echo 开始部署JS编辑器系统...

:: 停止服务
pm2 stop js-editor-backend

:: 备份当前版本
if exist "C:\inetpub\js-editor-system\backup" (
    rmdir /s /q "C:\inetpub\js-editor-system\backup"
)
mkdir "C:\inetpub\js-editor-system\backup"
xcopy /E /I "C:\inetpub\js-editor-system\backend" "C:\inetpub\js-editor-system\backup\backend"
xcopy /E /I "C:\inetpub\js-editor-system\frontend\build" "C:\inetpub\js-editor-system\backup\frontend"

:: 更新后端
cd /d "C:\inetpub\js-editor-system\backend"
npm install --production

:: 更新前端
cd /d "C:\inetpub\js-editor-system\frontend"
npm run build

:: 重启服务
pm2 start ecosystem.config.js --env production

echo 部署完成！
pause
```

### 启动脚本
创建 `deploy\start.bat`：
```batch
@echo off
echo 启动JS编辑器系统...

:: 启动MySQL (如果需要)
net start MySQL80

:: 启动后端服务
cd /d "C:\inetpub\js-editor-system"
pm2 start ecosystem.config.js --env production

:: 启动IIS (如果需要)
iisreset /start

echo 系统启动完成！
echo 前端地址: http://localhost
echo 后端API: http://localhost:5000
pause
```

## 📊 监控和维护

### 日志监控
```cmd
# 查看PM2日志
pm2 logs js-editor-backend

# 查看实时日志
pm2 logs js-editor-backend --lines 100 -f
```

### 性能监控
```cmd
# PM2监控面板
pm2 monit

# 系统资源监控
pm2 show js-editor-backend
```

### 定期维护任务
创建Windows计划任务：
1. **数据库备份** (每日)
2. **日志清理** (每周)
3. **文件清理** (每月)
4. **系统更新检查** (每月)

## 🔧 故障排除

### 常见问题

1. **端口占用**：
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

2. **权限问题**：
```cmd
# 检查文件权限
icacls "C:\inetpub\js-editor-system"
```

3. **数据库连接失败**：
```cmd
# 测试数据库连接
mysql -u jseditor -p -h localhost js_editor
```

4. **PPT转换失败**：
```cmd
# 检查LibreOffice安装
"C:\Program Files\LibreOffice\program\soffice.exe" --version

# 检查ImageMagick安装
magick -version
```

### 性能优化

1. **启用Gzip压缩**
2. **配置CDN**
3. **数据库索引优化**
4. **静态资源缓存**
5. **负载均衡** (多实例部署)

## 🚀 生产环境检查清单

- [ ] 数据库安全配置
- [ ] SSL证书配置
- [ ] 防火墙规则设置
- [ ] 文件权限配置
- [ ] 备份策略制定
- [ ] 监控系统部署
- [ ] 日志轮转配置
- [ ] 性能测试完成
- [ ] 安全扫描通过
- [ ] 文档更新完成

## 📞 技术支持

如果在部署过程中遇到问题，请检查：
1. 系统日志 (`C:\inetpub\js-editor-system\logs\`)
2. PM2日志 (`pm2 logs`)
3. IIS日志 (`C:\inetpub\logs\LogFiles\`)
4. Windows事件查看器

部署完成后，你的教学演示系统就可以在Windows服务器上稳定运行了！🎉