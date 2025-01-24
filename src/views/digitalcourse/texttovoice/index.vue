<template>
  <el-container class="ai-voice-generator">
    <el-main style="--el-main-padding: 0px">
      <!-- Header -->
      <el-card class="header-card" :body-style="{ padding: '24px', position: 'relative' }">
        <div class="flex items-center gap-2 text-lg font-medium">
          <el-icon><MagicStick /></el-icon>
          <span>AI文本配音，支持多种语言配音</span>
        </div>
        <div class="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <span>①提供文本</span>
          <span>----</span>
          <span>②选择声音</span>
          <span>----</span>
          <span>③生成语音</span>
        </div>
      </el-card>

      <!-- Voice Profile -->
      <el-card class="my-4">
        <div class="flex items-stretch gap-8">
          <!-- 声音配置 -->
          <div class="voice-config w-1/3">
            <div class="flex items-center gap-4 h-full">
              <el-avatar :size="64" :src="audioSelectData.avatarUrl" />
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-medium">{{ audioSelectData.name }}</h3>
                  <span class="text-gray-600">{{ getDictLabel(DICT_TYPE.DIGITALCOURSE_VOICES_LANGUAGE, audioSelectData.language)  }}</span>
                </div>
                <div class="flex gap-2">
                  <el-tag 
                    v-for="(tag, index) in audioSelectData.introduction?.split(',')" 
                    :key="index"
                    size="small" 
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
              <el-icon class="cursor-pointer" @click="openSelect">
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <!-- 语音设置 -->
          <div class="voice-settings w-2/3">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2 text-blue-600">
                <el-icon><Microphone /></el-icon>
                <span>语音设置</span>
              </div>
              <el-button type="primary" plain size="small">重置</el-button>
            </div>
            <div class="flex gap-8">
              <div class="w-1/2">
                <div class="flex justify-between mb-2">
                  <span>音量</span>
                  <span>{{ voiceData.volume }}</span>
                </div>
                <el-slider v-model="voiceData.volume" :min="1" :max="2" :step="0.1" :default-value="1" />
              </div>
              <div class="w-1/2">
                <div class="flex justify-between mb-2">
                  <span>语速</span>
                  <span>{{ voiceData.speed.toFixed(2) }} x</span>
                </div>
                <el-slider v-model="voiceData.speed" :min="0.6" :max="1.5" :step="0.1" :default-value="1" />
              </div>
            </div>
          </div>
        </div>
      </el-card>

      
      <div style="position: relative">
      <!-- Text Input -->
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="8"
        placeholder="请输入您要播报的文本内容"
        resize="none"
      />
      <div class="relative mt-2">
        <span class="absolute bottom-2 right-2 text-gray-400">{{ inputText.length }} / 1200</span>
        <div class="absolute bottom-2 left-2 flex items-center gap-4">
          <el-button type="primary" size="small" @click="drawerVisible = true">
            <el-icon><MagicStick /></el-icon>
            AI生成文案
          </el-button>
          <div class="flex gap-2">
            <el-button type="primary" :icon="VideoPlay" size="small" @click="createAudio">{{
              t('courseCenter.tryListening')
            }}</el-button>
            <el-button 
              v-if="audioUrl"
              type="primary" 
              :icon="Download" 
              size="small" 
              @click="downloadAudio">
              下载音频
            </el-button>
          </div>

        </div>
        
      </div>
      <div class="audio-play" v-if="showAudioPlay">
            <div>{{ t('courseCenter.listeningTrial') }}...</div>
            <el-button @click="pauseAudio">{{ t('courseCenter.cancelTrialListening') }}</el-button>
          </div>
      </div>
    </el-main>

    <!-- Right Sidebar -->
    <!-- 右侧抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="AI生成文案"
      direction="rtl"
      size="420px"
      :with-header="false"
      :modal="false"
      :show-close="false"
      custom-class="ai-drawer"
    >
      <div class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium">AI生成文案</h3>
          <el-button type="primary" text @click="drawerVisible = false">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <el-input v-model="keyword" placeholder="请输入关键词，多个关键词用“，”隔开" />
        <div class="flex gap-2 mt-4">
          <el-select v-model="wordCount" placeholder="生成字数" style="flex: 1;">
            <el-option label="生成200个字" value="200" />
            <el-option label="生成400个字" value="400" />
            <el-option label="生成600个字" value="600" />
            <el-option label="生成800个字" value="800" />
          </el-select>
          <el-button type="primary" :loading="isGenerating" @click="generateText">
            <el-icon><MagicStick /></el-icon>
            开始生成
          </el-button>
        </div>
        <div v-if="generatedText" class="mt-4">
          <el-card shadow="never" :body-style="{ padding: '16px' }">
            {{ generatedText }}
          </el-card>
          <div class="flex justify-end mt-2">
            <el-button size="small" @click="useGeneratedText">使用文案</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
    <AudioSelect ref="audioSelect" @success="selectAudio" />
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import AudioSelect from '@/views/chooseTemplate/audioSelect.vue'
import { MagicStick, ArrowRight, Microphone, Clock, VideoPlay } from '@element-plus/icons-vue'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import * as pptTemplateApi from '@/api/pptTemplate'
import { ChatApi } from '@/api/digitalcourse/chat'

const { t } = useI18n() // 国际化

const inputText = ref('')
const generatedText = ref('')
const voiceData = ref({
  volume: 1,
  speed: 1
})
const keyword = ref('')
const wordCount = ref('400')
const drawerVisible = ref(false)
//生成试听
const showAudioPlay = ref(false) //显示试听
//打开声音弹框
const audioSelect = ref()
const currentAudio = ref()
const audioUrl = ref('')
const audioSelectData = ref({
  id: 28,
  code: 'B056_streaming',
  name: '阳光男声',
  language: '1',
  language_text: '中文',
  introduction: '阳光,男声',
  avatarUrl: 'https://easegenedu.obs.cn-north-9.myhuaweicloud.com/9f7d0d125712541820c69d50db943535bfdbcd06ccd2ae2f74cd34088b5d980e.png'
})
const openSelect = () => {
  audioSelect.value.open()
}
const selectAudio = (data) => {
  audioSelectData.value = data[0]
  console.log("选择的声音",data[0])
}
//AI文案生成
const isGenerating = ref(false)
const generateText = async () => {
  if (!keyword.value) {
    ElMessage.warning('请输入关键词')
    return
  }

  try {
    isGenerating.value = true
    generatedText.value = ''

    const params = {
      business_code: 'BUSI_0011',
      content_param: JSON.stringify({
        words: parseInt(wordCount.value),
        keywords: keyword.value
      })
    }

    // 获取完整内容
    const chat = await ChatApi.streamChat(params)
    let fullContent = ''

    for await (const chunk of chat.iterateStream()) {
      try {
        if (chunk.choices?.[0]?.delta?.content) {
          fullContent += chunk.choices[0].delta.content
          generatedText.value = fullContent // 实时更新显示内容
        }
      } catch (e) {
        console.error('处理数据块时出错:', e)
      }
    }

  } catch (error) {
    console.error('生成文案失败:', error)
    ElMessage.error('生成文案失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

const useGeneratedText = () => {
  inputText.value = generatedText.value
  drawerVisible.value = false  // 使用文案后关闭抽屉
}

const createAudio = async () => {
  if (!audioSelectData.value || inputText.value.length == 0) {
    message.warning('请选择声音模型！')
    return false
  }
  if (!inputText.value || inputText.value.length == 0) {
    message.warning('请划选至少一个汉字')
    return false
  }
  const params = {
    text: inputText.value,
    speed: voiceData.value.speed, //语速
    pitch: 1, // 音高固定为1
    volume: voiceData.value.volume, //音量
    voiceType: 37,
    voiceTypeId: 51,
    voiceId: audioSelectData.value.id,
    smartSpeed: 1 //智能语速 预留
  }
  showAudioPlay.value = true
  pptTemplateApi
    .createAudio(params)
    .then((res) => {
      if (res && !res.error) {
        // 如果返回结果有效且没有错误，初始化Audio
        audioUrl.value = res
        console.log("音频地址",audioUrl.value)
        currentAudio.value = new Audio(res)
        // 添加播放结束事件监听
        currentAudio.value.addEventListener('ended', () => {
          showAudioPlay.value = false
          currentAudio.value = null
        })
        
        currentAudio.value.play()
      } else {
        // 如果返回结果为空或有错误，关闭弹出框
        showAudioPlay.value = false
      }
    })
    .catch((error) => {
      // 捕获请求错误，关闭弹出框
      console.error('API 请求失败：', error)
      showAudioPlay.value = false
    })
}
//取消试听
const pauseAudio = () => {
  currentAudio.value.pause()
  currentAudio.value = null
  showAudioPlay.value = false
}

const downloadAudio = () => {
  if (audioUrl.value) {
    window.open(audioUrl.value, '_blank')
  }
}


</script>

<style scoped>
.ai-voice-generator {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  position: relative;
  height: 100%;
}

.header-card {
  background-color: #F5F7FF;
}

:deep(.el-input__wrapper) {
  padding-bottom: 40px;
}

:deep(.ai-drawer) {
  position: absolute;
  height: 100%;
  top: 0;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
}

:deep(.el-drawer__body) {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}
.voice-config,
.voice-settings {
  background-color: #F5F8FF;
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.voice-config:hover,
.voice-settings:hover {
  background-color: #FAFBFF;
}

.audio-play {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      width: 100%;
      height: 100%;
      padding: 20px 0;
      line-height: 40px;
      color: #fff;
      background: #000;
      opacity: 0.5;
      align-items: center;
      flex-direction: column;
    }
</style>