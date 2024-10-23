// 导入必要的模块和类型
import {GenQuestionTypeEnum} from "@/views/digitalcourse/utils/constants";
import request from '@/config/axios'

// 定义生成试题的请求参数接口
export interface GenQuestionVO {
  type: GenQuestionTypeEnum.REQUIRE | AiWriteTypeEnum.DOC // 生成类型：1-按照要求生成，2-依据资料生成
  text: string // 试题内容提示
  questionType: string // 题型
  difficulty: string // 难度
  numQuestions: number // 题目数量
}

// 生成试题的API接口
export const generateQuestionsApi = (params: { text: string; question_type: string; difficulty: string; num_questions: string }) => {
  return request.post<{ code: number; data: string; msg: string }>({
    url: '/digitalcourse/courses/genQuestion',
    data: params
  })
}

// 文档解析的API接口
export const docparseApi = (params: { type: string; fileUrl: string }) => {
  return request.post<{ code: number; data: string; msg: string }>({
    url: '/digitalcourse/courses/docparse',
    data: params
  })
}

// 生成Excel文件的API接口
export const generateExcelApi = (params: { jsonString: string }) => {
  return request.postOriginal({
    url: '/digitalcourse/courses/generateExcel',
    method: 'post',
    data: params,
    responseType: 'blob' // 确保返回二进制文件
  }).then((response) => {
    if (response && response.data) {
      // 创建下载链接并触发下载
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
      link.setAttribute('download', `智能试题_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (response) {
      // 处理response已经是blob的情况
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
      link.setAttribute('download', `智能试题_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('未接收到数据');
    }
  }).catch((error) => {
    console.error('生成Excel文件时出错:', error);
  });
};