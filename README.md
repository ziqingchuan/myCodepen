# Vibe CodePen - 简易前端交互案例平台

一个基于 React + Vite 的轻量级前端交互案例分享平台，集成 Supabase 数据库，支持案例上传、预览、搜索和分页展示。

## 项目特性

- 📚 **案例上传**：支持 HTML/CSS/JavaScript 代码的上传和实时预览
- ✏️ **修改案例**：支持在线编辑和更新已发布的案例
- 🗑️ **删除案例**：支持删除不再需要的案例
- 🔍 **搜索功能**：快速搜索案例标题并实时筛选
- 🎨 **代码高亮**：使用 react-syntax-highlighter 提供代码语法高亮
- 📱 **响应式设计**：基于 TailwindCSS 的现代化 UI 设计
- ⚡ **高性能预览**：在 iframe 中实时渲染代码，延迟时间 ≤ 1 秒
- 📄 **分页展示**：每页显示 10 个案例，支持快速分页导航
- 💾 **数据持久化**：使用 Supabase 存储和管理案例数据

## 技术栈

| 技术 | 规格 |
|------|------|
| **框架** | React 19.2+ |
| **构建工具** | Vite 7.3+ |
| **包管理** | pnpm |
| **数据库** | Supabase |
| **样式** | TailwindCSS 3.4+ |
| **代码高亮** | react-syntax-highlighter + Prism.js |
| **路由** | react-router-dom 6.30+ |
| **HTTP客户端** | Axios |
| **语言** | TypeScript 5.9+ |

## 快速开始

### 1. 环境要求

- Node.js 18+ 
- pnpm 10.31+

### 2. 项目安装

```bash
# 安装依赖
pnpm install
```

### 3. Supabase 配置

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中执行以下命令创建 `cases` 表：

```sql
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  code TEXT NOT NULL,
  create_time TIMESTAMP DEFAULT NOW(),
  preview_img VARCHAR(255)
);

-- 创建索引以优化搜索
CREATE INDEX idx_cases_title ON cases USING GIN(to_tsvector('chinese', title));
```

3. 在项目根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

4. 在 `.env` 中填入您的 Supabase 信息：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 启动开发服务器

```bash
pnpm run dev
```

访问 `http://localhost:5173`

### 5. 生产环境构建

```bash
pnpm run build
```

预览构建后的应用：

```bash
pnpm run preview
```

## 项目结构

```
src/
├── components/           # 可复用组件
│   ├── CodeEditor.tsx       # 代码编辑器
│   ├── PreviewArea.tsx      # 预览区域
│   ├── CodeHighlighter.tsx  # 代码高亮显示
│   ├── Navigation.tsx       # 导航栏
│   ├── Toast.tsx            # 提示通知
│   ├── Loading.tsx          # 加载指示器
│   ├── Pagination.tsx       # 分页控件
│   └── index.ts             # 组件导出
├── pages/               # 页面组件
│   ├── ListPage.tsx         # 案例列表页面
│   ├── UploadPage.tsx       # 案例上传页面
│   ├── DetailPage.tsx       # 案例详情页面
│   └── index.ts             # 页面导出
├── services/            # 服务和 API
│   ├── supabase.ts          # Supabase 客户端配置
│   └── caseService.ts       # 案例数据服务
├── types/               # TypeScript 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   └── helpers.ts
├── styles/              # 全局样式
│   └── index.css
├── App.tsx              # 应用主组件
└── main.tsx             # 应用入口
```

## 页面说明

### 🏠 案例列表页 (`/`)

- 显示所有上传的案例
- 支持按标题搜索
- 卡片式布局展示，每页 10 个
- 分页导航

### ➕ 新增案例页 (`/upload`)

- 标题输入（2-50 字）
- 代码编辑区（支持 HTML/CSS/JS）
- 实时预览区
- 上传成功/失败提示

### 📖 案例详情页 (`/detail/:id`)

- 只读代码编辑器
- 代码高亮显示
- 一键复制代码
- 实时预览区

### ✏️ 案例编辑页 (`/edit/:id`)

- 加载并编辑现有案例
- 标题和代码均可修改
- 实时预览更新
- 更新成功/失败提示

## 性能指标

根据 PRD，以下是项目的性能目标：

| 指标 | 目标 | 说明 |
|------|------|------|
| 代码预览延迟 | ≤ 1 秒 | 从编辑代码到预览区更新 |
| 列表首次加载 | ≤ 2 秒 | 页面加载到内容显示 |
| 分页加载 | ≤ 1 秒 | 分页导航响应时间 |
| 搜索筛选 | ≤ 800ms | 输入关键词到结果更新 |
| 一键复制 | ≤ 500ms | 点击复制按钮到剪贴板成功 |

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## 常见问题

### Q: 部署后无法连接 Supabase

A: 检查 `.env` 文件中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确填入，确保 Supabase 项目已启用。

### Q: 代码预览失败

A: 某些特定的 JavaScript 代码可能会因为安全限制（Content Security Policy）而无法执行。尝试简化代码或避免使用 `eval` 等危险操作。

### Q: 搜索不到已上传的案例

A: 确保 Supabase 数据库中 `cases` 表已正确创建，并且已经插入了数据。

---

**Created with ❤️ for Front-end Developers**
