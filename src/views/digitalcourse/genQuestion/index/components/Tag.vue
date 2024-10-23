<!-- 标签选项组件 -->
<template>
  <div class="flex flex-wrap gap-[8px]">
    <!-- 遍历标签数组，渲染每个标签 -->
    <span
      v-for="tag in props.tags"
      :key="tag.value"
      class="tag mb-2 border-[2px] border-solid border-[#DDDFE3] px-2 leading-6 text-[12px] bg-[#DDDFE3] rounded-[4px] cursor-pointer"
      :class="modelValue === tag.value && '!border-[#846af7] text-[#846af7]'"
      @click="emits('update:modelValue', tag.value)"
    >
      {{ tag.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
// 定义组件的 props
const props = withDefaults(
  defineProps<{
    tags: { label: string; value: string }[] // 标签数组，包含标签文本和值
    modelValue: string // 当前选中的标签值
    [k: string]: any // 允许其他任意属性
  }>(),
  {
    tags: () => [] // 标签数组默认为空数组
  }
)

// 定义组件的 emits
const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void // 更新选中标签值的事件
}>()
</script>

<!-- 组件样式 -->
<style scoped></style>
