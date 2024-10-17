/**
 *
 * digitalcourse 枚举类
 *
 */


/**
 * 试题生成类型的枚举
 */
export enum GenQuestionTypeEnum {
  REQUIRE = 1, // 按照要求生成
  DOC, // 依据资料生成
  UPLOADFILE // 上传文件生成
}

// 转换 questionType 为对应的英文类型
export const questionTypeMap: Record<number, string> = {
  1: 'single_choice',
  2: 'multiple_choice',
  3: 'true_false',
  4: 'fill_in_the_blank',
  5: 'short_answer'
}

export const difficultyMap: Record<number, string> = {
  1: 'easy',
  2: 'medium',
  3: 'hard'
}
