<template>
  <div class="absolute top-0 left-0 right-0 bottom-0 flex">
    <!-- 条件输入区 -->
    <Left
      :is-writing="isWriting"
      class="h-full"
      @submit="submit"
      @uploadsuccess="uploadsuccess"
      @reset="reset"
      v-model:content="text"
    />
    <!-- 输入区 -->
    <Right
      :is-writing="isWriting"
      @stop-stream="stopStream"
      ref="rightRef"
      class="flex-grow"
      v-model:content="writeResult"
      @update:content="handleContentChange"
    />
    <!-- 识别区 -->
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
import {docparseApi, generateQuestionsApi, GenQuestionVO} from "@/api/digitalcourse/genQuestion";
import {difficultyMap, questionTypeMap} from "@/views/digitalcourse/utils/constants";

// 使用消息提示
const message = useMessage()

// 定义响应式变量
const text = ref('') // 题目要求
const writeResult = ref('') // 试题生成结果
const identifyResult = ref('') // 识别区结果
const isWriting = ref(false) // 是否正在写作中
const abortController = ref<AbortController>() // 写作进行中 abort 控制器(控制 stream 写作)

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
    // 获取题型和难度
    const questionType = questionTypeMap[data.questionType] || ''
    const difficulty = difficultyMap[data.difficulty] || ''
    // 调用API生成试题
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

    // 处理生成的试题
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

/** 处理文件上传成功 */
const uploadsuccess = async (data) => {
  isWriting.value = true
  try {
    console.log('上传成功', data)
    message.success('上传成功！')
    // 调用API解析文档
    const response = await docparseApi({
      type: 'text',
      fileUrl: data.fileUrl
    })
    console.log('response', response)
    // 将response转为string
    text.value = JSON.stringify(response)
    stopStream()
  } catch (error) {
    console.error('写作异常', error)
    stopStream()
  }
}

/** 解析试题内容为 JSON 格式 */
const parseQuestionsToJSON = (questionsString: string) => {
  // 去掉空行
  const cleanedString = questionsString.replace(/\n\s*\n/g, '\n');
  // 将试题字符串按题目序号或题型描述拆分为独立的题目块
  const questionsArray = cleanedString.trim().split(/(?=^\d)/gm);
  return questionsArray.map((questionBlock) => {
    console.log('questionBlock', questionBlock)
    // 将每个题目块按行拆分
    const lines = questionBlock.split('\n');
    const questionLine = lines[0]; // 题目行
    const items = []; // 选项部分
    let answer = ''; // 答案部分
    let difficulty = ''; // 难度部分
    let knowledge = ''; // 知识点部分
    let explan = ''; // 解析部分

    // 循环解析每一行内容，区分题目、选项、答案、难度、知识点和解析
    lines.forEach((line) => {
      if (/^[A-E]\.\s*/.test(line)) {
        // 如果行以选项字母 (A-E) 开头，表示这是一个选项
        items.push(line.replace(/^[A-E]\.\s*/, '')); // 去掉选项前的字母和空格
      } else if (line.startsWith('答案：') || line.startsWith('答案:')) {
        // 如果行以"答案："开头，表示这是答案部分
        answer = line.replace('答案', '').replace('：','').replace(':','').trim();
      } else if (line.startsWith('难度：')) {
        // 如果行以"难度："开头，表示这是难度部分
        difficulty = line.replace('难度：', '').trim();
      } else if (line.startsWith('知识点：')) {
        // 如果行以"知识点："开头，表示这是知识点部分
        knowledge = line.replace('知识点：', '').trim();
      } else if (line.startsWith('解析：')) {
        // 如果行以"解析："开头，表示这是解析部分
        explan = line.replace('解析：', '').trim();
      }
    });

    // 返回结构化的题目对象
    return {
      question: questionLine.replace(/^\d+\.\s*/, '').replace(/[（\(].*?[）\)]/, '').replace(/".*?"/, ''), // 去掉题目编号和题型描述
      type: getQuestionType(questionLine), // 获取题目类型
      difficulty: difficulty, // 题目难度
      items: items, // 选项列表
      answers: answer, // 答案列表（将答案拆分为字符数组）
      explan: explan, // 解析内容
      knowledges: knowledge // 知识点内容
    };
  });
};

/** 获取试题类型 */
const getQuestionType = (question: string) => {
  if (question.includes('单选题')) return 'single_choice';
  if (question.includes('多选题')) return 'multiple_choice';
  if (question.includes('判断题')) return 'true_false';
  if (question.includes('问答题')) return 'short_answer';
  if (question.includes('填空题')) return 'fill_in_the_blank';
  return 'unknown';
};

/** 实时处理手动输入的内容变化 */
const handleContentChange = (content: string) => {
  identifyResult.value = JSON.stringify(parseQuestionsToJSON(content));
};

/** 点击重置的时候清空写作的结果 */
const reset = () => {
  writeResult.value = ''
}
</script>
