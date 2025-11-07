# 具身驱动SDK接入说明

## 概述

魔珐星云具身驱动将 AI 的表达从"文本"升级为" 3D 多模态"。 它可基于文本输入，实时生成语音、表情与动作，驱动 3D 数字人或人形机器人，实现如真人般自然的表达。 相比传统仅能输出文字或语音的 AI ，星云赋予 AI 更丰富的表现力与更自然的交互体验。

**文档来源**: https://xingyun3d.com/developers/52-183

---

## 主要功能

1. 实时 3D 数字人渲染与驱动
2. 语音合成（SSML 支持）与口型同步
3. 多状态行为控制（Idle / Listen / Speak 等）
4. Widget 组件展示（图片、字幕、视频等）
5. 可自定义事件回调与日志系统

---

## 环境要求

### JS SDK

**对浏览器版本的要求**：

魔珐星云具身驱动SDK浏览器版本要求

### Android SDK

**系统要求**：Android 11及其以上

**芯片要求**：

| 芯片版本 | 建议清晰度 |
|---------|-----------|
| RK3588 | 1080P |
| RK3566 | 720P |
| 其它芯片 | 可联系我们进行测试 |

---

## 快速开始

### 1. JS SDK

#### 1.1 准备工作

1. **在页面中引入以下依赖**：

```html
<!DOCTYPE html>
<html lang="en">
<body>
  <div style="width: 400px;height: 600px">
    <div id="sdk"></div>
  </div>
  <script src="https://media.youyan.xyz/youling-lite-sdk/index.umd.0.1.0-alpha.63.js"></script>
</body>
</html>
```

**请关注JS SDK版本，以助于获取最新SDK特性和最新效果**

2. **设置虚拟人角色、音色、表演风格，获取App ID、App Secret**

请登录魔珐星云（https://xingyun3d.com/），在应用中心创建驱动应用，选择角色、音色、表演风格。

#### 1.2 创建实例

```javascript
const LiteSDK = new XmovAvatar({
  containerId: '#sdk',
  appId: '',
  appSecret: '',
  gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
  // 自定义渲染器，传递该方法，所有事件sdk均返回，由该方法定义所以类型事件的实现逻辑
  onWidgetEvent(data) {
    // 处理widget事件
    console.log('Widget事件:', data)
  },
  // 代理渲染器，sdk默认支持subtitle_on、subtitle_off和widget_pic事件。通过代理，
  // 可以修改默认事件，业务侧也可实现各种其他事件。
  proxyWidget: {
    "widget_slideshow": (data: any) => {
      console.log("widget_slideshow", data);
    },
    "widget_video": (data: any) => {
      console.log("widget_video", data);
    },
  },
  onNetworkInfo(networkInfo) {
    console.log('networkInfo:', networkInfo)
  },
  onMessage(message) {
    console.log('SDK message:', message);
  },
  onStateChange(state: string) {
    console.log('SDK State Change:', state);
  },
  onStatusChange(status) {
    console.log('SDK Status Change:', status);
  },
  onStateRenderChange(state: string, duration: number) {
    console.log('SDK State Change Render:', state, duration);
  },
  onVoiceStateChange(status:string) {
      console.log("sdk voice status", status);
  },
  enableLogger: false, // 不展示sdk log，默认为false
})
```

**初始化参数**：

| 参数名 | 类型 | 参数 | 必填 | 说明 |
|--------|------|------|------|------|
| containerId | string | | 是 | 容器元素ID |
| appId | string | | 是 | 数字人appId（从业务系统获取） |
| appSecret | string | | 是 | 数字人secretId（从业务系统获取） |
| gatewayServer | string | https://nebula-agent.xingyun3d.com/user/v1/ttsa/session | 是 | 数字人服务接口完整路径 |
| onWidgetEvent | function | | 否 | Widget事件回调函数 |
| proxyWidget | Object | | 否 | SDK内默认支持subtitle_on、subtitle_off和widget_pic事件。用户可以通过两种方式重写默认事件及支持自定义事件。使用onWidgetEvent代理所有事件，sdk会将事件全部抛出。使用proxyWidget代理事件，用户可根据需求实现自定义事件或代理默认事件。事件系统优先级如下：onWidgetEvent > proxyWidget > 默认事件。 |
| onVoiceStateChange | Function | Status: 音频播放状态"start"：开始播放"end"：播放结束 | 否 | 监控sdk音频播放状态 |
| onNetworkInfo | function | networkInfo:SDKNetworkInfo（见：参数说明） | 否 | 当前网络状况 |
| onMessage | function | message: SDKMessage（见：参数说明） | 是 | SDK 消息 |
| onStateChange | function | state: string详见下方数字人state说明 | 否 | 监听虚拟人状态变化 |
| onStatusChange | function | status: SDKStatus（见：参数说明） | 否 | 监听虚拟人状态变化 |
| onStateRenderChange | function | state: string, duration: number | 否 | 监听虚拟人状态渲染变化 |
| enableLogger | boolean | | 否 | 是否展示sdk log，默认为false |

#### 1.3 初始化连接房间

```javascript
LiteSDK.startSession()
  .then(() => {
    console.log('连接成功')
  })
  .catch((error) => {
    console.error('连接失败:', error)
  })
```

#### 1.4 驱动数字人说话

```javascript
// 使用普通文本
LiteSDK.speak('你好，我是数字人')

// 使用SSML格式
LiteSDK.speak('<speak>你好，我是<break time="500ms"/>数字人</speak>')
```

#### 1.5 销毁实例

```javascript
LiteSDK.destroy()
```

---

## 进阶接入

### 1. 数字人状态切换

#### 1.1 概述

数字人具有多种状态，可以通过状态切换来控制数字人的行为：

- **Idle**: 空闲状态
- **Listen**: 监听状态
- **Speak**: 说话状态

#### 1.2 Speak详解

`speak()` 方法用于驱动数字人说话，支持以下功能：

1. **普通文本**：直接传入文本字符串
2. **SSML格式**：支持SSML标签，可以实现更丰富的语音效果
3. **speak过程中`onVoiceStateChange`会抛出事件**：
   - `voice_start`：表示开始讲话
   - `voice_end`：表示讲话结束，可以用管理数字人说话状态

### 2. 其它方法

#### setVolume：控制声音

取值范围0->1，0:静音，1:最大音量

```javascript
setVolume(volume: number): void
```

#### showDebugInfo：显示调试信息

```javascript
showDebugInfo(): void
```

#### hideDebugInfo：隐藏调试信息

```javascript
hideDebugInfo(): void
```

### 3. 插件系统

#### 3.1 KA意图处理插件

SDK内置了KA（Key Action）意图处理插件，用于识别和处理文本中的动作意图。该插件可以自动识别文本中的动作描述并转换为相应的动画指令。

##### 注册KA插件

```javascript
// 使用默认配置注册KA插件
XmovAvatar.registerKAIntentPlugin();

// 使用自定义配置注册KA插件
XmovAvatar.registerKAIntentPlugin({
  BUFFER_LEN: 16,    // 缓冲区长度
  KA_DISTANCE: 16    // KA意图检测距离
  SSML_BUFFER_LEN: 3 // ssml缓冲区长度
});
```

##### KA插件配置参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| BUFFER_LEN | number | 16 | 单独一段ssml文本处理缓冲区长度 |
| KA_DISTANCE | number | 16 | KA意图检测的最小字符距离 |
| SSML_BUFFER_LEN | number | 3 | ssml缓冲区长度 |

#### 3.2 自定义插件示例

您也可以注册自己的自定义插件：

```javascript
// 定义一个简单的文本转换插件
const customPlugin = {
  name: 'UpperCasePlugin',
  process: (text: string) => {
    return text.toUpperCase();
  }
};

// 注册自定义插件
XmovAvatar.registerPlugin({
  name: 'UpperCasePlugin',
  plugin: customPlugin,
  enabled: true
});
```

#### 3.3 错误处理

SDK使用`SDKError`接口定义错误信息：

```typescript
interface SDKError {
  code: number        // 错误码
  message: string     // 错误信息
  timestamp: number   // 错误发生时间戳
  originalError: any  // 原始错误信息
}
```

---

## 注意事项

1. 确保容器元素具有明确的宽高，否则可能影响渲染效果
2. 初始化时必须提供所有必填参数
3. 使用`destroy()`方法时会清理所有资源并断开连接
4. 建议在开发环境使用`showDebugInfo()`辅助调试

---

## 错误码定义与解决建议

| 类型 | 错误码 | 描述 |
|------|--------|------|
| 初始化错误 | 10001 | 容器不存在 |
| | 10002 | socket连接错误 |
| | 10003 | 会话错误，start_session进入catch（/api/session的接口数据异常，均使用response.error_code） |
| | 10004 | 会话错误，stop_session进入catch |
| 前端处理逻辑错误 | 20001 | 视频抽帧错误 |
| | 20002 | 初始化视频抽帧WORKER错误 |
| | 20003 | 抽帧视频流处理错误 |
| | 20004 | 表情处理错误 |
| 资源管理错误 | 30001 | 背景图片加载错误 |
| | 30002 | 表情数据加载错误 |
| | 30003 | body数据无Name |
| | 30004 | 视频下载错误 |
| SDK 获取ttsa数据解压缩错误 | 40001 | 音频解码错误 |
| | 40002 | 表情解码错误 |
| | 40003 | 身体视频解码错误 |
| | 40004 | 事件解码错误 |
| | 40005 | ttsa返回数据类型错误，非audio、body、face、event等 |
| | 40006 | ttsa下行发送异常信息 |
| 网络问题 | 50001 | 离线模式 |
| | 50002 | 在线模式 |
| | 50003 | 网络重试 |
| | 50004 | 网络断开 |

---

## 最佳实践

1. 在页面卸载前调用`destroy()`方法清理资源
2. 合理使用错误回调处理异常情况
3. 使用SSML格式控制虚拟人说话效果
4. 需要自定义Widget行为时实现`onWidgetEvent`回调
5. 使用KA插件时，建议先测试动作意图识别效果，根据需要调整配置参数

---

## 常见问题

**Q：如何避免积分消耗过快？**

A：调试过程中建议使用基础音色；在长时间不做互动的状态下，可以切入离线模式；

**Q：如何切换数字人？**

A：可在魔珐星云平台创建多个具身驱动应用，通过销毁示例重新连接（接入新应用）的方式实现数字人切换

**Q：通过ip地址启动项目会报错？**

A：sdk中使用的某些方法仅支持localhost或者https调用

**Q：可以定制数字人吗？**

A：可以。若您有这方面的需求，可以扫码联系我们

---

## 版本记录

| 版本号 | 发布日期 | 说明 |
|--------|----------|------|
| 0.1.0-alpha.45 | 2025/10/15 | 新增了onVoiceStateChange方法，帮助更好的控制数字人状态新增插件系统，帮助用户自定义事件并进行响应 |
| 0.1.0-alpha.60 | 2025/10/19 | 修复人物重叠修复音频播放晚于正确事件 |
| 0.1.0-alpha.63 | 2025/10/23 | 修复sdk close时，sdk未销毁修复sdk disconnect时，sdk判断是否未销毁，未销毁时先销毁再发送给业务closewebgl 上下文丢失时，增加二次初始化失败处理 |

---

**文档更新时间**: 2025-01-06  
**来源**: https://xingyun3d.com/developers/52-183

