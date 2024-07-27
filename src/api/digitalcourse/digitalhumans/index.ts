import request from '@/config/axios'

export interface DigitalHumansVO {
  id: number
  expireStatus: string
  finishTime: Date
  gender: number
  matting: number
  name: string
  pictureUrl: string
  posture: number
  snapshotHeight: number
  snapshotUrl: string
  snapshotWidth: number
  type: number
  useGeneralModel: number
  useModel: string
  status: number
}

// 查询存储数字人信息，包括数字人的基本属性、图片、姿势等信息分页
export const getDigitalHumansPage = async (params) => {
  return await request.get({ url: `/digitalcourse/digital-humans/page`, params })
}

// 查询存储数字人信息，包括数字人的基本属性、图片、姿势等信息详情
export const getDigitalHumans = async (id: number) => {
  return await request.get({ url: `/digitalcourse/digital-humans/get?id=` + id })
}

// 新增存储数字人信息，包括数字人的基本属性、图片、姿势等信息
export const createDigitalHumans = async (data: DigitalHumansVO) => {
  return await request.post({ url: `/digitalcourse/digital-humans/create`, data })
}

// 修改存储数字人信息，包括数字人的基本属性、图片、姿势等信息
export const updateDigitalHumans = async (data: DigitalHumansVO) => {
  return await request.put({ url: `/digitalcourse/digital-humans/update`, data })
}

// 删除存储数字人信息，包括数字人的基本属性、图片、姿势等信息
export const deleteDigitalHumans = async (id: number) => {
  return await request.delete({ url: `/digitalcourse/digital-humans/delete?id=` + id })
}

// 导出存储数字人信息，包括数字人的基本属性、图片、姿势等信息 Excel
export const exportDigitalHumans = async (params) => {
  return await request.download({ url: `/digitalcourse/digital-humans/export-excel`, params })
}