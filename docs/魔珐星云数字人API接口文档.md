# 魔珐星云数字人视频生成API接口文档

## 文档概览

魔珐星云提供文本和PPT转高质量数字人视频的API服务，支持开发者构建专业级视频生成能力。

**基础地址**: `https://nebula-agent.xingyun3d.com`

**文档来源**: https://xingyun3d.com/developers/55-188

---

## 一、认证机制

### 1.1 认证方式

采用 **X-TOKEN 签名认证**，每个请求需包含以下三个请求头：

| 请求头名称 | 说明 | 示例 |
|-----------|------|------|
| X-APP-ID | 应用访问密钥ID | `your_app_id` |
| X-TIMESTAMP | 秒级时间戳（有效期60秒） | `1699999999` |
| X-TOKEN | MD5签名值 | `abc123def456...` |

### 1.2 签名算法

签名生成步骤：

```
1. 接口路径转小写
2. HTTP方法转小写
3. 请求体JSON序列化（键排序，无空格）
4. 拼接字符串：路径 + 方法 + JSON + 密钥 + 时间戳
5. MD5加密生成32位小写token
```

### 1.3 签名示例

**Java示例**:
```java
String path = "/user/v1/video_synthesis_task/create_render_task".toLowerCase();
String method = "post";
String jsonBody = "{\"look_name\":\"AM054_Jap_9021_new\",\"segment\":[{\"text\":\"测试内容\"}],\"studio_name\":\"youling_2d_v\",\"tts_vcn_name\":\"XMOV_HN_TTS__236\"}";
String appSecret = "your_app_secret";
long timestamp = System.currentTimeMillis() / 1000;

String signStr = path + method + jsonBody + appSecret + timestamp;
String token = DigestUtils.md5Hex(signStr).toLowerCase();
```

**Python示例**:
```python
import hashlib
import time
import json

path = "/user/v1/video_synthesis_task/create_render_task".lower()
method = "post"
body = {"look_name": "AM054_Jap_9021_new", "segment": [{"text": "测试内容"}], "studio_name": "youling_2d_v", "tts_vcn_name": "XMOV_HN_TTS__236"}
json_body = json.dumps(body, separators=(',', ':'), sort_keys=True)
app_secret = "your_app_secret"
timestamp = int(time.time())

sign_str = path + method + json_body + app_secret + str(timestamp)
token = hashlib.md5(sign_str.encode()).hexdigest().lower()
```

---

## 二、API接口列表

| 功能 | 接口路径 | 方法 | 说明 |
|------|---------|------|------|
| 创建渲染任务 | `/user/v1/video_synthesis_task/create_render_task` | POST | 提交文本或PPT渲染任务 |
| 解析PPT文件 | `/user/v1/video_synthesis_task/parse_ppt_file` | POST | 解析PPT为可渲染格式 |
| 查询任务状态 | `/user/v1/video_synthesis_task/get_render_task` | GET | 获取任务进度和结果 |
| 取消任务 | `/user/v1/video_synthesis_task/cancel_render_task` | POST | 取消正在执行的任务 |
| 获取预览URL | `/user/v1/video_synthesis_task/get_render_task_preview_url` | GET | 获取视频预览地址 |

---

## 三、接口详细说明

### 3.1 创建渲染任务

**接口**: `POST /user/v1/video_synthesis_task/create_render_task`

**功能**: 创建数字人视频渲染任务

#### 请求参数

**必填参数**:

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| look_name | String | 数字人角色名称 | `AM054_Jap_9021_new` |
| tts_vcn_name | String | 音色名称 | `XMOV_HN_TTS__236` |
| studio_name | String | 演播室背景名称 | `youling_2d_v` |

**可选参数**:

| 参数名 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| video_name | String | 输出视频名称 | 自动生成 |
| sub_title | String | 字幕开关：on/off | `on` |
| if_aigc_mark | Boolean | 是否显示AI生成标识 | `true` |
| segment | Array | 文本脚本段落数组 | - |
| parse_ppt_file_name | String | PPT解析后的文件名（与segment二选一） | - |

**segment数组结构**:

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| text | String | 文本内容 | 是 |
| media_url | String | 背景图片URL | 否 |

#### 请求示例

**方式一：使用文本段落**

```json
POST /user/v1/video_synthesis_task/create_render_task
Headers:
  X-APP-ID: your_app_id
  X-TIMESTAMP: 1699999999
  X-TOKEN: generated_token
  Content-Type: application/json

Body:
{
  "look_name": "AM054_Jap_9021_new",
  "tts_vcn_name": "XMOV_HN_TTS__236",
  "studio_name": "youling_2d_v",
  "video_name": "我的第一个数字人视频",
  "sub_title": "on",
  "if_aigc_mark": true,
  "segment": [
    {
      "text": "大家好，我是数字人讲师。今天我们来学习人工智能的基础知识。",
      "media_url": "https://example.com/background1.jpg"
    },
    {
      "text": "人工智能是计算机科学的一个分支，它致力于创建能够模拟人类智能的系统。"
    }
  ]
}
```

**方式二：使用PPT**

```json
{
  "look_name": "AM054_Jap_9021_new",
  "tts_vcn_name": "XMOV_HN_TTS__236",
  "studio_name": "youling_2d_v",
  "parse_ppt_file_name": "ppt_20231115_123456"
}
```

#### 响应示例

**成功响应**:
```json
{
  "error_code": 0,
  "error_msg": "success",
  "data": {
    "task_id": 135
  }
}
```

**失败响应**:
```json
{
  "error_code": 30005,
  "error_msg": "创建任务失败",
  "data": null
}
```

---

### 3.2 解析PPT文件

**接口**: `POST /user/v1/video_synthesis_task/parse_ppt_file`

**功能**: 将PPT文件解析为可用于渲染的格式

#### 请求参数

| 参数名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| ppt_url | String | PPT文件的可访问URL | 是 |

#### 请求示例

```json
POST /user/v1/video_synthesis_task/parse_ppt_file
Headers:
  X-APP-ID: your_app_id
  X-TIMESTAMP: 1699999999
  X-TOKEN: generated_token
  Content-Type: application/json

Body:
{
  "ppt_url": "https://example.com/course.pptx"
}
```

#### 响应示例

**成功响应**:
```json
{
  "error_code": 0,
  "error_msg": "success",
  "data": {
    "parse_ppt_file_name": "ppt_20231115_123456"
  }
}
```

**使用说明**:
1. 获取 `parse_ppt_file_name` 后
2. 将其传入创建渲染任务接口的 `parse_ppt_file_name` 参数
3. 系统会自动使用PPT内容生成数字人视频

---

### 3.3 查询任务状态

**接口**: `GET /user/v1/video_synthesis_task/get_render_task`

**功能**: 查询渲染任务的状态和进度

#### 请求参数

| 参数名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| task_id | Integer | 任务ID | 是 |

#### 请求示例

```
GET /user/v1/video_synthesis_task/get_render_task?task_id=135
Headers:
  X-APP-ID: your_app_id
  X-TIMESTAMP: 1699999999
  X-TOKEN: generated_token
```

#### 响应示例

**成功响应**:
```json
{
  "error_code": 0,
  "error_msg": "success",
  "data": {
    "task_id": 135,
    "status": "finished",
    "video_url": "https://cdn.xingyun3d.com/videos/task_135.mp4",
    "duration": 120,
    "created_at": "2023-11-15 12:34:56",
    "finished_at": "2023-11-15 12:40:23"
  }
}
```

#### 任务状态说明

| 状态值 | 说明 | 处理建议 |
|--------|------|---------|
| `not_send` | 排队中 | 继续轮询 |
| `waiting` | 等待处理 | 继续轮询 |
| `processing` | 处理中 | 继续轮询 |
| `finished` | 已完成 | 获取视频URL |
| `error` | 失败 | 检查错误信息 |
| `cancel` | 已取消 | 任务终止 |

---

### 3.4 取消任务

**接口**: `POST /user/v1/video_synthesis_task/cancel_render_task`

**功能**: 取消正在执行的渲染任务

#### 请求参数

| 参数名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| task_id | Integer | 任务ID | 是 |

#### 请求示例

```json
POST /user/v1/video_synthesis_task/cancel_render_task
Headers:
  X-APP-ID: your_app_id
  X-TIMESTAMP: 1699999999
  X-TOKEN: generated_token
  Content-Type: application/json

Body:
{
  "task_id": 135
}
```

#### 响应示例

**成功响应**:
```json
{
  "error_code": 0,
  "error_msg": "success",
  "data": {
    "task_id": 135,
    "status": "cancel"
  }
}
```

---

### 3.5 获取预览URL

**接口**: `GET /user/v1/video_synthesis_task/get_render_task_preview_url`

**功能**: 获取任务的视频预览地址

#### 请求参数

| 参数名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| task_id | Integer | 任务ID | 是 |

#### 请求示例

```
GET /user/v1/video_synthesis_task/get_render_task_preview_url?task_id=135
Headers:
  X-APP-ID: your_app_id
  X-TIMESTAMP: 1699999999
  X-TOKEN: generated_token
```

#### 响应示例

**成功响应**:
```json
{
  "error_code": 0,
  "error_msg": "success",
  "data": {
    "preview_url": "https://cdn.xingyun3d.com/preview/task_135.mp4"
  }
}
```

---

## 四、错误码说明

### 4.1 错误码列表

| 错误码 | 说明 | 处理建议 |
|--------|------|---------|
| 0 | 成功 | - |
| 20001 | 应用不存在 | 检查APP_ID是否正确 |
| 20002 | 签名验证失败 | 检查签名算法和密钥 |
| 20003 | 时间戳过期 | 更新时间戳（60秒有效期） |
| 30002 | PPT文件缺失 | 检查ppt_url是否可访问 |
| 30003 | PPT解析失败 | 检查PPT格式是否正确 |
| 30004 | 任务未找到 | 检查task_id是否正确 |
| 30005 | 创建任务失败 | 检查参数或联系技术支持 |
| 30006 | 取消任务失败 | 任务可能已完成或不存在 |

### 4.2 通用错误处理

```java
// 错误处理示例
if (response.getErrorCode() != 0) {
    switch (response.getErrorCode()) {
        case 20001:
            log.error("应用不存在，请检查APP_ID");
            break;
        case 20002:
            log.error("签名验证失败，请检查签名算法");
            break;
        case 20003:
            log.error("时间戳过期，请更新时间戳");
            break;
        default:
            log.error("未知错误: {}", response.getErrorMsg());
    }
}
```

---

## 五、最佳实践

### 5.1 任务状态轮询

建议轮询策略：
- 初始间隔：3秒
- 最大间隔：30秒
- 超时时间：30分钟

```java
// 轮询示例
public void pollTaskStatus(Integer taskId) {
    int maxAttempts = 600; // 30分钟 (600 * 3秒)
    int attempts = 0;

    while (attempts < maxAttempts) {
        TaskStatusResponse response = getTaskStatus(taskId);

        if ("finished".equals(response.getStatus())) {
            // 任务完成
            handleSuccess(response);
            break;
        } else if ("error".equals(response.getStatus())) {
            // 任务失败
            handleError(response);
            break;
        }

        // 继续等待
        Thread.sleep(3000);
        attempts++;
    }
}
```

### 5.2 请求重试机制

对于网络错误，建议实现指数退避重试：

```java
// 重试示例
public Response createTaskWithRetry(TaskRequest request) {
    int maxRetries = 3;
    int retryDelay = 1000; // 1秒

    for (int i = 0; i < maxRetries; i++) {
        try {
            return createTask(request);
        } catch (NetworkException e) {
            if (i == maxRetries - 1) {
                throw e;
            }
            Thread.sleep(retryDelay * Math.pow(2, i));
        }
    }
}
```

### 5.3 并发控制

建议单账号并发限制：
- 同时创建任务：≤ 10个
- 查询请求：≤ 100 QPS

---

## 六、集成清单

### 6.1 对接准备

- [ ] 获取 APP_ID 和 APP_SECRET
- [ ] 实现签名算法
- [ ] 封装HTTP请求工具类
- [ ] 实现任务状态轮询
- [ ] 添加错误处理逻辑
- [ ] 配置重试机制

### 6.2 测试验证

- [ ] 文本渲染任务测试
- [ ] PPT解析和渲染测试
- [ ] 任务状态查询测试
- [ ] 任务取消测试
- [ ] 异常情况处理测试
- [ ] 性能和并发测试

---

## 七、技术支持

如有问题，请访问：https://xingyun3d.com/developers/

---

**文档版本**: v1.0
**更新日期**: 2025-01-06
**维护者**: Easegen开发团队
