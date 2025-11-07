# 数字人视频生成API说明

## 概述

魔珐星云数字人视频生成功能能够将文本、PPT转化为高质量数字人视频，助力开发者快速构建专业级视频生成能力。

**文档来源**: https://xingyun3d.com/developers/55-188

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
3. 将 `data` 转换为json的字符串形式：`sort_json_str`
   > 以python为例：`json.dumps(dict(**data), sort_keys=True).replace(' ', '')`
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

### 2. API调用

#### 2.1 发起渲染

##### 方式1：通过segment发起渲染

**Host**: `https://nebula-agent.xingyun3d.com`

**请求路径**：`POST /user/v1/video_synthesis_task/create_render_task`

**请求参数**：

| 参数名 | 类型 | 名称 | 是否必填 | 备注 |
|--------|------|------|----------|------|
| video_name | string | 视频名称 | 非必填 | 含义：输出的视频名称=下载文件名<br>非必填项视频名称生成规则为 时间 |
| look_name | string | 形象名 | 必填 | 含义：视频使用的角色名称 |
| tts_vcn_name | string | 音色 | 必填 | 含义：视频使用的音色名称 |
| studio_name | string | 演播室 | 必填 | 含义：视频使用的演播室名称 |
| sub_title | string | 是否开启字幕 | 非必填 | 含义：视频是否开启字幕效果<br>枚举值：on / off<br>非必填项默认为 on |
| segment | JSON | SSML脚本 | 非必填 | 数组格式，SSML脚本 或 PPT文件 必填一个 |
| if_aigc_mark | bool | 是否AI生成标识 | 非必填 | 含义：是否添加AI生成标识<br>枚举值：true（表示在视频右下角，标注字样"魔珐星云·AI生成"） / false（视频去掉AI标识）<br>非必填项默认是 true |

**返回参数**：

| 一级参数名 | 二级参数名 | 类型 | 名称 | 备注 |
|-----------|-----------|------|------|------|
| error_code | | int | 错误码 | 0:成功 其他：错误 |
| error_reason | | string | 错误原因 | |
| data | | dict | | |
| | task_id | int | 视频任务ID | |

##### 方式2：通过PPT发起渲染

先调用 **PPT解析接口** 再调用 **创建渲染任务接口**

**PPT解析接口**：

**Host**: `https://nebula-agent.xingyun3d.com`

**请求路径**：`POST /user/v1/video_synthesis_task/parse_ppt_file`

**请求参数**：

| 参数名 | 类型 | 名称 | 是否必填 | 备注 |
|--------|------|------|----------|------|
| ppt_file | binary | PPT文件 | 必填 | X-TOKEN计算 不需要加入该参数 |

**返回参数**：

| 一级参数名 | 二级参数名 | 类型 | 名称 | 备注 |
|-----------|-----------|------|------|------|
| error_code | | int | 错误码 | 0:成功 其他：错误 |
| error_reason | | string | 错误原因 | |
| data | | dict | | |
| | parse_ppt_file_name | string | PPT文件解析名称 | |

**创建渲染任务接口**：

**Host**: `https://nebula-agent.xingyun3d.com`

**请求路径**：`POST /user/v1/video_synthesis_task/create_render_task`

**请求参数**：

| 参数名 | 类型 | 名称 | 是否必填 | 备注 |
|--------|------|------|----------|------|
| video_name | string | 视频名称 | 非必填 | 含义：输出的视频名称=下载文件名<br>非必填项视频名称生成规则为 时间 |
| look_name | string | 形象名 | 必填 | 含义：视频使用的角色名称 |
| tts_vcn_name | string | 音色 | 必填 | 含义：视频使用的音色名称 |
| studio_name | string | 演播室 | 必填 | 含义：视频使用的演播室名称 |
| sub_title | string | 是否开启字幕 | 非必填 | 含义：视频是否开启字幕效果<br>枚举值：on / off<br>非必填项默认为 on |
| parse_ppt_file_name | string | PPT文件解析名称 | 必填 | 含义：PPT解析接口返回的parse_ppt_file_name |
| if_aigc_mark | bool | 是否AI生成标识 | 非必填 | 含义：是否添加AI生成标识<br>枚举值：true（表示在视频右下角，标注字样"魔珐星云·AI生成"） / false（视频去掉AI标识）<br>非必填项默认是 true |

**返回参数**：

| 一级参数名 | 二级参数名 | 类型 | 名称 | 备注 |
|-----------|-----------|------|------|------|
| error_code | | int | 错误码 | 0:成功 其他：错误 |
| error_reason | | string | 错误原因 | |
| data | | dict | | |
| | task_id | int | 视频任务ID | |

#### 2.2 获取视频结果

**请求路径**：`GET /user/v1/video_synthesis_task/get_render_task`

**请求参数**：

| 参数名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| task_id | int | 任务id | 是 |

**返回参数**：

```json
{
    "error_code": 0,
    "error_reason": "",
    "data": {
        "id": 135,
        "error_reason": "合成任务失败，请重新发起或联系客服处理",
        "create_time": "2025-07-17T11:30:08.033710+08:00",
        "update_time": "2025-07-17T11:30:54.131480+08:00",
        "enable": true,
        "name": "6b187ef0c68c4ef2b9fda5964a392067",
        "video_name": "20250717_11_30_07.833",
        "output_resolution": "540P",
        "look_name": "AM058_10518_new",
        "tts_vcn_name": "XMOV_HN_TTS__6",
        "studio_name": "bust_chic_art_museum_01",
        "sub_title": "on",
        "synth_start_time": null,
        "synth_finish_time": null,
        "synth_state": "error",
        "segment": [
            {
                "text": "这是一条测试数据。",
                "media_id": 123338,
                "media_url": "https://media.xmov.ai/youyan/user_upload_qa/171998_b37eb4385ec64bec9fd4be.png"
            },
            {
                "text": "测试数据片段1",
                "media_id": 123339,
                "media_url": "https://media.xmov.ai/youyan/user_upload_qa/171998_b3195096c8d64cdfaa3b80.png"
            }
        ],
        "render_image_oss": null,
        "render_video_oss": null
    }
}
```

**synth_state 状态说明**：

- `not_send`: 排队中
- `waiting`: 等待处理
- `processing`: 处理中
- `finished`: 已完成
- `error`: 失败
- `cancel`: 已取消

#### 2.3 取消渲染任务

**请求路径**：`POST /user/v1/video_synthesis_task/cancel_render_task`

**请求参数**：

| 参数名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| task_id | int | 任务id | 是 |

**返回参数**：

```json
{
    "error_code": 0,
    "error_reason": ""
}
```

#### 2.4 预览

**请求路径**：`GET /user/v1/video_synthesis_task/get_render_task_preview_url`

**请求参数**：

| 参数名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| task_id | int | 任务id | 是 |

**返回参数**：

```json
{
    "error_code": 0,
    "error_reason": "",
    "data": {
        "preview_url": "https://xxx.com/preview/xxx.mp4"
    }
}
```

---

## DEMO示例

### 1. 发起渲染

#### 1.1 方式1：通过segment发起渲染

```python
import time
import json
import hashlib
import requests

def generate_x_token(data, secret, api_path, method, timestamp=None):
    lower_api_path = api_path.lower()
    lower_method = method.lower()
    sort_json_str = json.dumps(dict(data), sort_keys=True).replace(' ', '')
    x_timestamp = str(int(timestamp or time.time()))
    sign_str = f"{lower_api_path}{lower_method}{sort_json_str}{secret}{x_timestamp}"
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest()

app_id = 'xxxxx'    # 替换成应用的App ID
secret = 'xxxxx'    # 替换成应用的App Secret
host = 'https://nebula-agent.xingyun3d.com'

# 创建渲染任务接口
data = {
    "look_name": "caihongwei_3663_new",
    "tts_vcn_name": "XMOV_EN_TTS__13",
    "if_aigc_mark": True,
    "studio_name": "telestudio_simple_red_01",
    "sub_title": "on",
    "video_name": "测试调用API生成视频",
    "segment": [
        {
            "text": "这是一条测试数据。",
            "media_url": "https://example.com/image1.jpg"
        },
        {
            "text": "测试数据片段1",
            "media_url": "https://example.com/image2.jpg"
        }
    ]
}

api_path = '/user/v1/video_synthesis_task/create_render_task'
method = 'POST'
timestamp = int(time.time())
headers = {"content-type": "application/json"}
headers["X-APP-ID"] = app_id
headers["X-TOKEN"] = generate_x_token(data, secret, api_path, method, timestamp)
headers["X-TIMESTAMP"] = str(timestamp)

resp = requests.request(method, f'{host}{api_path}', json=data,
                        headers=headers, timeout=30)
res = resp.json()
print(resp.json())
task_id = res.get('data').get('task_id')
```

#### 1.2 方式2：通过PPT发起渲染

```python
import time
import json
import hashlib
import requests

def generate_x_token(data, secret, api_path, method, timestamp=None):
    lower_api_path = api_path.lower()
    lower_method = method.lower()
    sort_json_str = json.dumps(dict(data), sort_keys=True).replace(' ', '')
    x_timestamp = str(int(timestamp or time.time()))
    sign_str = f"{lower_api_path}{lower_method}{sort_json_str}{secret}{x_timestamp}"
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest()

app_id = 'xxxxx'    # 替换成应用的App ID
secret = 'xxxxx'    # 替换成应用的App Secret
host = 'https://nebula-agent.xingyun3d.com'

# PPT解析接口
files = [
    ('ppt_file', ('PPT模板.pptx', open('PPT模板.pptx', 'rb'),
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation'))
]
data = {}
api_path = '/user/v1/video_synthesis_task/parse_ppt_file'
method = 'POST'
timestamp = int(time.time())
headers = {}
headers["X-APP-ID"] = app_id
headers["X-TOKEN"] = generate_x_token(data, secret, api_path, method, timestamp)
headers["X-TIMESTAMP"] = str(timestamp)
start_time = time.time()
resp = requests.request(method, f'{host}{api_path}', data=data,
                        headers=headers, timeout=30, files=files)
res = resp.json()
print(res)
parse_ppt_file_name = res.get('data').get('parse_ppt_file_name')

# 创建渲染任务接口
data = {
    "look_name": "caihongwei_3663_new",
    "tts_vcn_name": "XMOV_EN_TTS__13",
    "if_aigc_mark": True,
    "studio_name": "telestudio_simple_red_01",
    "sub_title": "on",
    "video_name": "测试调用API生成视频",
    "parse_ppt_file_name": parse_ppt_file_name
}

api_path = '/user/v1/video_synthesis_task/create_render_task'
method = 'POST'
timestamp = int(time.time())
headers = {"content-type": "application/json"}
headers["X-APP-ID"] = app_id
headers["X-TOKEN"] = generate_x_token(data, secret, api_path, method, timestamp)
headers["X-TIMESTAMP"] = str(timestamp)

resp = requests.request(method, f'{host}{api_path}', json=data,
                        headers=headers, timeout=30)
res = resp.json()
print(resp.json())
task_id = res.get('data').get('task_id')
```

### 2. 获取视频结果

```python
import time
import json
import hashlib
import requests

def generate_x_token(data, secret, api_path, method, timestamp=None):
    lower_api_path = api_path.lower()
    lower_method = method.lower()
    sort_json_str = json.dumps(dict(data), sort_keys=True).replace(' ', '')
    x_timestamp = str(int(timestamp or time.time()))
    sign_str = f"{lower_api_path}{lower_method}{sort_json_str}{secret}{x_timestamp}"
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest()

app_id = 'xxxxx'    # 替换成应用的App ID
secret = 'xxxxx'    # 替换成应用的App Secret
host = 'https://nebula-agent.xingyun3d.com'

# 获取视频结果
task_id = 135
data = {
    "task_id": task_id
}
api_path = f'/user/v1/video_synthesis_task/get_render_task?task_id={task_id}'
method = 'GET'
timestamp = int(time.time())
headers = {}
headers["X-APP-ID"] = app_id
headers["X-TOKEN"] = generate_x_token(data, secret, api_path, method, timestamp)
headers["X-TIMESTAMP"] = str(timestamp)

resp = requests.request(method, f'{host}{api_path}',
                        headers=headers, timeout=30)
res = resp.json()
print(resp.json())
```

### 3. 取消渲染任务

```python
import time
import json
import hashlib
import requests

def generate_x_token(data, secret, api_path, method, timestamp=None):
    lower_api_path = api_path.lower()
    lower_method = method.lower()
    sort_json_str = json.dumps(dict(data), sort_keys=True).replace(' ', '')
    x_timestamp = str(int(timestamp or time.time()))
    sign_str = f"{lower_api_path}{lower_method}{sort_json_str}{secret}{x_timestamp}"
    return hashlib.md5(sign_str.encode('utf-8')).hexdigest()

app_id = 'xxxxx'    # 替换成应用的App ID
secret = 'xxxxx'    # 替换成应用的App Secret
host = 'https://nebula-agent.xingyun3d.com'

# 取消渲染任务
data = {
    "task_id": 135
}
api_path = '/user/v1/video_synthesis_task/cancel_render_task'
method = 'POST'
timestamp = int(time.time())
headers = {"content-type": "application/json"}
headers["X-APP-ID"] = app_id
headers["X-TOKEN"] = generate_x_token(data, secret, api_path, method, timestamp)
headers["X-TIMESTAMP"] = str(timestamp)

resp = requests.request(method, f'{host}{api_path}', json=data,
                        headers=headers, timeout=30)
res = resp.json()
print(resp.json())
```

---

## 3. 错误码

常见错误码说明：

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| 20001 | 应用不存在 | 检查APP_ID是否正确 |
| 20002 | 签名验证失败 | 检查签名算法和密钥 |
| 20003 | 时间戳过期 | 更新时间戳（60秒有效期） |
| 30002 | PPT文件缺失 | 检查ppt_file是否正确 |
| 30003 | PPT解析失败 | 检查PPT格式是否正确 |
| 30004 | 任务未找到 | 检查task_id是否正确 |
| 30005 | 创建任务失败 | 检查参数或联系技术支持 |

---

## 注意事项

1. **时间戳有效期**：X-TIMESTAMP 必须在当前时间的60秒内有效
2. **签名计算**：PPT文件上传时，X-TOKEN计算不需要加入 `ppt_file` 参数
3. **任务状态轮询**：建议使用轮询方式查询任务状态，直到任务完成或失败
4. **并发限制**：建议控制并发请求数量，避免超过API限制

---

**文档更新时间**: 2025-01-06  
**来源**: https://xingyun3d.com/developers/55-188

