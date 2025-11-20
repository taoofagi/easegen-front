# CLAUDE.md - 3D 数字人课程讲解系统

本文件为 Claude 在 `easegen-3d-lecture-system` 目录中工作时提供开发指导。

---

## 项目概述

**easegen-3d-lecture-system** 是 EaseGen 平台的 3D 数字人课程讲解子系统，分为两个阶段实现：

### 阶段一：简化版系统（✅ 已完成，当前使用）

**位置**：`simplified/` 目录
**技术栈**：Xmov SDK (CDN) + Flask + Vanilla JavaScript
**架构**：单后端服务 + 静态前端页面

```
simplified/
├── index.html           # 主界面（单页应用）
├── css/                 # 样式文件
├── js/                  # JavaScript 模块
└── backend/
    ├── app.py           # Flask 后端（端口 7000）
    ├── config.py        # 配置管理
    ├── .env             # 环境变量（唯一配置源）
    └── services/        # 服务层
```

**核心功能**：
- 课程列表和加载
- PPT 同步显示
- 3D 数字人讲解（Xmov SDK）
- 播放控制（播放/暂停/上一段/下一段/进度跳转）

### 阶段二：完整版系统（🚧 规划中）

**状态**：尚未实现，仅在设计文档中描述
**计划新增功能**：智能打断、知识库问答、LLM 对话、OBS 推流
**计划技术栈**：Fay 框架、WebSocket 通信、知识库集成

> ⚠️ **注意**：以下提到的 Stage 2 相关文件和目录目前都不存在，仅为规划内容。

---

## 开发指导（简化版）

### 架构原则

1. **配置集中管理**：所有配置必须在 `.env` 文件中，代码中不允许硬编码
2. **模块职责分离**：
   - `backend/` - 后端 API 和业务逻辑
   - `js/` - 前端逻辑模块化
   - `css/` - 样式组件化
3. **API 聚合模式**：后端聚合多个 EaseGen API 调用，前端只需一次请求

### 关键文件说明

#### 后端

| 文件 | 职责 | 关键点 |
|------|------|--------|
| `backend/app.py` | Flask 应用主文件 | 定义所有 API 路由 |
| `backend/config.py` | 配置类 | 从环境变量读取，**无默认值** |
| `backend/.env` | 环境配置 | **唯一配置源**，包含敏感信息 |
| `backend/services/easegen_client.py` | EaseGen API 客户端 | 封装所有对 EaseGen 的 HTTP 请求 |
| `backend/services/course_service.py` | 课程服务层 | 业务逻辑，数据聚合和格式化 |

#### 前端

| 文件 | 职责 | 关键点 |
|------|------|--------|
| `index.html` | 主界面 | 三栏布局，加载所有资源 |
| `js/config.js` | 前端配置 | API 端点、播放器配置、UI 配置 |
| `js/main.js` | 应用入口 | 初始化所有组件 |
| `js/course-player.js` | 播放器核心 | 课程加载、播放控制、状态管理 |
| `js/ui-controller.js` | UI 控制器 | 所有 UI 交互和更新 |
| `js/xmov-manager.js` | Xmov SDK 管理 | SDK 初始化、配置获取、speak 调用 |

### API 端点

**基础 URL**：`http://127.0.0.1:7000`

```javascript
GET  /api/health              // 健康检查
GET  /api/courses             // 课程列表（分页）
GET  /api/course/:id          // 课程详情
GET  /api/segments/:id        // 课程所有片段（文本 + PPT URL）
GET  /api/xmov-config         // Xmov SDK 配置
```

**响应格式**：
```javascript
{
  "code": 0,           // 0=成功, 非0=失败
  "message": "success",
  "data": { ... }      // 实际数据
}
```

### 配置管理

#### ⚠️ 重要规则

1. **所有配置必须在 `.env` 文件中**
2. **代码中不允许硬编码任何配置值**
3. **`config.py` 中不设置默认值**（强制从环境变量读取）
4. **敏感信息（API Key, Secret）绝不提交到版本控制**

#### 配置文件

**`backend/.env`**（唯一配置源）：
```bash
# Flask 配置
DEBUG=True
PORT=7000

# EaseGen API 配置
EASEGEN_API_URL=http://127.0.0.1:48080/admin-api
EASEGEN_API_KEY=your_api_key

# Xmov SDK 配置
XMOV_APP_ID=your_app_id
XMOV_APP_SECRET=your_app_secret

# 日志配置
LOG_LEVEL=INFO
```

**`backend/config.py`**（读取配置）：
```python
from dotenv import load_dotenv
import os

load_dotenv()  # 加载 .env 文件

class Config:
    # 强制从环境变量读取，无默认值
    XMOV_APP_ID = os.getenv('XMOV_APP_ID')
    XMOV_APP_SECRET = os.getenv('XMOV_APP_SECRET')

    # 如果配置缺失，应用将无法启动
    # 这是设计意图：防止使用错误配置运行
```

### 数据流

#### 课程播放流程

```
1. 前端加载
   ├─> 获取 Xmov 配置（GET /api/xmov-config）
   ├─> 初始化 Xmov SDK
   └─> 加载课程列表（GET /api/courses）

2. 用户选择课程
   └─> 获取所有片段（GET /api/segments/:id）
       ├─> 后端聚合 N 个片段的文本和 PPT URL
       └─> 返回完整课程数据

3. 用户点击播放
   └─> CoursePlayer.play()
       └─> 循环每个片段：
           ├─> UIController.updateSegmentDisplay()
           │   ├─> 显示 PPT 图片
           │   └─> 显示字幕文本
           ├─> XmovManager.speak(text)
           │   └─> SDK 驱动数字人说话
           └─> 等待完成 → 下一段
```

### 代码模式

#### 后端：添加新 API 端点

```python
# backend/app.py

@app.route('/api/your-endpoint', methods=['GET'])
def your_endpoint():
    """API 端点描述"""
    try:
        # 1. 获取参数
        param = request.args.get('param', 'default')

        # 2. 调用服务层
        result = your_service.do_something(param)

        # 3. 返回标准格式
        return jsonify({
            'code': 0,
            'message': 'success',
            'data': result
        })

    except Exception as e:
        app.logger.error(f'错误描述: {str(e)}')
        return jsonify({
            'code': 500,
            'message': str(e),
            'data': None
        }), 500
```

#### 前端：添加新功能模块

```javascript
// js/your-module.js

class YourModule {
    constructor() {
        this.state = {};
        this.callbacks = {};
    }

    async initialize() {
        Logger.info('初始化模块...');
        // 初始化逻辑
    }

    // 公共方法
    async doSomething() {
        try {
            const response = await api.get('/api/your-endpoint');
            if (response.code === 0) {
                // 处理成功
                return response.data;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            Logger.error('操作失败:', error);
            throw error;
        }
    }

    // 事件回调
    on(event, callback) {
        this.callbacks[event] = callback;
    }
}

// 导出到全局
window.YourModule = YourModule;
```

### 常见任务

#### 修改 UI 样式

1. 找到对应的 CSS 文件（`css/components.css` 或其他）
2. 遵循现有的 CSS 变量和命名约定
3. 使用 BEM 命名法：`.block__element--modifier`
4. 响应式设计：支持深色/浅色主题

#### 添加新配置项

1. 在 `backend/.env` 中添加配置
2. 在 `backend/config.py` 中读取：`os.getenv('YOUR_CONFIG')`
3. 在需要的地方使用：`Config.YOUR_CONFIG`
4. **不要设置默认值**（除非是 UI 配置等非敏感项）

#### 调试问题

**后端调试**：
```bash
# 查看后端日志
# Flask 自动输出到控制台

# 测试 API
curl http://127.0.0.1:7000/api/your-endpoint
```

**前端调试**：
```javascript
// 在浏览器控制台
Logger.debug('调试信息', data);

// 查看全局对象
console.log(window.CONFIG);
console.log(window.api);
```

### 依赖关系

#### 外部依赖

- **EaseGen API**（端口 48080）- 必须运行，提供课程数据
- **Xmov SDK**（CDN）- 在线加载，需要网络连接

#### Python 依赖

```
Flask==3.0.0
Flask-CORS==4.0.0
python-dotenv==1.0.0
requests==2.31.0
```

#### 前端依赖

- Xmov SDK（CDN 加载，无需本地安装）
- 纯 Vanilla JavaScript（无其他依赖）

### 注意事项

#### ⚠️ 配置安全

1. **永远不要**在代码中硬编码密钥、密码、API Key
2. **永远不要**将 `.env` 文件提交到 Git
3. `.env.example` 使用占位符，不包含真实值
4. 文档中的示例配置使用 `your_xxx` 占位符

#### ⚠️ API 调用

1. 所有 API 调用都要有错误处理
2. 后端聚合多个 API 调用时要考虑性能
3. 使用 Logger 记录关键操作和错误

#### ⚠️ 前端状态管理

1. `CoursePlayer` 管理播放状态（单一数据源）
2. `UIController` 只负责 UI 更新，不存储业务状态
3. 使用回调函数解耦模块间依赖

### 测试

#### 后端测试

```bash
# 健康检查
curl http://127.0.0.1:7000/api/health

# 测试配置加载
curl http://127.0.0.1:7000/api/xmov-config

# 测试课程 API
curl "http://127.0.0.1:7000/api/courses?page=1&size=5"
```

#### 前端测试

1. 打开 `index.html`
2. F12 查看控制台日志
3. Network 标签查看 API 请求
4. 测试所有播放控制功能

---

## 常见修改场景

### 场景 1：更换 Xmov 凭证

1. 编辑 `backend/.env`
2. 修改 `XMOV_APP_ID` 和 `XMOV_APP_SECRET`
3. 重启后端服务
4. 刷新前端页面验证

### 场景 2：修改 API 端口

1. 编辑 `backend/.env`：`PORT=新端口`
2. 编辑 `js/config.js`：`BASE_URL: 'http://127.0.0.1:新端口'`
3. 重启服务

### 场景 3：添加新的课程数据字段

1. 修改 `backend/services/course_service.py`
   - 在数据格式化中添加新字段
2. 修改 `js/ui-controller.js`
   - 在 UI 渲染中使用新字段
3. 修改 CSS（如果需要新样式）

### 场景 4：优化播放逻辑

1. 修改 `js/course-player.js` 中的播放相关方法
2. 考虑影响：
   - 状态管理（`isPlaying`, `isPaused`）
   - 回调触发（`onPlayStateChange`, `onSegmentChange`）
   - UI 更新（通过 `UIController`）

---

## 项目文件索引

> 📁 **注意**：以下所有路径相对于 `simplified/` 目录（阶段一实现）

### 关键代码位置

| 功能 | 文件位置 | 行号/方法 |
|------|---------|----------|
| API 路由定义 | `backend/app.py` | 第 31-158 行 |
| Xmov 配置端点 | `backend/app.py` | 第 127-158 行 |
| 配置加载 | `backend/config.py` | 第 9-10 行（load_dotenv） |
| 课程数据聚合 | `backend/services/course_service.py` | 第 77-141 行 |
| 播放器核心逻辑 | `js/course-player.js` | `play()`, `_playSegment()` |
| Xmov SDK 初始化 | `js/xmov-manager.js` | `initialize()` 方法 |
| UI 更新逻辑 | `js/ui-controller.js` | `updateSegmentDisplay()` |
| 进度条点击 | `js/ui-controller.js` | `handleProgressBarClick()` |

### 配置文件

| 文件 | 用途 | 是否提交 Git |
|------|------|-------------|
| `backend/.env` | 真实配置 | ❌ 不提交 |
| `backend/.env.example` | 配置模板 | ✅ 提交 |
| `backend/config.py` | 配置类定义 | ✅ 提交 |
| `js/config.js` | 前端配置 | ✅ 提交 |

---

## 相关文档

- **README.md** - 项目说明、功能介绍、快速开始指南
- **docs/架构设计方案.md** - 详细技术架构说明
- **docs/PPT讲解系统实现方案-v2.md** - PPT 讲解系统实现方案（包含两阶段详细设计）
- **XmovAvatarSDK/** - Xmov SDK 工具和文档

---

## 开发工作流

### 添加新功能

1. 理解需求和数据流
2. 后端：
   - 添加/修改 API 端点
   - 更新服务层逻辑
3. 前端：
   - 添加/修改 JavaScript 模块
   - 更新 UI 组件
   - 添加/修改 CSS 样式
4. 测试：
   - 后端 API 测试（curl/Postman）
   - 前端功能测试（浏览器）
   - 边界情况测试
5. 文档：
   - 更新 README.md（用户可见）
   - 更新本 CLAUDE.md（开发指导）

### 修复 Bug

1. 重现问题
2. 查看日志（后端终端 + 浏览器控制台）
3. 定位代码位置（参考上面的"关键代码位置"）
4. 修复并测试
5. 验证相关功能未受影响

---

## 第二阶段（完整版）开发指导

> ⚠️ **重要提示**：第二阶段尚未开始实施，以下内容为规划设计，相关文件和目录目前均不存在。

### 规划架构差异

完整版相比简化版的计划改进：

1. **多服务架构**（规划）：
   - PPTLecturePlayer（计划端口 6001）- 课程播放控制
   - Fay（计划端口 5000, 10002）- 数字人交互框架
   - XmovAvatarSDK 服务（计划端口 5002）- SDK 配置服务

2. **通信方式**（规划）：
   - WebSocket（Fay）替代 HTTP 轮询
   - metadata 机制同步 PPT 和讲解

3. **新增功能**（规划）：
   - 智能问答（LLM 集成）
   - 知识库集成
   - 语音输入支持
   - OBS 推流支持

### 计划实现的文件结构

以下文件和目录计划在第二阶段创建：

- `course_player_with_avatar.html` - 完整版主界面（待创建）
- `Fay/` 目录 - Fay 框架集成（待创建）
  - `Fay/core/interact.py` - metadata 支持
  - `Fay/core/fay_core.py` - 消息携带 metadata
  - `Fay/core/wsa_server.py` - 接收外部消息
- `PPTLecturePlayer/` 目录 - 播放控制服务（待创建）

### 设计要点

第二阶段开发时需要注意：

1. Fay 框架修改需要完全重启才能生效
2. metadata 必须原样传递（课程数据）
3. messageType 用于区分课程内容和用户问答
4. 保持与简化版的配置兼容性

---

## 文档修订历史

- **2025-11-20**：修正所有文件引用，确保准确性
  - 移除对不存在的 Stage 2 文件的直接引用（`course_player_with_avatar.html`, `Fay/`, `PPTLecturePlayer/`）
  - 明确标注 Stage 2 内容为规划状态，所有相关文件标注"待创建"
  - 更新"相关文档"部分，移除不存在的 `easegenapi接口文档.md`
  - 在文件索引中添加路径说明，所有路径相对于 `simplified/` 目录

---

*最后更新：2025-11-20*
