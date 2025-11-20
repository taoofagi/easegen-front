# Easegen 数字课程 API 文档

## 概述

本文档描述了 Easegen 数字课程平台提供的第三方 API 接口。所有接口都需要通过 API Key 进行认证。

**Base URL**: `http://localhost:48080`

**认证方式**: 通过请求头 `easegen-api-key` 传递 API Key
测试apikey：ak_6Lhr10waeBfdRgmABBge
测试课程id：887
---

## 1. 获取课程文本片段

### 接口信息

- **接口路径**: `/admin-api/digitalcourse/courses/getCourseText`
- **请求方式**: `GET`
- **接口描述**: 获取课程的单个文本片段（分段后的），包括文本、音频、图片等，支持实时数字人播放

### 请求参数

#### Header 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| easegen-api-key | String | 是 | API 密钥，用于身份认证 |

#### Query 参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| course_id | String | 是 | 课程编号 | "1024" |
| no | Integer | 否 | 文本片段序号，默认为1或用户当前进度 | 1 |

### 响应参数

#### 成功响应 (200)

**响应结构**: `CommonResult<CourseTextRespVO>`

```json
{
  "code": 0,
  "data": {
    "audio": "",
    "text": "这是课程的一段讲稿文本",
    "timestamp": 1699999999999,
    "img": "https://example.com/course/image1.jpg",
    "currentNo": 1,
    "totalNo": 50,
    "progress": "1/50"
  },
  "msg": "成功"
}
```

#### CourseTextRespVO 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| audio | String | 音频 URL（当前为空字符串） |
| text | String | 当前片段的文本内容（讲稿） |
| timestamp | Long | 时间戳（毫秒） |
| img | String | 当前片段对应的图片 URL（PPT 截图） |
| currentNo | Integer | 当前片段序号 |
| totalNo | Integer | 总片段数 |
| progress | String | 播放进度，格式："当前序号/总数" |

### 错误响应

#### 400 - 请求参数错误

```json
{
  "code": 400,
  "data": null,
  "msg": "缺少 easegen-api-key 请求头或请求头为空"
}
```

```json
{
  "code": 400,
  "data": null,
  "msg": "未找到用户信息，请确认apikey是否正确"
}
```

### 请求示例

#### cURL

```bash
curl -X GET "http://your-domain:48080/admin-api/digitalcourse/courses/getCourseText?course_id=1024&no=1" \
  -H "easegen-api-key: your-api-key-here"
```

#### Python

```python
import requests

url = "http://your-domain:48080/admin-api/digitalcourse/courses/getCourseText"
headers = {
    "easegen-api-key": "your-api-key-here"
}
params = {
    "course_id": "1024",
    "no": 1
}

response = requests.get(url, headers=headers, params=params)
print(response.json())
```

#### JavaScript (Axios)

```javascript
const axios = require('axios');

axios.get('http://your-domain:48080/admin-api/digitalcourse/courses/getCourseText', {
  headers: {
    'easegen-api-key': 'your-api-key-here'
  },
  params: {
    course_id: '1024',
    no: 1
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error(error);
});
```

### 业务说明

1. **文本分段逻辑**: 系统会自动将课程讲稿按照标点符号（，。！？；：,.!?;:）进行分段
2. **进度管理**:
   - 如果不传 `no` 参数，系统会返回用户上次观看进度的下一段
   - 如果用户首次访问，返回第一段（no=1）
   - 系统会自动记录用户的观看进度，有效期1小时
3. **图片对应关系**: 每个文本片段对应其所属场景的背景图片（PPT 截图）

---

## 2. 获取课程列表（分页）

### 接口信息

- **接口路径**: `/admin-api/digitalcourse/courses/getCoursePage`
- **请求方式**: `GET`
- **接口描述**: 获取当前用户的课程列表，支持分页和多条件筛选

### 请求参数

#### Header 参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| easegen-api-key | String | 是 | API 密钥，用于身份认证 |

#### Query 参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| pageNo | Integer | 否 | 页码，默认为1 | 1 |
| pageSize | Integer | 否 | 每页数量，默认为10 | 10 |
| name | String | 否 | 课程名称（模糊搜索） | "数学课程" |
| aspect | String | 否 | 屏幕比例 | "16:9" |
| duration | Integer | 否 | 时长（秒） | 300 |
| height | Integer | 否 | 高度（像素） | 1080 |
| width | Integer | 否 | 宽度（像素） | 1920 |
| matting | Integer | 否 | 是否抠图标识 | 0 |
| pageMode | Integer | 否 | 页面模式 | 1 |
| status | Integer | 否 | 状态 | 0 |
| pageInfo | String | 否 | 页面信息 | - |
| thumbnail | String | 否 | 缩略图 | - |
| subtitlesStyle | String | 否 | 字幕样式 | - |
| createTime | Array | 否 | 创建时间范围，格式：yyyy-MM-dd HH:mm:ss | ["2024-01-01 00:00:00","2024-12-31 23:59:59"] |

### 响应参数

#### 成功响应 (200)

**响应结构**: `CommonResult<PageResult<AppCoursesRespVO>>`

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1024,
        "accountId": 361,
        "name": "数学基础课程",
        "aspect": "16:9",
        "duration": 300,
        "height": 1080,
        "width": 1920,
        "matting": 0,
        "pageMode": 1,
        "status": 0,
        "pageInfo": "{}",
        "thumbnail": "https://example.com/thumbnail.jpg",
        "subtitlesStyle": "{}",
        "platformType": 1,
        "createTime": "2024-01-15T10:30:00",
        "progress": "5/50"
      }
    ],
    "total": 100
  },
  "msg": "成功"
}
```

#### PageResult 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| list | Array | 课程列表 |
| total | Long | 总记录数 |

#### AppCoursesRespVO 字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | Long | 课程ID |
| accountId | Integer | 账户ID |
| name | String | 课程名称 |
| aspect | String | 屏幕比例（如：16:9, 9:16） |
| duration | Integer | 时长（秒） |
| height | Integer | 高度（像素） |
| width | Integer | 宽度（像素） |
| matting | Integer | 是否抠图标识（0-否，1-是） |
| pageMode | Integer | 页面模式 |
| status | Integer | 状态（0-正常，1-异常） |
| pageInfo | String | 页面信息（JSON字符串） |
| thumbnail | String | 缩略图URL |
| subtitlesStyle | String | 字幕样式（JSON字符串） |
| platformType | Integer | 平台类型：1-2D（easegen），2-3D（魔珐星云） |
| createTime | String | 创建时间（ISO 8601格式） |
| progress | String | 课程进度，格式："当前进度/总数" |

### 错误响应

#### 400 - 请求参数错误

```json
{
  "code": 400,
  "data": null,
  "msg": "缺少 easegen-api-key 请求头或请求头为空"
}
```

```json
{
  "code": 400,
  "data": null,
  "msg": "未找到用户信息，请确认apikey是否正确"
}
```

### 请求示例

#### cURL

```bash
curl -X GET "http://your-domain:48080/admin-api/digitalcourse/courses/getCoursePage?pageNo=1&pageSize=10&name=数学" \
  -H "easegen-api-key: your-api-key-here"
```

#### Python

```python
import requests

url = "http://your-domain:48080/admin-api/digitalcourse/courses/getCoursePage"
headers = {
    "easegen-api-key": "your-api-key-here"
}
params = {
    "pageNo": 1,
    "pageSize": 10,
    "name": "数学"
}

response = requests.get(url, headers=headers, params=params)
print(response.json())
```

#### JavaScript (Axios)

```javascript
const axios = require('axios');

axios.get('http://your-domain:48080/admin-api/digitalcourse/courses/getCoursePage', {
  headers: {
    'easegen-api-key': 'your-api-key-here'
  },
  params: {
    pageNo: 1,
    pageSize: 10,
    name: '数学'
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error(error);
});
```

### 业务说明

1. **权限控制**: 只能查询当前 API Key 对应用户创建的课程
2. **分页**: 支持标准分页，默认每页10条
3. **筛选**: 支持多字段组合筛选
4. **进度**: 返回数据中包含课程播放进度信息

---

## 通用说明

### API Key 获取方式

API Key 需要通过 Easegen 平台管理后台生成：
1. 登录 Easegen 管理后台
2. 进入用户设置
3. 生成并保存 API Key

**注意**: API Key 具有完整的用户权限，请妥善保管，不要泄露。

### 响应格式说明

所有接口都使用统一的响应格式：

```json
{
  "code": 0,        // 状态码，0表示成功
  "data": {...},    // 响应数据
  "msg": "成功"     // 响应消息
}
```

### 常见错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（API Key 无效或过期） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 注意事项

1. 所有时间字段均采用 ISO 8601 格式
2. 所有 URL 请根据实际部署环境替换 `http://your-domain:48080`
3. API Key 存储在 Redis 中，格式为：`system:user:apikey:{apiKey}` -> `{userId}`
4. 课程进度缓存有效期为1小时

### 技术支持

如有问题，请联系技术支持团队。
