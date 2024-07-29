import request from '@/config/axios'

export interface VoicesVO {
  id: number
  name: string
  code: string
  auditionUrl: string
  language: string
  gender: number
  introduction: string
  quality: number
  voiceType: number
  status: number
}

// 查询声音管理分页
export const getVoicesPage = async (params) => {
  return await request.get({ url: `/digitalcourse/voices/page`, params })
}

// 查询声音管理详情
export const getVoices = async (id: number) => {
  return await request.get({ url: `/digitalcourse/voices/get?id=` + id })
}

// 新增声音管理
export const createVoices = async (data: VoicesVO) => {
  return await request.post({ url: `/digitalcourse/voices/create`, data })
}

// 修改声音管理
export const updateVoices = async (data: VoicesVO) => {
  return await request.put({ url: `/digitalcourse/voices/update`, data })
}

// 删除声音管理
export const deleteVoices = async (id: number) => {
  return await request.delete({ url: `/digitalcourse/voices/delete?id=` + id })
}

// 导出声音管理 Excel
export const exportVoices = async (params) => {
  return await request.download({ url: `/digitalcourse/voices/export-excel`, params })
}