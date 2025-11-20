# PPT讲解系统实现方案 v2.0（独立模块版）

**文档版本**: v2.0
**创建时间**: 2025-11-08
**更新**: 采用独立模块架构，最小化对Fay和Xmov的修改

---

## 📋 目录

1. [需求概述](#需求概述)
2. [架构设计](#架构设计)
3. [新模块设计](#新模块设计)
4. [实现步骤](#实现步骤)
5. [对现有系统的修改](#对现有系统的修改)
6. [配置文件](#配置文件)
7. [代码实现](#代码实现)
8. [OBS配置](#obs配置)
9. [测试方案](#测试方案)
10. [部署说明](#部署说明)

---

## 需求概述

### 核心目标

创建一个**独立的中间层模块** `PPTLecturePlayer`，协调EaseGen、Fay和Xmov三个系统，实现3D数字人自动讲解PPT课程的功能。

### 功能需求

1. **自动播放PPT**
   - 从EaseGen API获取课程文本片段
   - 全屏显示PPT图片作为背景
   - 自动循环播放所有片段

2. **数字人讲解**
   - 3D数字人悬浮在右下角
   - 根据口播稿自动讲解
   - 口型、表情与语音同步

3. **互动问答**
   - 支持文本打断提问
   - 通过Fay的LLM回答问题
   - 回答后重新播放当前片段

4. **OBS推流**
   - 将PPT+数字人组合为单一画面
   - 适配直播推流需求

### 设计原则

✅ **最小化修改原系统**: Fay和Xmov原代码尽量不动
✅ **独立模块**: 新建独立目录，可单独部署
✅ **复用现有功能**: 充分利用Fay的TTS、LLM和Xmov的渲染能力
✅ **配置化**: 所有配置独立管理，易于调整

### ⚡ 核心交互方式（重要）

**关键确认**:
- ✅ **用户直接与Fay交互**（通过语音或文本输入）
- ✅ **不是通过新模块输入**
- ✅ **新模块只负责PPT展示和同步控制**

**同步挑战**:
- Fay输出两种内容：课程讲解（需切换PPT）+ 用户提问回答（不切换PPT）
- 必须精确区分哪些内容应该触发PPT切换
- PPT显示必须与Xmov数字人说话同步

**解决方案**: 双WebSocket监听 + 文本匹配机制

---

## 架构设计

### 整体架构图（双WebSocket版）

```
                     ┌────────────────┐
                     │   用户输入     │
                     │ (语音/文本)    │
                     └───────┬────────┘
                             │ 直接交互
                             ↓
┌─────────────────────────────────────────────────┐
│              Fay (原系统)                        │
│              端口: 5000, WS: 10002               │
│  ┌────────────────────────────────────────┐    │
│  │ - ASR (语音识别)                       │    │
│  │ - LLM (对话生成)                       │    │
│  │ - TTS (语音合成)                       │    │
│  │ - WebSocket服务器(10002)               │    │
│  └────────────────────────────────────────┘    │
└──────────┬──────────────────────┬───────────────┘
           │                      │
           │ WS(课程文本)         │ WS(所有输出)
           ↓                      ↓
┌──────────────────────┐  ┌──────────────────────┐
│  新模块后端(5003)    │  │   前端页面(浏览器)   │
│  PPTLecturePlayer    │  │                      │
│  ┌────────────────┐  │  │  ┌────────────────┐ │
│  │ FayConnector   │  │  │  │ WebSocket 1    │ │
│  │ (WS Client)    │──┼──┼─▶│ → 新模块(5003) │ │
│  │ 发送课程文本   │  │  │  │ 接收PPT指令    │ │
│  └────────────────┘  │  │  └────────────────┘ │
│  ┌────────────────┐  │  │  ┌────────────────┐ │
│  │ EaseGenClient  │  │  │  │ WebSocket 2    │ │
│  │ 获取课程数据   │◀─┼──┼──│ → Fay(10002)   │ │
│  └────────────────┘  │  │  │ 接收语音数据   │ │
│  ┌────────────────┐  │  │  └────────────────┘ │
│  │ 文本匹配逻辑   │  │  │  ┌────────────────┐ │
│  │ 区分课程/问答  │  │  │  │ PPT显示区      │ │
│  └────────────────┘  │  │  │ (全屏背景)     │ │
│         │            │  │  └────────────────┘ │
│         │ HTTP       │  │  ┌────────────────┐ │
│         ↓            │  │  │ Xmov SDK       │ │
│  ┌────────────────┐  │  │  │ (右下悬浮)     │ │
│  │ EaseGen API    │  │  │  │ 接收语音驱动   │ │
│  │ 48080端口      │  │  │  └────────────────┘ │
│  └────────────────┘  │  └──────────────────────┘
└──────────────────────┘

关键数据流:
1. 新模块 → Fay: 发送课程文本 + 文本摘要(Hash)
2. 新模块 → 前端WS1: 发送PPT准备指令 + 文本摘要
3. Fay → 前端WS2: 输出TTS语音数据
4. 前端: 匹配文本摘要，决定是否显示PPT
5. 前端: 将所有语音数据传给Xmov SDK
```

### 数据流向详解

#### 流程1: 自动播放PPT（带同步机制）

```
1. 用户访问 http://localhost:5003
   前端初始化:
   - WebSocket 1连接新模块(5003)
   - WebSocket 2连接Fay(10002) ← 关键：双连接
   - 初始化Xmov SDK
   ↓
2. 用户点击"开始播放"
   前端 → 新模块: {action: 'play', courseId: '1024'}
   ↓
3. 新模块调用EaseGen API
   GET /digitalcourse/courses/getCourseText?course_id=1024&no=1
   Header: easegen-api-key: xxx
   ↓
4. EaseGen返回片段数据
   {
     "code": 0,
     "data": {
       "text": "欢迎来到人工智能课程。今天我们将学习...",
       "img": "https://example.com/ppt/page1.jpg",
       "currentNo": 1,
       "totalNo": 50
     }
   }
   ↓
5. 新模块计算文本摘要(Hash)
   text_hash = hash("欢迎来到人工智能课程。今天我们将学习..."[:100])
   ↓
6. 新模块通过WS1发送PPT准备指令给前端
   {
     "type": "ppt_ready",
     "data": {
       "imageUrl": "https://example.com/ppt/page1.jpg",
       "currentNo": 1,
       "totalNo": 50,
       "textHash": 12345678  ← 用于匹配
     }
   }
   前端收到后: pendingPPT = data (暂不显示)
   ↓
7. 新模块作为WebSocket客户端连接Fay:10002
   发送文本: "欢迎来到人工智能课程。今天我们将学习..."
   ↓
8. Fay处理流程:
   接收文本 → LLM处理(可能原文返回) → TTS合成
   → 通过WS(10002)广播语音数据
   ↓
9. 前端通过WS2监听Fay消息
   收到: {
     "Topic": "human",
     "Data": {
       "Key": "text",
       "Value": "欢迎来到人工智能课程。今天我们将学习...",
       "IsFirst": 1,
       "IsEnd": 0
     }
   }
   ↓
10. 前端执行同步判断(关键)
    if (msg.Data.IsFirst === 1) {
      // 计算文本Hash
      received_hash = hash(msg.Data.Value[:100])

      // 与pendingPPT的textHash比对
      if (received_hash === pendingPPT.textHash) {
        // 匹配！这是课程内容，显示PPT
        showPPT(pendingPPT.imageUrl)
        pendingPPT = null
      } else {
        // 不匹配，这是用户问答，不显示PPT
      }
    }

    // 无论是否匹配，都传给Xmov SDK
    xmovSDK.speak(msg.Data.Value, msg.Data.IsFirst, msg.Data.IsEnd)
    ↓
11. 数字人开始说话，PPT同步显示
    ↓
12. 讲解完成后(IsEnd=1)，新模块请求下一片段
    no = 2
    回到步骤3
    ↓
13. 循环播放，到最后一片段后回到第一片段
```

#### 流程2: 打断提问（关键：用户直接与Fay交互）

**重要**: 用户是直接在Fay的界面（或通过语音）提问，不是通过新模块的前端！

```
1. 用户通过Fay的Web控制台(localhost:5000)输入问题
   或通过语音直接向Fay提问:
   "什么是机器学习?"
   ↓
2. Fay接收到用户输入
   ASR识别(如果是语音) → LLM生成回答
   ↓
3. Fay通过TTS合成回答语音
   "机器学习是一种让计算机从数据中学习的技术..."
   ↓
4. Fay通过WS(10002)广播语音数据
   {
     "Topic": "human",
     "Data": {
       "Key": "text",
       "Value": "机器学习是一种让计算机从数据中学习的技术...",
       "IsFirst": 1,
       "IsEnd": 0
     }
   }
   ↓
5. 前端通过WS2监听到Fay消息
   ↓
6. 前端执行同步判断
   received_hash = hash("机器学习是一种让计算机..."[:100])

   if (pendingPPT && received_hash === pendingPPT.textHash) {
     // 匹配课程内容
     showPPT(pendingPPT.imageUrl)
   } else {
     // 不匹配！这是用户问答
     // 不显示PPT，保持当前页面
     console.log('用户问答，不切换PPT')
   }

   // 传给Xmov SDK（数字人回答问题）
   xmovSDK.speak(msg.Data.Value, msg.Data.IsFirst, msg.Data.IsEnd)
   ↓
7. 数字人开始说话回答问题，PPT保持不变
   ↓
8. 回答完成后(IsEnd=1)
   新模块检测到一段时间没有新的课程内容
   可选：自动恢复播放当前片段
   或：等待用户继续播放
```

**区分机制**:
- 课程内容: pendingPPT存在 + textHash匹配 → 显示PPT
- 用户问答: 没有pendingPPT或Hash不匹配 → 不显示PPT

---

## 🔑 同步机制详解（核心）

### 挑战分析

**问题**: Fay的WebSocket(10002)会广播所有TTS输出，包括：
1. 课程讲解内容（需要切换PPT）
2. 用户提问的回答（不应切换PPT）

**无法区分的原因**:
- 消息格式完全相同
- 没有"消息类型"字段
- 无法通过Topic或Key区分

**必须解决**: PPT显示必须与课程内容精确同步，但不能被用户问答触发

### 解决方案：文本哈希匹配

#### 核心思路

```
新模块发送课程文本前:
  ├─ 计算文本摘要(Hash)
  ├─ 记录这个Hash作为"待匹配标记"
  ├─ 通知前端准备显示PPT(附带Hash)
  └─ 发送文本给Fay

前端收到Fay输出时:
  ├─ 计算收到文本的Hash
  ├─ 与"待匹配标记"比对
  ├─ 匹配 → 课程内容 → 显示PPT
  └─ 不匹配 → 用户问答 → 不处理
```

#### 哈希算法

**JavaScript实现** (前端):
```javascript
function simpleHash(str) {
  // 取前100个字符，避免LLM改写影响
  const sample = str.substring(0, 100);

  let hash = 0;
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
```

**Python实现** (后端):
```python
def simple_hash(text: str) -> int:
    """计算文本的简单哈希值"""
    # 取前100个字符
    sample = text[:100]

    hash_value = 0
    for char in sample:
        hash_value = ((hash_value << 5) - hash_value) + ord(char)
        hash_value = hash_value & 0xFFFFFFFF  # 32位整数

    return hash_value
```

#### 为什么只取前100个字符？

1. **Fay的LLM可能改写文本**
   - 输入: "欢迎来到人工智能课程。今天我们将学习机器学习的基础知识。"
   - 输出: "欢迎来到人工智能课程。今天我们将学习机器学习的基础知识。首先，让我们了解一下..."
   - 开头部分通常保持不变

2. **性能考虑**
   - 哈希计算快速
   - 减少网络传输数据量

3. **足够唯一性**
   - 100个字符的Hash已经足够区分不同内容

### 工作流程时序图

```
时间轴 ────────────────────────────────────────────>

新模块后端:
  │
  ├─ [t0] 获取课程片段text="欢迎来到..."
  │
  ├─ [t1] 计算Hash: h1 = hash(text[:100])
  │        记录: pending_hash = h1
  │
  ├─ [t2] 通知前端: {type:'ppt_ready', hash:h1, img:...}
  │
  └─ [t3] 发送text给Fay
         │
         │ (Fay处理中...)
         │
前端页面: │
  │       │
  ├─ [t2] 收到ppt_ready
  │        存储: pendingPPT = {hash:h1, img:...}
  │
  ├─ [t5] 收到Fay的WS消息
  │        text2 = "欢迎来到..."
  │        h2 = hash(text2[:100])
  │
  ├─ [t5] 比对: h1 == h2?
  │        ✅ 匹配！显示PPT
  │        pendingPPT = null
  │
  └─ [t5] 传给Xmov SDK说话
         │
         ↓
      数字人说话 + PPT显示同步！
```

### 边界情况处理

#### 情况1: LLM大幅改写文本

**场景**: Fay的LLM将课程文本完全改写

**解决方案**:
- 在Fay配置中关闭LLM处理，或使用"echo"模式
- 或者：使用更宽松的匹配策略（模糊匹配前50个字符）

#### 情况2: 多条消息同时到达

**场景**: 用户快速连续提问

**解决方案**:
```javascript
let pendingPPTQueue = [];  // 队列，不是单个对象

// 收到ppt_ready时
pendingPPTQueue.push({hash, imageUrl, ...});

// 收到Fay消息时
for (let i = 0; i < pendingPPTQueue.length; i++) {
  if (hash(msg.Value[:100]) === pendingPPTQueue[i].hash) {
    showPPT(pendingPPTQueue[i].imageUrl);
    pendingPPTQueue.splice(i, 1);
    break;
  }
}
```

#### 情况3: 超时未匹配

**场景**: 新模块发送了text，但5秒内前端没收到匹配的Fay消息

**解决方案**:
```javascript
// 设置超时清理
setTimeout(() => {
  if (pendingPPT && pendingPPT.hash === h1) {
    console.warn('PPT匹配超时，清理pendingPPT');
    pendingPPT = null;
  }
}, 5000);  // 5秒超时
```

### 调试支持

**前端控制台输出**:
```javascript
console.log('[同步] 待匹配Hash:', pendingPPT?.hash);
console.log('[同步] 收到文本Hash:', receivedHash);
console.log('[同步] 匹配结果:', matched ? '✅课程内容' : '❌用户问答');
```

**后端日志输出**:
```python
print(f"[同步] 课程文本Hash: {text_hash}")
print(f"[同步] 文本前100字符: {text[:100]}")
```

---

## 新模块设计

### 目录结构

```
opensource-demos/
├── Fay/                    (原系统，不修改)
├── XmovAvatarSDK/          (原系统，不修改)
└── PPTLecturePlayer/       (新模块)
    ├── .venv/              (虚拟环境，使用uv创建)
    ├── app.py              (Flask主应用)
    ├── config.yaml         (配置文件)
    ├── requirements.txt    (依赖列表)
    ├── core/               (核心模块)
    │   ├── __init__.py
    │   ├── easegen_client.py      (EaseGen API客户端)
    │   ├── fay_connector.py       (Fay WebSocket连接器)
    │   └── playback_controller.py (播放控制器)
    ├── templates/          (HTML模板)
    │   └── index.html      (主页面)
    ├── static/             (静态资源)
    │   ├── css/
    │   │   └── style.css
    │   └── js/
    │       └── player.js
    ├── start.py            (启动脚本)
    └── README.md           (使用说明)
```

---

## 实现步骤

### 阶段1: 项目初始化

**目标**: 创建新模块目录和基础结构

#### 1.1 创建目录和虚拟环境

```bash
cd E:/code/yzpd/easegen-front/opensource-demos
mkdir PPTLecturePlayer
cd PPTLecturePlayer

# 使用uv创建虚拟环境
uv venv
.venv\Scripts\activate

# 安装依赖
uv pip install flask flask-socketio flask-cors requests websocket-client pyyaml python-dotenv
```

#### 1.2 创建requirements.txt

```txt
flask==3.0.0
flask-socketio==5.3.5
flask-cors==4.0.0
requests==2.31.0
websocket-client==1.7.0
pyyaml==6.0.1
python-dotenv==1.0.0
```

#### 1.3 创建配置文件

**文件**: `config.yaml`

```yaml
# PPTLecturePlayer 配置文件

server:
  host: '0.0.0.0'
  port: 5003
  debug: true

easegen:
  base_url: 'http://localhost:48080'
  api_key: ''  # 需要用户填写
  default_course_id: '1024'

fay:
  websocket_url: 'ws://127.0.0.1:10002'
  reconnect_interval: 5  # 秒

xmov:
  app_id: 'your_app_id'
  app_secret: 'your_app_secret'
  gateway_server: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session'

playback:
  auto_start: false
  loop: true
  page_interval: 2  # 翻页间隔(秒)
  speech_speed_multiplier: 1.0  # 语速倍数，用于估算讲解时长
```

### 阶段2: 后端核心模块开发

#### 2.1 EaseGen API客户端

**文件**: `core/easegen_client.py`

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
EaseGen API 客户端
负责与EaseGen后端交互，获取课程片段数据
"""
import requests
from typing import Optional, Dict


class EaseGenClient:
    """EaseGen API客户端"""

    def __init__(self, base_url: str, api_key: str):
        """
        初始化客户端

        Args:
            base_url: EaseGen API基础URL
            api_key: API密钥
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'easegen-api-key': api_key,
            'Content-Type': 'application/json'
        })

    def get_course_text(self, course_id: str, no: Optional[int] = None) -> Optional[Dict]:
        """
        获取课程文本片段

        Args:
            course_id: 课程ID
            no: 片段序号，不传则返回下一段

        Returns:
            {
                'text': '讲稿文本',
                'img': 'PPT图片URL',
                'currentNo': 1,
                'totalNo': 50,
                'progress': '1/50'
            }
        """
        try:
            url = f"{self.base_url}/digitalcourse/courses/getCourseText"
            params = {'course_id': course_id}

            if no is not None:
                params['no'] = no

            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()

            result = response.json()

            if result.get('code') == 0:
                return result.get('data')
            else:
                print(f"[EaseGen] API错误: {result.get('msg')}")
                return None

        except Exception as e:
            print(f"[EaseGen] 请求失败: {e}")
            return None

    def get_course_list(self, page_no: int = 1, page_size: int = 10) -> Optional[Dict]:
        """
        获取课程列表

        Args:
            page_no: 页码
            page_size: 每页数量

        Returns:
            {
                'list': [...],
                'total': 100
            }
        """
        try:
            url = f"{self.base_url}/digitalcourse/courses/getCoursePage"
            params = {
                'pageNo': page_no,
                'pageSize': page_size
            }

            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()

            result = response.json()

            if result.get('code') == 0:
                return result.get('data')
            else:
                print(f"[EaseGen] API错误: {result.get('msg')}")
                return None

        except Exception as e:
            print(f"[EaseGen] 请求失败: {e}")
            return None
```

#### 2.2 Fay WebSocket连接器

**文件**: `core/fay_connector.py`

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Fay WebSocket 连接器
作为WebSocket客户端连接到Fay，发送文本并接收语音响应
"""
import json
import time
import threading
from websocket import WebSocketApp, ABNF
from typing import Callable, Optional


class FayConnector:
    """Fay WebSocket连接器"""

    def __init__(self, websocket_url: str, on_message_callback: Optional[Callable] = None):
        """
        初始化连接器

        Args:
            websocket_url: Fay的WebSocket地址 (ws://127.0.0.1:10002)
            on_message_callback: 收到消息时的回调函数
        """
        self.websocket_url = websocket_url
        self.on_message_callback = on_message_callback
        self.ws = None
        self.connected = False
        self.reconnect_thread = None

    def connect(self):
        """连接到Fay WebSocket服务器"""
        print(f"[Fay] 正在连接到 {self.websocket_url}...")

        self.ws = WebSocketApp(
            self.websocket_url,
            on_open=self._on_open,
            on_message=self._on_message,
            on_error=self._on_error,
            on_close=self._on_close
        )

        # 在新线程中运行WebSocket
        ws_thread = threading.Thread(target=self.ws.run_forever, daemon=True)
        ws_thread.start()

    def _on_open(self, ws):
        """WebSocket连接建立"""
        print("[Fay] WebSocket连接已建立")
        self.connected = True

        # 发送初始化消息
        init_message = {
            'Username': 'PPTLecturePlayer',
            'Output': False  # 告诉Fay需要音频输出
        }
        self.ws.send(json.dumps(init_message))
        print("[Fay] 已发送初始化消息")

    def _on_message(self, ws, message):
        """收到WebSocket消息"""
        try:
            data = json.loads(message)
            print(f"[Fay] 收到消息: {data.get('Topic', 'unknown')}")

            if self.on_message_callback:
                self.on_message_callback(data)

        except Exception as e:
            print(f"[Fay] 处理消息出错: {e}")

    def _on_error(self, ws, error):
        """WebSocket错误"""
        print(f"[Fay] WebSocket错误: {error}")
        self.connected = False

    def _on_close(self, ws, close_status_code, close_msg):
        """WebSocket连接关闭"""
        print(f"[Fay] WebSocket连接已关闭: {close_msg}")
        self.connected = False

        # 尝试重连
        self._schedule_reconnect()

    def _schedule_reconnect(self):
        """安排重新连接"""
        if self.reconnect_thread and self.reconnect_thread.is_alive():
            return

        def reconnect():
            print("[Fay] 5秒后尝试重新连接...")
            time.sleep(5)
            if not self.connected:
                self.connect()

        self.reconnect_thread = threading.Thread(target=reconnect, daemon=True)
        self.reconnect_thread.start()

    def send_text(self, text: str):
        """
        发送文本给Fay处理

        注意: 这里需要根据Fay的实际协议调整
        可能需要模拟用户输入或使用特定的消息格式
        """
        if not self.connected:
            print("[Fay] 未连接，无法发送文本")
            return False

        try:
            # 方式1: 直接发送文本(需要确认Fay是否支持)
            message = {
                'action': 'speak',
                'text': text
            }

            self.ws.send(json.dumps(message))
            print(f"[Fay] 已发送文本: {text[:50]}...")
            return True

        except Exception as e:
            print(f"[Fay] 发送文本失败: {e}")
            return False

    def disconnect(self):
        """断开连接"""
        if self.ws:
            self.ws.close()
            self.connected = False
```

#### 2.3 播放控制器

**文件**: `core/playback_controller.py`

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
播放控制器
管理PPT播放逻辑、进度和状态
"""
import time
import threading
from typing import Optional, Callable, Dict
from .easegen_client import EaseGenClient
from .fay_connector import FayConnector


class PlaybackController:
    """播放控制器"""

    def __init__(self, easegen_client: EaseGenClient, fay_connector: FayConnector,
                 on_state_change: Optional[Callable] = None):
        """
        初始化控制器

        Args:
            easegen_client: EaseGen客户端
            fay_connector: Fay连接器
            on_state_change: 状态变化回调函数
        """
        self.easegen_client = easegen_client
        self.fay_connector = fay_connector
        self.on_state_change = on_state_change

        self.course_id = None
        self.current_no = 1
        self.total_no = 0

        self.is_playing = False
        self.is_paused = False
        self.is_interrupted = False

        self.play_thread = None

    def start_playback(self, course_id: str):
        """
        开始播放课程

        Args:
            course_id: 课程ID
        """
        if self.is_playing:
            print("[Playback] 已在播放中")
            return

        self.course_id = course_id
        self.current_no = 1
        self.is_playing = True
        self.is_paused = False
        self.is_interrupted = False

        print(f"[Playback] 开始播放课程: {course_id}")

        # 在新线程中播放
        self.play_thread = threading.Thread(target=self._playback_loop, daemon=True)
        self.play_thread.start()

    def _playback_loop(self):
        """播放循环"""
        while self.is_playing:
            try:
                # 如果暂停或被打断，等待
                if self.is_paused or self.is_interrupted:
                    time.sleep(1)
                    continue

                # 获取当前片段
                segment = self.easegen_client.get_course_text(
                    self.course_id,
                    self.current_no
                )

                if not segment:
                    print(f"[Playback] 无法获取第{self.current_no}片段")
                    time.sleep(5)
                    continue

                self.total_no = segment.get('totalNo', 0)

                print(f"[Playback] 播放片段 {segment['currentNo']}/{self.total_no}")

                # 通知前端更新PPT
                if self.on_state_change:
                    self.on_state_change({
                        'type': 'ppt_update',
                        'data': {
                            'imageUrl': segment.get('img'),
                            'currentNo': segment.get('currentNo'),
                            'totalNo': segment.get('totalNo'),
                            'progress': segment.get('progress')
                        }
                    })

                # 等待PPT图片加载
                time.sleep(0.5)

                # 发送文本给Fay
                text = segment.get('text', '')
                if text:
                    self.fay_connector.send_text(text)

                    # 估算讲解时长(假设1秒3个字)
                    estimated_duration = len(text) / 3
                    time.sleep(max(estimated_duration, 3))
                else:
                    time.sleep(3)

                # 翻到下一片段
                self.current_no += 1

                # 如果到达最后，循环播放
                if self.current_no > self.total_no:
                    print("[Playback] 播放完成，重新开始")
                    self.current_no = 1

                # 页面切换间隔
                time.sleep(2)

            except Exception as e:
                print(f"[Playback] 播放出错: {e}")
                import traceback
                traceback.print_exc()
                time.sleep(5)

    def pause(self):
        """暂停播放"""
        self.is_paused = True
        print("[Playback] 已暂停")

    def resume(self):
        """恢复播放"""
        self.is_paused = False
        print("[Playback] 已恢复")

    def interrupt(self):
        """标记为被打断"""
        self.is_interrupted = True
        self.pause()
        print("[Playback] 播放被打断")

    def resume_after_interrupt(self):
        """打断后恢复，重播当前片段"""
        self.is_interrupted = False

        # 重新请求当前片段
        segment = self.easegen_client.get_course_text(
            self.course_id,
            self.current_no
        )

        if segment:
            # 通知前端更新PPT
            if self.on_state_change:
                self.on_state_change({
                    'type': 'ppt_update',
                    'data': {
                        'imageUrl': segment.get('img'),
                        'currentNo': segment.get('currentNo'),
                        'totalNo': segment.get('totalNo'),
                        'progress': segment.get('progress')
                    }
                })

            # 发送文本给Fay
            text = segment.get('text', '')
            if text:
                self.fay_connector.send_text(text)

        self.resume()
        print("[Playback] 已恢复播放当前片段")

    def stop(self):
        """停止播放"""
        self.is_playing = False
        print("[Playback] 已停止")
```

### 阶段3: Flask主应用

**文件**: `app.py`

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
PPTLecturePlayer 主应用
"""
import yaml
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from core.easegen_client import EaseGenClient
from core.fay_connector import FayConnector
from core.playback_controller import PlaybackController

# 加载配置
with open('config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# 创建Flask应用
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# 初始化客户端
easegen_client = EaseGenClient(
    base_url=config['easegen']['base_url'],
    api_key=config['easegen']['api_key']
)

# WebSocket状态变化回调
def on_state_change(state_data):
    """状态变化时通知前端"""
    socketio.emit('state_update', state_data)

# Fay消息回调
def on_fay_message(message):
    """收到Fay消息时转发给前端"""
    socketio.emit('fay_message', message)

# 初始化Fay连接器
fay_connector = FayConnector(
    websocket_url=config['fay']['websocket_url'],
    on_message_callback=on_fay_message
)

# 初始化播放控制器
playback_controller = PlaybackController(
    easegen_client=easegen_client,
    fay_connector=fay_connector,
    on_state_change=on_state_change
)

# ==================== HTTP Routes ====================

@app.route('/')
def index():
    """主页面"""
    return render_template('index.html')

@app.route('/api/config')
def get_config():
    """获取配置信息（供前端使用）"""
    return jsonify({
        'xmov': {
            'appId': config['xmov']['app_id'],
            'appSecret': config['xmov']['app_secret'],
            'gatewayServer': config['xmov']['gateway_server']
        },
        'playback': {
            'autoStart': config['playback']['auto_start']
        }
    })

@app.route('/api/courses')
def get_courses():
    """获取课程列表"""
    page_no = request.args.get('pageNo', 1, type=int)
    page_size = request.args.get('pageSize', 10, type=int)

    result = easegen_client.get_course_list(page_no, page_size)

    if result:
        return jsonify({'code': 0, 'data': result})
    else:
        return jsonify({'code': 500, 'msg': '获取课程列表失败'})

@app.route('/api/play', methods=['POST'])
def start_play():
    """开始播放"""
    data = request.json
    course_id = data.get('courseId', config['easegen']['default_course_id'])

    playback_controller.start_playback(course_id)

    return jsonify({'code': 0, 'msg': '开始播放'})

@app.route('/api/pause', methods=['POST'])
def pause_play():
    """暂停播放"""
    playback_controller.pause()
    return jsonify({'code': 0, 'msg': '已暂停'})

@app.route('/api/resume', methods=['POST'])
def resume_play():
    """恢复播放"""
    playback_controller.resume()
    return jsonify({'code': 0, 'msg': '已恢复'})

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """提问"""
    data = request.json
    question = data.get('question', '')

    if not question:
        return jsonify({'code': 400, 'msg': '问题不能为空'})

    # 打断当前播放
    playback_controller.interrupt()

    # 发送问题给Fay
    fay_connector.send_text(question)

    # TODO: 等待Fay回答完成后恢复播放
    # 这里需要监听Fay的响应来判断何时回答完成

    return jsonify({'code': 0, 'msg': '问题已发送'})

# ==================== WebSocket Events ====================

@socketio.on('connect')
def handle_connect():
    """客户端连接"""
    print('[WebSocket] 客户端已连接')
    emit('message', {'type': 'info', 'text': '已连接到服务器'})

@socketio.on('disconnect')
def handle_disconnect():
    """客户端断开"""
    print('[WebSocket] 客户端已断开')

@socketio.on('control')
def handle_control(data):
    """处理控制命令"""
    action = data.get('action')

    if action == 'play':
        course_id = data.get('courseId', config['easegen']['default_course_id'])
        playback_controller.start_playback(course_id)
        emit('message', {'type': 'success', 'text': '开始播放'})

    elif action == 'pause':
        playback_controller.pause()
        emit('message', {'type': 'success', 'text': '已暂停'})

    elif action == 'resume':
        playback_controller.resume()
        emit('message', {'type': 'success', 'text': '已恢复'})

# ==================== 启动 ====================

if __name__ == '__main__':
    print("=" * 50)
    print("PPTLecturePlayer 正在启动...")
    print(f"访问地址: http://localhost:{config['server']['port']}")
    print("=" * 50)

    # 连接到Fay
    fay_connector.connect()

    # 启动Flask应用
    socketio.run(
        app,
        host=config['server']['host'],
        port=config['server']['port'],
        debug=config['server']['debug']
    )
```

### 阶段4: 前端页面

**文件**: `templates/index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>PPT数字人讲解系统</title>
  <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
  <!-- 状态栏 -->
  <div class="status-bar">
    <div class="status-info">
      <div class="status-item">
        <span class="status-dot" id="sdkStatus"></span>
        <span id="sdkStatusText">初始化中...</span>
      </div>
      <div class="status-item">
        <span class="status-dot" id="fayStatus"></span>
        <span id="fayStatusText">未连接Fay</span>
      </div>
      <div class="status-item">
        <span class="status-dot" id="easegenStatus"></span>
        <span id="easegenStatusText">未连接EaseGen</span>
      </div>
    </div>
    <div style="font-size: 11px; color: #888;">
      PPT数字人讲解系统 v2.0
    </div>
  </div>

  <!-- PPT全屏背景 -->
  <div id="ppt-background">
    <img id="ppt-image" src="" alt="PPT" style="display: none;">
    <div id="ppt-placeholder">
      <p>等待加载课程...</p>
    </div>
  </div>

  <!-- 进度指示器 -->
  <div class="progress-indicator" id="progressIndicator" style="display: none;">
    <span id="currentProgress">0/0</span>
  </div>

  <!-- 数字人悬浮窗口 -->
  <div id="sdk-container">
    <div id="sdk"></div>
  </div>

  <!-- 控制面板 -->
  <div class="control-panel" id="controlPanel">
    <button id="playBtn" class="control-btn">开始播放</button>
    <button id="pauseBtn" class="control-btn" style="display: none;">暂停</button>
    <div class="question-input">
      <input type="text" id="questionInput" placeholder="输入问题后按回车...">
      <button id="askBtn" class="control-btn">提问</button>
    </div>
  </div>

  <!-- 引入Xmov SDK -->
  <script src="https://media.youyan.xyz/youling-lite-sdk/index.umd.0.1.0-alpha.63.js"></script>

  <!-- 引入Socket.IO -->
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>

  <!-- 引入前端逻辑 -->
  <script src="/static/js/player.js"></script>
</body>
</html>
```

**文件**: `static/css/style.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #000;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

/* 状态栏 */
.status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(10px);
  color: white;
  padding: 12px 20px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.status-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  animation: pulse 2s infinite;
}

.status-dot.active {
  background: #4CAF50;
}

.status-dot.error {
  background: #f44336;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* PPT全屏背景 */
#ppt-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  background: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
}

#ppt-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

#ppt-placeholder {
  text-align: center;
  color: #888;
  font-size: 24px;
}

/* 进度指示器 */
.progress-indicator {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  border: 1px solid rgba(255,255,255,0.2);
}

/* 数字人悬浮窗口 */
#sdk-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 10;
  width: 320px;
  height: 480px;
  background: rgba(0,0,0,0.3);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.1);
}

#sdk {
  width: 100%;
  height: 100%;
  background: #000;
}

/* 控制面板 */
.control-panel {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  gap: 10px;
  align-items: center;
}

.control-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.control-btn:hover {
  background: #45a049;
}

.question-input {
  display: flex;
  gap: 10px;
}

.question-input input {
  padding: 10px 15px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 14px;
  width: 300px;
}

.question-input input::placeholder {
  color: rgba(255,255,255,0.5);
}
```

**文件**: `static/js/player.js`

```javascript
// PPT讲解系统前端逻辑

let socket;
let xmovSDK = null;
let config = null;

// 初始化
async function init() {
  console.log('[Player] 初始化中...');

  // 获取配置
  const configRes = await fetch('/api/config');
  config = await configRes.json();

  // 初始化Socket.IO
  initSocketIO();

  // 初始化Xmov SDK
  initXmovSDK();

  // 绑定事件
  bindEvents();
}

// 初始化Socket.IO
function initSocketIO() {
  socket = io();

  socket.on('connect', () => {
    console.log('[Socket.IO] 已连接到服务器');
    updateServerStatus('active');
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] 已断开连接');
    updateServerStatus('error');
  });

  socket.on('state_update', (data) => {
    console.log('[状态更新]', data);
    handleStateUpdate(data);
  });

  socket.on('fay_message', (message) => {
    console.log('[Fay消息]', message);
    handleFayMessage(message);
  });

  socket.on('message', (data) => {
    console.log('[消息]', data.text);
  });
}

// 初始化Xmov SDK
function initXmovSDK() {
  updateSDKStatus('正在初始化...', false);

  try {
    xmovSDK = new XmovAvatar({
      containerId: '#sdk',
      appId: config.xmov.appId,
      appSecret: config.xmov.appSecret,
      gatewayServer: config.xmov.gatewayServer,

      onVoiceStateChange(status) {
        console.log('[Xmov] 语音状态:', status);
        if (status === 'start') {
          updateSDKStatus('正在说话', true);
        } else if (status === 'end') {
          updateSDKStatus('就绪', true);
        }
      },

      enableLogger: true
    });

    xmovSDK.init({
      onDownloadProgress: (progress) => {
        updateSDKStatus(`加载资源 ${progress}%`, false);
      },
      onError: (error) => {
        console.error('[Xmov] SDK错误:', error);
        updateSDKStatus('初始化失败', false, true);
      }
    }).then(() => {
      updateSDKStatus('就绪', true);
    });

  } catch (error) {
    console.error('[Xmov] 创建SDK实例失败:', error);
    updateSDKStatus('初始化失败', false, true);
  }
}

// 处理状态更新
function handleStateUpdate(data) {
  if (data.type === 'ppt_update') {
    const pptData = data.data;

    // 更新PPT图片
    const pptImage = document.getElementById('ppt-image');
    const pptPlaceholder = document.getElementById('ppt-placeholder');

    pptImage.src = pptData.imageUrl;
    pptImage.style.display = 'block';
    pptPlaceholder.style.display = 'none';

    // 更新进度
    const progressIndicator = document.getElementById('progressIndicator');
    const currentProgress = document.getElementById('currentProgress');

    currentProgress.textContent = pptData.progress || `${pptData.currentNo}/${pptData.totalNo}`;
    progressIndicator.style.display = 'block';

    updateEaseGenStatus('已连接', true);
  }
}

// 处理Fay消息
function handleFayMessage(message) {
  if (message.Topic === 'human' && message.Data) {
    const data = message.Data;

    // 处理文本消息
    if (data.Key === 'text') {
      const text = data.Value || '';
      const isFirst = data.IsFirst === 1;
      const isEnd = data.IsEnd === 1;

      if (text && text.trim() && xmovSDK) {
        console.log('[Xmov] 数字人说话:', text);
        xmovSDK.speak(text, isFirst, isEnd);
      }
    }
  }

  updateFayStatus('已连接', true);
}

// 绑定事件
function bindEvents() {
  // 播放按钮
  document.getElementById('playBtn').addEventListener('click', () => {
    socket.emit('control', { action: 'play' });
    document.getElementById('playBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
  });

  // 暂停按钮
  document.getElementById('pauseBtn').addEventListener('click', () => {
    socket.emit('control', { action: 'pause' });
    document.getElementById('playBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
  });

  // 提问按钮
  document.getElementById('askBtn').addEventListener('click', askQuestion);

  // 回车提问
  document.getElementById('questionInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      askQuestion();
    }
  });
}

// 提问
async function askQuestion() {
  const input = document.getElementById('questionInput');
  const question = input.value.trim();

  if (!question) {
    alert('请输入问题');
    return;
  }

  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });

  const result = await res.json();
  console.log('[提问]', result.msg);

  input.value = '';
}

// 更新状态指示器
function updateSDKStatus(text, isActive = false, isError = false) {
  const dot = document.getElementById('sdkStatus');
  const textEl = document.getElementById('sdkStatusText');

  dot.className = 'status-dot';
  if (isActive) dot.classList.add('active');
  if (isError) dot.classList.add('error');

  textEl.textContent = text;
}

function updateFayStatus(text, isActive = false) {
  const dot = document.getElementById('fayStatus');
  const textEl = document.getElementById('fayStatusText');

  dot.className = 'status-dot';
  if (isActive) dot.classList.add('active');

  textEl.textContent = text;
}

function updateEaseGenStatus(text, isActive = false) {
  const dot = document.getElementById('easegenStatus');
  const textEl = document.getElementById('easegenStatusText');

  dot.className = 'status-dot';
  if (isActive) dot.classList.add('active');

  textEl.textContent = text;
}

function updateServerStatus(status) {
  // 可以添加服务器状态指示器
}

// 页面加载后初始化
window.onload = init;
```

---

## 对现有系统的修改

### 🎯 两种实施方案对比

本系统提供两种实施方案，您可以根据实际情况选择：

| 方案 | Fay修改 | 同步机制 | 可靠性 | 复杂度 | 推荐度 |
|------|---------|---------|--------|--------|--------|
| **方案A: Hash匹配** | ❌ 零修改 | 文本哈希 | ⭐⭐⭐ | 高 | 快速验证 |
| **方案B: 消息类型** | ✅ 小修改(50行) | 类型字段 | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐⭐⭐⭐ 推荐 |

---

### 方案A: Hash匹配方案（零修改）

**适用场景**: 快速验证业务可行性，不想改动Fay

#### 系统修改清单

| 系统 | 是否修改 | 说明 |
|------|---------|------|
| **EaseGen** | ❌ 否 | 已提供API接口，无需修改 |
| **Fay** | ❌ 否 | **已支持**WebSocket客户端发送文本 |
| **Xmov** | ❌ 否 | 使用CDN的SDK，前端嵌入即可 |
| **新模块** | ✅ 新建 | 完全独立的新目录 |

详见前文"同步机制详解"章节。

---

### 方案B: 消息类型扩展方案（推荐）⭐

**适用场景**: 生产环境部署，追求高可靠性和易维护性

#### 核心思路

在Fay的WebSocket消息中添加`messageType`和`metadata`字段，让消息自描述，无需前端猜测。

#### 消息格式对比

**原消息格式**（Fay当前）:
```json
{
  "Topic": "human",
  "Data": {
    "Key": "text",
    "Value": "欢迎来到人工智能课程...",
    "IsFirst": 1,
    "IsEnd": 0
  }
}
```

**新消息格式**（扩展后）:
```json
{
  "Topic": "human",
  "Data": {
    "Key": "text",
    "Value": "欢迎来到人工智能课程...",
    "IsFirst": 1,
    "IsEnd": 0,
    "messageType": "course",  // ← 新增：消息类型
    "metadata": {             // ← 新增：元数据
      "courseId": "1024",
      "segmentNo": 1,
      "totalSegments": 50,
      "pptImageUrl": "https://example.com/ppt/page1.jpg"
    }
  }
}
```

**messageType枚举**:
- `"course"` - 课程讲解内容（需显示PPT）
- `"qa"` - 用户问答（不显示PPT）
- `"notification"` - 系统通知
- `null` - 默认值，兼容旧版

#### Fay修改详解

##### 修改1: Interact类支持元数据

**文件**: `Fay/core/interact.py`

**位置**: `Interact` 类定义

```python
class Interact:
    def __init__(self, interact_type, user_id, data):
        self.type = interact_type
        self.user_id = user_id
        self.data = data
        self.text = ""

        # ===== 新增：支持元数据 =====
        self.metadata = None  # 外部可注入的元数据
        # ===== 新增结束 =====
```

**修改行数**: 1行

---

##### 修改2: WebSocket消息构造时添加元数据

**文件**: `Fay/core/fay_core.py`

**位置**: `__process_output_audio()` 方法中构造消息的部分

**查找代码**（大约在第597行附近）:
```python
def __process_output_audio(self, ...):
    # ... 原有代码 ...

    # 构造WebSocket消息
    message = {
        'Topic': 'human',
        'Data': {
            'Key': 'text',
            'Value': text,
            'IsFirst': is_first,
            'IsEnd': is_end
        }
    }

    # 发送消息
    wsa_server.get_web_instance().add_cmd(message)
```

**修改为**:
```python
def __process_output_audio(self, interact, ...):  # 注意：需要传入interact参数
    # ... 原有代码 ...

    # 构造WebSocket消息
    message = {
        'Topic': 'human',
        'Data': {
            'Key': 'text',
            'Value': text,
            'IsFirst': is_first,
            'IsEnd': is_end
        }
    }

    # ===== 新增：添加元数据支持 =====
    if hasattr(interact, 'metadata') and interact.metadata:
        message['Data']['messageType'] = interact.metadata.get('type', 'qa')
        message['Data']['metadata'] = interact.metadata
    else:
        message['Data']['messageType'] = None  # 兼容旧版
    # ===== 新增结束 =====

    # 发送消息
    wsa_server.get_web_instance().add_cmd(message)
```

**修改行数**: 约8行

**注意**: 需要确保`__process_output_audio`方法能够访问到`interact`对象。如果当前没有，需要通过参数传递。

---

##### 修改3: WebSocket接收消息时支持元数据

**文件**: `Fay/core/wsa_server.py`

**位置**: `HumanServer` 类的 `on_message` 方法

**查找代码**（大约在第XXX行）:
```python
def on_message(self, message):
    """处理WebSocket消息"""
    try:
        data = json.loads(message)

        # 现有的处理逻辑
        if data.get('Username'):
            # 初始化连接
            pass

        # ... 其他处理 ...
```

**修改为**:
```python
def on_message(self, message):
    """处理WebSocket消息"""
    try:
        data = json.loads(message)

        # 现有的处理逻辑
        if data.get('Username'):
            # 初始化连接
            pass

        # ===== 新增：支持带元数据的文本处理 =====
        elif data.get('action') == 'speak' and data.get('text'):
            # 创建Interact
            from core.interact import Interact
            interact = Interact("external_text", 0, {})
            interact.text = data.get('text', '')

            # 注入元数据
            if data.get('metadata'):
                interact.metadata = data.get('metadata')

            # 处理
            feiFei.on_interact(interact)
            return
        # ===== 新增结束 =====

        # ... 其他处理 ...
```

**修改行数**: 约15行

---

#### 修改总结

| 文件 | 修改位置 | 修改行数 | 难度 |
|------|---------|---------|------|
| `core/interact.py` | Interact类 | 1行 | ⭐ 简单 |
| `core/fay_core.py` | `__process_output_audio()` | 8行 | ⭐⭐ 中等 |
| `core/wsa_server.py` | `on_message()` | 15行 | ⭐⭐ 中等 |
| **总计** | 3个文件 | **约24行** | **容易** |

---

#### 新模块调整

使用方案B时，新模块的`fay_connector.py`需要调整：

**文件**: `PPTLecturePlayer/core/fay_connector.py`

```python
def send_course_text(self, text: str, segment_data: dict):
    """
    发送课程文本给Fay，携带完整元数据

    Args:
        text: 课程讲稿文本
        segment_data: 从EaseGen API获取的片段数据
    """
    if not self.connected:
        print("[Fay] 未连接，无法发送文本")
        return False

    try:
        message = {
            'action': 'speak',
            'text': text,
            'metadata': {
                'type': 'course',
                'courseId': segment_data.get('courseId', ''),
                'segmentNo': segment_data.get('currentNo', 0),
                'totalSegments': segment_data.get('totalNo', 0),
                'pptImageUrl': segment_data.get('img', '')
            }
        }

        self.ws.send(json.dumps(message))
        print(f"[Fay] 已发送课程片段 {segment_data.get('currentNo')}/{segment_data.get('totalNo')}")
        return True

    except Exception as e:
        print(f"[Fay] 发送失败: {e}")
        return False
```

---

#### 前端简化（单WebSocket）

使用方案B时，前端**只需连接Fay的WebSocket**，无需连接新模块！

**文件**: `PPTLecturePlayer/static/js/player.js`

```javascript
// 只需一个WebSocket连接
const fayWS = new WebSocket('ws://127.0.0.1:10002');

fayWS.onopen = () => {
  console.log('[Fay] 已连接');

  // 发送初始化消息
  fayWS.send(JSON.stringify({
    Username: 'PPTLecturePlayer',
    Output: false
  }));
};

fayWS.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.Topic === 'human' && msg.Data) {
    const data = msg.Data;

    // 根据messageType判断是否显示PPT
    if (data.messageType === 'course' && data.metadata) {
      // 课程内容 - 显示PPT
      const metadata = data.metadata;

      console.log(`[PPT] 显示第${metadata.segmentNo}页`);
      showPPT(metadata.pptImageUrl);
      updateProgress(metadata.segmentNo, metadata.totalSegments);

    } else if (data.messageType === 'qa') {
      // 用户问答 - 不处理PPT
      console.log('[QA] 用户问答，保持当前PPT');
    }

    // 无论什么类型，都传给Xmov SDK
    if (data.Key === 'text') {
      xmovSDK.speak(data.Value, data.IsFirst, data.IsEnd);
    }
  }
};

// 显示PPT的函数（极简）
function showPPT(imageUrl) {
  const pptImage = document.getElementById('ppt-image');
  pptImage.src = imageUrl;
  pptImage.style.display = 'block';
}

// 更新进度
function updateProgress(current, total) {
  const progressEl = document.getElementById('progress');
  progressEl.textContent = `${current}/${total}`;
}
```

**对比**:
- 方案A需要双WebSocket + Hash匹配（约100行代码）
- 方案B只需单WebSocket + 类型判断（约50行代码）

---

#### 优势分析

##### 1. 零歧义
```
✅ 通过messageType直接判断，无需猜测
✅ 不受LLM改写影响
✅ 100%可靠
```

##### 2. 前端极简
```javascript
// 一行判断
if (msg.Data.messageType === 'course') {
  showPPT(msg.Data.metadata.pptImageUrl);
}
```

##### 3. 元数据丰富
```json
{
  "metadata": {
    "courseId": "1024",
    "segmentNo": 1,
    "totalSegments": 50,
    "pptImageUrl": "https://...",
    "duration": 15,           // 预计时长
    "keywords": ["AI"],       // 关键词
    "hasQuiz": true,          // 是否有测验
    "chapterName": "第一章"    // 章节名
  }
}
```

##### 4. 易于扩展
```javascript
// 轻松添加新类型
if (msg.Data.messageType === 'quiz') {
  showQuiz(msg.Data.metadata);
} else if (msg.Data.messageType === 'poll') {
  showPoll(msg.Data.metadata);
}
```

##### 5. 向后兼容
```python
# messageType为null时，按原有逻辑处理
if message['Data']['messageType'] is None:
    # 旧版消息，按原有方式处理
```

---

#### 实施步骤

##### 阶段1: 修改Fay（1小时）

1. 修改 `core/interact.py` - 添加metadata属性
2. 修改 `core/fay_core.py` - 输出时携带元数据
3. 修改 `core/wsa_server.py` - 接收时支持元数据
4. 测试：发送带metadata的消息，检查输出

##### 阶段2: 调整新模块（30分钟）

1. 修改 `core/fay_connector.py` - 发送时携带元数据
2. 简化前端 `static/js/player.js` - 删除Hash逻辑
3. 测试：检查metadata是否正确传递

##### 阶段3: 集成测试（30分钟）

1. 启动Fay
2. 启动新模块
3. 测试课程播放 - 验证PPT显示
4. 测试用户提问 - 验证PPT不变

**总耗时**: 约2小时

---

### 方案选择建议

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| **快速验证** | 方案A（Hash） | 零修改，快速上线 |
| **生产部署** | 方案B（消息类型）| 可靠性高，易维护 |
| **长期使用** | 方案B（消息类型）| 易扩展，代码简洁 |
| **团队协作** | 方案B（消息类型）| 语义清晰，易理解 |

**建议路径**:
1. 先用方案A验证业务（1-2天）
2. 确认可行后，升级到方案B（半天）
3. 享受优雅架构带来的便利

---

## 配置文件

### 新模块配置

**文件**: `PPTLecturePlayer/config.yaml`

```yaml
server:
  host: '0.0.0.0'
  port: 5003
  debug: true

easegen:
  base_url: 'http://localhost:48080'  # 需要根据实际部署调整
  api_key: 'YOUR_API_KEY_HERE'        # **用户需要填写**
  default_course_id: '1024'

fay:
  websocket_url: 'ws://127.0.0.1:10002'
  reconnect_interval: 5

xmov:
  app_id: 'your_app_id'
  app_secret: 'your_app_secret'
  gateway_server: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session'

playback:
  auto_start: false
  loop: true
  page_interval: 2
  speech_speed_multiplier: 1.0
```

---

## OBS配置

### 推流方案

与v1.0方案相同，使用窗口捕获：

1. 浏览器访问 `http://localhost:5003`
2. F11全屏
3. OBS添加"窗口捕获"源
4. 选择浏览器窗口
5. 调整画面尺寸
6. 开始推流

---

## 测试方案

### 单元测试

#### 测试EaseGen客户端

```bash
cd PPTLecturePlayer
.venv\Scripts\activate
python -c "
from core.easegen_client import EaseGenClient
client = EaseGenClient('http://localhost:48080', 'YOUR_API_KEY')
result = client.get_course_text('1024', 1)
print(result)
"
```

### 集成测试

1. 启动Fay: `cd Fay && .venv\Scripts\python.exe main.py`
2. 启动新模块: `cd PPTLecturePlayer && python start.py`
3. 浏览器访问: `http://localhost:5003`
4. 点击"开始播放"

**预期结果**:
- ✅ PPT图片显示
- ✅ 数字人开始讲解
- ✅ 自动翻页
- ✅ 可以打断提问

---

## 部署说明

### 启动顺序

1. **启动Fay** (必须):
   ```bash
   cd E:/code/yzpd/easegen-front/opensource-demos/Fay
   .venv\Scripts\python.exe main.py
   ```

2. **启动PPTLecturePlayer** (新模块):
   ```bash
   cd E:/code/yzpd/easegen-front/opensource-demos/PPTLecturePlayer
   .venv\Scripts\activate
   python start.py
   ```

3. **访问页面**:
   ```
   http://localhost:5003
   ```

### 环境要求

- Python 3.13.6
- EaseGen后端运行在 48080 端口
- Fay运行在 5000 端口，WebSocket 10002 端口
- 新模块运行在 5003 端口

---

## 总结

### 模块职责

| 模块 | 职责 | 端口 | 修改情况 |
|------|------|------|----------|
| **EaseGen** | 提供课程数据API | 48080 | 无需修改 |
| **Fay** | TTS、LLM服务 | 5000, 10002 | 最小修改（10行代码） |
| **Xmov** | 3D数字人渲染 | SDK(CDN) | 无需修改 |
| **PPTLecturePlayer** | 中间层协调 | 5003 | **新建模块** |

### 优势

✅ **独立部署**: 新模块完全独立，可单独启动/停止
✅ **最小侵入**: Fay和Xmov几乎无需修改
✅ **易于维护**: 代码结构清晰，配置统一管理
✅ **可扩展**: 易于添加新功能（如课程选择、进度保存）

---

**方案结束**

请检查本方案并确认是否可以开始实施。如有修改建议，请随时告知！
