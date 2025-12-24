# XHS_Downloader_UI - 小红书素材下载Web UI

这是一个基于 [JoeanAmier/XHS-Downloader](https://github.com/JoeanAmier/XHS-Downloader) 社区项目构建的专业级前端应用。它提供了一个直观、优雅的 B 端风格界面，帮助用户轻松地解析、管理和批量下载小红书笔记中的图片与视频素材。

## ✨ 功能特性

- **🚀 智能解析**：支持直接粘贴小红书 App 复制的完整分享文案，系统会自动从中提取有效链接。
- **📦 批量下载**：支持一键打包下载笔记内的所有高清图片和视频素材。
- **🌍 多语言支持**：内置简体中文与英文界面，支持在设置中无缝切换。
- **📱 响应式设计**：采用 Tailwind CSS 构建，完美适配桌面端、平板和移动端。
- **⚙️ 灵活配置**：支持自定义后端 API 地址和 API Token，适配各种 Docker 部署环境。
- **💎 极简美学**：干净的 Slate/Gray 色调，卡片式布局，提供专业的操作体验。

## 🛠 技术栈

- **框架**: React 19 (Hooks & Functional Components)
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **部署**: 纯静态前端应用，支持快速部署到任何 Web 服务器


## 🚀 部署指南

本项目作为前端界面，需要配合 `XHS-Downloader` 的后端服务运行。

### 部署后端 (API 服务)

请参考原项目 [XHS-Downloader](https://github.com/JoeanAmier/XHS-Downloader) 的说明，使用 Docker 部署后端服务。确保后端 API 端口（通常是 8000）可以被前端访问。

```bash
# 示例：启动 Docker 容器
docker run -d -p 8000:8000 joeanamier/xhs-downloader
```


### 本地开发
```bash
npm install
npm run dev
```

### 构建与部署
1. **运行构建**：
   ```bash
   npm run build
   ```
2. **预览构建产物**：
   **注意**：由于现代浏览器的安全限制，**不能**直接通过双击 `dist/index.html` 打开。必须使用 Web 服务器运行。
   ```bash
   # 使用 vite 预览
   npm run preview
   # 或者使用 serve 工具
   npx serve dist
   ```
3. **正式部署**：
   将 `dist` 文件夹中的所有内容上传到 Nginx、Apache、Vercel 或 GitHub Pages。

### 配置连接

1. 打开部署好的前端页面。
2. 点击右上角的 **“设置 (Settings)”** 图标。
3. 在 **“API 基础 URL”** 中填写您后端的访问地址（例如：`http://your-server-ip:8000`）。
4. 点击 **“保存”**。
5. 粘贴小红书链接，开始解析素材！

## ⚠️ 注意事项

1. **跨域问题 (CORS)**：如果您的前端和后端部署在不同的域名或 IP 下，请确保后端 Docker 容器配置了允许跨域访问，或者通过 Nginx 反向代理将前后台放在同一路径下。
2. **演示模式**：默认 API 地址为 `demo`，此时系统会返回模拟数据供测试界面 UI，不会调用真实接口。

## 📄 开源协议

本项目前端代码遵循 MIT 协议。核心解析逻辑依赖于 [JoeanAmier/XHS-Downloader](https://github.com/JoeanAmier/XHS-Downloader)，请在使用时遵守原项目的相关规定。

---
*声明：本项目仅供学习和研究使用，请勿用于任何违反小红书服务协议或法律法规的行为。*
