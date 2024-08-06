import request from '@/config/axios'
export interface PPTCreateVO {
  filename: string,
  size: number,
  md5: string,
  courseId: number,
  docType: number,
  url: string,
  status:number,
  extInfo: string,
  resolveType: number
}
// ppt保存
export const createPPT = async(data: PPTCreateVO) => {
  return await request.post({ url: '/digitalcourse/course-ppts/create', data })
}
//ppt解析
export const getSchedule = async(id: number) => {
  return await request.get({ url: '/digitalcourse/course-ppts/getSchedule?id=' + id })
}
//数字人列表
export const pageList = async(params: PageParam) => {
  return await request.get({ url: '/digitalcourse/digital-humans/page', params })
}
//声音模型列表
export const videlPageList = async(params: PageParam) => {
  return await request.get({ url: '/digitalcourse/voices/page', params })
}
//试听
export const realtime = async(data: PPTCreateVO) => {
  return await request.post({ url: '/api/audition/realtime', data })
}

//课程中心列表
export const courseList = async(params: PageParam) => {
  return await request.get({ url: '/digitalcourse/courses/page', params })
}
//生成课程id
export interface coursesVO {
  accountId: string
}
export const coursesCreate = async(data: coursesVO) => {
  return await request.post({ url: '/digitalcourse/courses/create', data })
}
//更新课程
export const coursesUpdate = async(data) => {
  return await request.post({ url: '/digitalcourse/courses/update', data })
}