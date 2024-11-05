import request from '@/config/axios'

// 模板 VO
export interface TemplateVO {
  id: number // 编号
  showBackground: number // 0 不显示，1显示
  showDigitalHuman: number // 0 不显示，1显示
  showPpt: number // 0 不显示，1显示
  pptW: number // ppt宽
  pptH: number // ppt高
  pptX: number // ppt距离顶部位置
  pptY: number // ppt距离左侧位置
  humanW: number // 数字人宽
  humanH: number // 数字人高
  humanX: number // 数字人距离顶部位置
  humanY: number // 数字人距离左侧位置
  bgImage: string // 背景图片
}

// 模板 API
export const TemplateApi = {
  // 查询模板分页
  getTemplatePage: async (params: any) => {
    return await request.get({ url: `/digitalcourse/template/page`, params })
  },

  // 查询模板详情
  getTemplate: async (id: number) => {
    return await request.get({ url: `/digitalcourse/template/get?id=` + id })
  },

  // 新增模板
  createTemplate: async (data: TemplateVO) => {
    return await request.post({ url: `/digitalcourse/template/create`, data })
  },

  // 修改模板
  updateTemplate: async (data: TemplateVO) => {
    return await request.put({ url: `/digitalcourse/template/update`, data })
  },

  // 删除模板
  deleteTemplate: async (id: number) => {
    return await request.delete({ url: `/digitalcourse/template/delete?id=` + id })
  },

  // 导出模板 Excel
  exportTemplate: async (params) => {
    return await request.download({ url: `/digitalcourse/template/export-excel`, params })
  },
}