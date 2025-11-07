<template>
  <div class="voice-selector">
    <div class="selector-header">
      <h3>选择音色</h3>
      <span class="tips">共 {{ filteredVoices.length }} 个音色可选</span>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="filterGender" size="small">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="female">女声</el-radio-button>
        <el-radio-button label="male">男声</el-radio-button>
      </el-radio-group>

      <el-select
        v-model="filterLanguage"
        placeholder="语言"
        style="width: 100px"
        clearable
        size="small"
      >
        <el-option label="全部" value="" />
        <el-option label="中文" value="Chinese" />
        <el-option label="英文" value="English" />
      </el-select>

      <el-select
        v-model="filterStyle"
        placeholder="风格"
        style="width: 110px"
        clearable
        size="small"
      >
        <el-option label="全部" value="" />
        <el-option label="温和" value="mild" />
        <el-option label="活力" value="energetic" />
        <el-option label="可爱" value="cute" />
        <el-option label="温暖" value="warm" />
      </el-select>
    </div>

    <!-- 音色列表 -->
    <div class="voice-list">
      <div
        v-for="voice in filteredVoices"
        :key="voice.id"
        :class="['voice-item', { active: selectedVoice?.id === voice.id }]"
        @click="selectVoice(voice)"
      >
        <el-image :src="voice.render_image_oss" class="voice-avatar" fit="cover" lazy>
          <template #placeholder>
            <div class="avatar-loading">
              <el-icon><User /></el-icon>
            </div>
          </template>
          <template #error>
            <div class="avatar-error">
              <el-icon><User /></el-icon>
            </div>
          </template>
        </el-image>

        <div class="voice-info">
          <div class="voice-name">{{ voice.cn_name }}</div>
          <div class="voice-desc">{{ voice.description }}</div>
          <div class="voice-tags">
            <el-tag size="small">{{ voice.language_tag }}</el-tag>
            <el-tag size="small" :type="voice.gender === 'female' ? 'danger' : 'primary'">
              {{ getGenderLabel(voice.gender) }}
            </el-tag>
            <el-tag size="small" type="success">{{ getStyleLabel(voice.style_label) }}</el-tag>
          </div>
        </div>

        <!-- 试听按钮 -->
        <div class="voice-actions">
          <el-button
            class="audition-btn"
            :icon="playingVoiceId === voice.id ? VideoPause : Headset"
            :type="playingVoiceId === voice.id ? 'primary' : 'default'"
            circle
            size="small"
            @click.stop="toggleAudition(voice)"
          />
        </div>
      </div>
    </div>

    <!-- 音频播放器（隐藏） -->
    <audio
      ref="audioPlayer"
      :src="currentAudioUrl"
      @ended="onAudioEnded"
      @error="onAudioError"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Headset, VideoPause, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Voice3D } from '../types'
import voiceDataRaw from '@/assets/data/3d音色信息.json'

// Props & Emits
interface Props {
  modelValue?: Voice3D | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Voice3D | null): void
  (e: 'select', value: Voice3D): void
}>()

// 数据
const voiceData = voiceDataRaw as { data: { results: Voice3D[] } }
const allVoices = ref<Voice3D[]>(voiceData.data.results)

// 筛选条件
const filterGender = ref('')
const filterLanguage = ref('')
const filterStyle = ref('')

// 选中状态
const selectedVoice = ref<Voice3D | null>(props.modelValue)

// 音频播放
const audioPlayer = ref<HTMLAudioElement>()
const currentAudioUrl = ref('')
const playingVoiceId = ref<number | null>(null)

// 筛选后的音色列表
const filteredVoices = computed(() => {
  return allVoices.value.filter(voice => {
    // 只显示启用且上架的音色
    if (!voice.enable || !voice.is_shelf) return false

    // 性别筛选
    if (filterGender.value && voice.gender !== filterGender.value) {
      return false
    }

    // 语言筛选
    if (filterLanguage.value && voice.language_tag !== filterLanguage.value) {
      return false
    }

    // 风格筛选
    if (filterStyle.value && voice.style_label !== filterStyle.value) {
      return false
    }

    return true
  }).sort((a, b) => b.score - a.score) // 按评分排序
})

// 方法
const selectVoice = (voice: Voice3D) => {
  selectedVoice.value = voice
  emit('update:modelValue', voice)
  emit('select', voice)
}

const toggleAudition = (voice: Voice3D) => {
  if (playingVoiceId.value === voice.id) {
    // 正在播放，暂停
    stopAudition()
  } else {
    // 播放新的音色
    playAudition(voice)
  }
}

const playAudition = (voice: Voice3D) => {
  // 优先使用Pro版试听音频，否则使用基础版
  const audioUrl = voice.preview_audio_pro_oss || voice.preview_audio_oss

  if (!audioUrl) {
    ElMessage.warning('该音色暂无试听音频')
    return
  }

  // 停止当前播放
  stopAudition()

  currentAudioUrl.value = audioUrl
  playingVoiceId.value = voice.id

  nextTick(() => {
    audioPlayer.value?.play().catch(err => {
      console.error('播放失败:', err)
      ElMessage.error('播放失败，请重试')
      playingVoiceId.value = null
    })
  })
}

const stopAudition = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
  playingVoiceId.value = null
}

const onAudioEnded = () => {
  playingVoiceId.value = null
}

const onAudioError = () => {
  // 只有在有音频URL时才显示错误提示（避免空src导致的错误）
  if (currentAudioUrl.value) {
    ElMessage.error('音频加载失败')
  }
  playingVoiceId.value = null
}

const getGenderLabel = (gender: string) => {
  return gender === 'female' ? '女声' : '男声'
}

const getStyleLabel = (style: string) => {
  const styleMap: Record<string, string> = {
    'mild': '温和',
    'energetic': '活力',
    'cute': '可爱',
    'warm': '温暖'
  }
  return styleMap[style] || style
}
</script>

<style scoped lang="scss">
.voice-selector {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #fff;
  border-radius: 8px;

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .tips {
      font-size: 13px;
      color: #909399;
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .voice-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;

    .voice-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-bottom: 12px;
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      background: #fff;

      &:hover {
        border-color: #a78bfa;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
      }

      &.active {
        border-color: #7c3aed;
        background: #f9f5ff;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);

        .voice-name {
          color: #7c3aed;
          font-weight: 600;
        }
      }

      .voice-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        flex-shrink: 0;
        overflow: hidden;
        background: #f5f7fa;

        .avatar-loading,
        .avatar-error {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 24px;
          color: #909399;
        }
      }

      .voice-info {
        flex: 1;
        min-width: 0;

        .voice-name {
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .voice-desc {
          font-size: 13px;
          color: #606266;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .voice-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
      }

      .voice-actions {
        flex-shrink: 0;

        .audition-btn {
          width: 36px;
          height: 36px;
        }
      }
    }
  }

  audio {
    display: none;
  }
}
</style>
