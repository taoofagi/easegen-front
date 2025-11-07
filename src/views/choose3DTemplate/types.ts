/**
 * 3D数字人课程制作相关类型定义
 */

// 演播室场景
export interface Studio3D {
  id: number
  studio_en_name: string
  studio_chinese_name: string
  render_image_oss: string
  render_movie_oss: string
  studio_type: string
  terminal_studio_style: string
  terminal_studio_type: string
  camera_config_chinese_name: string
  theme_color_tag: string
  score: number
  enable: boolean
  is_shelf: boolean
  available_ability_type: string
  peformance_type: string
  application_scene_tag: string
  application_scene_sub_tag?: string
}

// 数字人形象
export interface Look3D {
  id: number
  name: string
  cn_name: string
  full_body_preview_image_oss: string
  half_body_preview_image_oss: string
  facial_animation_video_oss: string
  gender: 'male' | 'female'
  age: string
  race: string
  collection_style: string
  collection_series: string
  terminal_color: string
  score: number
  enable: boolean
  is_shelf: boolean
  available_ability_type: string
  figure_name: string
  xhuman_type: string
  terminal_application: string
}

// 音色
export interface Voice3D {
  id: number
  tts_vcn_id: string
  cn_name: string
  description: string
  preview_audio_oss: string
  preview_audio_pro_oss: string | null
  render_image_oss: string
  gender: 'male' | 'female'
  language_tag: string
  age_label: string
  style_label: string
  tts_model: string
  sample_text: string
  score: number
  enable: boolean
  is_shelf: boolean
  accent_tag: string
  tts_type_tag: string
  application_scene_tag: string
  xhuman_type: string
}

// 3D课程场景
export interface Scene3D {
  id: string
  pictureUrl: string        // PPT页面图片URL
  pptRemark: string          // 口播稿
  pageIndex: number          // 页码
  duration: number           // 预估时长（秒）
  width?: number             // 宽度
  height?: number            // 高度
  isActive?: boolean         // 是否选中
  isChecked?: boolean        // 是否勾选
}

// 3D课程基础信息
export interface Course3DInfo {
  id: number
  accountId: number
  aspect: string             // 屏幕比例 '16:9' 或 '9:16'
  name: string               // 课程名称
  duration: number           // 时长（秒）
  status: number             // 状态
  pageMode: number           // 页面模式 2-PPT课件视频
  matting: number            // 抠图标识（3D不需要，设为0）
  width: number              // 宽度（像素）
  height: number             // 高度（像素）

  // 3D固定参数
  platformType: 2            // 固定为2（魔珐星云）
  synthesisType: 'segment'   // 固定为segment（文本片段方式）
  ifAigcMark: 0              // 固定为0（不显示AI标识）
  subTitle: 'on' | 'off'     // 字幕开关（默认off）

  thumbnail?: string         // 缩略图
  pageInfo?: string          // 页面信息JSON
  subtitlesStyle?: string    // 字幕样式
}

// 3D资源选择状态
export interface Selected3DResources {
  studio: Studio3D | null    // 演播室场景
  look: Look3D | null        // 数字人形象
  voice: Voice3D | null      // 音色
}

// 3D视频合成请求参数
export interface CourseMedia3DMegerVO {
  // 必填项
  id: number                      // 课程ID
  courseMediaId: number           // 视频ID
  name: string                    // 课程名称

  // 基础配置
  accountId?: number
  aspect?: string                 // 屏幕比例
  duration?: number               // 时长（秒）
  height?: number                 // 高度（像素）
  width?: number                  // 宽度（像素）
  matting?: number                // 是否抠图标识
  pageMode?: number               // 页面模式
  status?: number
  pageInfo?: string
  thumbnail?: string
  subtitlesStyle?: string

  // 场景数据
  scenes?: any[]                  // 场景列表
  ppt?: any[]
  expectedDuration?: number       // 前端传的预估时间 秒

  // 3D平台固定参数
  platformType: 2                 // 固定为2（魔珐星云）
  synthesisType: 'segment'        // 固定为segment
  ifAigcMark: 0                   // 固定为0（不显示AI标识）

  // 3D数字人配置（用户选择）
  lookName: string                // 数字人形象名称（必填）
  ttsVcnName: string              // 音色名称（必填）
  studioName: string              // 演播室名称（必填）
  subTitle?: string               // 字幕开关：on/off（可选，默认off）

  // 文本内容
  text?: string                   // 所有场景的口播稿文本（拼接）
  pptFileUrl?: string             // PPT文件URL
  reqJson?: string                // 额外参数
}

// 工具函数返回类型
export interface DurationInfo {
  total: number                   // 总秒数
  formatted: string               // 格式化字符串 "MM:SS"
}
