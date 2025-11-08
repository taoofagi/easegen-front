<template>
  <div class="studio-selector">
    <div class="selector-header">
      <h3>选择演播室场景</h3>
      <span class="tips">共 {{ filteredStudios.length }} 个场景可选</span>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select
        v-model="filterStyle"
        placeholder="场景风格"
        style="width: 140px"
        clearable
        size="small"
      >
        <el-option label="全部" value="" />
        <el-option label="现代简约" value="modern" />
        <el-option label="商务正式" value="business" />
        <el-option label="生活日常" value="daily_living" />
        <el-option label="党建教育" value="party_building" />
        <el-option label="清新自然" value="fresh_nature" />
        <el-option label="工业风" value="industrial_style" />
      </el-select>

      <el-select
        v-model="filterType"
        placeholder="场景类型"
        style="width: 140px"
        clearable
        size="small"
      >
        <el-option label="全部" value="" />
        <el-option label="大舞台" value="lstage" />
        <el-option label="小舞台" value="sstage" />
        <el-option label="特写站姿" value="closeshot" />
        <el-option label="室内坐姿" value="indoor_sit" />
        <el-option label="固定演播室" value="studio_fixed" />
      </el-select>

      <el-select
        v-model="filterCamera"
        placeholder="画幅"
        style="width: 100px"
        clearable
        size="small"
      >
        <el-option label="全部" value="" />
        <el-option label="横屏" value="horizontal" />
        <el-option label="竖屏" value="vertical" />
      </el-select>
    </div>

    <!-- 场景卡片网格 -->
    <div class="studio-grid">
      <div
        v-for="studio in filteredStudios"
        :key="studio.id"
        :class="['studio-card', { active: selectedStudio?.id === studio.id }]"
        @click="selectStudio(studio)"
      >
        <div class="studio-image">
          <el-image :src="studio.render_image_oss" fit="cover" lazy>
            <template #placeholder>
              <div class="image-loading">加载中...</div>
            </template>
            <template #error>
              <div class="image-error">加载失败</div>
            </template>
          </el-image>

          <!-- 预览按钮 -->
          <div v-if="studio.render_movie_oss" class="preview-btn-wrapper">
            <el-button
              class="preview-btn"
              :icon="VideoPlay"
              circle
              size="small"
              @click.stop="previewStudio(studio)"
            />
          </div>
        </div>

        <div class="studio-info">
          <div class="studio-name">{{ studio.studio_chinese_name }}</div>
          <div class="studio-tags">
            <el-tag size="small" type="info">{{ getCameraType(studio.camera_config_chinese_name) }}</el-tag>
            <el-tag size="small" type="success">{{ getStudioType(studio.terminal_studio_type) }}</el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 场景预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="场景预览"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="previewStudioData" class="preview-dialog">
        <video
          :src="previewStudioData.render_movie_oss"
          controls
          autoplay
          style="width: 100%; max-height: 500px"
        ></video>
        <div class="preview-info">
          <p><strong>场景名称：</strong>{{ previewStudioData.studio_chinese_name }}</p>
          <p><strong>场景类型：</strong>{{ getStudioType(previewStudioData.terminal_studio_type) }}</p>
          <p><strong>画幅：</strong>{{ getCameraType(previewStudioData.camera_config_chinese_name) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import type { Studio3D } from '../types'
import studioDataRaw from '@/assets/data/3d场景信息.json'

// Props & Emits
interface Props {
  modelValue?: Studio3D | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Studio3D | null): void
  (e: 'select', value: Studio3D): void
}>()

// 数据
const studioData = studioDataRaw as { data: { results: Studio3D[] } }
const allStudios = ref<Studio3D[]>(studioData.data.results)

// 筛选条件
const filterStyle = ref('')
const filterType = ref('')
const filterCamera = ref('')

// 选中状态
const selectedStudio = ref<Studio3D | null>(props.modelValue)

// 预览
const previewVisible = ref(false)
const previewStudioData = ref<Studio3D | null>(null)

// 筛选后的场景列表
const filteredStudios = computed(() => {
  return allStudios.value.filter(studio => {
    // 只显示启用且上架的场景，支持video类型
    if (!studio.enable || !studio.is_shelf) return false
    if (!studio.available_ability_type?.includes('video')) return false

    // 风格筛选
    if (filterStyle.value && !studio.terminal_studio_style?.includes(filterStyle.value)) {
      return false
    }

    // 类型筛选
    if (filterType.value && studio.terminal_studio_type !== filterType.value) {
      return false
    }

    // 画幅筛选
    if (filterCamera.value && studio.camera_config_chinese_name !== filterCamera.value) {
      return false
    }

    return true
  }).sort((a, b) => b.score - a.score) // 按评分排序
})

// 方法
const selectStudio = (studio: Studio3D) => {
  selectedStudio.value = studio
  emit('update:modelValue', studio)
  emit('select', studio)
}

const previewStudio = (studio: Studio3D) => {
  previewVisible.value = true
  previewStudioData.value = studio
}

const getCameraType = (camera: string) => {
  if (camera === 'horizontal') return '横屏'
  if (camera === 'vertical') return '竖屏'
  return camera || '未知'
}

const getStudioType = (type: string) => {
  const typeMap: Record<string, string> = {
    'lstage': '大舞台',
    'sstage': '小舞台',
    'closeshot': '特写',
    'indoor_sit': '室内坐姿',
    'studio_fixed': '固定演播室',
    'studio_sit': '演播室坐姿'
  }
  return typeMap[type] || type
}
</script>

<style scoped lang="scss">
.studio-selector {
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

  .studio-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    overflow-y: auto;
    padding: 4px;

    .studio-card {
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      overflow: hidden;
      background: #fff;

      &:hover {
        border-color: #a78bfa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);

        .preview-btn-wrapper {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.05);
        }
      }

      &.active {
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);

        .studio-name {
          color: #7c3aed;
          font-weight: 600;
        }
      }

      .studio-image {
        position: relative;
        width: 100%;
        height: 120px;
        overflow: hidden;
        background: #f5f7fa;

        :deep(.el-image) {
          width: 100%;
          height: 100%;
        }

        .image-loading,
        .image-error {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: #909399;
          font-size: 13px;
        }

        .preview-btn-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.8;
          transition: all 0.3s;

          .preview-btn {
            background: rgba(0, 0, 0, 0.7);
            border: none;
            color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            font-size: 18px;

            &:hover {
              background: rgba(124, 58, 237, 0.95);
              transform: scale(1.15);
              box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
            }
          }
        }
      }

      .studio-info {
        padding: 12px;

        .studio-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .studio-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
      }
    }
  }

  .preview-dialog {
    .preview-info {
      margin-top: 16px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;

      p {
        margin: 8px 0;
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
