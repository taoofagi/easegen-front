# 简化版 3D 数字人课程播放系统

> 基于 EaseGen + Xmov 的极简课程播放方案，采用苹果级设计美学

## ✨ 特性

- ✅ **极简架构** - 移除 Fay 依赖，只需 2 个服务（后端 + EaseGen）
- ✅ **苹果级设计** - 毛玻璃效果、流畅动画、深色模式
- ✅ **3D 数字人** - Xmov SDK 驱动，口型同步
- ✅ **自动播放** - 智能管理课程进度和片段切换
- ✅ **响应式布局** - 支持桌面、平板、手机
- ✅ **易于调试** - 单一后端，清晰的日志系统

## 📋 系统要求

### 必需
- **Python 3.8+**
- **现代浏览器**（Chrome/Edge/Safari/Firefox）
- **EaseGen 后端服务**（端口 48080）

### 可选
- **Node.js**（如需使用 HTTP 服务器）

## 🚀 快速开始

### 1. 启动 EaseGen 后端

确保 EaseGen 后端服务运行在 `http://127.0.0.1:48080`

### 2. 配置环境变量

```bash
# 进入后端目录
cd backend

# 复制配置文件
copy .env.example .env

# 编辑 .env 文件
notepad .env
```

**必须配置的变量**:
```env
EASEGEN_API_URL=http://127.0.0.1:48080/admin-api
EASEGEN_API_KEY=ak_6Lhr10waeBfdRgmABBge
XMOV_APP_ID=your_app_id
XMOV_APP_SECRET=your_app_secret
```

### 3. 启动服务

#### Windows:
```bash
start.bat
```

#### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

#### 手动启动:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate    # Windows
# source .venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
python app.py
```

### 4. 打开前端界面

**方式 1 (推荐)**: 直接打开
```
双击 index.html
```

**方式 2**: 使用 HTTP 服务器
```bash
# Python 自带
python -m http.server 8000

# 访问 http://127.0.0.1:8000
```

**方式 3**: 使用 VS Code Live Server
- 安装 Live Server 扩展
- 右键 `index.html` → "Open with Live Server"

---

## 📐 目录结构

```
simplified/
├── backend/                    # 后端服务
│   ├── app.py                  # Flask 主应用
│   ├── config.py               # 配置管理
│   ├── services/
│   │   ├── easegen_client.py   # EaseGen API 客户端
│   │   └── course_service.py   # 课程业务逻辑
│   ├── requirements.txt        # Python 依赖
│   ├── .env.example            # 环境变量模板
│   └── .env                    # 环境变量（需手动创建）
│
├── css/                        # 样式文件
│   ├── variables.css           # CSS 变量（颜色、字体等）
│   ├── base.css                # 基础样式
│   ├── components.css          # 组件样式
│   └── animations.css          # 动画效果
│
├── js/                         # JavaScript 文件
│   ├── config.js               # 前端配置
│   ├── xmov-manager.js         # Xmov SDK 管理器
│   ├── course-player.js        # 播放器核心逻辑
│   ├── ui-controller.js        # UI 控制器
│   └── main.js                 # 主入口文件
│
├── index.html                  # 主页面
├── start.bat                   # Windows 启动脚本
├── start.sh                    # Linux/Mac 启动脚本
└── README.md                   # 本文件
```

---

## 🔧 配置说明

### 后端配置 (`.env`)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DEBUG` | 调试模式 | `True` |
| `PORT` | 后端服务端口 | `7000` |
| `EASEGEN_API_URL` | EaseGen API 地址 | `http://127.0.0.1:48080/admin-api` |
| `EASEGEN_API_KEY` | EaseGen API 密钥 | `ak_6Lhr10waeBfdRgmABBge` |
| `XMOV_APP_ID` | Xmov 应用 ID | **需配置** |
| `XMOV_APP_SECRET` | Xmov 应用密钥 | **需配置** |

### 前端配置 (`js/config.js`)

```javascript
const CONFIG = {
    API: {
        BASE_URL: 'http://127.0.0.1:7000',  // 后端地址
    },
    PLAYER: {
        AUTO_PLAY_NEXT: true,               // 自动播放下一段
        SEGMENT_DELAY: 500,                 // 段落间隔（毫秒）
        DEFAULT_VOLUME: 80                  // 默认音量
    }
};
```

---

## 🎨 设计系统

### 颜色系统

#### 浅色模式
```css
--accent: #007aff;              /* 苹果蓝 */
--text-primary: #1d1d1f;        /* 主文本 */
--bg-primary: rgba(255, 255, 255, 0.7);  /* 毛玻璃背景 */
```

#### 深色模式
```css
--accent: #0a84ff;              /* 亮蓝 */
--text-primary: #f5f5f7;        /* 主文本 */
--bg-primary: rgba(28, 28, 30, 0.85);    /* 毛玻璃背景 */
```

### 排版系统
- **字体**: -apple-system, SF Pro Display
- **字号**: 11px - 34px（8 级）
- **字重**: 400 / 500 / 600 / 700

### 间距系统
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

### 动画曲线
- **ease-out**: cubic-bezier(0.23, 1, 0.32, 1) - 苹果默认
- **ease-spring**: cubic-bezier(0.68, -0.55, 0.265, 1.55) - 弹簧效果

---

## 📡 API 接口

### 后端 API

#### 1. 获取课程列表
```http
GET /api/courses?page=1&size=20
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 50,
    "list": [
      {
        "id": "887",
        "name": "Python 编程入门",
        "totalSegments": 45,
        "progress": 65
      }
    ]
  }
}
```

#### 2. 获取课程所有片段
```http
GET /api/segments/:courseId
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "courseId": "887",
    "courseName": "Python 编程入门",
    "totalSegments": 45,
    "segments": [
      {
        "no": 1,
        "text": "欢迎来到 Python 编程入门课程...",
        "pptImageUrl": "http://127.0.0.1:48080/admin-api/infra/file/4/get/slide_1.png"
      }
    ]
  }
}
```

#### 3. 获取 Xmov 配置
```http
GET /api/xmov-config
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "appId": "xxx",
    "appSecret": "yyy"
  }
}
```

---

## 🐛 故障排查

### 问题 1: 后端启动失败

**症状**: `ModuleNotFoundError: No module named 'flask'`

**解决**:
```bash
cd backend
pip install -r requirements.txt
```

### 问题 2: 数字人 SDK 配置缺失

**症状**: 页面显示 "数字人SDK 配置缺失"

**解决**:
1. 检查 `backend/.env` 文件是否存在
2. 确认 `XMOV_APP_ID` 和 `XMOV_APP_SECRET` 已配置
3. 重启后端服务

### 问题 3: 无法加载课程列表

**症状**: 页面显示 "加载课程列表失败"

**解决**:
1. 确认 EaseGen 后端服务运行正常
2. 检查 `EASEGEN_API_URL` 配置是否正确
3. 检查 `EASEGEN_API_KEY` 是否有效
4. 查看后端控制台日志

### 问题 4: PPT 无法显示

**症状**: PPT 区域显示 404 错误

**解决**:
1. 确认课程中有 PPT 图片
2. 检查 EaseGen 文件服务是否运行
3. 查看浏览器控制台网络请求

### 问题 5: 数字人无法说话

**症状**: 有 PPT 但数字人不动

**解决**:
1. 点击页面任意位置激活音频系统
2. 检查浏览器控制台是否有错误
3. 确认 Xmov SDK 已成功初始化
4. 检查网络连接

---

## 🔍 调试技巧

### 浏览器控制台

打开 F12 查看详细日志：
```javascript
// 查看应用状态
app.getState()

// 手动播放文本
app.xmovManager.speak('测试文本')

// 重新加载
app.reload()
```

### 后端日志

后端会输出详细的日志信息，包括：
- API 请求和响应
- 课程加载进度
- 错误堆栈

---

## 📊 性能优化

### 前端
- ✅ CSS 动画使用 GPU 加速（transform/opacity）
- ✅ 骨架屏减少白屏时间
- ✅ 图片懒加载（PPT 切换时加载）
- ✅ 防抖/节流优化事件处理

### 后端
- ✅ 使用 requests.Session 复用连接
- ✅ 批量获取课程片段
- ✅ 简化 API 调用链

---

## 🎯 使用场景

### 1. 在线教育
- 课程自动讲解
- AI 教师授课
- 培训视频生成

### 2. 企业培训
- 员工入职培训
- 产品知识讲解
- 技能培训课程

### 3. 内容创作
- 快速生成讲解视频
- PPT 自动配音
- 知识分享

---

## 🔄 与原版对比

| 维度 | 原版（含 Fay） | 简化版 |
|------|--------------|-------|
| **服务数量** | 4 个 | 2 个 |
| **启动步骤** | 7 步 | 2 步 |
| **调试难度** | 高 | 低 |
| **设计美观度** | 中等 | 苹果级 |
| **打断功能** | ✅ | ❌ |
| **实时问答** | ✅ | ❌ |
| **深色模式** | ❌ | ✅ |
| **响应式** | ❌ | ✅ |

---

## 📈 后续扩展

### Phase 2（可选）
- [ ] 添加播放速度控制
- [ ] 字幕显示
- [ ] 播放历史记录
- [ ] 收藏夹功能

### Phase 3（可选）
- [ ] 多语言支持
- [ ] 课程搜索
- [ ] 全屏模式
- [ ] 快捷键支持

---

## 📝 技术栈

### 前端
- **HTML5** - 语义化标记
- **CSS3** - 毛玻璃、动画
- **JavaScript (ES6+)** - 原生开发
- **Xmov Avatar SDK** - 3D 数字人渲染

### 后端
- **Python 3.8+**
- **Flask 3.0** - Web 框架
- **Requests** - HTTP 客户端
- **python-dotenv** - 环境变量管理

---

## 📄 许可证

本项目仅供学习和参考使用。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📞 联系方式

遇到问题？查看[故障排查](#-故障排查)章节或提交 Issue。

---

**Enjoy! 🎉**
