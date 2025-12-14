# ClearView AI

<div align="center">

**AI-powered watermark remover and video restorer using Google Gemini & Veo**

[![React](https://img.shields.io/badge/React-19.2.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)

🌐 **[在线体验](https://abcd122333455.github.io/clearview-ai/)** | 📖 [上传指南](./手动上传到GitHub.md)

</div>

## ✨ 功能特性

- 🖼️ **图片水印移除**: 使用 Google Gemini 2.5 Flash Image 模型智能移除图片中的水印、logo 和文字
- 🎬 **视频恢复**: 通过清理参考帧，使用 Google Veo 生成高质量的无水印视频
- 🎨 **现代化 UI**: 基于 Tailwind CSS 的深色主题界面
- ⚡ **快速响应**: 使用 Vite 构建，开发体验流畅

## 🚀 快速开始

### 在线使用

直接访问: https://abcd122333455.github.io/clearview-ai/

首次使用需要输入你的 Google Gemini API Key（仅存储在本地浏览器）。

### 本地开发

**前置要求:**
- Node.js 18+ ([下载地址](https://nodejs.org/))
- Google Gemini API Key ([获取地址](https://ai.google.dev/))

**安装步骤:**

1. **克隆仓库**
   ```bash
   git clone https://github.com/abcd122333455/clearview-ai.git
   cd clearview-ai
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置 API Key（可选）**
   
   创建 `.env.local` 文件：
   ```env
   GEMINI_API_KEY=你的API密钥
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问: http://localhost:3000

## 📖 使用说明

### 图片水印移除模式

1. 点击 "Image Remover" 标签
2. 上传带水印的图片（支持拖拽）
3. 输入自定义提示词（可选，例如："移除右下角的 logo"）
4. 点击 "Remove Watermark" 按钮
5. 等待处理完成后下载结果

### 视频恢复模式

1. 点击 "Video Restorer" 标签
2. 上传视频的参考帧（截图）
3. **第一步**: 清理参考帧中的水印
4. **第二步**: 输入视频描述（例如："海浪轻柔地移动，电影级 4K 画质"）
5. **第三步**: 生成并下载恢复后的视频

> ⏱️ **提示**: 视频生成可能需要几分钟时间

## 🛠️ 技术栈

- **前端框架**: React 19.2.3
- **语言**: TypeScript 5.8
- **构建工具**: Vite 6.2
- **UI 库**: Tailwind CSS (CDN)
- **图标**: Lucide React
- **AI 服务**: Google Gemini API (@google/genai)

## 📁 项目结构

```
clearview-ai/
├── components/          # React 组件
│   ├── ApiKeySelector.tsx
│   ├── Button.tsx
│   ├── ImageWorkspace.tsx
│   └── VideoWorkspace.tsx
├── services/            # API 服务
│   └── geminiService.ts
├── App.tsx              # 主应用组件
├── index.tsx            # 入口文件
├── types.ts             # TypeScript 类型定义
└── vite.config.ts       # Vite 配置
```

## ⚠️ 注意事项

1. **API Key 安全**: 
   - API Key 仅存储在用户本地浏览器
   - 不会上传到任何服务器
   - 每个用户使用自己的 API Key

2. **费用**: 
   - 使用 Google Gemini 和 Veo 会产生 API 调用费用
   - 建议在 Google Cloud Console 中设置使用限额

3. **环境支持**:
   - 支持本地开发和 GitHub Pages 部署
   - 在线版本需要用户手动输入 API Key

## 📝 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Powered by Google Gemini & Veo** 🚀
