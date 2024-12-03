<template>
  <el-card class="my-card h-full">
    <template #header>
      <h3 class="m-0 px-7 shrink-0 flex items-center justify-between header-section">
        <span class="header-title">{{ t('genQuestion.rightTitle') }}</span>
        <!-- 展示在右上角 -->
        <!-- 注释掉的复制按钮，可能后续会启用 -->
        <!--        <el-button color="#846af7" v-show="showCopy" @click="copyContent" size="small">-->
        <!--          <template #icon>-->
        <!--            <Icon icon="ph:copy-bold" />-->
        <!--          </template>-->
        <!--          复制-->
        <!--        </el-button>-->
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
        {{ t('genQuestion.stopGen') }}
        </el-button>
        <!-- 文本输入区域 -->
        <el-input
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

/** 滚动相关 */
const contentRef = ref<HTMLDivElement>()
defineExpose({
  scrollToBottom() {
    contentRef.value?.scrollTo(0, contentRef.value?.scrollHeight)
  }
})

/** 
 * 控制复制按钮的显示
 * 在生成内容完成且有内容时显示
 */
const showCopy = computed(() => props.content && !props.isWriting)

/** 复制内容到剪贴板 */
const copyContent = () => {
  copy(props.content)
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

// 标题样式
.header-title {
  font-size: 14px;
}
</style>
