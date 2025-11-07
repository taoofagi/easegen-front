# 语音合成API说明

## 概述

将文本实时转换为自然语音，为数字人和各类智能终端应用提供高质量声音输出。

**文档来源**: https://xingyun3d.com/developers/56-190

---

## API说明

### 1. 鉴权

#### 1.1 X-TOKEN计算

**接口接收参数**：

1. **数据体**：`data = {"xxxx": "xxxx"}` or `{}`
2. **分配给外部的密钥**：`secret = "iamsecret"`
3. **接口方法路径（不包含host）**：`api_path = "/xxx/xxx?xx=xxx"`

**计算步骤**：

1. 将 `api_path` 转换为全小写形式：`lower_api_path`
2. 将请求 `method` 方法转为小写形式：`lower_method`（例如："delete"/"post"/...）
3. 将 `data` 转换为json的字符串形式：`sort_json_str`；以python为例：`json.dumps(dict(**data), sort_keys=True).replace(' ', '')`
4. 按照如下顺序连接字符串：`lower_api_path + lower_method + sort_json_str + secret + X-TIMESTAMP`
   - **X-TIMESTAMP**：接口秒级时间戳，距当前时间60s内有效
   - 得到sign：`/xxx/xxx?xx=xxx{"xxxx": "xxxx"}iamsecret1489133053`
5. 将 `sign` 以utf8编码，计算md5得到X-TOKEN：`ddc6457fd0b373475ac65912b797ef05`

#### 1.2 接口调用

请求接口时应该加入如下头部信息：

- **X-APP-ID**：应用AK
- **X-TIMESTAMP**：秒级时间戳
- **X-TOKEN**：签名计算结果

#### 1.3 demo代码

**Python示例**：

```python
import time
import json
import hashlib
import requests
from urllib.parse import urljoin


def encode_with_md5(s):
    m = hashlib.md5()
    m.update(s.encode('utf-8'))
    return m.hexdigest()


def headers_need_sign(ak, secret, method, url, data):
    headers = {}
    t = int(time.time())
    
    data = json.dumps(dict(**data), sort_keys=True).replace(' ', '')
    ori_sign = '{0}{1}{2}{3}{4}'.format(url.lower(), method.lower(), data, secret, t)
    sign = encode_with_md5(ori_sign)
    headers["X-APP-ID"] = ak
    headers["X-TOKEN"] = sign
    headers["X-TIMESTAMP"] = str(t)
    return headers


if __name__ == '__main__':
    ak = '37514ac0-3fce-4f4c-bc3f-86eba37da7dd'
    secret = 'bb81b706-ef1f-443e-9e86-9df8399f796b'
    method = 'POST'
    host = 'https://nebula-agent.xingyun3d.com'
    url = '/xxx/xxx?x=xx&z=zz'
    req_data = {
        "data1": "data1",
        "data2": "data2",
    }

    # 计算获取请求headers
    req_headers = headers_need_sign(ak, secret, method, url, req_data)

    # 请求接口
    req_url = urljoin(host, url)
    resp = requests.request(method, req_url, json=req_data, headers=req_headers)
```

---

### 2. 调用说明

#### 2.1 Websocket 语音试听

**Host**: `https://nebula-agent.xingyun3d.com`

**请求路径**：`wss://{host}/user/v1/ws/tts`

**请求参数Params**：

| 参数名 | 类型 | 名称 | 是否必填 | 备注 |
|--------|------|------|----------|------|
| tts_vcn | string | 音色 | 必填 | 含义：用于合成的音色名称 |
| text | text | 语料 | 必填 | 含义：用于合成音频的语料内容 |

**Message**：

| 参数名 | 类型 | 名称 | 是否必填 | 备注 |
|--------|------|------|----------|------|
| text | text | 语料 | 必填 | 含义：用于合成音频的语料内容 |

**返回参数**：

| 一级参数名 | 类型 | 名称 | 备注 |
|-----------|------|------|------|
| error_code | int | 错误码 | 0:成功其他：错误 |
| error_reason | string | 错误原因 | |
| data | string | 音频数据 | |
| start_time | float | 语音开始秒数 | |
| end_time | float | 语音结束秒数 | |
| inference_end | bool | 是否结束 | |

#### 2.2 创建合成音频任务

**Host**: `https://nebula-agent.xingyun3d.com`

**请求路径**：`POST /user/v1/tts_task/create_tts_task`

**请求参数**：

| 参数名 | 类型 | 名称 | 是否必填 | 备注 |
|--------|------|------|----------|------|
| audio_name | string | 音频名称 | 非必填 | 1.含义：输出的音频名称=下载文件名<br>2.非必填项<br>3.音频名称生成规则为 时间 |
| tts_vcn | string | 音色 | 必填 | 含义：用于合成的音色名称 |
| text | text | 语料 | 必填 | 含义：用于合成音频的语料内容 |

**返回参数**：

| 一级参数名 | 二级参数名 | 类型 | 名称 | 备注 |
|-----------|-----------|------|------|------|
| error_code | | int | 错误码 | 0:成功其他：错误 |
| error_reason | | string | 错误原因 | |
| data | | dict | | |
| | task_id | int | 任务ID | |

#### 2.3 查询任务结果

**Host**: `https://nebula-agent.xingyun3d.com`

**请求路径**：`GET /user/v1/tts_task/get_tts_task`

**请求参数**：

| 参数名 | 类型 | 名称 | 是否必填 | 备注 |
|--------|------|------|----------|------|
| task_id | int | 任务ID | 必填 | |

**返回参数**：

| 一级参数名 | 二级参数名 | 类型 | 名称 | 备注 |
|-----------|-----------|------|------|------|
| error_code | | int | 错误码 | 0:成功其他：错误 |
| error_reason | | string | 错误原因 | |
| data | | dict | | |
| | id | int | 任务ID | |
| | audio_name | string | 音频名称 | |
| | tts_vcn | string | 音色名称 | |
| | text | string | 语料内容 | |
| | synth_status | string | 任务状态 | 枚举值：waiting（等待中）、processing（处理中）、finished（已完成）、error（失败）、cancel（已取消） |
| | file_oss | string | 音频文件OSS地址 | 当任务状态为已完成，该字段才有数值 |
| | synth_start_time | datetime | 合成开始时间 | 当任务状态为处理中或已完成，该字段才有数值 |
| | synth_finish_time | datetime | 合成完成时间 | 当任务状态为已完成，该字段才有数值 |
| | error_reason | string | 错误日志 | |

#### 2.4 取消任务

**Host**: `https://nebula-agent.xingyun3d.com`

**请求路径**：`POST /user/v1/tts_task/cancel_tts_task`

**请求参数**：

| 参数名 | 类型 | 名称 | 是否必填 | 备注 |
|--------|------|------|----------|------|
| task_id | int | 任务ID | 必填 | |

**返回参数**：

| 一级参数名 | 二级参数名 | 类型 | 名称 | 备注 |
|-----------|-----------|------|------|------|
| error_code | | int | 错误码 | 0:成功 其他：错误 |
| error_reason | | string | 错误原因 | |

---

### 3. 错误码

| 错误码Code | 错误码描述 |
|-----------|-----------|
| 20001 | 应用不存在或无法使用 |
| 40001 | 试听错误,请联系客服 |
| 40002 | 创建任务失败，请重新发起或联系客服处理 |
| 40003 | 语音合成任务未找到 |

---

## DEMO示例

### 1. Websocket 语音试听

```
wss://{host}/user/v1/ws/tts
Params: tts_vcn: XMOV_LV_TTS__13
Message:
{
    "text": "这是一个测试数据"
}
```

**返回消息示例**：

```json
{
    "data_type": "CHAR_TIME_MAP",
    "data": "[[\"\这\", 0.0, 0.13492637276649475], [\"\是\", 0.13492637276649475, 0.2383104532957077], [\"\一\", 0.2383104532957077, 0.3133762061595917], [\"\个\", 0.3133762061595917, 0.40454187691211707], [\"\测\", 0.40454187691211707, 0.6611631065607071], [\"\试\", 0.6611631065607071, 0.7994877487421036], [\"\数\", 0.7994877487421036, 0.9844612509012223], [\"\据\", 0.9844612509012223, 1.209628227353096], [\"[PUNC]\", 1.209628227353096, 1.725]]",
    "start_time": 0.0,
    "end_time": 0.0,
    "sentence_index": -1,
    "char_index": -1,
    "inference_end": false,
    "flush_buffer": false,
    "req_id": "ws-tts-564c57d3-6c50-4c01-90a4-4016547f6625-0"
}

{
    "data_type": "AUDIO",
    "data": "AAAA",
    "start_time": 0.0,
    "end_time": 1.725000023841858,
    "sentence_index": -1,
    "char_index": -1,
    "inference_end": false,
    "flush_buffer": false,
    "req_id": "ws-tts-564c57d3-6c50-4c01-90a4-4016547f6625-0"
}

{
    "data_type": "CHAR_TIME_MAP",
    "data": "",
    "start_time": 0.0,
    "end_time": 0.0,
    "sentence_index": -1,
    "char_index": -1,
    "inference_end": false,
    "flush_buffer": true,
    "req_id": "ws-tts-564c57d3-6c50-4c01-90a4-4016547f6625-0"
}

{
    "data_type": "AUDIO",
    "data": "",
    "start_time": 0.0,
    "end_time": 0.0,
    "sentence_index": -1,
    "char_index": -1,
    "inference_end": true,
    "flush_buffer": false,
    "req_id": "ws-tts-564c57d3-6c50-4c01-90a4-4016547f6625-0"
}
```

### 2. 创建合成音频任务

**请求**：

```
POST /user/v1/tts_task/create_tts_task
Body:
{
    "text": "在这里提醒大家，入冬之后呢要注意早睡晚起，保证充足的睡眠。可以适当地运动，强度达到身体微微发热、微微出汗就好啦，不宜过度地运动哈。愿你们在这个寒冷的季节里，心怀温暖，身体健康，家庭幸福。",
    "tts_vcn": "XMOV_LV_TTS__13"
}
```

**响应**：

```json
{
    "error_code": 0,
    "error_reason": "",
    "data": {
        "task_id": 10
    }
}
```

### 3. 获取任务结果

**请求**：

```
GET /user/v1/tts_task/get_tts_task
Params: task_id: 135  # 任务id
```

**响应**：

```json
{
    "error_code": 0,
    "error_reason": "",
    "data": {
        "id": 10,
        "synth_status": "waiting",
        "file_oss": "",
        "synth_start_time": null,
        "synth_finish_time": null,
        "error_reason": ""
    }
}
```

### 4. 取消任务

**请求**：

```
POST /user/v1/tts_task/cancel_tts_task
{
   "task_id": 10  # 任务id
}
```

**响应**：

```json
{
    "error_code": 0,
    "error_reason": ""
}
```

---

## 注意事项

1. **时间戳有效期**：X-TIMESTAMP 必须在当前时间的60秒内有效
2. **任务状态轮询**：建议使用轮询方式查询任务状态，直到任务完成或失败
3. **Websocket连接**：语音试听功能使用Websocket连接，需要处理连接断开和重连逻辑
4. **音频格式**：返回的音频数据为base64编码格式

---

**文档更新时间**: 2025-01-06  
**来源**: https://xingyun3d.com/developers/56-190

