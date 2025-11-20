# EaseGen 3D 数字人课程讲解系统

<div align="center">

![Status](https://img.shields.io/badge/阶段一-已完成-success)
![Python](https://img.shields.io/badge/python-3.13.6-blue)
![Platform](https://img.shields.io/badge/platform-EaseGen-blueviolet)

**AI 驱动的 3D 数字人 PPT 智能讲解系统**

[功能特性](#功能特性) • [快速开始](#快速开始) • [系统架构](#系统架构) • [开发路线](#开发路线) • [常见问题](#常见问题)

</div>

---

## 📋 项目简介

**easegen-3d-lecture-system** 是 EaseGen 平台的核心子系统，专注于 3D 数字人驱动的课程讲解场景。系统整合了 Xmov 3D 渲染引擎与 EaseGen 课程管理平台，提供智能化的课程讲解解决方案。

### 🎯 开发路线

#### ✅ 第一阶段：基础讲解系统（已完成）

**技术方案**：Xmov SDK + EaseGen API + Flask 后端

**核心功能**：
- 📊 **自动播放 PPT** - 全屏显示课程幻灯片，自动翻页
- 🤖 **3D 数字人讲解** - 逼真的 3D 数字人形象，口型与语音同步
- ⏯️ **播放控制** - 支持播放、暂停、上一段、下一段
- 🎯 **进度跳转** - 点击进度条快速跳转到指定片段
- 📱 **响应式界面** - 现代化的三栏布局设计

**实现位置**：`simplified/` 目录

**适用场景**：
- 录播课程展示
- 自动化课程讲解
- 无需互动的教学场景

#### 🚧 第二阶段：智能交互系统（规划中）

**技术方案**：在第一阶段基础上整合 Fay 开源框架

**新增功能**：
- 💬 **智能打断** - 支持随时打断数字人提问
- 🤖 **知识库问答** - 基于课程知识库的智能回答
- 🔄 **上下文理解** - LLM 驱动的对话能力
- 📚 **知识库管理** - 自定义课程知识库
- 🎥 **OBS 推流** - 支持直播推流到各平台

**实现位置**：`Fay/`、`XmovAvatarSDK/`、`course_player_with_avatar.html`

**适用场景**：
- 直播课程
- 互动教学
- 智能答疑系统

---

## ⭐ 功能特性（第一阶段）

### 核心功能

✅ **课程管理**
- 从 EaseGen 平台获取课程内容
- 自动分段处理讲稿文本
- 支持多课程切换和预览

✅ **数字人讲解**
- 3D 高清数字人形象（通过 Xmov SDK）
- TTS 语音合成
- 面部表情 + 口型同步
- 自然的肢体动作

✅ **PPT 展示**
- 高分辨率 PPT 图片显示
- 与讲解内容精确同步
- 实时显示讲解字幕

✅ **播放控制**
- 播放/暂停切换
- 上一段/下一段跳转
- 点击进度条精准定位
- 片段进度显示（如 "05 / 10"）

✅ **用户界面**
- 三栏响应式布局（课程列表 | PPT 展示 | 3D 数字人）
- 实时状态指示
- 骨架屏加载动画
- Toast 通知提示

### 技术特性

🔧 **简洁架构**
- 单一后端服务（Flask）
- 直接调用 EaseGen API
- Xmov SDK 通过 CDN 加载

🚀 **高性能**
- 异步数据加载
- 资源预加载优化
- 流畅的 UI 交互

🎨 **现代化设计**
- 毛玻璃特效
- 平滑动画过渡
- 深色/浅色主题支持

🔒 **稳定可靠**
- 完善的错误处理
- 友好的错误提示
- 自动重试机制

---

## 🚀 快速开始（第一阶段）

### 环境要求

- Windows 10/11 (推荐) 或 Linux
- Python 3.13.6+
- EaseGen 后端运行在 `http://127.0.0.1:48080`
- 稳定的网络连接（加载 Xmov SDK）

### 📦 安装依赖

```bash
# 1. 进入后端目录
cd easegen-3d-lecture-system/simplified/backend

# 2. 创建虚拟环境（如果没有）
python -m venv .venv

# 3. 激活虚拟环境
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# 4. 安装依赖
pip install -r requirements.txt
```

### ▶️ 启动服务

#### 前提条件

确保 **EaseGen 后端服务**运行在 `http://127.0.0.1:48080`

#### 启动后端服务

```bash
cd easegen-3d-lecture-system/simplified/backend
python app.py
```

**期望输出**：
```
 * Running on http://127.0.0.1:7000
 * Press CTRL+C to quit
```

#### 打开主界面

**方式 1（推荐）**：直接双击
```
easegen-3d-lecture-system/simplified/index.html
```

**方式 2**：浏览器地址栏
```
file:///E:/code/yzpd/easegen-front/easegen-3d-lecture-system/simplified/index.html
```

**方式 3**：本地服务器
```bash
cd easegen-3d-lecture-system/simplified
python -m http.server 8000
```
然后访问：`http://127.0.0.1:8000/index.html`

### ✅ 验证服务状态

打开主界面后，检查：

**正常状态**：
- ✅ 左侧课程列表正常加载
- ✅ 选择课程后可以开始播放
- ✅ 右侧数字人区域正常显示
- ✅ 点击播放后 PPT 和数字人同步工作

**异常状态**：
- ❌ "加载课程列表失败" → 检查后端服务（端口 7000）
- ❌ "课程加载失败" → 检查 EaseGen 后端（端口 48080）
- ❌ 数字人 SDK 加载失败 → 检查网络连接

---

## 🏗️ 系统架构（第一阶段）

### 整体架构图

```
┌────────────────────────────────────────────────────────┐
│           simplified/index.html (浏览器)                │
│  ┌──────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ 课程列表     │  │ PPT 展示   │  │ 3D 数字人     │  │
│  │ + 控制面板   │  │ + 字幕     │  │ (Xmov SDK)    │  │
│  └──────┬───────┘  └─────┬──────┘  └───────┬───────┘  │
└─────────┼────────────────┼──────────────────┼─────────┘
          │                │                  │
          │ HTTP           │                  │ CDN (HTTPS)
          ↓                ↓                  ↓
    ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
    │ Flask 后端  │  │ EaseGen API │  │ Xmov SDK CDN │
    │ (简化版)    │  │             │  │              │
    │ 端口:7000   │  │ 端口:48080  │  │ 在线加载     │
    └─────────────┘  └─────────────┘  └──────────────┘
         │
         └─> 聚合课程数据
             提供统一 API
```

### 技术栈

**前端**：
- HTML5 + CSS3 + Vanilla JavaScript
- Xmov Avatar SDK（CDN 加载）
- 响应式布局（CSS Grid + Flexbox）

**后端**：
- Python 3.13.6
- Flask（Web 框架）
- Flask-CORS（跨域支持）
- requests（HTTP 客户端）

**集成服务**：
- EaseGen API - 课程内容管理
- Xmov SDK - 3D 数字人渲染

### 数据流

1. **课程列表加载**：
   ```
   前端 → Flask 后端 (/api/courses)
        → EaseGen API (获取课程列表)
        → 格式化数据返回前端
   ```

2. **课程播放**：
   ```
   前端 → Flask 后端 (/api/segments/:id)
        → EaseGen API (获取所有片段数据)
        → 聚合片段信息（文本 + PPT 图片）
        → 返回完整课程数据

   前端 → 循环播放每个片段：
        1. 显示 PPT 图片
        2. 调用 Xmov SDK 朗读文本
        3. 更新进度和字幕
   ```

---

## 📁 项目结构

```
easegen-3d-lecture-system/
│
├── simplified/                        # ⭐ 第一阶段：简化版系统（当前使用）
│   ├── index.html                     # 主界面（单页应用）
│   ├── css/
│   │   ├── variables.css              # CSS 变量
│   │   ├── base.css                   # 基础样式
│   │   ├── components.css             # 组件样式
│   │   └── animations.css             # 动画效果
│   ├── js/
│   │   ├── config.js                  # 配置文件
│   │   ├── main.js                    # 主入口
│   │   ├── course-player.js           # 播放器核心逻辑
│   │   ├── ui-controller.js           # UI 控制器
│   │   └── xmov-manager.js            # Xmov SDK 管理
│   └── backend/
│       ├── app.py                     # Flask 后端服务
│       ├── requirements.txt           # Python 依赖
│       └── services/
│           ├── easegen_client.py      # EaseGen API 客户端
│           └── course_service.py      # 课程服务层
│
├── Fay/                               # 🚧 第二阶段：Fay 数字人框架（规划中）
├── XmovAvatarSDK/                     # 🚧 第二阶段：Xmov 配置服务（规划中）
├── course_player_with_avatar.html     # 🚧 第二阶段：完整版主界面（规划中）
│
├── simplified-design/                 # 设计文档和原型
├── temp/                              # 临时文件
│
└── 文档/
    ├── CLAUDE.md                      # Claude Code 开发指南
    ├── README.md                      # 本文件
    ├── easegenapi接口文档.md          # EaseGen API 文档
    ├── Fay修改总结.md                 # Fay 集成文档（第二阶段）
    └── PPT讲解系统实现方案-v2.md      # 完整技术方案（第二阶段）
```

---

## 📖 使用指南

### 基本操作

#### 1️⃣ 启动系统

```bash
# 启动后端服务
cd easegen-3d-lecture-system/simplified/backend
python app.py

# 打开主界面（双击文件）
simplified/index.html
```

#### 2️⃣ 选择课程

- 在左侧边栏的课程列表中点击选择课程
- 选中的课程会高亮显示
- 顶部面包屑导航显示课程名称

#### 3️⃣ 播放控制

**播放按钮** ▶️：
- 点击开始播放当前课程
- 播放中显示为暂停图标 ⏸️
- 再次点击暂停播放

**上一段/下一段**：
- ⏮️ 跳转到上一个片段
- ⏭️ 跳转到下一个片段

**进度条**：
- 显示当前播放进度（如 "05 / 10"）
- 点击进度条任意位置快速跳转
- 进度条填充显示完成百分比

#### 4️⃣ 观看体验

**中间区域**：
- 显示当前片段的 PPT 图片
- 底部显示讲解字幕文本

**右侧区域**：
- 3D 数字人实时讲解
- 口型与语音同步
- 自然的面部表情

**顶部状态栏**：
- 课程名称和当前片段号
- 系统状态指示

### 界面布局

```
┌──────────────────────────────────────────────────────────┐
│ 📚 当前课程 / 第 5 节              系统状态: 已加载       │
├───────────────┬────────────────────────┬──────────────────┤
│               │                        │                  │
│  课程列表     │      PPT 展示区        │   3D 数字人区    │
│               │                        │                  │
│ ● 课程 1      │  ┌──────────────────┐ │   ┌──────────┐   │
│ ● 课程 2      │  │                  │ │   │          │   │
│ ● 课程 3      │  │   PPT 图片       │ │   │  数字人  │   │
│               │  │                  │ │   │          │   │
│ [刷新]        │  └──────────────────┘ │   └──────────┘   │
│               │                        │                  │
│               │  字幕：课程讲解文本... │                  │
│               │                        │                  │
├───────────────┴────────────────────────┴──────────────────┤
│  ⏮️  ▶️  ⏭️        (05 / 10) [━━━━━━━   ] 🔊  ⛶          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 配置说明

### 后端配置

**文件**：`simplified/backend/app.py`

```python
# 端口配置
PORT = 7000

# EaseGen API 配置
EASEGEN_API_BASE = "http://127.0.0.1:48080/admin-api"
EASEGEN_API_KEY = "your_api_key_here"
```

### 前端配置

**文件**：`simplified/js/config.js`

```javascript
const CONFIG = {
    API: {
        BASE_URL: 'http://127.0.0.1:7000',
        ENDPOINTS: {
            COURSES: '/api/courses',
            SEGMENTS: '/api/segments'
        }
    },

    PLAYER: {
        AUTO_PLAY_NEXT: true,      // 自动播放下一段
        SEGMENT_DELAY: 1000,       // 段间延迟（毫秒）
    },

    UI: {
        COURSES_PER_PAGE: 100,     // 课程列表每页数量
        TOAST_DURATION: 3000,      // Toast 显示时长
        DEFAULT_THEME: 'auto'      // 主题：'light' | 'dark' | 'auto'
    }
};
```

### Xmov SDK 配置

**SDK 加载**：通过 CDN 自动加载（`index.html` 第 191 行）

```html
<script src="https://media.youyan.xyz/youling-lite-sdk/index.umd.0.1.0-alpha.63.js"></script>
```

**配置参数**：在 `js/xmov-manager.js` 中设置

---

## ❓ 常见问题

### Q1: 课程列表加载失败？

**症状**：左侧显示"加载课程列表失败"

**可能原因**：
1. 后端服务未启动（端口 7000）
2. EaseGen API 服务未启动（端口 48080）
3. 网络连接问题

**解决方法**：
```bash
# 检查后端服务
curl http://127.0.0.1:7000/api/courses

# 检查 EaseGen API
curl -H "easegen-api-key: YOUR_KEY" \
  http://127.0.0.1:48080/admin-api/digitalcourse/courses/getCoursePage
```

### Q2: 数字人 SDK 加载失败？

**症状**：右侧显示"数字人 SDK 加载失败"

**可能原因**：
1. 网络连接问题（无法访问 CDN）
2. SDK URL 失效

**解决方法**：
1. 检查网络连接
2. 打开浏览器控制台（F12）查看错误信息
3. 尝试刷新页面

### Q3: 播放时数字人不说话？

**症状**：PPT 正常显示但数字人无声音

**可能原因**：
1. 浏览器音频被禁用
2. 系统音量设置问题
3. Xmov SDK 初始化失败

**解决方法**：
1. 检查浏览器是否允许音频播放
2. 检查系统音量设置
3. F12 查看控制台是否有 SDK 错误

### Q4: PPT 图片不显示？

**症状**：讲解正常但 PPT 区域空白

**可能原因**：
1. 图片 URL 无效
2. 网络连接问题
3. 跨域限制

**解决方法**：
1. F12 → Network 查看图片请求状态
2. 检查 EaseGen API 返回的图片 URL
3. 查看浏览器控制台错误信息

### Q5: 如何切换主题？

**操作方法**：
1. 打开浏览器控制台（F12）
2. 执行 JavaScript：
   ```javascript
   document.body.classList.toggle('dark-mode');
   ```

或修改 `js/config.js` 中的 `DEFAULT_THEME` 配置。

---

## 🗺️ 开发路线图

### ✅ 第一阶段（已完成）

- [x] 基础架构搭建
- [x] EaseGen API 集成
- [x] Xmov SDK 集成
- [x] 课程列表和加载
- [x] PPT 同步显示
- [x] 播放控制功能
- [x] 进度条跳转
- [x] 响应式界面设计
- [x] 错误处理和提示
- [x] 深色模式支持

### 🚧 第二阶段（规划中）

**核心目标**：整合 Fay 开源框架，实现智能交互

**技术方案**：
- 保留第一阶段所有功能
- 集成 Fay 数字人框架
- 添加 WebSocket 实时通信
- 实现 LLM 驱动的对话能力

**新增功能**：
- [ ] 智能打断播放
- [ ] 基于知识库的问答
- [ ] 上下文对话理解
- [ ] 自定义知识库管理
- [ ] OBS 推流集成
- [ ] 自动循环播放
- [ ] 问答历史记录
- [ ] 语音输入支持

**预计完成时间**：待定

---

## 🔗 相关资源

### 技术文档

- [CLAUDE.md](./CLAUDE.md) - Claude Code 开发指南
- [EaseGen API 文档](./easegenapi接口文档.md) - API 接口说明
- [Xmov SDK 文档](https://www.xingyun3d.com/) - 3D 数字人 SDK

### 开源项目

- [Fay](https://github.com/TheRamU/Fay) - 数字人交互框架（第二阶段）
- [EaseGen](https://github.com/taoofagi/easegen-admin) - 课程管理后端

---

## 🤝 贡献指南

欢迎贡献代码和建议！

### 贡献方式

1. Fork 本项目
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 打开 Pull Request

### 代码规范

**Python**：
- 遵循 PEP 8
- 使用有意义的变量名
- 添加必要的注释和文档字符串

**JavaScript**：
- 使用 ES6+ 语法
- 一致的代码风格
- JSDoc 注释

**通用**：
- 编写清晰的提交信息
- 更新相关文档
- 添加必要的测试

---

## 📄 许可证

MIT License

---

## 📞 联系方式

如有问题或建议：

1. 查看 [常见问题](#常见问题)
2. 查阅 [技术文档](#技术文档)
3. 提交 GitHub Issue
4. 联系技术支持团队

---

<div align="center">

**第一阶段已完成，第二阶段持续规划中** 🎉

Made with ❤️ by EaseGen Team

</div>
