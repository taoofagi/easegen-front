# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

EaseGen-Front 是一个基于 Vue 3 + TypeScript + Vite 的数字人课程制作平台。它支持 AI 驱动的课程生成，包括数字人、语音合成、智能课件和视频合成功能。基于 yudao-ui-admin-vue3 框架构建。

## 开发命令

### 安装与设置
```bash
pnpm install        # 或: pnpm i
```
**要求：** Node.js > 16.18.0, pnpm >= 8.6.0 (强制使用)

### 开发
```bash
pnpm dev            # 本地开发 (.env.local)
pnpm dev-server     # 开发服务器 (.env.dev)
pnpm ts:check       # TypeScript 类型检查
```

### 构建
```bash
pnpm build:local    # 本地构建
pnpm build:dev      # 开发环境构建
pnpm build:test     # 测试环境
pnpm build:stage    # 预发布环境
pnpm build:prod     # 生产环境构建
```

### 代码检查与格式化
```bash
pnpm lint:eslint    # 修复 .js,.ts,.vue 文件中的 ESLint 问题
pnpm lint:format    # 使用 Prettier 格式化
pnpm lint:style     # 修复 stylelint 问题
```

### 预览与清理
```bash
pnpm preview        # 构建并本地预览
pnpm serve:dev      # 预览开发构建
pnpm serve:prod     # 预览生产构建
pnpm clean          # 删除 node_modules
pnpm clean:cache    # 清除 node_modules/.cache
```

## 架构概览

### 目录结构
- **src/api/** - API 服务层，按业务域组织 (digitalcourse, bpm, crm, system 等)
- **src/components/** - 可复用的 UI 组件 (48+ 个组件)
- **src/views/** - 页面组件，按功能域组织
- **src/store/modules/** - Pinia 状态管理 stores
- **src/router/** - Vue Router 配置，支持动态路由加载
- **src/hooks/web/** - 组合式函数，用于逻辑复用
- **src/utils/** - 工具函数 (auth, dict, download, permissions 等)
- **src/types/** - TypeScript 类型定义
- **src/directives/** - 自定义 Vue 指令 (v-hasPermi, v-mounted-focus)
- **src/locales/** - i18n 翻译文件 (zh-CN, en)
- **src/plugins/** - 插件集成 (formCreate, echarts, unocss 等)
- **src/styles/** - 全局样式，SCSS 变量自动导入

### 核心业务域：数字人课程制作
主要业务逻辑围绕数字人课程生产：

1. **数字人管理** (`src/views/digitalcourse/digitalhumans/`)
   - 标准和自定义数字人创建，带审核流程
   - 形象和声音定制

2. **课程模板** (`src/views/digitalcourse/template/`)
   - 可配置布局 (背景、PPT、数字人位置)
   - 模板预览系统

3. **语音合成** (`src/views/digitalcourse/voices/`)
   - 文本转语音，支持 SSML 语法
   - 自定义声音管理
   - **重要：** SSML 处理必须防止多个 `<speak>` 标签 (参见提交 5c491eab)

4. **背景管理** (`src/views/digitalcourse/backgrounds/`)
   - 课程视频背景图库

5. **题目生成** (`src/views/digitalcourse/genQuestion/`)
   - AI 驱动的题目生成

6. **视频合成**
   - 组合数字人、语音、PPT 和背景
   - 视频时长单位：毫秒 (参见提交 d927c722)
   - **重要：** 合成前必须验证脚本内容 (参见提交 d0939525)

### 状态管理 (Pinia)
位置：`src/store/modules/`

主要 stores：
- **app.ts** - 主题、布局、语言、移动端检测
- **user.ts** - 认证、用户信息
- **permission.ts** - 动态路由权限
- **dict.ts** - 数据字典系统 (广泛用于下拉框/标签)
- **tagsView.ts** - 导航面包屑

模式：
```typescript
export const useAppStore = defineStore('app', {
  state: (): AppState => ({ /* ... */ }),
  actions: { /* ... */ },
  persist: true // 使用 pinia-plugin-persistedstate
})
```

### API 服务层
位置：`src/api/`

按后端业务模块组织。每个模块导出类型化的接口和 API 对象：

```typescript
// 示例: src/api/digitalcourse/template/index.ts
export interface TemplateVO {
  id: number
  showBackground: number
  // ... 字段
}

export const TemplateApi = {
  getTemplatePage: async (params: any) => {
    return await request.get({ url: `/digitalcourse/template/page`, params })
  },
  createTemplate: async (data: TemplateVO) => {
    return await request.post({ url: `/digitalcourse/template/create`, data })
  }
}
```

**Axios 配置** (`src/config/axios/service.ts`)：
- 请求拦截器添加 JWT token 和 tenant-id 头
- 响应拦截器处理 token 刷新、401/403 重定向
- Token 刷新使用基于队列的重试机制

### 路由架构
- 动态路由通过 `permissionStore.generateRoutes()` 从后端加载
- 静态路由在 `src/router/modules/remaining.ts`
- 路由守卫在 `src/permission.ts` 处理认证、字典加载
- 白名单路由：`/login`, `/social-login`, `/auth-redirect`, `/bind`, `/register`, `/oauthLogin/gitee`

### 权限系统
- 后端返回用户权限
- 前端通过 `v-hasPermi` 指令过滤路由和 UI 元素
- 权限检查在 `src/utils/permission.ts`

### 字典系统
集中的数据字典管理，用于统一的下拉框/标签：
```vue
<dict-tag :type="DICT_TYPE.IS_OR_NOT" :value="value" />
```

### 配置
根目录下的环境文件：
- **.env.local** - 本地开发
- **.env.dev** - 开发服务器
- **.env.test** - 测试环境
- **.env.stage** - 预发布
- **.env.prod** - 生产环境

关键变量：
```bash
VITE_BASE_URL           # 后端 API 基础 URL
VITE_API_URL            # API 前缀 (/admin-api)
VITE_UPLOAD_URL         # 文件上传端点
VITE_APP_TENANT_ENABLE  # 多租户开关
VITE_APP_CAPTCHA_ENABLE # 验证码开关
```

## 关键第三方集成

### UI 与表单
- **Element Plus** (v2.8.4) - 自动导入，自定义 SCSS 主题
- **@form-create/element-ui** + designer - 动态表单构建器 (`src/plugins/formCreate/`)
- **@wangeditor/editor** - 富文本编辑器

### 工作流
- **bpmn-js** (v8.9.0) - 可视化工作流设计器，位于 `src/components/bpmnProcessDesigner/`
- 支持 Camunda、Flowable、Activiti

### 可视化
- **echarts** (v5.5.0) - 单独打包以优化性能
- **markmap-view** - 思维导图可视化

### 媒体
- **video.js** - 视频播放
- **cropperjs** - 图片裁剪
- **mediainfo.js** - 媒体文件元数据提取

### 工具库
- **axios** (v1.6.8) - HTTP 客户端
- **dayjs** - 日期处理
- **crypto-js** / **jsencrypt** - 加密 (密码使用 RSA)
- **pinyin-pro** - 中文转拼音
- **qrcode** - 二维码生成

### 图标
- **@iconify/iconify** - 4 万+ 图标，通过自定义 Icon 组件使用：
  ```vue
  <Icon icon="ep:search" />
  ```

## 开发规范

### 文件命名
- **Views:** PascalCase (例如 `DigitalHumansForm.vue`)
- **API 模块:** 小写文件夹配合 `index.ts`
- **Types:** 使用 `VO` (Value Object) 或 `Type` 后缀

### API 模式
所有 API 模块遵循此结构：
```typescript
export interface EntityVO { /* ... */ }
export const EntityApi = {
  getPage: async (params) => { /* ... */ },
  get: async (id) => { /* ... */ },
  create: async (data) => { /* ... */ },
  update: async (data) => { /* ... */ },
  delete: async (id) => { /* ... */ }
}
```

### 组件模式
- **ContentWrap** - 页面内容包装器，带标准内边距
- **Icon** - Iconify 图标包装器
- **DictTag** - 字典值显示

### i18n 键值
按业务域组织：
```typescript
t('template.name')
t('digitalHumans.customHuman')
t('action.add')  // 通用操作
t('table.createTime')  // 通用字段
```

### Schema 驱动的 CRUD
使用 `useCrudSchemas` hook 实现一致的表格/表单生成：
```typescript
const { allSchemas } = useCrudSchemas(crudSchemas)
// 生成 tableColumns, searchSchema, formSchema
```

### 组合式函数 (Hooks)
大量使用组合式 API，位于 `src/hooks/web/`：
- **useTable** - 表格 CRUD 操作
- **useForm** - 表单处理
- **useCache** - Web 存储包装器
- **useMessage** - Element Plus 消息提示助手
- **useDesign** - CSS 命名空间/BEM 工具
- **useI18n** - i18n 助手

## 重要注意事项

### 视频合成
- 视频时长单位为 **毫秒** (提交 d927c722)
- 合成前务必验证脚本内容 (提交 d0939525)
- 脚本为空时不允许合成

### SSML 语音合成
生成或处理 SSML 标记时：
- 确保每个请求只有一个根 `<speak>` 标签
- 脚本中的换行符可能导致多个 `<speak>` 标签 - 需要清理输入 (提交 5c491eab)

### Token 管理
- Access token 通过 `useCache` 存储 (localStorage/sessionStorage)
- Refresh token 流程在 axios 拦截器中处理
- 启用多租户时注入 tenant-id 头

### 多租户
- 可选功能，由 `VITE_APP_TENANT_ENABLE` 控制
- 启用时通过请求头发送 tenant-id

### 后端集成
- 预期后端 URL：`VITE_BASE_URL + /admin-api`
- 后端仓库：https://github.com/taoofagi/easegen-admin

## 快速参考：功能位置

| 功能 | 位置 |
|---------|----------|
| 数字人管理 | `src/views/digitalcourse/digitalhumans/` |
| 课程模板 | `src/views/digitalcourse/template/` |
| 语音合成 | `src/views/digitalcourse/voices/` |
| 题目生成 | `src/views/digitalcourse/genQuestion/` |
| 背景图片 | `src/views/digitalcourse/backgrounds/` |
| 用户认证 | `src/api/login/` + `src/store/modules/user.ts` |
| 权限控制 | `src/directives/permission/` |
| 文件上传 | `src/components/UploadFile/` |
| 工作流设计器 | `src/components/bpmnProcessDesigner/` |
| 富文本编辑器 | `src/components/Editor/` |
| API 拦截器 | `src/config/axios/service.ts` |
| 路由配置 | `src/router/modules/remaining.ts` |
| 全局样式 | `src/styles/variables.scss` (自动导入) |

## Vite 配置

**别名：** `@/` 映射到 `src/`

**关键插件：**
- Vue + VueJsx
- UnoCSS (原子化 CSS)
- Element Plus 自动导入
- Auto-import (Vue APIs, composables)
- Components 自动注册
- VueI18n
- SvgIcons (精灵图生成)
- Compression (Gzip/Brotli)
- ESLint

构建优化：
- Terser 压缩
- 单独的 echarts chunk
- SCSS 全局变量自动注入
