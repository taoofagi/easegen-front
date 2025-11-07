# 3D数字人课程制作模块

基于魔珐星云平台的3D数字人课程制作功能。

## 快速开始

访问路径: `/digitalcourse/choose3DTemplate`

## 功能特性

- PPT上传与自动解析
- 拖拽排序场景
- 演播室场景选择（84个场景）
- 数字人形象选择（200+形象）
- 音色选择与试听（164个音色）
- 口播稿编辑与统计
- 一键合成3D视频

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.vue` | 主页面，包含布局、数据管理、保存与合成逻辑 |
| `types.ts` | TypeScript类型定义 |
| `components/StudioSelector.vue` | 演播室场景选择器 |
| `components/LookSelector.vue` | 数字人形象选择器 |
| `components/VoiceSelector.vue` | 音色选择器 |
| `components/ScriptEditor.vue` | 口播稿编辑器 |

## 数据文件

3D资源数据位于 `src/assets/data/`:

- `3d场景信息.json` - 演播室场景数据
- `3d形象信息.json` - 数字人形象数据
- `3d音色信息.json` - 音色数据

## 核心流程

```
上传PPT → 解析场景 → 选择3D资源 → 编辑口播稿 → 保存 → 合成视频
```

## API依赖

复用2D课程的API接口:
- `src/api/pptTemplate/index.ts`

## 关键参数

合成3D视频的固定参数:

```typescript
platformType: 2           // 魔珐星云
synthesisType: 'segment'  // 文本片段方式
ifAigcMark: 0            // 不显示AI标识
```

## 详细文档

查看 [3D数字人课程制作功能说明.md](../../../docs/3D数字人课程制作功能说明.md) 获取完整文档。

## 开发注意

1. **SSML处理**: 合成时自动去除多余的`<speak>`标签
2. **时长计算**: 按200字/分钟计算
3. **必填校验**: 演播室、形象、音色、口播稿都必须填写
4. **视频时长**: 后端要求单位为毫秒

## 技术栈

- Vue 3 + TypeScript
- Element Plus
- vuedraggable (拖拽排序)
- lodash-es (深拷贝)
