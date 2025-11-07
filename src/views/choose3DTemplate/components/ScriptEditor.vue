<template>
  <div class="script-editor">
    <div class="editor-header">
      <h3>口播稿编辑</h3>
      <div class="editor-stats">
        <span class="stat-item">
          <el-icon><Document /></el-icon>
          字数: {{ wordCount }}
        </span>
        <span class="stat-item">
          <el-icon><Timer /></el-icon>
          预计时长: {{ estimatedDuration }}
        </span>
      </div>
    </div>

    <div class="editor-body">
      <el-input
        v-model="localContent"
        type="textarea"
        :rows="12"
        :placeholder="placeholder"
        :maxlength="maxLength"
        show-word-limit
        @input="handleInput"
      />
    </div>

    <div class="editor-footer">
      <el-alert
        v-if="showLengthWarning"
        type="warning"
        :closable="false"
        show-icon
      >
        建议口播稿字数在 {{ minWords }}-{{ maxWords }} 字之间，以获得最佳效果
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Document, Timer } from '@element-plus/icons-vue'

// Props & Emits
interface Props {
  modelValue?: string
  placeholder?: string
  maxLength?: number
  minWords?: number
  maxWords?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入口播稿内容...',
  maxLength: 5000,
  minWords: 50,
  maxWords: 1000
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

// 数据
const localContent = ref(props.modelValue)

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== localContent.value) {
    localContent.value = newVal
  }
})

// 计算属性
const wordCount = computed(() => {
  return localContent.value.trim().length
})

const estimatedDuration = computed(() => {
  // 假设每分钟200字的语速
  const words = wordCount.value
  const minutes = words / 200
  const totalSeconds = Math.ceil(minutes * 60)

  if (totalSeconds < 60) {
    return `${totalSeconds}秒`
  } else {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}分${secs}秒`
  }
})

const showLengthWarning = computed(() => {
  const count = wordCount.value
  return count > 0 && (count < props.minWords || count > props.maxWords)
})

// 方法
const handleInput = () => {
  emit('update:modelValue', localContent.value)
  emit('change', localContent.value)
}
</script>

<style scoped lang="scss">
.script-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #fff;
  border-radius: 8px;

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .editor-stats {
      display: flex;
      gap: 16px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: #606266;

        .el-icon {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .editor-body {
    flex: 1;
    margin-bottom: 12px;

    :deep(.el-textarea) {
      height: 100%;

      .el-textarea__inner {
        height: 100%;
        min-height: auto;
        resize: none;
        font-size: 14px;
        line-height: 1.6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

        &:focus {
          border-color: #7c3aed;
        }
      }
    }
  }

  .editor-footer {
    min-height: 40px;

    .el-alert {
      margin: 0;
    }
  }
}
</style>
