<template>
  <div class="pages-3d">
    <!-- 顶部工具栏 -->
    <div class="template-top">
      <div class="top-left">
        <div class="top-icon" style="font-size: 16px">
          <ArrowLeft @click="goBack" style="width: 1em; height: 1em; cursor: pointer" />
        </div>
        <span class="back-text" @click="goBack">返回</span>

        <!-- 课程名称编辑 -->
        <el-input
          v-if="isEditing"
          ref="inputRef"
          v-model="editName"
          style="width: 300px"
          size="small"
          placeholder="请输入课程名称"
          @blur="saveEdit"
          @keydown.enter="saveEdit"
        />
        <div v-else @click="toggleEdit" style="display: flex; align-items: center; cursor: pointer">
          <span>{{ course3DInfo.name }}</span>
        </div>

        <!-- 3D资源配置状态指示器 -->
        <div class="config-status">
          <el-tooltip
            :content="
              selected3DResources.studio && selected3DResources.look && selected3DResources.voice
                ? '所有3D资源已配置完成 ✓'
                : '3D资源配置未完成，点击查看详情'
            "
            placement="bottom"
          >
            <div
              class="status-badge"
              :class="{
                'status-complete': selected3DResources.studio && selected3DResources.look && selected3DResources.voice,
                'status-incomplete': !selected3DResources.studio || !selected3DResources.look || !selected3DResources.voice
              }"
            >
              <span class="status-icon">
                {{
                  selected3DResources.studio && selected3DResources.look && selected3DResources.voice
                    ? '✓'
                    : '⚠'
                }}
              </span>
              <span class="status-text">3D配置</span>
              <div class="status-details">
                <div class="status-item" :class="{ active: selected3DResources.studio }">
                  <span>{{ selected3DResources.studio ? '✓' : '○' }}</span>
                  演播室
                </div>
                <div class="status-item" :class="{ active: selected3DResources.look }">
                  <span>{{ selected3DResources.look ? '✓' : '○' }}</span>
                  数字人
                </div>
                <div class="status-item" :class="{ active: selected3DResources.voice }">
                  <span>{{ selected3DResources.voice ? '✓' : '○' }}</span>
                  音色
                </div>
              </div>
            </div>
          </el-tooltip>
        </div>

        <span>预计时长: {{ formatDuration(totalDuration) }}</span>
        <span>字数: {{ totalWordCount }}</span>
      </div>
      <div class="top-right">
        <span v-if="saveTime">{{ saveTime }} {{ t('choose3DTemplate.saveSuccess') }}</span>
        <el-button size="small" :loading="isSaving" :disabled="isComposing" @click="saveCourse">
          {{ t('choose3DTemplate.saveCourse') }}
        </el-button>
        <el-button type="primary" size="small" :loading="isComposing" :disabled="isSaving" @click="compose3DVideo">
          {{ t('choose3DTemplate.composeVideo') }}
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="template-main">
      <!-- 左侧 - PPT页面列表 -->
      <div class="template-box template-left">
        <div class="page">
          <div>页面: ({{ pptScenes.length }}) 页</div>
          <div class="line"></div>
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            accept=".pptx,.pdf"
            :limit="1"
            :headers="headers"
            :action="uploadUrl"
            :on-exceed="handleExceed"
            :on-change="handleChange"
            :on-success="handlePPTUploadSuccess"
            :on-error="handleError"
            :show-file-list="false"
          >
            <template #trigger>
              <el-button type="primary" :icon="Upload">上传 PPT/PDF</el-button>
            </template>
          </el-upload>
        </div>

        <!-- 场景列表（拖拽排序） -->
        <div v-if="showLeftList" class="scenes-container">
          <div class="image-list">
            <draggable
              :list="pptScenes"
              :disabled="false"
              item-key="id"
              ghost-class="ghost"
              chosen-class="chosen"
              animation="300"
              @start="dragging = true"
              @end="dragging = false"
            >
              <template #item="{ element, index }">
                <div class="mt-2 w-100%">
                  <div
                    :class="['list', { active: currentScene?.id === element.id }]"
                    @click="selectScene(element)"
                  >
                    <!-- PPT缩略图 -->
                    <el-image
                      class="background"
                      :src="element.pictureUrl"
                      fit="contain"
                      :style="{
                        width: '100%',
                        height: '120px'
                      }"
                    />

                    <div class="list-index" :style="element.isActive ? 'background: #7c3aed' : ''">
                      {{ index + 1 }}
                    </div>

                    <!-- 操作按钮 -->
                    <div class="icon-content">
                      <el-icon
                        size="20"
                        color="#ffffff"
                        style="margin-right: 5px"
                        @click.stop="copyScene(element, index)"
                      >
                        <CopyDocument />
                      </el-icon>
                      <el-icon
                        size="20"
                        color="#ffffff"
                        style="margin-right: 5px"
                        @click.stop="deleteScene(element)"
                      >
                        <Delete />
                      </el-icon>
                      <el-checkbox v-model="element.isChecked" size="large" />
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>

          <!-- 批量删除按钮 -->
          <div class="page-btn">
            <el-button type="primary" size="small" :icon="Delete" @click.stop="deleteMore" />
          </div>
        </div>

        <!-- PPT解析进度 -->
        <div v-if="!showLeftList" class="left-upload-setting">
          <div>PPT解析中...</div>
          <el-progress :percentage="percentagePPT" />
          <el-button @click="cancelAnalyze">取消</el-button>
          <div>正在解析文档，请耐心等待...</div>
        </div>
      </div>

      <!-- 中间 - 预览区 -->
      <div class="template-box template-middle">
        <div class="middle-top">
          <el-select v-model="course3DInfo.aspect" placeholder="选择比例" style="width: 140px">
            <el-option label="16:9" value="16:9" />
            <el-option label="9:16" value="9:16" />
          </el-select>
        </div>

        <div class="main-box relative">
          <div class="list">
            <div
              class="main-image-box"
              :style="{
                width: viewSize.width + 'px',
                height: viewSize.height + 'px',
                background: '#f5f7fa'
              }"
            >
              <!-- 当前选中的PPT页 -->
              <el-image
                v-if="currentScene?.pictureUrl"
                class="background"
                :src="currentScene.pictureUrl"
                fit="contain"
              />
              <div v-else class="empty-preview">
                <el-empty description="请上传PPT或选择一页">
                  <el-upload
                    ref="uploadRef2"
                    accept=".pptx,.pdf"
                    :limit="1"
                    :headers="headers"
                    :action="uploadUrl"
                    :on-exceed="handleExceed"
                    :on-change="handleChange"
                    :on-success="handlePPTUploadSuccess"
                    :on-error="handleError"
                    :show-file-list="false"
                  >
                    <el-button type="primary" :icon="Upload">上传 PPT/PDF</el-button>
                  </el-upload>
                </el-empty>
              </div>
            </div>
          </div>
        </div>

        <!-- 当前页面信息 -->
        <div v-if="currentScene" class="scene-info">
          <div class="info-row">
            <span class="info-label">当前页:</span>
            <span class="info-value">{{ currentScene.pageIndex }} / {{ pptScenes.length }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">字数:</span>
            <span class="info-value">{{ getSceneWordCount(currentScene) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">预计时长:</span>
            <span class="info-value">{{ formatDuration(getSceneDuration(currentScene)) }}</span>
          </div>
        </div>

        <!-- 口播稿编辑区 -->
        <div class="script-section">
          <div class="script-header">
            <span class="script-title">口播稿编辑</span>
          </div>
          <div class="script-editor-wrapper">
            <ScriptEditor
              v-if="currentScene"
              v-model="currentScene.pptRemark"
              :placeholder="`请为第 ${currentScene.pageIndex} 页输入口播稿...`"
              :max-length="5000"
              :min-words="50"
              :max-words="1000"
              @change="handleScriptChange"
            />
            <el-empty v-else description="请先选择一页PPT" :image-size="80" />
          </div>
        </div>
      </div>

      <!-- 右侧 - 3D资源配置 -->
      <div class="template-box template-right">
        <div class="config-title">3D资源配置</div>
        <el-collapse v-model="activeCollapse" class="config-collapse">
          <!-- 折叠面板1: 演播室场景 -->
          <el-collapse-item title="演播室场景" name="studio">
            <StudioSelector
              v-model="selected3DResources.studio"
              @select="handleStudioSelect"
            />
          </el-collapse-item>

          <!-- 折叠面板2: 数字人形象 -->
          <el-collapse-item title="数字人形象" name="look">
            <LookSelector
              v-model="selected3DResources.look"
              @select="handleLookSelect"
            />
          </el-collapse-item>

          <!-- 折叠面板3: 音色选择 -->
          <el-collapse-item title="音色选择" name="voice">
            <VoiceSelector
              v-model="selected3DResources.voice"
              @select="handleVoiceSelect"
            />
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- PPT上传说明弹窗 -->
    <UploadExplain ref="uploadExplainRef" @success="uploadSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Upload, Delete, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, genFileId } from 'element-plus'
import type { UploadInstance, UploadRawFile } from 'element-plus'
import draggable from 'vuedraggable'
import { cloneDeep } from 'lodash-es'
import { useI18n } from '@/hooks/web/useI18n'

// API
import * as pptTemplateApi from '@/api/pptTemplate'
import { getAccessToken, getTenantId } from '@/utils/auth'

// 组件
import StudioSelector from './components/StudioSelector.vue'
import LookSelector from './components/LookSelector.vue'
import VoiceSelector from './components/VoiceSelector.vue'
import ScriptEditor from './components/ScriptEditor.vue'
import UploadExplain from '@/views/chooseTemplate/uploadExplain.vue'

// 类型
import type {
  Course3DInfo,
  Scene3D,
  Selected3DResources,
  CourseMedia3DMegerVO,
  Studio3D,
  Look3D,
  Voice3D
} from './types'

// 3D资源数据
import studioDataRaw from '@/assets/data/3d场景信息.json'
import lookDataRaw from '@/assets/data/3d人物信息.json'
import voiceDataRaw from '@/assets/data/3d音色信息.json'

const route = useRoute()
const router = useRouter()
const message = ElMessage
const { t } = useI18n()

// 上传配置
const uploadUrl = import.meta.env.VITE_UPLOAD_URL

// ========== 基础数据 ==========
const userId = ref(Number(localStorage.getItem('userId') || 0))
const isEditing = ref(false)
const editName = ref('')
const saveTime = ref('')
const inputRef = ref()
const uploadRef = ref<UploadInstance>()
const uploadExplainRef = ref()
const activeCollapse = ref(['studio', 'look', 'voice']) // 默认展开所有折叠面板

// 加载状态
const isSaving = ref(false)
const isComposing = ref(false)

// 视图尺寸
const viewSize = reactive({
  width: 600,
  height: 338
})

// 拖拽状态
const dragging = ref(false)

// PPT解析相关
const showLeftList = ref(true)
const percentagePPT = ref(0)
const schedulePPTTimer = ref()

// ========== 核心数据 ==========
// 课程基础信息
const course3DInfo = ref<Course3DInfo>({
  id: 0,
  accountId: userId.value,
  aspect: '16:9',
  name: '未命名3D课程',
  duration: 0,
  status: 0,
  pageMode: 2, // PPT课件模式
  matting: 0,
  width: 1920,
  height: 1080,
  platformType: 2, // 魔珐星云
  synthesisType: 'segment',
  ifAigcMark: 0,
  subTitle: 'off'
})

// 3D资源选择
const selected3DResources = ref<Selected3DResources>({
  studio: null,
  look: null,
  voice: null
})

// PPT场景列表
const pptScenes = ref<Scene3D[]>([])

// 当前选中的场景
const currentScene = ref<Scene3D | null>(null)

// 上传文件对象
const uploadFileObj = reactive({
  filename: '',
  size: 0,
  url: '',
  md5: '',
  courseId: 0,
  docType: 1,
  status: 0,
  extInfo: '{"addMode":true,"docType":1,"pptNotes":true,"pptContent":false,"notesPolish":false}',
  resolveType: 1
})

// HTTP请求头
const headers = {
  Accept: 'application/json, text/plain, */*',
  Authorization: 'Bearer ' + getAccessToken(),
  'tenant-id': getTenantId()
}

// ========== 计算属性 ==========
// 总字数
const totalWordCount = computed(() => {
  return pptScenes.value.reduce((sum, scene) => {
    return sum + getSceneWordCount(scene)
  }, 0)
})

// 总时长（秒）
const totalDuration = computed(() => {
  return pptScenes.value.reduce((sum, scene) => {
    return sum + getSceneDuration(scene)
  }, 0)
})

// ========== 工具函数 ==========
// 生成UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 获取场景字数（去除SSML标签）
const getSceneWordCount = (scene: Scene3D): number => {
  if (!scene.pptRemark) return 0
  const plainText = scene.pptRemark.replace(/<[^>]+>/g, '')
  return plainText.trim().length
}

// 获取场景时长（按200字/分钟计算）
const getSceneDuration = (scene: Scene3D): number => {
  const wordCount = getSceneWordCount(scene)
  return Math.ceil((wordCount / 200) * 60)
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// ========== 场景管理 ==========
// 选择场景
const selectScene = (scene: Scene3D) => {
  // 取消之前选中的
  pptScenes.value.forEach((s) => (s.isActive = false))
  // 设置新选中的
  scene.isActive = true
  currentScene.value = scene
}

// 复制场景
const copyScene = (scene: Scene3D, index: number) => {
  const newScene = cloneDeep(scene)
  newScene.id = generateUUID()
  newScene.isActive = false
  newScene.isChecked = false
  pptScenes.value.splice(index + 1, 0, newScene)

  // 重新计算页码
  pptScenes.value.forEach((s, i) => {
    s.pageIndex = i + 1
  })
}

// 删除场景
const deleteScene = async (scene: Scene3D) => {
  try {
    await ElMessageBox.confirm(
      t('choose3DTemplate.confirmDelete'),
      t('common.confirmTitle'),
      {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    const index = pptScenes.value.findIndex((s) => s.id === scene.id)
    if (index === -1) return

    pptScenes.value.splice(index, 1)

    // 重新计算页码
    pptScenes.value.forEach((s, i) => {
      s.pageIndex = i + 1
    })

    // 如果删除的是当前选中的，则选中第一页
    if (currentScene.value?.id === scene.id) {
      currentScene.value = pptScenes.value.length > 0 ? pptScenes.value[0] : null
      if (currentScene.value) {
        currentScene.value.isActive = true
      }
    }

    message.success(t('common.delSuccess'))
  } catch {
    // 用户取消删除
  }
}

// 批量删除
const deleteMore = async () => {
  const selected = pptScenes.value.filter((s) => s.isChecked)
  if (selected.length === 0) {
    message.warning(t('common.delNoData'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('choose3DTemplate.confirmBatchDelete'),
      t('common.confirmTitle'),
      {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    pptScenes.value = pptScenes.value.filter((s) => !s.isChecked)

    // 重新计算页码
    pptScenes.value.forEach((s, i) => {
      s.pageIndex = i + 1
    })

    // 重新选中
    if (pptScenes.value.length > 0) {
      selectScene(pptScenes.value[0])
    } else {
      currentScene.value = null
    }

    message.success(t('common.delSuccess'))
  } catch {
    // 用户取消删除
  }
}

// ========== 资源选择回调 ==========
const handleStudioSelect = (studio: Studio3D) => {
  console.log('选择演播室:', studio.studio_chinese_name)
}

const handleLookSelect = (look: Look3D) => {
  console.log('选择数字人:', look.cn_name)
}

const handleVoiceSelect = (voice: Voice3D) => {
  console.log('选择音色:', voice.cn_name)
}

const handleScriptChange = (content: string) => {
  if (currentScene.value) {
    currentScene.value.pptRemark = content
  }
}

// ========== PPT上传 ==========
const handleExceed = (files: File[]) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

const handleChange = (file: any) => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  uploadFileObj.docType = extension === 'pdf' ? 2 : 1
  uploadFileObj.filename = file.name
  uploadFileObj.size = file.size
}

const handlePPTUploadSuccess = (response: any) => {
  message.success('上传成功！')
  uploadFileObj.url = response.data
  // 设置md5值（如果响应中有，否则使用默认值）
  uploadFileObj.md5 = response.md5 || '16b4c5e61897159b11405883ebd6749c'
  uploadExplainRef.value.open()
  uploadRef.value!.clearFiles()
}

const handleError = (err: any) => {
  message.error('上传失败，请重试')
  console.error('Upload error:', err)
}

// PPT上传说明确认
const uploadSubmit = async (uploadForm: any) => {
  try {
    // 先创建课程ID（如果还没有）
    if (!course3DInfo.value.id) {
      const courseRes = await pptTemplateApi.coursesCreate({ accountId: userId.value })
      course3DInfo.value.id = courseRes
      uploadFileObj.courseId = courseRes
    } else {
      uploadFileObj.courseId = course3DInfo.value.id
    }

    // 创建PPT记录
    const res = await pptTemplateApi.createPPT(uploadFileObj)
    if (res) {
      // 修改课程名称为文件名
      course3DInfo.value.name = uploadFileObj.filename.split('.').slice(0, -1).join('.')
      editName.value = course3DInfo.value.name

      // 开始解析
      schedulePPT(res)
    }
  } catch (error) {
    console.error('PPT上传失败:', error)
    message.error('PPT上传失败')
  }
}

// 解析PPT（轮询）
const schedulePPT = (id: number) => {
  percentagePPT.value = 0
  if (schedulePPTTimer.value) {
    clearInterval(schedulePPTTimer.value)
  }

  showLeftList.value = false

  schedulePPTTimer.value = setInterval(async () => {
    try {
      const res = await pptTemplateApi.getSchedule(id)

      // 解析进度
      if (res && typeof res === 'string') {
        const progress = Number(res)
        if (progress < 0) {
          clearInterval(schedulePPTTimer.value)
          showLeftList.value = true
          message.error('PPT解析失败，请重试')
          return
        }
        percentagePPT.value = Math.floor(progress * 100)
      }
      // 解析完成
      else if (res && Array.isArray(res) && res.length > 0) {
        const scenes: Scene3D[] = res.map((item: any, index: number) => ({
          id: generateUUID(),
          pictureUrl: item.pictureUrl || '',
          pptRemark: item.pptRemark || '',
          pageIndex: index + 1,
          duration: 0,
          width: course3DInfo.value.width,
          height: course3DInfo.value.height,
          isActive: index === 0,
          isChecked: false
        }))

        pptScenes.value = scenes
        currentScene.value = scenes[0]
        showLeftList.value = true
        clearInterval(schedulePPTTimer.value)

        message.success('PPT解析完成')
      }
    } catch (error) {
      console.error('解析轮询错误:', error)
      clearInterval(schedulePPTTimer.value)
      showLeftList.value = true
      message.error('PPT解析出错')
    }
  }, 2000)
}

// 取消解析
const cancelAnalyze = () => {
  showLeftList.value = true
  if (schedulePPTTimer.value) {
    clearInterval(schedulePPTTimer.value)
  }
}

// ========== 课程保存与合成 ==========
// 保存课程
const saveCourse = async () => {
  if (isSaving.value) return

  try {
    isSaving.value = true

    // ===== 基本校验 =====
    // 检查课程名称
    if (!course3DInfo.value.name || course3DInfo.value.name.trim() === '未命名3D课程') {
      message.warning(t('choose3DTemplate.courseNameEmpty'))
      isEditing.value = true
      nextTick(() => {
        inputRef.value?.focus()
      })
      return false
    }

    // 检查是否有PPT场景
    if (pptScenes.value.length === 0) {
      message.warning(t('choose3DTemplate.pleaseUploadPPT'))
      return false
    }

    // 创建课程ID（如果还没有）
    if (!course3DInfo.value.id) {
      const courseRes = await pptTemplateApi.coursesCreate({ accountId: userId.value })
      course3DInfo.value.id = courseRes
    }

    // 准备保存数据
    // 处理scenes：按照3D数字人课程后端要求组装完整的scene数据
    const scenesToSave = pptScenes.value.map((scene, index) => {
      // ✅ 3D数字人课程不支持SSML，使用纯文本
      const scriptContent = scene.pptRemark || ''
      // 移除所有SSML标签，只保留纯文本
      const plainTextScript = scriptContent.replace(/<[^>]+>/g, '').trim()

      // ✅ 构造完整的components数组（参考2D课程正确参数）
      const components = [
        // 水印组件
        {
          businessId: generateUUID(),
          category: 8,  // 水印
          cover: '',
          depth: 0,
          digitbotType: 0,
          entityId: '0',
          entityType: 0,
          height: 60,
          marginLeft: 100,
          marker: false,
          matting: 0,
          name: '水印',
          originHeight: 60,
          originWidth: 200,
          src: 'https://www.bifrostv.com/minio/easegen/system/watermark.png',
          status: 0,
          top: 50,
          width: 200
        },
        // 数字人组件
        {
          businessId: generateUUID(),
          category: 2,  // 数字人
          cover: selected3DResources.value.look?.full_body_preview_image_oss || '',
          depth: 400,
          digitbotType: 1,  // 3D数字人类型
          entityId: selected3DResources.value.look?.name || '',
          entityType: 0,
          height: 568,
          marginLeft: -4,
          marker: true,
          matting: 0,
          name: selected3DResources.value.look?.cn_name || '数字人',
          originHeight: 1920,
          originWidth: 1080,
          src: selected3DResources.value.look?.full_body_preview_image_oss || '',
          status: 0,
          top: 506,
          width: 338
        },
        // PPT画中画组件
        {
          businessId: generateUUID(),
          category: 1,  // PPT画中画
          cover: scene.pictureUrl,
          depth: 100,
          entityId: '0',
          entityType: 0,
          height: 914,
          marginLeft: 326,
          name: '画中画',
          originHeight: scene.height || 1080,
          originWidth: scene.width || 1920,
          src: scene.pictureUrl,
          status: 0,
          top: 0,
          width: 1586
        }
      ]

      const sceneData: any = {
        // ===== 必需字段 =====
        driverType: 1,  // 文本驱动（必需）
        businessId: generateUUID(),  // 业务ID（必需）

        // ===== textDriver对象（必需）=====
        textDriver: {
          textJson: plainTextScript,  // ✅ 使用纯文本（3D不支持SSML）
          pitch: 1,  // ✅ 修复：改为1（关键修复！）
          speed: 1.0,
          volume: 1.0,
          smartSpeed: 1.0,
          speechRate: 1.0,
          status: 0
        },

        // ===== background对象（3D场景固定值）=====
        background: {
          backgroundType: 1,  // 图片类型（必需）
          src: '',  // 3D无背景
          cover: '',
          width: course3DInfo.value.width,
          height: course3DInfo.value.height,
          depth: 0,
          originWidth: course3DInfo.value.width,
          originHeight: course3DInfo.value.height,
          status: 0,
          pptRemark: plainTextScript,  // ✅ 使用纯文本口播内容
          color: '#000000'
        },

        // ===== components数组（必需，避免后端NullPointerException）=====
        components: components,  // ✅ 修复：添加完整组件列表

        // ===== voice对象（使用选中的3D音色）=====
        voice: {
          voiceId: selected3DResources.value.voice?.id || 0,
          entityId: selected3DResources.value.voice?.tts_vcn_id || '',  // ✅ 修复：添加entityId
          name: selected3DResources.value.voice?.cn_name || '',  // ✅ 修复：添加name
          status: 0
        },

        // ===== audioDriver对象（3D课程使用文本驱动，传空对象）=====
        audioDriver: {
          audioUrl: '',
          status: 0
        },

        // ===== 其他字段 =====
        courseId: course3DInfo.value.id,
        orderNo: index + 1,  // 使用索引作为顺序号
        duration: scene.duration || 0,
        status: 0,

        // 前端字段（用于前端显示）
        pictureUrl: scene.pictureUrl,
        pptRemark: scene.pptRemark,
        pageIndex: scene.pageIndex,
        width: scene.width || 1920,
        height: scene.height || 1080
      }

      // 如果id存在且是数字类型，才传递给后端（更新已有场景时）
      if (scene.id && typeof scene.id === 'number') {
        sceneData.id = scene.id
      }

      return sceneData
    })

    const saveData = {
      ...course3DInfo.value,
      duration: totalDuration.value,
      scenes: scenesToSave,
      pageInfo: JSON.stringify({
        studio: selected3DResources.value.studio,
        look: selected3DResources.value.look,
        voice: selected3DResources.value.voice
      })
    }

    await pptTemplateApi.coursesSave(saveData)

    const now = new Date()
    saveTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    message.success(t('choose3DTemplate.saveSuccess'))
  } catch (error) {
    console.error('保存失败:', error)
    message.error(t('choose3DTemplate.saveFailed'))
  } finally {
    isSaving.value = false
  }
}

// 合成3D视频
const compose3DVideo = async () => {
  if (isComposing.value) return

  try {
    // ==================== 第一步：3D资源配置检查 ====================
    const missingResources = []

    // 检查演播室场景
    if (!selected3DResources.value.studio) {
      missingResources.push(t('choose3DTemplate.studioLabel'))
    }

    // 检查数字人形象
    if (!selected3DResources.value.look) {
      missingResources.push(t('choose3DTemplate.lookLabel'))
    }

    // 检查音色
    if (!selected3DResources.value.voice) {
      missingResources.push(t('choose3DTemplate.voiceLabel'))
    }

    // 如果有缺失的配置，给出详细提示
    if (missingResources.length > 0) {
      const missingText = missingResources.join('、')

      // 弹出详细的错误提示
      await ElMessageBox.alert(
        `<div style="padding: 16px 0;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #e6a23c;">
            ⚠️ ${t('choose3DTemplate.resourcesNotComplete')}
          </div>
          <div style="margin-bottom: 8px; color: #606266;">
            ${t('choose3DTemplate.resourcesIncompleteHint', { missing: missingText })}
          </div>
          <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 3px solid #409eff; border-radius: 4px;">
            <div style="font-weight: 500; margin-bottom: 8px; color: #409eff;">💡 操作步骤：</div>
            ${!selected3DResources.value.studio ? '<div style="margin: 4px 0;">1️⃣ 点击右侧 "演播室场景" 选项卡，选择一个演播室</div>' : ''}
            ${!selected3DResources.value.look ? '<div style="margin: 4px 0;">2️⃣ 点击右侧 "数字人形象" 选项卡，选择一个数字人</div>' : ''}
            ${!selected3DResources.value.voice ? '<div style="margin: 4px 0;">3️⃣ 点击右侧 "音色选择" 选项卡，选择一个音色</div>' : ''}
          </div>
        </div>`,
        t('choose3DTemplate.resourcesNotComplete'),
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: t('common.ok'),
          type: 'warning'
        }
      )

      // 自动展开第一个缺失的配置项
      if (!selected3DResources.value.studio && !activeCollapse.value.includes('studio')) {
        activeCollapse.value = ['studio']
      } else if (!selected3DResources.value.look && !activeCollapse.value.includes('look')) {
        activeCollapse.value = ['look']
      } else if (!selected3DResources.value.voice && !activeCollapse.value.includes('voice')) {
        activeCollapse.value = ['voice']
      }

      return
    }

    // ==================== 第二步：PPT场景检查 ====================
    if (pptScenes.value.length === 0) {
      message.warning(t('choose3DTemplate.needAtLeastOneScene'))
      return
    }

    // ==================== 第三步：口播稿内容检查 ====================
    const scriptErrors: string[] = []
    let emptyCount = 0

    for (const scene of pptScenes.value) {
      // 去除所有HTML和SSML标签后计算真实字数
      const plainText = scene.pptRemark ? scene.pptRemark.replace(/<[^>]+>/g, '').trim() : ''

      // 检查是否为空
      if (!plainText) {
        emptyCount++
        scriptErrors.push(
          `<div style="margin: 8px 0; padding: 8px; background: #fef0f0; border-left: 3px solid #f56c6c; border-radius: 4px;">
            <span style="color: #f56c6c; font-weight: bold;">第 ${scene.pageIndex} 页：</span>
            <span style="color: #606266;">口播稿为空</span>
          </div>`
        )
      } else {
        // 检查是否太短（少于10字）
        if (plainText.length < 10) {
          scriptErrors.push(
            `<div style="margin: 8px 0; padding: 8px; background: #fdf6ec; border-left: 3px solid #e6a23c; border-radius: 4px;">
              <span style="color: #e6a23c; font-weight: bold;">第 ${scene.pageIndex} 页：</span>
              <span style="color: #606266;">口播稿太短（${plainText.length} 字），建议至少10字以上</span>
            </div>`
          )
        }

        // 检查是否太长（超过2000字）
        if (plainText.length > 2000) {
          scriptErrors.push(
            `<div style="margin: 8px 0; padding: 8px; background: #fef0f0; border-left: 3px solid #f56c6c; border-radius: 4px;">
              <span style="color: #f56c6c; font-weight: bold;">第 ${scene.pageIndex} 页：</span>
              <span style="color: #606266;">口播稿过长（${plainText.length} 字），超过2000字限制</span>
            </div>`
          )
        }
      }
    }

    // 如果所有场景都是空的
    if (emptyCount === pptScenes.value.length) {
      await ElMessageBox.alert(
        `<div style="padding: 16px 0;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #f56c6c;">
            ⚠️ 所有页面的口播稿都为空！
          </div>
          <div style="margin-bottom: 8px; color: #606266;">
            至少需要为一个页面添加口播内容才能合成视频。
          </div>
          <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 3px solid #409eff; border-radius: 4px;">
            <div style="font-weight: 500; margin-bottom: 8px; color: #409eff;">💡 操作步骤：</div>
            <div style="margin: 4px 0;">1️⃣ 在左侧PPT列表中，点击选择一个页面</div>
            <div style="margin: 4px 0;">2️⃣ 在中间预览区下方的"口播稿编辑"中输入内容</div>
            <div style="margin: 4px 0;">3️⃣ 为所有需要语音的页面添加口播稿</div>
          </div>
        </div>`,
        '口播稿检查',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: t('common.ok'),
          type: 'error'
        }
      )

      // 自动选中第一个场景，方便用户编辑
      if (pptScenes.value.length > 0) {
        selectScene(pptScenes.value[0])
      }

      return
    }

    // 如果有口播稿错误或警告
    if (scriptErrors.length > 0) {
      await ElMessageBox.alert(
        `<div style="padding: 16px 0;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #e6a23c;">
            ⚠️ 发现 ${scriptErrors.length} 个口播稿问题
          </div>
          <div style="max-height: 400px; overflow-y: auto;">
            ${scriptErrors.join('')}
          </div>
          <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 3px solid #409eff; border-radius: 4px;">
            <div style="font-weight: 500; margin-bottom: 8px; color: #409eff;">💡 建议：</div>
            <div style="margin: 4px 0;">• 空口播稿的页面将无法生成语音</div>
            <div style="margin: 4px 0;">• 过短的口播稿可能影响语音质量</div>
            <div style="margin: 4px 0;">• 过长的口播稿需要拆分成多个页面</div>
          </div>
        </div>`,
        '口播稿检查',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: t('common.ok'),
          type: 'warning'
        }
      )

      // 定位到第一个有问题的场景
      for (const scene of pptScenes.value) {
        const plainText = scene.pptRemark ? scene.pptRemark.replace(/<[^>]+>/g, '').trim() : ''
        if (!plainText || plainText.length < 10 || plainText.length > 2000) {
          selectScene(scene)
          break
        }
      }

      return
    }

    // 3. 拼接所有文本（3D数字人课程不支持SSML，使用纯文本）
    const allText = pptScenes.value
      .map((s) => {
        // 移除所有HTML/SSML标签，只保留纯文本
        return s.pptRemark.replace(/<[^>]+>/g, '').trim()
      })
      .join('\n\n')

    // 4. 组装合成参数
    // 处理scenes：按照3D数字人课程后端要求组装完整的scene数据
    const scenesToCompose = pptScenes.value.map((scene, index) => {
      // ✅ 3D数字人课程不支持SSML，使用纯文本
      const scriptContent = scene.pptRemark || ''
      // 移除所有SSML标签，只保留纯文本
      const plainTextScript = scriptContent.replace(/<[^>]+>/g, '').trim()

      // ✅ 构造完整的components数组（参考2D课程正确参数）
      const components = [
        // 水印组件
        {
          businessId: generateUUID(),
          category: 8,  // 水印
          cover: '',
          depth: 0,
          digitbotType: 0,
          entityId: '0',
          entityType: 0,
          height: 60,
          marginLeft: 100,
          marker: false,
          matting: 0,
          name: '水印',
          originHeight: 60,
          originWidth: 200,
          src: 'https://www.bifrostv.com/minio/easegen/system/watermark.png',
          status: 0,
          top: 50,
          width: 200
        },
        // 数字人组件
        {
          businessId: generateUUID(),
          category: 2,  // 数字人
          cover: selected3DResources.value.look?.full_body_preview_image_oss || '',
          depth: 400,
          digitbotType: 1,  // 3D数字人类型
          entityId: selected3DResources.value.look?.name || '',
          entityType: 0,
          height: 568,
          marginLeft: -4,
          marker: true,
          matting: 0,
          name: selected3DResources.value.look?.cn_name || '数字人',
          originHeight: 1920,
          originWidth: 1080,
          src: selected3DResources.value.look?.full_body_preview_image_oss || '',
          status: 0,
          top: 506,
          width: 338
        },
        // PPT画中画组件
        {
          businessId: generateUUID(),
          category: 1,  // PPT画中画
          cover: scene.pictureUrl,
          depth: 100,
          entityId: '0',
          entityType: 0,
          height: 914,
          marginLeft: 326,
          name: '画中画',
          originHeight: scene.height || 1080,
          originWidth: scene.width || 1920,
          src: scene.pictureUrl,
          status: 0,
          top: 0,
          width: 1586
        }
      ]

      const sceneData: any = {
        // ===== 必需字段 =====
        driverType: 1,  // 文本驱动（必需）
        businessId: generateUUID(),  // 业务ID（必需）

        // ===== textDriver对象（必需）=====
        textDriver: {
          textJson: plainTextScript,  // ✅ 使用纯文本（3D不支持SSML）
          pitch: 1,  // ✅ 修复：改为1（关键修复！）
          speed: 1.0,
          volume: 1.0,
          smartSpeed: 1.0,
          speechRate: 1.0,
          status: 0
        },

        // ===== background对象（3D场景固定值）=====
        background: {
          backgroundType: 1,  // 图片类型（必需）
          src: '',  // 3D无背景
          cover: '',
          width: course3DInfo.value.width,
          height: course3DInfo.value.height,
          depth: 0,
          originWidth: course3DInfo.value.width,
          originHeight: course3DInfo.value.height,
          status: 0,
          pptRemark: plainTextScript,  // ✅ 使用纯文本口播内容
          color: '#000000'
        },

        // ===== components数组（必需，避免后端NullPointerException）=====
        components: components,  // ✅ 修复：添加完整组件列表

        // ===== voice对象（使用选中的3D音色）=====
        voice: {
          voiceId: selected3DResources.value.voice?.id || 0,
          entityId: selected3DResources.value.voice?.tts_vcn_id || '',  // ✅ 修复：添加entityId
          name: selected3DResources.value.voice?.cn_name || '',  // ✅ 修复：添加name
          status: 0
        },

        // ===== audioDriver对象（3D课程使用文本驱动，传空对象）=====
        audioDriver: {
          audioUrl: '',
          status: 0
        },

        // ===== 其他字段 =====
        courseId: course3DInfo.value.id,
        orderNo: index + 1,  // 使用索引作为顺序号
        duration: scene.duration || 0,
        status: 0
      }

      // 如果id存在且是数字类型，才传递给后端（更新已有场景时）
      if (scene.id && typeof scene.id === 'number') {
        sceneData.id = scene.id
      }

      return sceneData
    })

    const composeData: CourseMedia3DMegerVO = {
      id: course3DInfo.value.id,
      courseMediaId: course3DInfo.value.id,
      name: course3DInfo.value.name,
      accountId: userId.value,
      aspect: course3DInfo.value.aspect,
      width: course3DInfo.value.width,
      height: course3DInfo.value.height,
      matting: 0,
      pageMode: 2,
      status: 0,

      // 3D固定参数
      platformType: 2,
      synthesisType: 'segment',
      ifAigcMark: 0,
      subTitle: course3DInfo.value.subTitle,

      // 3D资源配置
      studioName: selected3DResources.value.studio.studio_en_name,
      lookName: selected3DResources.value.look.name,
      ttsVcnName: selected3DResources.value.voice.tts_vcn_id,

      // 文本内容
      text: allText,

      // 场景数据
      scenes: scenesToCompose,
      expectedDuration: totalDuration.value,

      pageInfo: JSON.stringify({
        studio: selected3DResources.value.studio,
        look: selected3DResources.value.look,
        voice: selected3DResources.value.voice
      })
    }

    // ✅ 调试日志：打印完整的合成参数以便验证
    console.log('=== 3D课程视频合成参数 ===')
    console.log('合成数据:', JSON.stringify(composeData, null, 2))
    console.log('场景数量:', scenesToCompose.length)
    console.log('第一个场景详情:', scenesToCompose[0])
    console.log('验证关键字段:')
    console.log('  - textDriver.pitch:', scenesToCompose[0]?.textDriver?.pitch, '(应该为1)')
    console.log('  - textDriver.textJson:', scenesToCompose[0]?.textDriver?.textJson?.substring(0, 100) + '...')
    console.log('  - background.pptRemark:', scenesToCompose[0]?.background?.pptRemark?.substring(0, 100) + '...')
    console.log('  - voice.entityId:', scenesToCompose[0]?.voice?.entityId)
    console.log('  - voice.name:', scenesToCompose[0]?.voice?.name)
    console.log('  - components数量:', scenesToCompose[0]?.components?.length, '(应该为3)')
    console.log('========================')

    isComposing.value = true

    // 5. 先保存
    await saveCourse()

    // 6. 提交合成任务
    await pptTemplateApi.megerMedia(composeData)

    message.success(t('choose3DTemplate.composeSuccess'))

    // 跳转到我的课程列表
    setTimeout(() => {
      router.push('/myCourse/index')
    }, 1500)
  } catch (error) {
    console.error('合成失败:', error)
    message.error(t('choose3DTemplate.composeFailed'))
  } finally {
    isComposing.value = false
  }
}

// ========== 编辑课程名 ==========
const toggleEdit = () => {
  isEditing.value = true
  editName.value = course3DInfo.value.name
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const saveEdit = () => {
  if (editName.value.trim()) {
    course3DInfo.value.name = editName.value.trim()
  }
  isEditing.value = false
}

// ========== 返回 ==========
const goBack = () => {
  router.back()
}

// ========== 初始化 ==========
onMounted(async () => {
  // 从路由参数中获取课程ID（如果是编辑模式）
  const courseId = route.query.id
  if (courseId) {
    try {
      const res = await pptTemplateApi.coursesDetail(Number(courseId))
      if (res) {
        course3DInfo.value = res
        editName.value = res.name

        // 恢复场景数据
        if (res.scenes && Array.isArray(res.scenes)) {
          // 将后端返回的复杂scene结构转换为前端Scene3D接口
          pptScenes.value = res.scenes.map((scene: any, index: number) => {
            // 1. 提取PPT图片URL（从components中找category=1的组件）
            let pictureUrl = ''
            if (scene.components && Array.isArray(scene.components)) {
              const pptComponent = scene.components.find((comp: any) => comp.category === 1)
              if (pptComponent) {
                pictureUrl = pptComponent.src || pptComponent.cover || ''
              }
            }

            // 2. 提取口播稿（优先从textDriver.textJson，其次从background.pptRemark）
            let pptRemark = ''
            if (scene.textDriver && scene.textDriver.textJson) {
              pptRemark = scene.textDriver.textJson
            } else if (scene.background && scene.background.pptRemark) {
              pptRemark = scene.background.pptRemark
            }

            // 3. 使用orderNo作为排序依据，pageIndex从1开始
            const pageIndex = scene.orderNo !== undefined ? scene.orderNo : index + 1

            // 4. 计算场景时长（根据口播稿字数估算，按4字/秒）
            const wordCount = pptRemark.replace(/<[^>]+>/g, '').trim().length
            const estimatedDuration = Math.ceil(wordCount / 4)

            // 5. 构造符合Scene3D接口的对象
            return {
              id: scene.id?.toString() || generateUUID(),
              pictureUrl: pictureUrl,
              pptRemark: pptRemark,
              pageIndex: pageIndex,
              duration: estimatedDuration,
              width: scene.background?.width || course3DInfo.value.width,
              height: scene.background?.height || course3DInfo.value.height,
              isActive: index === 0,
              isChecked: false
            }
          })

          // 按pageIndex排序（确保顺序正确）
          pptScenes.value.sort((a, b) => a.pageIndex - b.pageIndex)

          // 选中第一页
          if (pptScenes.value.length > 0) {
            selectScene(pptScenes.value[0])
          }

          console.log('场景数据加载完成，共', pptScenes.value.length, '个场景')
        }

        // 恢复3D资源选择
        if (res.pageInfo) {
          try {
            const pageInfo = JSON.parse(res.pageInfo)
            selected3DResources.value = {
              studio: pageInfo.studio || null,
              look: pageInfo.look || null,
              voice: pageInfo.voice || null
            }
          } catch (e) {
            console.error('解析pageInfo失败:', e)
          }
        }
      }
    } catch (error) {
      console.error('加载课程详情失败:', error)
    }
  } else {
    // 新建模式：自动选择默认的3D资源（每种资源的第一个）
    try {
      // 解析3D资源数据
      const studioData = studioDataRaw as { data: { results: Studio3D[] } }
      const lookData = lookDataRaw as { data: { results: Look3D[] } }
      const voiceData = voiceDataRaw as { data: { results: Voice3D[] } }

      // 筛选并选择第一个有效的演播室（enable=true, is_shelf=true, 支持video）
      const firstStudio = studioData.data.results.find(
        s => s.enable && s.is_shelf && s.available_ability_type?.includes('video')
      )

      // 筛选并选择第一个有效的数字人（enable=true, is_shelf=true, 支持video）
      const firstLook = lookData.data.results.find(
        l => l.enable && l.is_shelf && l.available_ability_type?.includes('video')
      )

      // 筛选并选择第一个有效的音色（enable=true, is_shelf=true）
      const firstVoice = voiceData.data.results.find(
        v => v.enable && v.is_shelf
      )

      // 设置默认选择
      selected3DResources.value = {
        studio: firstStudio || null,
        look: firstLook || null,
        voice: firstVoice || null
      }

      console.log('已自动选择默认3D资源：', {
        studio: firstStudio?.studio_chinese_name,
        look: firstLook?.cn_name,
        voice: firstVoice?.cn_name
      })
    } catch (error) {
      console.error('加载默认3D资源失败:', error)
    }
  }
})

// 监听屏幕比例变化
watch(
  () => course3DInfo.value.aspect,
  (newAspect) => {
    if (newAspect === '16:9') {
      course3DInfo.value.width = 1920
      course3DInfo.value.height = 1080
      viewSize.width = 600
      viewSize.height = 338
    } else {
      course3DInfo.value.width = 1080
      course3DInfo.value.height = 1920
      viewSize.width = 338
      viewSize.height = 600
    }
  }
)
</script>

<style scoped lang="scss">
.pages-3d {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .template-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: 60px;

    .top-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .top-icon {
        display: flex;
        align-items: center;
        color: #606266;

        &:hover {
          color: #409eff;
        }
      }

      .back-text {
        cursor: pointer;
        color: #606266;
        font-size: 14px;

        &:hover {
          color: #409eff;
        }
      }

      span {
        font-size: 14px;
        color: #606266;
      }

      // 配置状态指示器
      .config-status {
        .status-badge {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid;

          &.status-complete {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-color: #86efac;
            color: #16a34a;

            .status-icon {
              color: #16a34a;
              font-weight: bold;
            }

            &:hover {
              box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);
              transform: translateY(-1px);
            }
          }

          &.status-incomplete {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-color: #fbbf24;
            color: #d97706;

            .status-icon {
              color: #d97706;
              font-weight: bold;
              animation: pulse 2s ease-in-out infinite;
            }

            &:hover {
              box-shadow: 0 2px 8px rgba(217, 119, 6, 0.2);
              transform: translateY(-1px);

              .status-details {
                display: block;
              }
            }
          }

          .status-icon {
            font-size: 14px;
          }

          .status-text {
            font-weight: 500;
          }

          .status-details {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            padding: 12px;
            background: #fff;
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            min-width: 140px;

            .status-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 6px 8px;
              margin: 4px 0;
              border-radius: 4px;
              font-size: 13px;
              color: #909399;
              background: #f5f7fa;
              transition: all 0.2s;

              span {
                font-size: 14px;
                color: #c0c4cc;
              }

              &.active {
                color: #67c23a;
                background: #f0f9ff;

                span {
                  color: #67c23a;
                  font-weight: bold;
                }
              }
            }
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      }
    }

    .top-right {
      display: flex;
      align-items: center;
      gap: 12px;

      span {
        font-size: 13px;
        color: #67c23a;
        font-weight: 500;
      }

      .el-button {
        transition: all 0.3s;

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
        }

        &[type="primary"] {
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
          border: none;

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%);
          }
        }
      }
    }
  }

  .template-main {
    flex: 1;
    display: flex;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
    min-height: 0;

    .template-box {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    // 左侧PPT列表
    .template-left {
      width: 240px;
      display: flex;
      flex-direction: column;
      min-height: 0;

      .page {
        padding: 16px;
        border-bottom: 1px solid #e4e7ed;
        flex-shrink: 0;

        .line {
          margin: 12px 0;
          height: 1px;
          background: #e4e7ed;
        }
      }

      .scenes-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
      }

      .image-list {
        flex: 1;
        overflow-y: auto;
        padding: 12px;

        // 自定义滚动条样式
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: #f5f7fa;
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: #dcdfe6;
          border-radius: 3px;
          transition: background 0.3s;

          &:hover {
            background: #c0c4cc;
          }
        }

        .list {
          position: relative;
          margin-bottom: 12px;
          border: 2px solid #e4e7ed;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: #fff;

          &:hover {
            border-color: #a78bfa;
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
            transform: translateY(-2px);

            .icon-content {
              opacity: 1;
            }

            .list-index {
              background: rgba(124, 58, 237, 0.9);
            }
          }

          &.active {
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
            background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%);
          }

          .background {
            width: 100%;
            height: 120px;
          }

          .list-index {
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
          }

          .icon-content {
            position: absolute;
            bottom: 8px;
            right: 8px;
            display: flex;
            align-items: center;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.3s;
            background: rgba(0, 0, 0, 0.5);
            padding: 4px 8px;
            border-radius: 6px;
            backdrop-filter: blur(4px);

            .el-icon {
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                transform: scale(1.2);
                filter: brightness(1.2);
              }
            }
          }
        }
      }

      .page-btn {
        padding: 12px;
        border-top: 1px solid #e4e7ed;
        flex-shrink: 0;
      }

      .left-upload-setting {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        gap: 16px;

        div {
          font-size: 14px;
          color: #606266;
          font-weight: 500;
        }

        .el-progress {
          width: 100%;
        }

        .el-button {
          margin-top: 8px;
        }
      }
    }

    // 中间预览区
    .template-middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px;
      min-height: 0;

      .middle-top {
        margin-bottom: 16px;
        flex-shrink: 0;
      }

      .main-box {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;

        .main-image-box {
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;

          .background {
            width: 100%;
            height: 100%;
          }

          .empty-preview {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .scene-info {
        margin-top: 16px;
        padding: 16px;
        background: linear-gradient(135deg, #faf5ff 0%, #f3f4f6 100%);
        border-radius: 8px;
        display: flex;
        gap: 24px;
        border: 1px solid #e4e7ed;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        flex-shrink: 0;

        .info-row {
          display: flex;
          gap: 8px;
          font-size: 14px;
          align-items: center;

          .info-label {
            color: #909399;
            font-weight: 400;
          }

          .info-value {
            color: #303133;
            font-weight: 600;
            background: #fff;
            padding: 4px 12px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          }
        }
      }

      // 口播稿编辑区
      .script-section {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        flex: 0 0 auto;
        min-height: 180px;
        max-height: 300px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e4e7ed;
        overflow: hidden;

        .script-header {
          padding: 12px 16px;
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          flex-shrink: 0;

          .script-title {
            font-size: 14px;
            font-weight: 600;
          }
        }

        .script-editor-wrapper {
          flex: 1;
          overflow: auto;
          display: flex;
          flex-direction: column;
        }
      }
    }

    // 右侧3D资源配置栏
    .template-right {
      width: 380px;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-left: 1px solid #e4e7ed;
      min-height: 0;

      .config-title {
        padding: 16px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        background: linear-gradient(135deg, #f9f5ff 0%, #fff 100%);
        border-bottom: 2px solid #7c3aed;
        flex-shrink: 0;
      }

      .config-collapse {
        flex: 1;
        overflow-y: auto;

        :deep(.el-collapse-item__header) {
          padding: 0 16px;
          height: 48px;
          line-height: 48px;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          background: #fafafa;
          border-bottom: 1px solid #e4e7ed;
          transition: all 0.3s;

          &:hover {
            background: #f5f7fa;
            color: #7c3aed;
          }

          &.is-active {
            background: #f9f5ff;
            color: #7c3aed;
            border-bottom-color: #7c3aed;
          }
        }

        :deep(.el-collapse-item__content) {
          padding: 0;
        }

        :deep(.el-collapse-item__arrow) {
          color: #7c3aed;
          font-weight: bold;
        }
      }
    }
  }
}

// 拖拽样式
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.chosen {
  opacity: 1;
}
</style>
