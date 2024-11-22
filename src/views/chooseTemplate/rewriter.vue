<template>
  <el-dialog
    v-model="dialogVisible"
    title="讲稿助手"
    width="80%"
    :before-close="handleClose"
  >
  <div class="rewriter-container flex-col">
      <div class="content-wrapper flex-col">
        <div class="main-content flex-row">
          <!-- 左侧区域 -->
          <div class="left-area flex-col">
            <div class="title">预览</div>
            
            <!-- 图片预览区 -->
            <div class="preview-image  flex-center">
              <el-image 
                :src="imageUrl"
                :style="{
                  width: '480px',
                  height: imageUrl ? '480px / (imageWidth / imageHeight)' : '0'
                }"
              />
            </div>

            <!-- 生成讲稿按钮 -->
            <div class="rewrite-actions flex-center">
              <el-button 
                type="primary" 
                :loading="isRewriting"
                @click="handleRewrite"
              >
                生成讲稿
              </el-button>
            </div>
          </div>
          <!-- 中间功能区 -->
          <div class="feature-area flex-col">
            <!-- <div class="section_5 flex-col">
              <img
                class="label_15"
                referrerpolicy="no-referrer"
                src="./assets/img/FigmaDDSSlicePNGf981d35e48759f43e11100e51a5683de.png"
              />
              <span class="text_39">智能拓写</span>
            </div> -->
            <div class="feature-item flex-row justify-between ">
              <div class="feature-icon-wrapper flex-col justify-between align-center">
                <img
                  class="feature-icon"
                  referrerpolicy="no-referrer"
                  src="./assets/img/icon-image-generate.png"
                />
                <span class="text-group_11">图片生成</span>
              </div>
            </div>
            <!-- <div class="section_7 flex-row">
              <div class="image-text_24 flex-col justify-between">
                <img
                  class="label_17"
                  referrerpolicy="no-referrer"
                  src="./assets/img/FigmaDDSSlicePNG42603c049aa86436c5a6c204b6de08f6.png"
                />
                <span class="text-group_12">资料增强</span>
              </div>
            </div> -->
          </div>
          <!-- 右侧输出区 -->
          <div class="output-area flex-col justify-between">
            <div class="output-content flex-col">
              <el-input
                v-model="displayContent"
                type="textarea"
                :rows="20"
                resize="none"
                readonly
                :placeholder="isRewriting ? '讲稿生成中，请耐心等待...' : '改写后的内容将在这里展示...'"
              />
            </div>
            <!-- <div class="text-wrapper_17 flex-col">
              <span class="text_41">
                请输入对原文稿拓写的要求，如丰富某部分内容、让文稿更口语化等。也可以直接点击右侧按钮进行标准化拓写
              </span>
            </div> -->
          </div>
        </div>
        <!-- <div class="text-wrapper_18 flex-col"><span class="text_42">确定使用文案</span></div> -->
        <!-- 底部确认按钮 -->
        <div class="footer-actions flex-row justify-end">
          <el-button 
            type="primary" 
            @click="handleConfirm"
            :disabled="!outputContent || isTyping"
          >
            确定使用讲稿
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatApi } from '@/api/digitalcourse/chat'
import { ElMessage } from 'element-plus'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = ref(false)
const rewriteRequirement = ref('')
const rewrittenText = ref('')


const open = () => {
  dialogVisible.value = true
}

const handleClose = () => {
  dialogVisible.value = false
  rewriteRequirement.value = ''
  rewrittenText.value = ''
}

const outputContent = ref('') // 存储完整的生成内容
const displayContent = ref('') // 用于显示打字机效果的内容
const isRewriting = ref(false)
const isTyping = ref(false) // 新增打字机效果进行中的状态

const typewriterEffect = (text: string, speed = 30) => { // 200ms 输出一个字符，相当于每秒5个字符
  return new Promise<void>((resolve) => {
    let index = 0
    displayContent.value = ''
    isTyping.value = true // 开始打字效果时设置状态
    
    const timer = setInterval(() => {
      if (index < text.length) {
        displayContent.value += text[index]
        index++
      } else {
        clearInterval(timer)
        isTyping.value = false // 打字效果完成后重置状态
        resolve()
      }
    }, speed)
  })
}

const handleRewrite = async () => {
  try {
    isRewriting.value = true
    outputContent.value = ''
    displayContent.value = ''
    
    const params = {
      business_code: 'BUSI_0003',
      content_param: JSON.stringify({
        ppt_title: props.title,
        ppt_content: props.content,
        image_url: props.imageUrl,
        custom_requirements: ''
      })
    }

    // 获取完整内容
    const chat = await ChatApi.streamChat(params)
    let fullContent = ''
    
    for await (const chunk of chat.iterateStream()) {
      try {
        if (chunk.choices?.[0]?.delta?.content) {
          fullContent += chunk.choices[0].delta.content
        }
      } catch (e) {
        console.error('处理数据块时出错:', e)
      }
    }
    
    outputContent.value = fullContent // 保存完整内容
    
    // 开始打字机效果
    await typewriterEffect(fullContent)
    
  } catch (error) {
    console.error('改写失败:', error)
    ElMessage.error('改写失败，请重试')
  } finally {
    isRewriting.value = false
  }
}

// 组件卸载时清理可能的定时器
onUnmounted(() => {
  displayContent.value = ''
  outputContent.value = ''
  isTyping.value = false
})

const handleConfirm = () => {
  if (!outputContent.value || isTyping.value) {
    ElMessage.warning('请等待讲稿生成完成')
    return
  }
  emit('confirm', outputContent.value)
  handleClose()
}


defineExpose({
  open
})
</script>

<style scoped lang="scss">
.footer-actions {
  margin-top: 10px;
  border-top: 1px solid #eee;
}

// 添加打字机效果的光标样式
:deep(.el-textarea__inner) {
  &::after {
    content: '|';
    animation: cursor-blink 1s infinite;
  }
}

.left-area {
  width: 520px;
  padding: 20px;
  border-right: 1px solid #eee;
  
  .title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
  }
  
  .preview-image {
    flex: 1; // 占据剩余空间
    margin-bottom: 20px;
  }
  
  .rewrite-actions {
    height: 60px; // 给按钮区域固定高度
  }
}

// 居中布局的通用类
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-col {
  display: flex;
  flex-direction: column;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
// .rewriter-container {
//   background-color: rgba(0, 0, 0, 0.71);
//   height: 1080px;
//   width: 1920px;
//   position: absolute;
//   left: 0;
//   top: 0;
// }
.content-wrapper {
  background-color: rgba(255, 255, 255, 1);
  border-radius: 16px;
  width: 100%;
  height: 488px;
  margin: 0px 0 0 0px;
}

.group_14 {
  background-color: rgba(247, 249, 251, 1);
  width: 100%;
  height: 68px;
}

.text_37 {
  width: 32px;
  height: 28px;
  overflow-wrap: break-word;
  color: rgba(51, 51, 51, 1);
  font-size: 16px;
  font-family: MiSans VF-Semibold;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  line-height: 28px;
  margin: 20px 0 0 24px;
}

.label_14 {
  width: 24px;
  height: 24px;
  margin: 22px 24px 0 0;
}

.main-content {
  background-color: rgba(236, 240, 244, 1);
  width: 100%;
  height: 444px;
}

.text_38 {
  width: 279px;
  height: 168px;
  overflow-wrap: break-word;
  color: rgba(102, 102, 102, 1);
  font-size: 14px;
  font-family: PingFang SC-Regular;
  font-weight: NaN;
  text-align: left;
  line-height: 150px;
  margin: 20px 0 0 24px;
}

.feature-area {
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  width: 140px;
  height: 444px;
  border: 1px solid rgba(234, 234, 234, 1);
  margin-left: 20px;
  justify-content: flex-center;
}

.section_5 {
  background-color: rgba(239, 248, 253, 1);
  border-radius: 12px;
  width: 100px;
  height: 100px;
  border: 1px solid rgba(50, 115, 246, 1);
  justify-content: flex-center;
  margin: 32px 0 0 20px;
}

.label_15 {
  width: 32px;
  height: 32px;
  margin: 20px 0 0 34px;
}

.text_39 {
  width: 56px;
  height: 20px;
  overflow-wrap: break-word;
  color: rgba(50, 115, 246, 1);
  font-size: 14px;
  font-family: PingFang SC-Semibold;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  line-height: 14px;
  margin: 8px 0 20px 22px;
}

.feature-item {
  background-color: rgba(249, 249, 249, 1);
  border-radius: 12px;
  width: 100px;
  height: 100px;
  margin: 40px 0 0 20px;
}

.align-center {
  align-items: center; // flex 布局下的子元素水平居中
}

.feature-icon-wrapper {
  width: 70px;
  height: 60px;
  margin: 20px 0 0 15px;
  .feature-icon {
    width: 32px;
    height: 32px;
    margin: 0 auto; // 图片水平居中
  }
  
  .text-group_11 {
    text-align: center; // 文字水平居中
  }
}

.feature-icon {
  width: 32px;
  height: 32px;
  margin-left: 19px;
}

.text-group_11 {
  width: 70px;
  height: 20px;
  overflow-wrap: break-word;
  color: rgba(51, 51, 51, 1);
  font-size: 14px;
  font-family: PingFang SC-Regular;
  font-weight: NaN;
  text-align: center;
  white-space: nowrap;
  line-height: 14px;
  margin-top: 8px;
}

.section_7 {
  background-color: rgba(249, 249, 249, 1);
  border-radius: 12px;
  width: 100px;
  height: 100px;
  margin: 40px 0 32px 20px;
}

.image-text_24 {
  width: 56px;
  height: 60px;
  margin: 20px 0 0 22px;
}

.label_17 {
  width: 32px;
  height: 32px;
  margin-left: 12px;
}

.text-group_12 {
  width: 56px;
  height: 20px;
  overflow-wrap: break-word;
  color: rgba(51, 51, 51, 1);
  font-size: 14px;
  font-family: PingFang SC-Regular;
  font-weight: NaN;
  text-align: center;
  white-space: nowrap;
  line-height: 14px;
  margin-top: 8px;
}

.output-area {
  width: calc(100% - 16px); // 减去左右各8px的边距
  height: calc(100% - 16px); // 减去上下各8px的边距
  margin: 8px; // 四周统一8px边距
}
.output-content {
  background-color: rgba(255, 255, 255, 1);
  border-radius: 8px;
  height: 100%;
  border: 1px solid rgba(234, 234, 234, 1);
  width: 100%;
}

.text_40 {
  width: 84px;
  height: 21px;
  overflow-wrap: break-word;
  color: rgba(153, 153, 153, 1);
  font-size: 14px;
  font-family: PingFang SC-Regular;
  font-weight: NaN;
  text-align: left;
  white-space: nowrap;
  line-height: 150px;
  margin: 20px 0 0 20px;
}

.text-wrapper_17 {
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  height: 74px;
  border: 1px solid rgba(234, 234, 234, 1);
  margin-top: 12px;
  width: 531px;
}

.text_41 {
  width: 495px;
  height: 42px;
  overflow-wrap: break-word;
  color: rgba(153, 153, 153, 1);
  font-size: 14px;
  font-family: PingFang SC-Regular;
  font-weight: NaN;
  text-align: left;
  line-height: 150px;
  margin: 16px 0 0 16px;
}

.text-wrapper_18 {
  background-color: rgba(50, 115, 246, 1);
  border-radius: 8px;
  height: 40px;
  width: 140px;
  margin: 16px 0 20px 870px;
}

.text_42 {
  width: 84px;
  height: 20px;
  overflow-wrap: break-word;
  color: rgba(255, 255, 255, 1);
  font-size: 14px;
  font-family: PingFang SC-Semibold;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  line-height: 14px;
  margin: 10px 0 0 28px;
}
// 样式保持不变,只是修改了一些类名
.script-rewriter {
  display: flex;
  flex-direction: column;
  height: 80vh;
  
  .preview-image {
    width: 600px;
    margin: 0 auto;
    
    :deep(.el-image) {
      width: 100%;
      display: block;
    }
  }
}
</style>