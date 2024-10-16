import request from '@/config/axios'

export interface BackgroundsVO {
  id: number
  backgroundType: number
  name: string
  originalUrl: string
  pictureUrl: string
  width: number
  height: number
  size: number
  duration: number
  preset: number
  status: number
}

// 查询背景信息（PPT背景、板书、插图、字幕等）分页
export const getBackgroundsPage = async (params) => {
  return await request.get({ url: `/digitalcourse/backgrounds/page`, params })
}

// 查询背景信息（PPT背景、板书、插图、字幕等）详情
export const getBackgrounds = async (id: number) => {
  return await request.get({ url: `/digitalcourse/backgrounds/get?id=` + id })
}

// 新增背景信息（PPT背景、板书、插图、字幕等）
export const createBackgrounds = async (data: BackgroundsVO) => {
  return await request.post({ url: `/digitalcourse/backgrounds/create`, data })
}

// 修改背景信息（PPT背景、板书、插图、字幕等）
export const updateBackgrounds = async (data: BackgroundsVO) => {
  return await request.put({ url: `/digitalcourse/backgrounds/update`, data })
}

// 删除背景信息（PPT背景、板书、插图、字幕等）
export const deleteBackgrounds = async (id: number) => {
  return await request.delete({ url: `/digitalcourse/backgrounds/delete?id=` + id })
}

// 导出背景信息（PPT背景、板书、插图、字幕等） Excel
export const exportBackgrounds = async (params) => {
  return await request.download({ url: `/digitalcourse/backgrounds/export-excel`, params })
}