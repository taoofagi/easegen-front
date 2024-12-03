<template>
  <el-card class="my-card h-full">
    <template #header>
      <h3 class="m-0 px-7 shrink-0 flex items-center justify-between header-section">
        <span class="header-title">{{t('genQuestion.identificationArea')}} - <span class="recognized-text">{{t('genQuestion.successfullyIdentifiedNumberQuestions')}}: </span><span class="recognized-count">{{ formattedContent ? formattedContent.length : 0 }}</span></span>
        <!-- 展示在右上角的导出试题按钮 -->
        <el-button color="#ffffff" v-show="showCopy" @click="exportExcel" size="small" style="border: 1px solid #0000FF;">
          {{t('genQuestion.exportTestQuestions')}}
        </el-button>
      </h3>
    </template>

    <div ref="contentRef" class="hide-scroll-bar h-full box-border overflow-y-auto">
      <div class="w-full min-h-full relative flex-grow bg-white box-border p-3 sm:p-7">
        <!-- 终止生成内容的按钮 -->
        <el-button
          v-show="isWriting"
          class="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 z-36"
          @click="emits('stopStream')"
          size="small"
        >
          <template #icon>
            <Icon icon="material-symbols:stop" />
          </template>
          {{t('genQuestion.stopGen')}}
        </el-button>
        <!-- 格式化后的试题内容展示 -->
        <div v-if="formattedContent" class="formatted-content">
          <div v-for="(item, index) in formattedContent" :key="index" class="question-item">
            <div class="question-type">{{ getQuestionType(item.type) }}</div>
            <h4>{{ index + 1 }}. {{t('genQuestion.subject')}}: {{ item.question }}</h4>
            <!-- 单选题和多选题的选项展示 -->
            <div v-if="item.type === 'single_choice' || item.type === 'multiple_choice'">
              <div v-for="(option, idx) in item.options" :key="idx">
                <el-checkbox v-if="item.type === 'multiple_choice'" :label="getOptionLabel(idx)" :checked="item.answers.includes(getOptionLabel(idx))" style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;" @change.prevent>{{ getOptionLabel(idx) }}. {{ option }}</el-checkbox>
                <el-radio v-else :label="getOptionLabel(idx)" :checked="item.answers === getOptionLabel(idx)" style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;" @change.prevent>{{ getOptionLabel(idx) }}. {{ option }}</el-radio>
              </div>
              <p style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;">{{t('genQuestion.answer')}}: {{ item.answers }}</p>
            </div>
            <!-- 判断题答案展示 -->
            <div v-else-if="item.type === 'true_false'">
              <p style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;">{{t('genQuestion.answer')}}: {{ item.answers === 'A' ? t('genQuestion.right') : t('genQuestion.wrong') }}</p>
            </div>
            <!-- 填空题答案展示 -->
            <div v-else-if="item.type === 'fill_in_the_blank'">
              <p style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;">{{t('genQuestion.answer')}}: {{ item.answers }}</p>
            </div>
            <!-- 简答题答案展示 -->
            <div v-else-if="item.type === 'short_answer'">
              <p style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;">{{t('genQuestion.answer')}}: {{ item.answers }}</p>
            </div>
            <!-- 题目难度、知识点和解析展示 -->
            <p style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;"><strong>{{t('genQuestion.difficulty')}}:</strong> {{ item.difficulty }}</p>
            <p style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;"><strong>{{t('genQuestion.knowledgePoints')}}:</strong> {{ item.knowledges }}</p>
            <p style="font-size: 14px; font-family: pingfang; color: black; max-width: 60ch; word-break: break-word;"><strong>{{t('genQuestion.analysis')}}:</strong> {{ item.explan }}</p>
          </div>
        </div>
        <!-- 未格式化内容的输入框 -->
        <el-input
          v-else
          id="inputId"
          type="textarea"
          v-model="compContent"
          autosize
          :input-style="{ boxShadow: 'none' }"
          resize="none"
          :placeholder="t('genQuestion.generatedContent')+'……'"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { generateExcelApi } from "@/api/digitalcourse/genQuestion";
const { t } = useI18n() // 国际化
// 使用消息提示
const message = useMessage()
// 使用剪贴板功能
const { copied, copy } = useClipboard()

// 定义组件的props
const props = defineProps({
  content: {
    // 生成的结果
    type: String,
    default: ''
  },
  isWriting: {
    // 是否正在生成文章
    type: Boolean,
    default: false
  }
})

// 定义组件的emits
const emits = defineEmits(['update:content', 'stopStream'])

/** 
 * 通过计算属性，双向绑定，更改生成的内容
 * 考虑到用户想要更改生成文章的情况
 */
const compContent = computed({
  get() {
    return props.content
  },
  set(val) {
    emits('update:content', val)
  }
})

/** 格式化生成的内容为试题展示格式 */
const formattedContent = computed(() => {
  try {
    const parsedContent = JSON.parse(props.content);
    if (Array.isArray(parsedContent)) {
      return parsedContent.map((item: any) => ({
        question: item.question,
        type: item.type,
        difficulty: item.difficulty,
        options: item.items,
        answers: item.answers,
        explan: item.explan,
        knowledges: item.knowledges
      }));
    }
    return null;
  } catch (e) {
    return null;
  }
});

/** 获取题型名称 */
const getQuestionType = (type: string) => {
  switch (type) {
    case 'single_choice':
      return '单选题';
    case 'multiple_choice':
      return '多选题';
    case 'true_false':
      return '判断题';
    case 'fill_in_the_blank':
      return '填空题';
    case 'short_answer':
      return '简答题';
    default:
      return '未知题型';
  }
};

/** 获取选项标签 */
const getOptionLabel = (index: number) => {
  return String.fromCharCode(65 + index); // 将索引转换为A, B, C, D, E等
};

/** 滚动相关 */
const contentRef = ref<HTMLDivElement>()
defineExpose({
  scrollToBottom() {
    contentRef.value?.scrollTo(0, contentRef.value?.scrollHeight)
  }
})

/** 
 * 控制导出按钮的显示
 * 在生成内容完成且有内容时显示
 */
const showCopy = computed(() => props.content && !props.isWriting)

/** 导出Excel文件 */
const exportExcel = () => {
  const params = { jsonString: props.content };
  generateExcelApi(params);
}

/** 监听复制操作，成功时显示提示 */
watch(copied, (val) => {
  if (val) {
    message.success('复制成功')
  }
})
</script>

<style lang="scss" scoped>
// 隐藏滚动条样式
.hide-scroll-bar {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

// 卡片样式
.my-card {
  display: flex;
  flex-direction: column;

  :deep(.el-card__header) {
    background-color: #015EBF1A;
    height: 40px;
    padding: 0;
  }

  :deep(.el-card__body) {
    box-sizing: border-box;
    flex-grow: 1;
    overflow-y: auto;
    padding: 0;
    @extend .hide-scroll-bar;
  }
}

// 头部样式
.header-section {
  font-size: 16px;
  height: 40px;
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 14px;
}

.recognized-text {
  font-size: 12px;
  color: gray;
}

.recognized-count {
  font-size: 12px;
  color: #48CA8F;
}

// 格式化内容样式
.formatted-content {
  .question-item {
    margin-bottom: 1.5rem;
    h4 {
      font-weight: bold;
      margin-bottom: 0.5rem;
      font-size: 14px;
      font-family: pingfang;
      color: black;
      max-width: 60ch;
      word-break: break-word;
    }
    .question-type {
      font-size: 14px;
      font-family: pingfang;
      color: black;
      margin-bottom: 0.5rem;
      padding: 1px 8px;
      border: 1px solid #999999;
      background-color: #015EBF1A;
    }
    p {
      margin: 0.5rem 0;
      font-size: 14px;
      font-family: pingfang;
      color: black;
      max-width: 60ch;
      word-break: break-word;
    }
  }
}
</style>
