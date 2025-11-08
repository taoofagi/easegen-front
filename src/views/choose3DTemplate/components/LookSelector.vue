<template>
  <div class="look-selector">
    <div class="selector-header">
      <h3>选择数字人形象</h3>
      <span class="tips">共 {{ filteredLooks.length }} 个形象可选</span>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="filterGender" size="small">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="female">女性</el-radio-button>
        <el-radio-button label="male">男性</el-radio-button>
      </el-radio-group>

      <el-select
        v-model="filterAge"
        placeholder="年龄段"
        style="width: 130px"
        clearable
        size="small"
      >
        <el-option label="全部" value="" />
        <el-option label="20-40岁" value="20to40" />
        <el-option label="41-50岁" value="41to50" />
        <el-option label="51-60岁" value="51to60" />
      </el-select>

      <el-select
        v-model="filterStyle"
        placeholder="风格"
        style="width: 130px"
        clearable
        size="small"
      >
        <el-option label="全部" value="" />
        <el-option label="正装" value="Formal_Wear" />
        <el-option label="休闲装" value="Casualwear" />
        <el-option label="运动装" value="Activewear" />
      </el-select>
    </div>

    <!-- 形象卡片网格 -->
    <div class="look-grid">
      <div
        v-for="look in filteredLooks"
        :key="look.id"
        :class="['look-card', { active: selectedLook?.id === look.id }]"
        @click="selectLook(look)"
      >
        <div class="look-image">
          <el-image :src="look.half_body_preview_image_oss" fit="cover" lazy>
            <template #placeholder>
              <div class="image-loading">加载中...</div>
            </template>
            <template #error>
              <div class="image-error">加载失败</div>
            </template>
          </el-image>

          <!-- 预览按钮 -->
          <div v-if="look.facial_animation_video_oss" class="preview-btn-wrapper">
            <el-button
              class="preview-btn"
              :icon="VideoPlay"
              circle
              size="small"
              @click.stop="previewLook(look)"
            />
          </div>
        </div>

        <div class="look-info">
          <div class="look-name">{{ look.cn_name }}</div>
          <div class="look-meta">
            <el-tag size="small" :type="look.gender === 'female' ? 'danger' : 'primary'">
              {{ look.gender === 'female' ? '女' : '男' }}
            </el-tag>
            <el-tag size="small" type="info">{{ getAgeLabel(look.age) }}</el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 形象预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="形象预览"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="previewLookData" class="preview-dialog">
        <video
          :src="previewLookData.facial_animation_video_oss"
          controls
          autoplay
          loop
          style="width: 100%; max-height: 400px; border-radius: 8px"
        ></video>
        <div class="preview-info">
          <p><strong>形象名称：</strong>{{ previewLookData.cn_name }}</p>
          <p><strong>性别：</strong>{{ previewLookData.gender === 'female' ? '女性' : '男性' }}</p>
          <p><strong>年龄段：</strong>{{ getAgeLabel(previewLookData.age) }}</p>
          <p><strong>风格：</strong>{{ previewLookData.collection_style }}</p>
          <p><strong>系列：</strong>{{ previewLookData.collection_series }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import type { Look3D } from '../types'
import lookDataRaw from '@/assets/data/3d人物信息.json'

// Props & Emits
interface Props {
  modelValue?: Look3D | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Look3D | null): void
  (e: 'select', value: Look3D): void
}>()

// 数据
const lookData = lookDataRaw as { data: { results: Look3D[] } }
const allLooks = ref<Look3D[]>(lookData.data.results)

// 筛选条件
const filterGender = ref('')
const filterAge = ref('')
const filterStyle = ref('')

// 选中状态
const selectedLook = ref<Look3D | null>(props.modelValue)

// 预览
const previewVisible = ref(false)
const previewLookData = ref<Look3D | null>(null)

// 筛选后的形象列表
const filteredLooks = computed(() => {
  return allLooks.value.filter(look => {
    // 只显示启用且上架的形象，支持video类型
    if (!look.enable || !look.is_shelf) return false
    if (!look.available_ability_type?.includes('video')) return false

    // 性别筛选
    if (filterGender.value && look.gender !== filterGender.value) {
      return false
    }

    // 年龄筛选
    if (filterAge.value && look.age !== filterAge.value) {
      return false
    }

    // 风格筛选
    if (filterStyle.value && !look.collection_style?.includes(filterStyle.value)) {
      return false
    }

    return true
  }).sort((a, b) => b.score - a.score) // 按评分排序
})

// 方法
const selectLook = (look: Look3D) => {
  selectedLook.value = look
  emit('update:modelValue', look)
  emit('select', look)
}

const previewLook = (look: Look3D) => {
  previewVisible.value = true
  previewLookData.value = look
}

const getAgeLabel = (age: string) => {
  const ageMap: Record<string, string> = {
    '20to40': '20-40岁',
    '41to50': '41-50岁',
    '51to60': '51-60岁'
  }
  return ageMap[age] || age
}
</script>

<style scoped lang="scss">
.look-selector {
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

  .look-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    overflow-y: auto;
    padding: 4px;

    .look-card {
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

        .look-name {
          color: #7c3aed;
          font-weight: 600;
        }
      }

      .look-image {
        position: relative;
        width: 100%;
        height: 160px;
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

      .look-info {
        padding: 12px;

        .look-name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 8px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .look-meta {
          display: flex;
          gap: 6px;
          justify-content: center;
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
