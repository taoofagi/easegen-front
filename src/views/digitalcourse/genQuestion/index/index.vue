<template>
  <div class="absolute top-0 left-0 right-0 bottom-0 flex">
    <Left
      :is-writing="isWriting"
      class="h-full"
      @submit="submit"
      @reset="reset"
      @example="handleExampleClick"
    />
<!--    输入区-->
    <Right
      :is-writing="isWriting"
      @stop-stream="stopStream"
      ref="rightRef"
      class="flex-grow"
      v-model:content="writeResult"
      @update:content="handleContentChange"
    />
<!--    识别区-->
    <Identify
      :is-writing="isWriting"
      @stop-stream="stopStream"
      ref="identifyRef"
      class="flex-grow"
      v-model:content="identifyResult"
    />
  </div>
</template>

<script setup lang="ts">
import Left from './components/Left.vue'
import Right from './components/Right.vue'
import Identify from './components/Identify.vue'
import {generateQuestionsApi, GenQuestionVO} from "@/api/digitalcourse/genQuestion";
import {difficultyMap, questionTypeMap} from "@/views/digitalcourse/utils/constants";

const message = useMessage()

const writeResult = ref('') // 试题生成结果
const identifyResult = ref('') // 识别区结果
const isWriting = ref(false) // 是否正在写作中
const abortController = ref<AbortController>() // // 写作进行中 abort 控制器(控制 stream 写作)

/** 停止 stream 生成 */
const stopStream = () => {
  abortController.value?.abort()
  isWriting.value = false
}

/** 试题生成 */
const rightRef = ref<InstanceType<typeof Right>>()
const submit = async (data: GenQuestionVO) => {
  isWriting.value = true
  try {
    const questionType = questionTypeMap[data.questionType] || ''
    const difficulty = difficultyMap[data.difficulty] || ''
    const response = await generateQuestionsApi({
      text: data.text,
      question_type: questionType,
      difficulty: difficulty,
      num_questions: data.numQuestions
    })
    console.log('response', response)
    // 解析返回的数据字符串为 JSON 对象
    let parsedData;
    try {
      parsedData = JSON.parse(response);
    } catch (e) {
      message.alert('解析返回数据失败')
      stopStream()
      return
    }

    if (parsedData.question) {
      writeResult.value += `\n${parsedData.question}`; // 追加生成的内容
      // 解析试题内容为 JSON 格式
      identifyResult.value = JSON.stringify(parseQuestionsToJSON(writeResult.value));
      stopStream()
    } else {
      message.alert('没有正确返回试题内容')
      stopStream()
      return
    }
    // 滚动到底部
    await nextTick()
    rightRef.value?.scrollToBottom()
  } catch (error) {
    console.error('写作异常', error)
    stopStream()
  }
}

/** 解析试题内容为 JSON 格式 */
const parseQuestionsToJSON = (questionsString: string) => {
  const questionsArray = questionsString.trim().split('\n\n');
  return questionsArray.map((questionBlock) => {
    const lines = questionBlock.split('\n');
    const questionLine = lines[0];
    const items = [];
    let answer = '';
    let difficulty = '';
    let knowledge = '';
    let explan = '';

    // 循环解析每一行
    lines.forEach((line) => {
      if (/^[A-E]\.\s*/.test(line)) {
        items.push(line.replace(/^[A-E]\.\s*/, '')); // 选项部分
      } else if (line.startsWith('答案：')) {
        answer = line.replace('答案：', '').trim();
      } else if (line.startsWith('难度：')) {
        difficulty = line.replace('难度：', '').trim();
      } else if (line.startsWith('知识点：')) {
        knowledge = line.replace('知识点：', '').trim();
      } else if (line.startsWith('解析：')) {
        explan = line.replace('解析：', '').trim();
      }
    });

    return {
      question: questionLine.replace(/^\d+\.\s*/, '').replace(/（.*?）/, ''), // 去掉题目编号和题型描述
      type: getQuestionType(questionLine),
      difficulty: difficulty,
      items: items,
      answers: answer.split(''),
      explan: explan,
      knowledges: knowledge
    };
  });
};


/** 获取试题类型 */
const getQuestionType = (question: string) => {
  if (question.includes('（单选题）')) return 'single_choice';
  if (question.includes('（多选题）')) return 'multiple_choice';
  if (question.includes('（判断题）')) return 'true_false';
  if (question.includes('（问答题）')) return 'short_answer';
  if (question.includes('（填空题）')) return 'fill_in_the_blank';
  return 'unknown';
};

// 实时处理手动输入的内容变化
const handleContentChange = (content: string) => {
  identifyResult.value = JSON.stringify(parseQuestionsToJSON(content));
};

/** 点击示例触发 */
// const handleExampleClick = (type: keyof typeof WriteExample) => {
//   writeResult.value = WriteExample[type].data
// }

/** 点击重置的时候清空写作的结果**/
const reset = () => {
  writeResult.value = ''
}
</script>
