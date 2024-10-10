import {GenQuestionTypeEnum} from "@/views/digitalcourse/utils/constants";
import request from '@/config/axios'

export interface GenQuestionVO {
  type: GenQuestionTypeEnum.REQUIRE | AiWriteTypeEnum.DOC // 1:按照要求生成 2:依据资料生成
  text: string // 试题内容提示
  questionType: string // 题型
  difficulty: string // 难度
  numQuestions: number // 题目数量
}

export const generateQuestionsApi = (params: { text: string; question_type: string; difficulty: string; num_questions: string }) => {
  return request.post<{ code: number; data: string; msg: string }>({
    url: '/digitalcourse/courses/genQuestion',
    data: params
  })
}

export const generateExcelApi = (params: { jsonString: string }) => {
  return request.postOriginal({
    url: '/digitalcourse/courses/generateExcel',
    method: 'post',
    data: params,
    responseType: 'blob' // 确保返回二进制文件
  }).then((response) => {
    if (response && response.data) {
      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
      link.setAttribute('download', `智能试题_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (response) {
      // Handle case where response is already a blob
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
      link.setAttribute('download', `智能试题_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('No data received');
    }
  }).catch((error) => {
    console.error('Error generating Excel:', error);
  });
};