# 部署和使用指南

## 目录

1. [本地开发](#本地开发)
2. [Supabase 配置](#supabase-配置)
3. [生产环境部署](#生产环境部署)
4. [常见问题](#常见问题)

## 本地开发

### 环境设置

```bash
# 1. 安装依赖
pnpm install

# 2. 创建 .env 文件
cp .env.example .env

# 3. 在 .env 中配置 Supabase 凭证
```

### 运行开发服务器

```bash
pnpm run dev
```

访问 `http://localhost:5173`

### 编译检查

```bash
pnpm run build
```

### Lint 检查

```bash
pnpm run lint
```

## Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 点击 "New Project"
3. 填入项目信息（组织、项目名、密码、区域）
4. 等待项目创建完成

### 2. 创建数据表

1. 进入项目 Dashboard
2. 点击 "SQL Editor"
3. 点击 "New Query"
4. 复制 `database.sql` 中的 SQL 语句
5. 执行 SQL 语句

或者手动创建：

```sql
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  code TEXT NOT NULL,
  create_time TIMESTAMP DEFAULT NOW(),
  preview_img VARCHAR(255),
  CONSTRAINT title_length CHECK (char_length(title) >= 2 AND char_length(title) <= 50)
);

CREATE INDEX IF NOT EXISTS idx_cases_create_time ON cases(create_time DESC);
CREATE INDEX IF NOT EXISTS idx_cases_title_search ON cases USING GIN(to_tsvector('english', title));
```

### 3. 配置 RLS（行级安全）策略

1. 进入 "Authentication" → "Policies"
2. 在 `cases` 表上创建以下策略：

**SELECT 策略** - 允许所有人查看：
```sql
CREATE POLICY "Allow public select" ON cases
FOR SELECT USING (true);
```

**INSERT 策略** - 允许所有人插入：
```sql
CREATE POLICY "Allow public insert" ON cases
FOR INSERT WITH CHECK (true);
```

如果要防止恶意用户删除数据，不建议创建 DELETE 或 UPDATE 策略。

### 4. 获取 API 凭证

1. 进入 "Settings" → "API"
2. 复制以下信息：
   - **Supabase URL** - `VITE_SUPABASE_URL`
   - **Anon Key** - `VITE_SUPABASE_ANON_KEY`

3. 更新 `.env` 文件：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. 测试连接

启动开发服务器并尝试：
1. 上传一个新案例
2. 查看列表页是否能加载案例
3. 搜索功能是否正常

## 生产环境部署

### 使用 Vercel 部署（推荐）

1. **推送代码到 GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **在 Vercel 连接 GitHub**

- 访问 [Vercel](https://vercel.com)
- 点击 "Import Project"
- 选择您的 GitHub 仓库
- 配置构建设置（已自动检测）

3. **配置环境变量**

在 Vercel Dashboard 中：
- Project Settings → Environment Variables
- 添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`

4. **部署**

- 点击 "Deploy"
- 等待构建完成

### 使用 Netlify 部署

1. **连接 GitHub**

- 访问 [Netlify](https://netlify.com)
- 点击 "Connect from Git"
- 选择您的 GitHub 仓库

2. **配置构建**

- Build command: `pnpm run build`
- Publish directory: `dist`

3. **环境变量**

- Site settings → Build & deploy → Environment
- 添加环境变量

4. **部署**

自动部署会在推送代码时触发

### 使用 Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制文件
COPY . .

# 安装依赖
RUN pnpm install

# 构建应用
RUN pnpm run build

# 配置环境变量
ENV VITE_SUPABASE_URL=https://your-project.supabase.co
ENV VITE_SUPABASE_ANON_KEY=your-anon-key

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "run", "preview"]
```

构建和运行：

```bash
docker build -t vibe-codepen .
docker run -p 3000:3000 vibe-codepen
```

## 常见问题

### Q: 我收到 "Missing environment variables" 错误

**A:** 检查 `.env` 文件是否存在，并且包含以下内容：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

确保使用的是正确的 Supabase 项目凭证。

### Q: 上传后看不到新案例

**A:** 
1. 检查 Supabase 是否创建了数据
   - 进入 Supabase Dashboard
   - 检查 `cases` 表中是否有数据行
2. 检查 RLS 策略是否正确配置
3. 刷新列表页面

### Q: 搜索功能不工作

**A:**
1. 确保索引已创建：

```sql
CREATE INDEX IF NOT EXISTS idx_cases_title_search ON cases USING GIN(to_tsvector('english', title));
```

2. 在 Supabase 中使用 `ilike` 操作符进行搜索

### Q: 代码预览显示错误

**A:**
某些代码可能因为以下原因无法执行：
1. 违反 iframe sandbox 限制
2. 存在语法错误
3. 某些 API 不可用（如某些 DOM 操作）

尝试：
- 简化代码
- 避免使用 `eval` 或 `Function` 构造函数
- 检查浏览器控制台查看具体错误

### Q: 如何删除或修改已上传的案例？

**A:** 当前版本仅支持查看已上传的案例。如需删除或修改，请：

1. 直接在 Supabase 编辑器中修改数据
2. 或向 Supabase 表添加 UPDATE/DELETE 策略（不推荐用于生产环境）

### Q: 如何增加存储容量？

**A:** 
- Supabase Free 计划提供 1GB 存储
- 如需更多空间，升级到付费计划

### Q: 应用变慢了怎么办？

**A:**
1. 减少每页显示的案例数
2. 添加更多数据库索引
3. 使用 CDN 服务加速 UI 资源
4. 优化代码性能

---

## 监控和维护

### 监控应用性能

- 使用 Vercel Analytics 监控性能
- 检查 Supabase 日志了解 API 调用情况
- 定期检查存储空间使用情况

### 备份数据

定期导出 Supabase 数据：

```bash
# 使用 Supabase CLI
supabase db pull
```

### 更新依赖

```bash
pnpm update
```

---

需要更多帮助？查看 [README.md](./README.md) 或提交 Issue。
