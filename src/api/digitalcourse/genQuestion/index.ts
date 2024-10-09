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