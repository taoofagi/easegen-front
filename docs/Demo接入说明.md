# Demo接入

## 概述

通过接入三方ASR、LLM完成一个可以交互对话的数字人应用

**文档来源**: https://xingyun3d.com/developers/52-187

---

## 主要功能

1. 接入魔珐星云具身驱动SDK
2. 对接LLM大模型，实现文本对话
3. 对接ASR，实现语音转文本后对话

---

## 环境要求

1. **前端框架**: Vue 3 + TypeScript
2. **构建工具**: Vite
3. **数字人SDK**: https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar.0.1.0-alpha.63.js
4. **语音识别**: 三方ASR
5. **大语言模型**: OpenAI兼容API（火山引擎方舟）
6. **加密库**: CryptoJS

---

## 快速开始

1. **下载demo**（https://rsjqcmnt5p.feishu.cn/wiki/U1TkwoTj5iP5gDkfXbwcUFsYngi），解压缩

2. **在文件所在位置，执行代码**`pnpm i`，安装环境依赖

3. **安装环境依赖完成之后，执行代码**`pnpm run dev`，运行demo

4. **在浏览器中打开** http://localhost:5173/

5. **输入连接参数**，数字人实时驱动SDK连接参数 App ID、App Secret（可以从魔珐星云 - 应用管理 - 查看密钥 处得到）

6. **输入语音识别连接参数** ASR App ID、ASR Secret ID、ASR Secret Key

   > 下拉选择ASR服务商，本demo中以腾讯ASR为例，需要在ASR服务商获取连接参数

7. **输入大模型连接参数**：大模型版本、大模型 key

   > 本demo中连接的是火山方舟系的大模型，可以从火山方舟获取参数

8. **输入文本，点击发送，即可与数字人进行问答**或者**点击语音识别按钮，说话，识别结束后，数字人即可进行问答**

---

## 进阶接入

### 1. ASR模块替换

asr整体封装在 `src/lib` 下，对外暴露入口api为 `useAsr`，执行 `useAsr` 会获得以下3个api:

1. **start**: 执行语音获取转换文字
2. **stop**: 停止语音接收
3. **asrText**: 语音识别出的文字内容

那么只需要保持这三个api的功能和输出一致，内部asr具体执行可按照需要的asr三方文档做修改即可

### 2. LLM模块替换

llm模块为大模型对接，整体封装在 `src/components/llm.ts` 文件中，当前采用的是openai的接入模式，替换只需要将这个文件中的大模型接入方按对方文档接入并嵌入其中即可，只需要保持这里类中的 `send` 方法吐出的是字符串就能完成llm的替换

---

## FAQ

**Q: 为什么会报错：VideoDecoder is not defined？**

A: 魔珐星云具身驱动目前部分方法暂不支持http调用，可以尝试使用 localhost 或者 https调用

---

**文档更新时间**: 2025-01-06  
**来源**: https://xingyun3d.com/developers/52-187

