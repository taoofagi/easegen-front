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
  accountId: number
}
export const coursesCreate = async(data: coursesVO) => {
  return await request.post({ url: '/digitalcourse/courses/create', data })
}
//更新课程
export const coursesUpdate = async(data) => {
  return await request.post({ url: '/digitalcourse/courses/update', data })
}
//生成试听文件
export const createAudio = async(data) => {
  return await request.post({ url: '/digitalcourse/voices/audition', data })
}
//保存场景
export const coursesSave = async(data) => {
  return await request.post({ url: '/digitalcourse/courses/update', data })
}
//课程详情
export const coursesDetail = async(id: number) => {
  return await request.get({ url: '/digitalcourse/courses/get?id=' + id })
}
//删除课程
export const coursesDelete = async(id: string) => {
  return await request.delete({ url: `/digitalcourse/courses/delete?id=${id}` })
}
//ppt复制
export const copyPPT = async(id: number) => {
  return await request.get({ url: '/digitalcourse/ppt-materials/copy?id=' + id })
}

//我的课程列表
export const myCourseList = async(params: PageParam) => {
  return await request.get({ url: '/digitalcourse/course-media/page', params })
}
//删除我的课程
export const deleteMyCourse = async(id: string) => {
  return await request.delete({ url: `/digitalcourse/course-media/delete?id=${id}` })
}
//合成视频
export const megerMedia = async(data) => {
  return await request.post({ url: '/digitalcourse/course-media/megerMedia', data })
}