import request from '@/config/axios'

// 作品中心 VO
export interface WorkCenterVO {
  id: number // 收件地址编号
  industry: string // 行业
  scene: string // 场景
  language: string // 语种
  workType: string // 作品类型
  workDuration: number // 作品时长
  coverUrl: string // 封面地址
}

// 作品中心 API
export const WorkCenterApi = {
  // 查询作品中心分页
  getWorkCenterPage: async (params: any) => {
    return await request.get({ url: `/member/work-center/page`, params })
  },

  // 查询作品中心详情
  getWorkCenter: async (id: number) => {
    return await request.get({ url: `/member/work-center/get?id=` + id })
  },

  // 新增作品中心
  createWorkCenter: async (data: WorkCenterVO) => {
    return await request.post({ url: `/member/work-center/create`, data })
  },

  // 修改作品中心
  updateWorkCenter: async (data: WorkCenterVO) => {
    return await request.put({ url: `/member/work-center/update`, data })
  },

  // 删除作品中心
  deleteWorkCenter: async (id: number) => {
    return await request.delete({ url: `/member/work-center/delete?id=` + id })
  },

  // 导出作品中心 Excel
  exportWorkCenter: async (params) => {
    return await request.download({ url: `/member/work-center/export-excel`, params })
  },
}