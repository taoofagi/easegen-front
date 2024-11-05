<template>
  <div class="pages">
    <div class="template-top">
      <div class="top-left">
        <div style="font-size: 16px" class="top-icon">
          <ArrowLeft @click="goBack" style="width: 1em; height: 1em; cursor: pointer" />
        </div>
        <span class="back-text" @click="goBack">返回</span>
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

        <!-- 如果不在编辑，显示文本 -->
        <div
          v-else
          @click="toggleEdit"
          :prefix-icon="Edit"
          style="display: flex; align-items: center; cursor: pointer"
        >
          <span>{{ courseInfo.name }}</span>
        </div>
        <span>预估时长: {{ videoDuration }}</span>
        <span>总字数:{{ videoText }}</span>
      </div>
      <div class="top-right">
        <span v-if="saveTime">{{ saveTime }} 已保存</span>
        <el-button size="small" @click="saveSubmit('save')">保存</el-button>
        <el-button type="primary" size="small" @click="saveSubmit('')">合成视频</el-button>
      </div>
    </div>
    <div class="template-main">
      <div class="template-box template-left">
        <div class="page">
          <div>页面({{ PPTArr ? PPTArr.length : 1 }}页)</div>
          <div class="line"></div>
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            accept=".pptx"
            :limit="1"
            :headers="headers"
            :action="`${config.base_url}/infra/file/upload`"
            :on-exceed="handleExceed"
            :on-change="handleChange"
            :on-success="handleSuccess"
            :show-file-list="false"
          >
            <template #trigger>
              <el-button type="primary" :icon="Upload">上传PPT</el-button>
            </template>
          </el-upload>
        </div>
        <!-- 左侧场景页面缩略图 -->
        <div v-if="showLeftList" style="height: calc(100% - 86px)">
          <div class="image-list">
            <draggable
              :list="PPTArr"
              :disabled="false"
              item-key="name"
              ghost-class="ghost"
              chosen-class="chosen"
              @start="state.dragging = true"
              @end="state.dragging = false"
              animation="300"
            >
              <template #item="{ element, index }">
                <div class="mt-2 w-100%">
                  <div class="list" @click="choosePPt(element)">
                    <!-- 背景图片(必显示) -->
                    <el-image
                      class="background"
                      :src="element.pictureUrl"
                      fit="contain"
                      :style="{
                        width: thumViewSize.width + 'px',
                        height: thumViewSize.height + 'px',
                        top: '0px',
                        left: '0px'
                      }"
                    />
                    <!-- 画中画(有则显示) -->
                    <el-image
                      v-if="element.innerPicture?.src"
                      class="ppt-bg"
                      :style="{
                        width: element.innerPicture.width  * (thumViewSize.width / 800) + 'px',
                        height: element.innerPicture.height * (thumViewSize.height / 450) + 'px',
                        top: element.innerPicture.top  * (thumViewSize.width / 800) + 'px',
                        left: element.innerPicture.marginLeft * (thumViewSize.height / 450) + 'px',
                        borderColor: element.isActive ? '#0683ee' : ''
                      }"
                      :src="element.innerPicture.src"
                      fit="contain"
                    />
                    <!-- 数字人(有则显示) -->
                    <el-image
                      v-if="element.showDigitalHuman"
                      class="host"
                      :style="{
                        width: PPTpositon.w  * (thumViewSize.width / 800) + 'px',
                        height: PPTpositon.h  * (thumViewSize.height / 450) + 'px',
                        top: PPTpositon.y  * (thumViewSize.width / 800) + 'px',
                        left: PPTpositon.x * (thumViewSize.height / 450) + 'px'
                      }"
                      :src="selectHost?.pictureUrl"
                      fit="cover"
                    />
                    <div class="list-index" :style="element.isActive ? 'background: #409eff' : ''">
                      {{ index + 1 }}
                    </div>
                    <div class="icon-content">
                      <el-icon
                        size="20"
                        color="#ffffff"
                        style="margin-right: 5px"
                        @click.stop="copyDocument(element, index)"
                      >
                        <CopyDocument />
                      </el-icon>
                      <el-icon
                        size="20"
                        color="#ffffff"
                        style="margin-right: 5px"
                        @click.stop="deleteDocument(element)"
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
          <div class="page-btn">
            <el-button type="primary" size="small" :icon="Delete" @click.stop="deleteMore" />
          </div>
        </div>
        <div class="left-upload-setting" v-if="!showLeftList">
          <!-- <img src="" alt=""> -->
          <div>ppt解析中...</div>
          <el-progress :percentage="percentagePPT" />
          <el-button @click="cancelAnalyze">取消</el-button>
          <div>PPT需要上传、解析等步骤处理，请耐心等待。</div>
        </div>
      </div>
      <!-- 中间主画布 -->
      <div class="template-box template-middle">
        <div class="middle-top">
          <el-select v-model="courseInfo.aspect" placeholder="Select" style="width: 140px">
            <el-option
              v-for="item in options"
              :key="item.label"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </div>
        <div class="main-box relative">
          <div class="list">
            <div
              class="main-image-box"
              :style="{ width: viewSize.width + 'px', height: viewSize.height + 'px' }"
            >
              <!-- 背景(必显示) -->
              <el-image
                class="background"
                :src="selectPPT.pictureUrl"
              />
              <!-- 画中画 -->
              <Vue3DraggableResizable
                v-if="selectPPT.innerPicture&&selectPPT.innerPicture.src"
                :parent="true"
                :initW="selectPPT.innerPicture.width"
                :initH="selectPPT.innerPicture.height"
                v-model:x="selectPPT.innerPicture.marginLeft"
                v-model:y="selectPPT.innerPicture.top"
                v-model:w="selectPPT.innerPicture.width"
                v-model:h="selectPPT.innerPicture.height"
                v-model:active="selectPPT.innerPicture.active"
                :draggable="true"
                :resizable="true"
                @activated="print('PPT activated')"
                @deactivated="print('PPT deactivated')"
                @drag-start="print('PPT drag-start')"
                @resize-start="print('PPT resize-start')"
                @dragging="print('PPT dragging')"
                @resizing="print('PPT resizing')"
                @drag-end="print('PPT drag-end')"
                @resize-end="print('PPT resize-end')"
                style="z-index: 3"
              >
                <el-image
                  class="ppt-bg"
                  :src="selectPPT.innerPicture.src"
                  fit="cover"
                />
                <el-icon
                  v-if="PPTpositon.active"
                  size="20"
                  color="#409eff"
                  style="position: absolute; top: 5px; right: 5px; z-index: 4"
                  @click.stop="deleteInnerPicture"
                >
                  <Delete />
                </el-icon>
              </Vue3DraggableResizable>
              <Vue3DraggableResizable
                v-if="selectPPT.showDigitalHuman"
                :parent="true"
                :initW="PPTpositon.w"
                :initH="PPTpositon.h"
                v-model:x="PPTpositon.x"
                v-model:y="PPTpositon.y"
                v-model:w="PPTpositon.w"
                v-model:h="PPTpositon.h"
                v-model:active="PPTpositon.active"
                :draggable="true"
                :resizable="true"
                @activated="print('activated')"
                @deactivated="print('deactivated')"
                @drag-start="print('drag-start')"
                @resize-start="print('resize-start')"
                @dragging="print('dragging')"
                @resizing="print('resizing')"
                @drag-end="print('drag-end')"
                @resize-end="print('resize-end')"
                style="z-index: 4"
              >
                <el-image
                  class="minddle-host-image"
                  :src="selectHost ? selectHost.pictureUrl : ''"
                  fit="cover"
                />
                <el-icon
                  v-if="PPTpositon.active"
                  size="20"
                  color="#409eff"
                  style="position: absolute; top: 5px; right: 5px; z-index: 4"
                  @click.stop="deleteDigitalHuman"
                >
                  <Delete />
                </el-icon>
              </Vue3DraggableResizable>
            </div>
          </div>
          <el-card
            v-show="voiceData.show"
            class="voice-card absolute right-10px bottom-10px w-300px"
          >
            <div class="flex flex-col">
              <div class="flex flex-col p-10px border-b-solid border-b-1px border-gray-200">
                <div class="flex items-baseline">
                  <span class="text-16px">语速</span>
                  <el-button
                    class="ml-10px"
                    type="info"
                    link
                    @click="voiceData.speechRate = voiceData.defaultSpeechRate"
                  >
                    恢复默认
                  </el-button>
                </div>
                <el-slider
                  class="speech-slider px-10px mb-20px"
                  v-model="voiceData.speechRate"
                  :step="0.05"
                  :min="0.6"
                  :max="1.5"
                  :marks="voiceData.marks"
                  :show-spots="false"
                />
              </div>
              <div class="flex flex-col p-10px">
                <div class="flex items-baseline">
                  <span class="text-16px">音量放大</span>
                  <el-button
                    class="ml-10px"
                    type="info"
                    link
                    @click="voiceData.volume = voiceData.defaultVolume"
                  >
                    恢复默认
                  </el-button>
                </div>
                <el-slider
                  class="speech-slider px-10px mb-20px"
                  v-model="voiceData.volume"
                  :step="0.1"
                  :min="1"
                  :max="2"
                  :marks="voiceData.marks2"
                  :show-spots="false"
                />
              </div>
            </div>
          </el-card>
        </div>
        <div class="voice-main">
          <el-text class="mx-1" type="primary" size="small">口播内容</el-text>
          <div class="voice-item">
            <span
              :class="selectPPT.driverType == item.itemValue ? 'active-item' : ''"
              v-for="(item, index) in driveType"
              :key="index"
              @click="driveTypeChange(item)"
              >{{ item.name }}</span
            >
          </div>
          <div class="media-box">
            <el-button type="primary" :icon="Mic" size="small" @click="openSelect">{{
              selectPPT.selectAudio ? selectPPT.selectAudio.name : '未选择'
            }}</el-button>
            <el-button
              type="success"
              :icon="Headset"
              size="small"
              @click="voiceData.show = !voiceData.show"
            />
          </div>
        </div>
        <div v-if="selectPPT.driverType == 1" style="position: relative">
          <div class="middle-textarea">
            <el-input
              v-model="selectPPT.pptRemark"
              ref="textareaRef"
              @mouseup="handlePptRemarkSelection"
              :rows="5"
              type="textarea"
              placeholder="请输入口播内容"
              show-word-limit
              maxlength="1200"
              resize="none"
            />
          </div>
          <div class="tool-box">
            <div class="tool-btn">
              <el-button type="primary" @click="openReplaceDialog" size="small">批量替换</el-button>
              <el-button type="primary" size="small">停顿</el-button>
              <el-button type="primary" size="small">多音字</el-button>
              <el-button type="primary" size="small">数字</el-button>
              <el-checkbox
                v-model="checked5"
                style="margin-left: 10px"
                label="多音字检测"
                size="small"
              />
              <QuestionFilled style="width: 1em; height: 1em" />
              <div></div>
            </div>
            <el-button type="primary" :icon="VideoPlay" size="small" @click="createAudio"
              >试听</el-button
            >
          </div>
          <div class="audio-play" v-if="showAudioPlay">
            <div>试听中...</div>
            <el-button @click="pauseAudio">取消试听</el-button>
          </div>
        </div>
        <div v-else class="audio-upload" style="position: relative">
          <div class="audio-play" v-if="startAudioPlay">
            <div>播放中...</div>
            <el-button @click="cancelAudio">取消播放</el-button>
          </div>
          <el-tooltip
            effect="dark"
            content="支持mp3,wav等格式;1GB以内;时长60分钟以内"
            placement="top"
          >
            <el-upload
              v-model:file-list="selectPPT.fileList"
              ref="uploadAudioRef"
              class="upload-demo"
              accept=".wav,.mp3"
              :limit="1"
              :headers="headers"
              :action="`${config.base_url}/infra/file/upload`"
              :on-success="handleAudioSuccess"
              :on-change="handleAudioChange"
              :on-preview="audioPlay"
              :on-exceed="audioExceed"
              :show-file-list="true"
            >
              <template #trigger>
                <el-button type="primary" :icon="Upload">上传音频</el-button>
              </template>
            </el-upload>
          </el-tooltip>
        </div>
      </div>
      <div class="template-box template-right" v-if="showDigitalHumanTool">
        <div class="tabs-1">
          <div
            class="tabs-item"
            v-for="item in tabs1"
            :key="item.itemValue"
            @click="tabs1Click(item)"
          >
            <div>{{ item.itemName }}</div>
            <span v-if="tabs1ActiveNum == item.itemValue"></span>
          </div>
        </div>
        <div class="tabs-2">
          <div
            :class="{ 'tabs-active': tabs2ActiveNum == item.itemValue }"
            v-for="item in tabs2"
            @click="tabs2Click(item)"
            :key="item.itemValue"
          >
            {{ item.itemName }}
          </div>
          <div
            :class="{ 'tabs-active': tabs3ActiveNum == item.itemValue }"
            v-for="item in tabs3"
            @click="tabs3Click(item)"
            :key="item.itemValue"
          >
            {{ item.itemName }}
          </div>
        </div>
        <div class="host-list">
          <div
            class="host-item"
            v-for="(item, index) in hostList"
            :key="index"
            @click="chooseHost(item)"
          >
            <div class="background"></div>
            <div class="host-name">{{ item.name }}</div>
            <el-image class="ppt-bg" :src="item.pictureUrl" fit="cover" />
          </div>
          <Pagination
            small="true"
            :total="total"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </div>
      </div>
      <!-- 模板设置 -->
      <div class="template-box template-right" v-if="showTemplateTool">
        <div class="tabs-2"> </div>
        <div class="template-list">
          <div
            class="template-item"
            v-for="(template, index) in templates"
            :key="index"
            @click="chooseTemplate(template)"
          >
            <div class="list-index" :style="template.isActive ? 'background: #409eff' : ''">
              {{ index + 1 }}
            </div>
            <el-image
              class="background"
              :src="template.previewImage"
              fit="contain"
            />
          </div>
        </div>
        <div class="apply-all">
          <el-checkbox v-model="applyAllTemplate" label="是否应用所有页面" />
        </div>
      </div>
      <!-- 背景设置 -->
      <div class="template-box template-right" v-if="showHeadImageTool">
        <div class="image-setting">
          <!--          上传图片成功后，将当前场景的背景修改为上传的图片url-->

          <div>上传图片</div>
          <UploadImg v-model="selectPPT.pictureUrl" :limit="1" />
        </div>
      </div>
      <!-- 画中画设置 -->
      <div class="template-box template-right" v-if="showInnerPictureTool">
        <div class="image-setting">
          <!--          上传图片成功后，将当前场景的画中画修改为上传的图片url-->

          <div>上传图片</div>
          <UploadImg v-model="selectPPT.innerPicture.src" :limit="1" />
        </div>
      </div>
      <div class="template-box template-right" v-if="showImageSet">
        <div class="image-setting">
          <div>图片属性</div>
          <div class="img-setting">
            <span class="setting-label">位置</span>
            X <el-input v-model="PPTpositon.x" type="number" :min="20" :max="460" /> Y
            <el-input v-model="PPTpositon.y" type="number" :min="20" :max="180" />
          </div>
          <div class="img-setting">
            <span class="setting-label">层级</span>
            <el-input v-model="PPTpositon.depth" type="number" :min="0" :max="999" />
          </div>
          <div class="img-setting">
            <span class="setting-label">大小</span>
            W <el-input v-model="PPTpositon.w" type="number" :min="20" :max="760" /> H
            <el-input v-model="PPTpositon.h" type="number" :min="20" :max="360" />
          </div>
        </div>
      </div>
      <div class="template-box template-tool">
        <div
          v-for="(item, index) in rightTools"
          :key="index"
          class="tool-item"
          @click="handleChangeTool(item)"
        >
          <img :src="item.isActive ? item.activeUrl : item.url" alt="" />
          <div class="tool-name" :style="item.isActive ? 'color:#0088fe' : ''">
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
    <uploadExplain ref="uploadExplainRef" @success="uploadSubmit" />
    <AudioSelect ref="audioSelect" @success="selectAudio" />
    <mergeWarningDialog ref="warningDialog" />
    <ReplaceDialog ref="replaceDialog" :ppt-arr="PPTArr" @submit="handleReplacement" />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import draggable from 'vuedraggable'

import Vue3DraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import { config } from '@/config/axios/config'
import { genFileId } from 'element-plus'
import type { UploadRawFile } from 'element-plus'
import { getAccessToken, getTenantId } from '@/utils/auth'
import * as pptTemplateApi from '@/api/pptTemplate'
import uploadExplain from './uploadExplain.vue'
import AudioSelect from './audioSelect.vue'
import mergeWarningDialog from './mergeWarningDialog.vue'
import ReplaceDialog from './replaceDialog.vue' // 引入批量替换组件
import template from '@/assets/imgs/template.png'
import templateActive from '@/assets/imgs/template-active.png'
import user from '@/assets/imgs/user.png'
import userActive from '@/assets/imgs/user-active.png'
import bg from '@/assets/imgs/bg.png'
import bgActive from '@/assets/imgs/bg-active.png'
import innerPicture from '@/assets/imgs/inner-picture.png'
import innerPictureActive from '@/assets/imgs/inner-picture-active.png'
//用户信息
import { useUserStore } from '@/store/modules/user'
import {
  Edit,
  ArrowLeft,
  Upload,
  Mic,
  Headset,
  Delete,
  QuestionFilled,
  VideoPlay,
  CopyDocument
} from '@element-plus/icons-vue'
import { generateUUID } from '@/utils'
import { useRoute, useRouter } from 'vue-router'
import { cloneDeep } from 'lodash-es'
const router = useRouter() // 路由
const route = useRoute() //
//用户信息
const userStore = useUserStore()
const userId = computed(() => userStore.user.id)
const message = useMessage()
const isEditing = ref(false)
const inputRef = ref(null)
// 切换到编辑模式
const toggleEdit = () => {
  isEditing.value = true
  editName.value = courseInfo.value.name
  nextTick(() => {
    inputRef.value.focus()
  })
}
// 保存编辑后的名称
const saveEdit = () => {
  isEditing.value = false
  courseInfo.value.name = editName.value
}

//课程基本信息
const courseInfo = ref({
  id: 0,
  accountId: userId.value,
  aspect: '16:9',
  name: '未命名草稿',
  duration: 0,
  status: 0,
  pageMode: 2,
  matting: 1,
  width: 1920,
  height: 1080,
})
// 当比例改变时更新宽度和高度
watch(() => courseInfo.value.aspect, (newAspect) => {
  courseInfo.value.width = newAspect === '16:9' ? 1920 : 1080
  courseInfo.value.height = newAspect === '16:9' ? 1080 : 1920
})

const editName = ref(courseInfo.value.name)
const viewSize = reactive({
  width: 800,
  height: (800 * 9) / 16
})
const thumViewSize = reactive({
  width: 152,
  height: (152 * 9) / 16
})
const digitalHumanSize = reactive({
  width: 150,
  height: 200
})
// 添加缩放比例计算
const scaleRatio = computed(() => ({
  width: courseInfo.value.width / viewSize.width, // 1920/800 = 2.4
  height: courseInfo.value.height / viewSize.height // 1080/450 = 2.4
}))

const PPTpositon = reactive({
  x: viewSize.width - digitalHumanSize.width,
  y: viewSize.height - digitalHumanSize.height,
  w: digitalHumanSize.width,
  h: digitalHumanSize.height,
  depth: 0,
  active: false
})

const componentsInfo = reactive({
  width: PPTpositon.w / 5,
  height: PPTpositon.h / 4,
  marginLeft: PPTpositon.x / 4,
  top: PPTpositon.y / 4.5,
  depth: PPTpositon.depth
})
//背景设置
const showHeadImageTool = ref(false)
//数字人设置
const showDigitalHumanTool = ref(false)
//模板设置
const showTemplateTool = ref(false)
//画中画设置
const showInnerPictureTool = ref(false)
//图片属性
const showImageSet = ref(false)
//是否将模板应用到所有页面
const applyAllTemplate = ref(false)

const xScale = viewSize.width / thumViewSize.width
// const yScale = viewSize.height / thumViewSize.height
//左侧ppt数字人位置
const leftWidth = computed(() => {
  return PPTpositon.w / xScale + 'px'
})
const leftHeight = computed(() => {
  return PPTpositon.h / xScale + 'px'
})
const leftTop = computed(() => {
  return PPTpositon.y / xScale + 'px'
})
const leftLeft = computed(() => {
  return PPTpositon.x / xScale + 'px'
})
const print = (val) => {
  console.log(val)
}
const state = reactive({
  dragging: false
})
//预设模板
const TEMPLATE_PRESETS = [
  {
    showBackground: true,
    showDigitalHuman: true,
    showPPT: true,
    PPTPositon: {
      w: 672, // 1613 / 2.4
      h: 379,  // 910 / 2.4
      x: 122,  // 293 / 2.4
      y: 20    // 48 / 2.4
    },
    HumanPositon: {
      w: 150,  // 360 / 2.4
      h: 198,  // 475 / 2.4
      x: 0,
      y: 252   // 605 / 2.4
    },
    bgImage:
      'http://36.103.251.108:48084/6f76ef1671f70f5676ae7e08eeb9dc240f16eaff0107c5ffeef38c9cbcf83d2d.png',//淡蓝
    previewImage:
      'http://36.103.251.108:48084/81cf41ad6bddb692a976700d813a3abe8a0ecd883d8281dac9e92ff644022b1e.png'
  },
  {
    showBackground: true,
    showDigitalHuman: true,
    showPPT: true,
    PPTPositon: {
      w: 672, // 1613 / 2.4
      h: 379,  // 910 / 2.4
      x: 122,  // 293 / 2.4
      y: 20    // 48 / 2.4
    },
    HumanPositon: {
      w: 150,  // 360 / 2.4
      h: 198,  // 475 / 2.4
      x: 0,
      y: 252   // 605 / 2.4
    },
    bgImage:
      'http://36.103.251.108:48084/e4118100e71818c3d81477fb1a80756c68670337865ae7717a6f5e3b050a58fb.png',//深蓝
    previewImage:
      'http://36.103.251.108:48084/a440e8c0606b23807d62129fa6490eaf90d65b5483abe6c5ab5c500b04fb50b1.png'
  },
  {
    showBackground: true,
    showDigitalHuman: true,
    showPPT: true,
    PPTPositon: {
      w: 672, // 1613 / 2.4
      h: 379,  // 910 / 2.4
      x: 122,  // 293 / 2.4
      y: 20    // 48 / 2.4
    },
    HumanPositon: {
      w: 150,  // 360 / 2.4
      h: 198,  // 475 / 2.4
      x: 0,
      y: 252   // 605 / 2.4
    },
    bgImage:
      'http://36.103.251.108:48084/874d9f3a4af1d82fbd4888e225ba2bf6a97f3f5e23ae9ff90e6e3f9c396c3ccb.png',//紫色
    previewImage:
      'http://36.103.251.108:48084/d3b0c9a6e0a651b57fc23cfb122d266e2ccc5b824836f58931bf8529c49a983b.png'
  },
  {
    showBackground: false,
    showDigitalHuman: true,
    showPPT: true,
    PPTPositon: {
      w: 800, // 1920 / 2.4
      h: 450, // 1080 / 2.4
      x: 0,
      y: 0
    },
    HumanPositon: {
      w: 150,  // 360 / 2.4
      h: 198,  // 475 / 2.4
      x: 650, // 1560 / 2.4
      y: 252   // 605 / 2.4
    },
    bgImage: '',
    previewImage: 'http://36.103.251.108:48084/3ebeff2dc6c13ac9e5a91dacf6dac2e454dc02a54d667ecc010ac95d1f98242f.png'
  }
] as const
const templates = ref(TEMPLATE_PRESETS.map(template => cloneDeep(template)))
 
const selectTemplate = ref(cloneDeep(templates.value[0]))

//数字人tab
const tabs1 = [
  {
    itemName: '模特',
    itemValue: '0'
  },
  {
    itemName: '我的',
    itemValue: '1'
  }
]
const tabs1ActiveNum = ref('0')
const tabs2ActiveNum = ref('')
const tabs2 = [
  {
    itemName: '全部',
    itemValue: ''
  },
  {
    itemName: '男',
    itemValue: '1'
  },
  {
    itemName: '女',
    itemValue: '2'
  }
]
const tabs3ActiveNum = ref()
const tabs3 = [
  {
    itemName: '站姿',
    itemValue: '1'
  },
  {
    itemName: '坐姿',
    itemValue: '2'
  }
]
const tabs1Click = (item) => {
  tabs1ActiveNum.value = item.itemValue
  getList()
}
const tabs2Click = (item) => {
  tabs2ActiveNum.value = item.itemValue
  getList()
}
const tabs3Click = (item) => {
  tabs3ActiveNum.value = item.itemValue
  getList()
}
//驱动类型
const selectDriveType = ref({
  name: '文本驱动',
  itemValue: 1,
  isActive: true
})
const driveType = reactive([
  {
    name: '文本驱动',
    itemValue: 1,
    isActive: true
  },
  {
    name: '声音驱动',
    isActive: false,
    itemValue: 2
  }
])
const driveTypeChange = (item) => {
  selectPPT.value.driverType = item.itemValue
}
//右侧设置
const rightTools = reactive([
  {
    name: '模板',
    url: template,
    activeUrl: templateActive,
    isActive: false
  },
  {
    name: '数字人',
    url: user,
    activeUrl: userActive,
    isActive: false
  },
  {
    name: '背景',
    url: bg,
    activeUrl: bgActive,
    isActive: false
  },
  {
    name: '画中画',
    url: innerPicture,
    activeUrl: innerPictureActive,
    isActive: false
  }
])
const handleChangeTool = (item) => {
  rightTools.forEach((child) => {
    if (child.name == item.name) {
      child.isActive = true
    } else {
      child.isActive = false
    }
  })
  if (item.name == '背景') {
    showHeadImageTool.value = true
    showTemplateTool.value = false
    showDigitalHumanTool.value = false
    showInnerPictureTool.value = false
  } else if (item.name == '数字人') {
    showHeadImageTool.value = false
    showTemplateTool.value = false
    showDigitalHumanTool.value = true
    showInnerPictureTool.value = false
  } else if (item.name == '模板') {
    showHeadImageTool.value = false
    showTemplateTool.value = true
    showDigitalHumanTool.value = false
    showInnerPictureTool.value = false
  } else if (item.name == '画中画') {
    showHeadImageTool.value = false
    showTemplateTool.value = false
    showDigitalHumanTool.value = false
    showInnerPictureTool.value = true
  }
}

const PPTArr = ref()
//ppt解析进度
const percentagePPT = ref(0)
const showLeftList = ref(true)

const selectPPT = ref({
  pictureUrl: '',
  innerPicture: {
    //定义画中画对象，属性与数字人相同
    name: '画中画',
    src: '',
    cover: '',
    width: 0,
    height: 0,
    originWidth: 0,
    originHeight: 0,
    category: 1,
    depth: 1,//画中画1-100
    top: 0,
    marginLeft: 0,
    businessId: generateUUID(),
    entityType: 0,
    entityId: '0'

  },
  pptRemark: '',
  driverType: 1,
  uploadAudioUrl: '',
  fileList: [] as any,
  selectAudio: {
    id: '',
    code: '',
    name: ''
  },
  showDigitalHuman: true
}) //选择的PPT
const checked5 = ref(false)
const options = [
  {
    value: '1',
    label: '16:9'
  },
  {
    value: '2',
    label: '9:16'
  }
]
const uploadRef = ref()
const headers = {
  Accept: 'application/json, text/plain, */*',
  Authorization: 'Bearer ' + getAccessToken(),
  'tenant-id': getTenantId()
}
//上传文件对象
const uploadFileObj = reactive({
  filename: '',
  size: 0,
  url: '',
  md5: '16b4c5e61897159b11405883ebd6749c',
  courseId: 23388,
  docType: 1,
  status: 0,
  extInfo: '{"addMode":true,"docType":1,"pptNotes":true,"pptContent":false,"notesPolish":false}',
  resolveType: 1
})
const handleExceed = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}
const handleChange = (files) => {
  uploadFileObj.filename = files.name
  uploadFileObj.size = files.size
}
const uploadExplainRef = ref()
const handleSuccess = (rawFile) => {
  message.success('上传成功！')
  uploadFileObj.url = rawFile.data
  uploadExplainRef.value.open()
  uploadRef.value!.clearFiles()
}
//上传音频
const uploadAudioRef = ref()
const handleAudioSuccess = (rawFile) => {
  console.log('--------', rawFile)
  message.success('上传成功！')
  selectPPT.value.uploadAudioUrl = rawFile.data
  // uploadAudioRef.value!.clearFiles();
  selectPPT.value.fileList = [
    {
      name: uploadAudioFile.value,
      url: rawFile.data
    }
  ]
}
const uploadAudioFile = ref()
const handleAudioChange = (files) => {
  uploadAudioFile.value = files.name
}
//ppt上传说明回调
const uploadSubmit = (uploadForm) => {
  console.log('-------ppt上传说明', uploadForm)
  pptTemplateApi.createPPT(uploadFileObj).then((res) => {
    if (res) {
      //将课程名称修改为附件名称
      courseInfo.value.name = uploadFileObj.filename.split('.').slice(0, -1).join('.')
      editName.value = courseInfo.value.name
      schedulePPT(res)
    }
  })
}
//解析ppt
const schedulePPTTimer = ref()
const schedulePPT = (id) => {
  percentagePPT.value = 0
  if (schedulePPTTimer.value) {
    clearInterval(schedulePPTTimer.value)
  }
  showLeftList.value = false
  schedulePPTTimer.value = setInterval(() => {
    pptTemplateApi.getSchedule(id).then((res) => {
      if (res && typeof res == 'string') {
        percentagePPT.value = parseInt(`${Number(res) * 100}`)
      } else if (res && res.length > 0) {
        console.log('selectTemplate',selectTemplate.value)
        res.forEach((item) => {
          item.isActive = false
          item.isChecked = false
          item.driverType = 1
          item.selectAudio = {}
          item.uploadAudioUrl = ''
          item.fileList = []
          item.businessId = generateUUID()
          item.width = courseInfo.value.width
          item.height = courseInfo.value.height
          let ppturl = item.pictureUrl;
          //是否展示背景 如果展示背景，则背景等于模板背景，否则为空
          if(selectTemplate.value.showBackground){
            item.pictureUrl = selectTemplate.value.bgImage
          }else{
            item.pictureUrl = ''
          }
          // 如果展示背景，并且展示ppt，则ppt放到画中画
          console.log('selectTemplate.value.PPTPositon.w',selectTemplate.value.PPTPositon.w
          ,'selectTemplate.value.PPTPositon.h',selectTemplate.value.PPTPositon.h
          ,'scaleRatio.value.width',scaleRatio.value.width
          ,'scaleRatio.value.height',scaleRatio.value.height
          )
          if (item.pictureUrl&&selectTemplate.value.showPPT) {
            item.innerPicture = { 
              name: '画中画',
              src: ppturl,
              cover: ppturl,
              width: selectTemplate.value.PPTPositon.w,
              height: selectTemplate.value.PPTPositon.h,
              originWidth: selectTemplate.value.PPTPositon.w,
              originHeight: selectTemplate.value.PPTPositon.h,
              category: 1,
              depth: 1,
              top: selectTemplate.value.PPTPositon.y,
              marginLeft: selectTemplate.value.PPTPositon.x,
              businessId: generateUUID(),
              entityType: 0,
              entityId: '0'
            }

            
          } 
          //如果不展示背景，则ppt放到背景，画中画为空
          else if(!item.pictureUrl&&selectTemplate.value.showPPT){
            item.pictureUrl = ppturl
            item.innerPicture = { 
              src: '',
              cover: '',
              width: 0,
              height: 0,
              top: 0,
              marginLeft: 0,
              category: 1
            }
          }
          // 初始化是否展示数字人
          item.showDigitalHuman = true
          // 数字人位置和尺寸也需要缩放
          PPTpositon.w = selectTemplate.value.HumanPositon.w
          PPTpositon.h = selectTemplate.value.HumanPositon.h
          PPTpositon.x = selectTemplate.value.HumanPositon.x
          PPTpositon.y = selectTemplate.value.HumanPositon.y
        })
        PPTArr.value = res
        PPTArr.value[0].isActive = true
        selectPPT.value = PPTArr.value[0]
        console.log('selectPPT.value',selectPPT.value)
        showLeftList.value = true
        clearInterval(schedulePPTTimer.value)
        //轮询保存课程
        saveInter()
      }
    })
  }, 2000)
}
//视频总字数、时长
const videoText = ref(0)
const videoDuration = ref('')
watch(
  () => PPTArr.value,
  (val) => {
    if (!val) {
      return
    }
    // 计算总字数
    videoText.value = val.reduce((prev, curr) => {
      return prev + (curr.pptRemark ? curr.pptRemark.length : 0)
    }, 0)
    //视频时长换算
    let videoTime = (videoText.value / 200) * 60
    videoDuration.value = formateVideoTime(Math.ceil(videoTime))
  },
  { deep: true }
)
//视频时长换算
const formateVideoTime = (times: any) => {
  let hours: any = parseInt(`${times / 60 / 60}`) // 计算小时数
  let restMinutes: any = parseInt(`${(times / 60) % 60}`) // 分钟数取余，得到剩余分钟数
  let seconds: any = parseInt(`${times % 60}`) // 将剩余分钟数转换为秒数
  if (hours < 10) {
    hours = '0' + hours
  }
  if (restMinutes < 10) {
    restMinutes = '0' + restMinutes
  }
  if (seconds < 10) {
    seconds = '0' + seconds
  }
  return hours + ':' + restMinutes + ':' + seconds
}
//取消解析ppt
const cancelAnalyze = () => {
  showLeftList.value = true
  clearInterval(schedulePPTTimer.value)
}
const copyDocument = (item, index) => {
  let copyItem = cloneDeep(item)
  copyItem.id = generateUUID()
  copyItem.isActive = false
  PPTArr.value.splice(index + 1, 0, copyItem)
}
const deleteDocument = (item) => {
  PPTArr.value = PPTArr.value.filter((child) => child.id !== item.id)
}
const deleteDigitalHuman = () => {
  selectPPT.value.showDigitalHuman = false
}
//删除画中画
const deleteInnerPicture = () => {
  selectPPT.value.innerPicture.src = ''
}
//删除多个ppt
const deleteMore = () => {
  let selected = PPTArr.value.filter((child) => child.isChecked == true)
  if (selected.length == 0) {
    message.warning('请先选择要删除的ppt')
  } else {
    let newPPTArr = PPTArr.value.filter((child) => child.isChecked !== true)
    PPTArr.value = newPPTArr
  }
}
/** 查询数字人列表 */
const hostList = ref()
const loading = ref(true) // 列表的加载中
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  type: '',
  gender: '',
  posture: ''
})
const getList = async () => {
  loading.value = true
  try {
    queryParams.type = tabs1ActiveNum.value
    queryParams.gender = tabs2ActiveNum.value
    queryParams.posture = tabs3ActiveNum.value
    let data = await pptTemplateApi.pageList(queryParams)
    //如果数字人列表 data为空 则切换type再查询一次
    if (data.list.length == 0) {
      queryParams.type = tabs1ActiveNum.value == '0' ? '1' : '0'
      tabs1ActiveNum.value = queryParams.type
      data = await pptTemplateApi.pageList(queryParams)
      if (data.list.length == 0) {
        //如果还是没有，则提示没有有效的数字人，请联系管理员
        message.error('没有有效的数字人，请联系管理员')
        return
      }
    }
    data.list.forEach((item) => {
      item.isActive = false
    })
    hostList.value = data.list
    selectHost.value = hostList.value[0]
    // 切换数字人姿势条件时，修改数字人在ppt的位置
    initHumanPositon(selectHost.value)
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const choosePPt = (item) => {
  PPTArr.value.forEach((child) => {
    if (child.id == item.id) {
      child.isActive = true
    } else {
      child.isActive = false
    }
  })
  selectPPT.value = item
}
const selectHost = ref() // 选择的数字人
const chooseHost = (item) => {
  console.log(item.pictureUrl)
  hostList.value.forEach((el) => {
    if (el.id == item.id) {
      el.isActive = true
    } else {
      el.isActive = false
    }
  })
  selectHost.value = item
  // 点击数字人列表中的图像时，修改数字人在ppt的位置
  initHumanPositon(item)
}
// 根据数字人的不同姿势初始化其在ppt的位置
const initHumanPositon = (data) => {
  if (data.posture === 1) {
    PPTpositon.x = viewSize.width - digitalHumanSize.width
    PPTpositon.y = viewSize.height - digitalHumanSize.height
    PPTpositon.w = digitalHumanSize.width
    PPTpositon.h = digitalHumanSize.height
  } else if (data.posture === 2) {
    PPTpositon.x = viewSize.width - digitalHumanSize.height
    PPTpositon.y = viewSize.height - digitalHumanSize.width
    PPTpositon.w = digitalHumanSize.height
    PPTpositon.h = digitalHumanSize.width
  }
}
//打开弹框
const audioSelect = ref()
const audioSelectData = ref()
const openSelect = () => {
  audioSelect.value.open()
}
const selectAudio = (data) => {
  audioSelectData.value = data
  // selectPPT.value.selectAudio = data[0]
  // 遍历所有场景，应用相同的声音模型
  PPTArr.value.forEach((scene) => {
    scene.selectAudio = data[0]
  })
}
//生成课程id
const coursesCreate = () => {
  const params = {
    accountId: userId.value
  }
  pptTemplateApi.coursesCreate(params).then((res) => {
    console.log(res)
    if (res) {
      courseInfo.value.id = res
    }
  })
}

//获取保存时间
const saveTime = ref()
const getSaveTime = () => {
  const date = new Date()
  let h: any = date.getHours() //hour
  let m: any = date.getMinutes() //minute
  let s: any = date.getSeconds() //second
  if (h < 10) {
    h = '0' + h
  }
  if (m < 10) {
    m = '0' + m
  }
  if (s < 10) {
    s = '0' + s
  }
  return h + ':' + m + ':' + s
}
const warningDialog = ref()

// 语速 音量
const voiceData = reactive({
  show: false,
  speechRate: 1,
  volume: 1,
  defaultSpeechRate: 1,
  defaultVolume: 1,
  marks: {
    0.6: '0.6',
    1: '1',
    1.5: '1.5'
  },
  marks2: {
    1: '1',
    1.5: '1.5',
    2: '2'
  }
})

const saveSubmit = (type) => {
  // 检查场景是否为空
  if (!PPTArr.value || PPTArr.value.length === 0) {
    message.warning('场景为空，请先上传PPT！')
    return
  }
  //保存课程
  let saveSubmitForm = {
    accountId: courseInfo.value.accountId,
    aspect: courseInfo.value.aspect,
    duration: courseInfo.value.duration,
    height: courseInfo.value.height,
    matting: courseInfo.value.matting,
    name: courseInfo.value.name,
    pageMode: courseInfo.value.pageMode,
    ppt: [],
    scenes: [],
    status: courseInfo.value.status,
    width: courseInfo.value.width,
    pageInfo: '',
    thumbnail: '',
    subtitlesStyle: '{}'
  }
  // if(type == "save"){
  Reflect.set(saveSubmitForm, 'id', courseInfo.value.id)
  // }else{
  //   Reflect.set(saveSubmitForm, "courseMediaId", courseInfo.value.id);
  // }

  //组装数据
  const scenes: any = []
  const pageInfo = {
    docInfo: {
      docType: 1,
      fileName: uploadFileObj.filename,
      fileSize: uploadFileObj.size
    },
    scenes: [] as any[]
  }
  let thumbnail = ''
  const { name, pictureUrl, code, type: digitalHumanType } = selectHost.value; // 解构以避免循环引用
  const digitalHumanComponents = { 
    name, 
    src: pictureUrl, 
    cover: pictureUrl, 
    width: PPTpositon.w * scaleRatio.value.width,
    height: PPTpositon.h * scaleRatio.value.height,
    originWidth: PPTpositon.w * scaleRatio.value.width,
    originHeight: PPTpositon.h * scaleRatio.value.height,
    category: 2, // 1: PPT, 2: 数字人, 3: 其他 
    depth: componentsInfo.depth, 
    top: PPTpositon.y * scaleRatio.value.height,
    marginLeft: PPTpositon.x * scaleRatio.value.width,
    entityId: code, 
    entityType: digitalHumanType, // 如果是数字人，则是数字人类型 0: 普通, 1: 专属 
    businessId: generateUUID(), 
    digitbotType: tabs1ActiveNum.value, 
    matting: 1, 
    marker: 1 
  }; 
  let pageNum = 1
  if (PPTArr.value && PPTArr.value.length > 0) {
    console.log('开始处理PPTArr数据');
    PPTArr.value.forEach((item, index) => {
      console.log(`处理第 ${index + 1} 个场景`);
      try {
        pageInfo.scenes.push(item.businessId);
        if (pageNum == 1) {
          thumbnail = item.pictureUrl;
          pageNum++;
        }
        
        const innerPictureCom = item.innerPicture;
        console.log('innerPictureCom:', JSON.stringify(innerPictureCom));

        const formatItem = {
          background: {
            backgroundType: item.backgroundType,
            entityId: '',
            width: courseInfo.value.width,
            height: courseInfo.value.height,
            depth: 0,
            src: item.pictureUrl,
            cover: item.pictureUrl,
            originWidth: item.width,
            originHeight: item.height,
            color: '#ffffff',
            pptRemark: item.pptRemark
          },
          components: [
            {
              ...cloneDeep(digitalHumanComponents), // 深拷贝
              status: item.showDigitalHuman ? 0 : 1
            },
            ...(item.innerPicture?.src ? [{
              ...cloneDeep(item.innerPicture),
              // 保存时放大画中画的尺寸和位置
              width: item.innerPicture.width * scaleRatio.value.width,
              height: item.innerPicture.height * scaleRatio.value.height,
              top: item.innerPicture.top * scaleRatio.value.height,
              marginLeft: item.innerPicture.marginLeft * scaleRatio.value.width,
              category: 1,
              id: undefined
            }] : [])
          ],
          driverType: item.driverType,
          duration: '',
          orderNo: index + 1,
          textDriver: {
            pitch: '',
            speed: '',
            speech_rate: voiceData.speechRate,
            volume: voiceData.volume,
            smartSpeed: '',
            textJson: item.pptRemark
          },
          audioDriver: {
            fileName: item.fileList && item.fileList[0]?.name,
            audioId: '',
            audioUrl: item.uploadAudioUrl,
            useVideoBackgroundAudio: ''
          },
          voice: {
            voiceId: item.selectAudio && item.selectAudio.id,
            entityId: item.selectAudio && item.selectAudio.code,
            tonePitch: '',
            voiceType: item.selectAudio && item.selectAudio.voiceType,
            speechRate: '',
            name: item.selectAudio && item.selectAudio.name
          },
          businessId: item.businessId
        };
        console.log('formatItem:', cloneDeep(formatItem));
        scenes.push(formatItem);
      } catch (error) {
        console.error(`处理第 ${index + 1} 个场景时出错:`, error);
        //抛出异常
        throw error
      }
    });
  }
  console.log('pageInfo:', JSON.stringify(pageInfo));
  console.log('thumbnail:', thumbnail);
  
  try {
    saveSubmitForm.pageInfo = JSON.stringify(pageInfo);
    saveSubmitForm.thumbnail = thumbnail;
    saveSubmitForm.scenes = cloneDeep(scenes);
    console.log('saveSubmitForm:', cloneDeep(saveSubmitForm));
  } catch (error) {
    console.error('保存表单数据时出错:', error);
  }

  if (type == 'save') {
    pptTemplateApi.coursesSave(stringifySafely(saveSubmitForm)).then((res) => {
      if (res) {
        message.success('保存成功！');
        saveTime.value = getSaveTime();
      }
    }).catch((error) => {
      console.error('保存课程时出错:', error);
    });
  } else {
    // 校验场景数据
    if (!PPTArr.value || PPTArr.value.length == 0) {
      message.warning('请先上传ppt!')
      return false
    }
    let warningStrArr: any = []
    PPTArr.value.forEach((item, index) => {
      if (!item.selectAudio || !item.selectAudio.code) {
        warningStrArr.push(
          `场景<span style="color: red; font-weight: bold;">${index + 1}</span>没有选择声音模型`
        )
      }
      if (item.driverType == 1) {
        if (!item.pptRemark) {
          warningStrArr.push(
            `场景<span style="color: red; font-weight: bold;">${index + 1}</span>无口播内容`
          )
        } else {
          //判断item.pptRemark超过1200个字，则提示
          if (item.pptRemark.length > 1200) {
            warningStrArr.push(
              `场景<span style="color: red; font-weight: bold;">${index + 1}</span>口播内容超过1200字，请减少或拆分场景`
            )
          }
          // 正则表达式检查阿拉伯数字和英文标点符号
          const arabicNumberReg = /\d{2,}/ // 匹配连续2个及以上阿拉伯数字
          // const punctuationReg = /[.,?!:;'"]/ // 匹配英文标点符号
          const htmlTagReg = /<[^>]*>/ // 匹配HTML标签
          if (arabicNumberReg.test(item.pptRemark)) {
            // 找出所有连续的阿拉伯数字
            const matches = item.pptRemark.match(/\d{2,}/g) || [];
            const numbersStr = matches.length > 0 ? 
              `(<span style="color: #ff4d4f">${matches.join('、')}</span>)` : '';
            warningStrArr.push(
              `场景<span style="color: red; font-weight: bold;">${index + 1}</span>口播内容包含连续阿拉伯数字${numbersStr}可能会出现误读，请修改为中文数字`
            )
          }
          // if (punctuationReg.test(item.pptRemark)) {
          //   warningStrArr.push(
          //     `场景<span style="color: red; font-weight: bold;">${index + 1}</span>口播内容包含英文标点符号，可能会出现误读，请修改为全角标点符号`
          //   )
          // }
          if (htmlTagReg.test(item.pptRemark)) {
            warningStrArr.push(
              `场景<span style="color: red; font-weight: bold;">${index + 1}</span>口播内容包含html标签，可能会出现误读，请修改`
            )
          }
        }
      } else {
        if (!item.uploadAudioUrl) {
          warningStrArr.push(
            `场景<span style="color: red; font-weight: bold;">${index + 1}</span>无音频内容`
          )
        }
      }
    })
    if (warningStrArr.length > 0) {
      // 使用 \n 换行符连接警告信息，并用 <div> 包裹每条警告
      warningDialog.value.open(warningStrArr.map((warning) => `<div>${warning}</div>`).join(''))
      return
    }
    //合成视频
    pptTemplateApi.megerMedia(saveSubmitForm).then((res) => {
      console.log('---------', res)
      if (res) {
        message.success('合成视频任务提交成功，请到我的视频中查看！')
      }
    })
  }
}
function stringifySafely(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return; // 循环引用时返回 undefined
            }
            seen.add(value);
        }
        return value;
    });
}
//定时保存
const saveTimer = ref()
const saveInter = () => {
  if (saveTimer.value) {
    clearInterval(saveTimer.value)
  }
  saveTimer.value = setInterval(() => {
    saveSubmit('save')
  }, 60000)
}
//生成试听
const showAudioPlay = ref(false) //显示试听
//显示声音驱动的文件播放弹框
const startAudioPlay = ref(false)
const textareaRef = ref()
const selectTextarea = ref('')
//上传音频文件超出限制后的提示
const audioExceed = () => {
  message.warning('最多上传一个声音驱动文件！')
}
const currentAudio = ref()

const handlePptRemarkSelection = () => {
  if (textareaRef.value) {
    const textarea = textareaRef.value.$el.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      if (start !== end) {
        selectTextarea.value = textarea.value.substring(start, end)
        console.log('选中的文本:', selectTextarea.value)
      } else {
        selectTextarea.value = ''
        console.log('没有选中任何文本')
      }
    }
  }
}
const createAudio = async () => {
  if (!audioSelectData.value || audioSelectData.value.length == 0) {
    message.warning('请选择声音模型！')
    return false
  }
  if (!selectTextarea.value || selectTextarea.value.length == 0) {
    message.warning('请划选至少一个汉字')
    return false
  }
  const params = {
    text: selectTextarea.value,
    speed: 18,
    pitch: 17,
    volume: 45,
    voiceType: 37,
    voiceTypeId: 51,
    voiceId: audioSelectData.value[0].id,
    smartSpeed: 34
  }
  showAudioPlay.value = true
  pptTemplateApi
    .createAudio(params)
    .then((res) => {
      if (res && !res.error) {
        // 如果返回结果有效且没有错误，初始化Audio
        currentAudio.value = new Audio(res)
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
//声音驱动的文件
const currentAudioFile = ref()
//声音驱动的文件播放
const audioPlay = (file) => {
  // 确保 file.response.data 是一个有效的 URL
  if (!file.response.data) {
    message.error('未获取到文件')
    return
  }
  // 停止当前播放的音频（如果存在）
  if (currentAudioFile.value) {
    currentAudioFile.value.pause()
    currentAudioFile.value.currentTime = 0 // 重置播放位置
  }

  // 创建新的 Audio 实例
  const audio = new Audio(file.response.data)
  currentAudioFile.value = audio

  // 监听播放结束事件
  audio.addEventListener('ended', () => {
    cancelAudio()
  })

  // 开始播放
  startAudioPlay.value = true
  audio.play()
}
//取消声音驱动的文件播放
const cancelAudio = () => {
  if (currentAudioFile.value) {
    currentAudioFile.value.pause()
    // 可选：重置播放位置
    currentAudioFile.value.currentTime = 0
    currentAudioFile.value = null
  }
  startAudioPlay.value = false
}
//返回
const goBack = () => {
  router.go(-1)
}
const getCourseDetail = (id) => {
  pptTemplateApi.coursesDetail(id).then((res) => {
    console.log(res)
    if (res) {
      //回显数据处理
      // 课程基本信息
      courseInfo.value = res
      if (res.scenes && res.scenes.length > 0) {
        //左侧数据列表
        res.scenes.forEach((item) => {
          item.isActive = false
          item.isChecked = false
          item.pictureUrl = item.background.src
          item.pptRemark = item.background.pptRemark
          item.backgroundType = item.background.backgroundType
          item.width = item.background.width
          item.height = item.background.height
          item.showDigitalHuman = item.components.find((p) => p.category == 2).status == 0 //根据数字人模板的status判断是否显示数字人
          // 画中画位置和尺寸缩小
          const innerPicture = item.components.find((p) => p.category == 1)
          if (innerPicture) {
            item.innerPicture = {
              ...innerPicture,
              width: innerPicture.width / scaleRatio.value.width,
              height: innerPicture.height / scaleRatio.value.height,
              top: innerPicture.top / scaleRatio.value.height,
              marginLeft: innerPicture.marginLeft / scaleRatio.value.width
            }
          }
        })
        PPTArr.value = res.scenes
        PPTArr.value[0].isActive = true
        selectPPT.value = PPTArr.value[0]
        console.log('getCourseDetail selectPPT.value:', selectPPT.value)
        // selectPPT.value.uploadAudioUrl = PPTArr.value[0].audioDriver?.audioUrl;
        // selectPPT.value.selectAudio = PPTArr.value[0].voice;
        // 遍历所有场景，应用相同的声音模型
        PPTArr.value.forEach((scene, index) => {
          //如果res.scenes[index] 有voice且不为空
          if (res.scenes[index].voice) {
            scene.selectAudio = res.scenes[index].voice
            scene.selectAudio.code = res.scenes[index].voice.entityId
            scene.selectAudio.id = res.scenes[index].voice.voiceId
          }
          scene.uploadAudioUrl = res.scenes[index].audioDriver?.audioUrl
        })
        if (PPTArr.value[0].audioDriver?.fileName && PPTArr.value[0].audioDriver?.audioUrl) {
          selectPPT.value.fileList = [
            {
              name: PPTArr.value[0].audioDriver?.fileName,
              url: PPTArr.value[0].audioDriver?.audioUrl
            }
          ]
        }
        //选择的数字人信息
        const hostInfo = res.scenes[0].components.find(component => component.category === 2)
        hostList.value.forEach((item) => {
          if (item.code == hostInfo.entityId) {
            selectHost.value = item
          }
        })
        if (hostInfo) {
          PPTpositon.w = hostInfo.width / scaleRatio.value.width
          PPTpositon.h = hostInfo.height / scaleRatio.value.height
          PPTpositon.x = hostInfo.marginLeft / scaleRatio.value.width
          PPTpositon.y = hostInfo.top / scaleRatio.value.height
        }
        // selectHost.value.name = hostInfo.name;
        // selectHost.value.pictureUrl = hostInfo.src;
        // selectHost.value.id = hostInfo.entityId;
        //数字人位置信息
        componentsInfo.width = hostInfo.width
        componentsInfo.height = hostInfo.height
        componentsInfo.top = hostInfo.top
        componentsInfo.marginLeft = hostInfo.marginLeft
        componentsInfo.depth = hostInfo.depth
        //数字人类型
        tabs1ActiveNum.value = hostInfo.digitbotType
        driveType.forEach((child) => {
          if (child.name == hostInfo.driverType) {
            selectDriveType.value = child
          }
        })
        //选择声音信息
        const voiceInfo = res.scenes[0].voice
        audioSelectData.value = [
          {
            id: voiceInfo.voiceId,
            entityId: voiceInfo.entityId,
            name: voiceInfo.name
          }
        ]
      }
      //上传文件信息
      const pageInfo = res.pageInfo ? JSON.parse(res.pageInfo) : ''
      uploadFileObj.filename = pageInfo ? pageInfo.docInfo.fileName : ''
      uploadFileObj.size = pageInfo ? pageInfo.docInfo.fileSize : ''

      //应用模板 这里用户可能已经调整了模板，所以这里不应用模板
      // applyTemplate()
    }
  })
}
//选择模板
const chooseTemplate = (currTemplate) => {
  selectTemplate.value = cloneDeep(currTemplate)
  console.log('选择的模板信息:', currTemplate)
  templates.value.forEach((item) => {
    item.isActive = false
  })
  currTemplate.isActive = true
  applyTemplate()
}

const applyTemplate = (ppt = null) => {
  const template = selectTemplate.value
  const pptList = applyAllTemplate.value ? PPTArr.value : [selectPPT.value]

  //数字人是统一生效的，先处理

  pptList.forEach((item) => {
    // 保存原始ppt图片
    const originalPPT = item.innerPicture?.src || item.pictureUrl
    console.log('originalPPT', originalPPT)
    if (template.showBackground) {
      item.pictureUrl = template.bgImage
      if (template.showPPT) {
        item.innerPicture = {
          name: '画中画',
          src: originalPPT,
          cover: template.bgImage,
          width: template.PPTPositon.w,
          height: template.PPTPositon.h,
          top: template.PPTPositon.y,
          marginLeft: template.PPTPositon.x,
          category: 1,
          depth: 1,
          businessId: generateUUID(),
          entityType: 1,
          originHeight: courseInfo.value.height,
          originWidth: courseInfo.value.width,
          entityId: 1
        }
      }
    } else {
      item.pictureUrl = originalPPT
      item.innerPicture.src = ""
    }
    
    item.showDigitalHuman = template.showDigitalHuman
  })
  // 数字人位置也需要缩放
  PPTpositon.w = selectTemplate.value.HumanPositon.w
  PPTpositon.h = selectTemplate.value.HumanPositon.h
  PPTpositon.x = selectTemplate.value.HumanPositon.x
  PPTpositon.y = selectTemplate.value.HumanPositon.y
}

const replaceDialog = ref(null)

// 打开弹出框
const openReplaceDialog = () => {
  replaceDialog.value.open()
}

// 处理提交的替换规则
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 转义正则中的特殊字符
}

const handleReplacement = (replacements) => {
  PPTArr.value.forEach((item) => {
    if (item.pptRemark) {
      replacements.forEach((replacement) => {
        const fromEscaped = escapeRegExp(replacement.from) // 转义特殊字符
        const regExp = new RegExp(fromEscaped, 'g') // 使用转义后的字符串构造正则表达式
        item.pptRemark = item.pptRemark.replace(regExp, replacement.to)
      })
    }
  })
  message.success('批量替换成功！')
}

onMounted(async () => {
  await getList()
  if (route.query.id) {
    await getCourseDetail(route.query.id)
    saveInter() // 启动定时保存
  } else {
    coursesCreate()
  }
})
onUnmounted(() => {
  clearInterval(saveTimer.value)
  clearInterval(schedulePPTTimer.value)
  if (currentAudioFile.value) {
    currentAudioFile.value.removeEventListener('ended', cancelAudio)
    currentAudioFile.value = null
  }
})
</script>
<style scoped lang="scss">
.pages {
  height: 100%;
  background-color: #f5f7fa;
}

.minddle-host-image {
  z-index: 3;
  width: 100%;
  height: 100%;
}

.template-top {
  display: flex;
  height: 60px;
  padding: 0 30px;
  line-height: 60px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  box-shadow: 0 3px 6px rgb(175 175 175 / 16%);
  justify-content: space-between;

  .top-left {
    display: flex;
    align-items: center;

    .top-icon {
      display: flex;
      align-items: center;
    }

    .back-text {
      margin-right: 20px;
      margin-left: 10px;
      cursor: pointer;
    }

    span {
      margin: 0 25px;
    }
  }

  .top-right {
    span {
      margin: 0 20px;
    }
  }
}

.template-main {
  display: flex;
  height: calc(100% - 82px);
  padding: 10px;
  justify-content: space-around;

  .template-left {
    position: relative;
    width: 180px;
    background-color: #fff;
    border: 1px solid #ebeef5;
    box-shadow: 0 3px 6px rgb(175 175 175 / 16%);

    .page {
      margin: 0;

      div {
        // height: 30px;
        padding: 5px 10px;
        margin: 0;
        line-height: 30px;
        border-bottom: 1px solid #ebeef5;
      }

      .line {
        width: 30px;
        height: 3px;
        padding: 0;
        margin: 0;
        background-color: aqua;
      }

      .upload-demo {
        text-align: center;
      }
    }

    .left-upload-setting {
      display: flex;
      height: calc(100% - 86px);
      padding: 0 20px;
      text-align: center;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      div {
        line-height: 40px;
      }

      ::v-deep(.el-progress-bar) {
        width: 180px;
      }

      .el-button {
        margin: 20px 0;
      }
    }

    .image-list {
      height: calc(100% - 70px);
      padding: 10px;
      overflow: hidden auto;
      border-bottom: 1px solid #ebeef5;

      .list {
        position: relative;
        height: calc(152px * 9 / 16); // 使用缩略图的固定高度
        margin: 20px 0;
        box-sizing: content-box;

        .list-index {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 100;
          width: 25px;
          height: 25px;
          line-height: 25px;
          color: #fff;
          text-align: center;
          background: #122121;
          border-radius: 5px;
        }

        // 确保背景图片填充整个容器
        .background {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .ppt-bg {
          z-index: 2;
          // width: 152px;
          // height: 100%;
        }

        .host {
          position: absolute;
          z-index: 3;
        }

        .icon-content {
          position: absolute;
          top: 0;
          right: 10px;
          display: flex;
          cursor: pointer;
          align-items: center;
          z-index: 4;
        }
      }
    }

    .page-btn {
      position: absolute;
      bottom: 10px;
      width: 85%;
      padding: 0 10px;
    }
  }

  .template-middle {
    display: flex;
    width: 56%;
    background-color: #fff;
    box-shadow: 0 3px 6px rgb(175 175 175 / 16%);
    flex-grow: 1; // 确保中间区域可以自适应高度
    flex-direction: column;
    justify-content: flex-start;

    .middle-top {
      padding: 5px 20px;
    }

    .main-box {
      display: flex;
      padding: 10px 20px;
      border: 1px solid #ebeef5;
      justify-content: center;

      .main-image-box {
        position: relative;
        // width: 760px;
        // height: 360px;
        border: 1px solid #ebeef5;
        box-sizing: content-box;
      }

      .list {
        position: relative;
        display: flex;
        width: 95%;
        justify-content: center;
      }

      .ppt-bg {
        z-index: 2;
        width: 100%;
        height: 100%;
      }

      .host {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 300px;
      }
    }

    .voice-main {
      display: flex;
      justify-content: space-between;
      padding: 10px;

      .voice-item {
        width: 180px;
        height: 30px;
        overflow: hidden;
        cursor: pointer;
        background-color: #c9c9c9;
        border-radius: 12px;

        span {
          display: inline-block;
          width: 50%;
          height: 30px;
          line-height: 30px;
          text-align: center;
        }

        .active-item {
          color: #fff;
          background-color: #409eff;
        }
      }

      .media-box {
        display: flex;
        align-items: center;

        .mic {
          display: flex;
          align-items: center;
          width: 50px;
          justify-content: space-around;
          padding: 5px 10px;
        }
      }
    }

    .audio-upload {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
    }

    .middle-textarea {
      padding: 5px 20px;
    }

    .tool-box {
      display: flex;
      padding: 10px;
      border-top: 1px solid #ebeef5;
      justify-content: space-between;

      .tool-btn {
        display: flex;
        align-items: center;
      }
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
  }

  .template-right {
    position: relative;
    width: 20%;
    background-color: #fff;
    box-shadow: 0 3px 6px rgb(175 175 175 / 16%);

    .tabs-1 {
      display: flex;
      justify-content: space-around;
      padding: 10px 30px;
      border-bottom: 1px solid #ebeef5;

      .tabs-item {
        width: 30px;
        font-size: 14px;
        text-align: center;
        cursor: pointer;

        span {
          display: block;
          width: 30px;
          height: 2px;
          margin-top: 5px;
          background: #409eff;
        }
      }
    }

    .tabs-2 {
      display: flex;
      padding: 10px;
      justify-content: space-around;

      div {
        width: 60px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        cursor: pointer;
        border-radius: 5px;
      }

      .tabs-active {
        color: #fff !important;
        background-color: #409eff;
      }
    }

    .apply-all {
      position: absolute;
      bottom: 80px;
      display: flex;
      width: 100%;
      justify-content: center;
    }

    .host-list {
      height: 90%;
      overflow-y: auto;
      border-top: 1px solid #ebeef5;

      .host-item {
        position: relative;
        display: inline-block;
        width: 45%;
        height: 200px;
        margin: 5px 0;
        margin-left: 10px;
        cursor: pointer;

        .background {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1; /* 背景在底层 */
          width: 100%;
          height: 100%;
          background-color: #f0f1fa; /* 设置底色 */
        }

        .host-name {
          position: absolute;
          bottom: 10px;
          left: 5px;
          z-index: 100;
          width: 30px;
          height: 20px;
          font-size: 10px;
          line-height: 20px;
          text-align: center;
          background: rgb(225 225 225 / 70%);
          border-radius: 5px;
        }

        .ppt-bg {
          z-index: 2; /* 图片在背景之上 */
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .image-setting {
    padding: 10px 20px;

    .img-setting {
      display: flex;
      align-items: center;
      line-height: 40px;

      .setting-label {
        width: 120px;
      }

      ::v-deep(.el-input) {
        width: 170px;
        margin-left: 10px;
      }
    }
  }

  .template-list {
    height: 90%;
    overflow-y: auto;
    border-top: 1px solid #ebeef5;

    .template-item {
      position: relative;
      display: inline-block;
      width: 224px;
      height: 126px;
      margin: 5px 0;
      margin-left: 10px;
      cursor: pointer;
      .list-index {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 100;
        width: 25px;
        height: 25px;
        line-height: 25px;
        color: #fff;
        text-align: center;
        background: #122121;
        border-radius: 5px;
      }
      .ppt-bg {
        position: absolute;
        z-index: 2; /* 图片在背景之上 */
      }

      .human-image {
        position: absolute;
        z-index: 3; /* 图片在背景之上 */
      }
    }
  }

  .background {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1; /* 背景在底层 */
    width: 100%;
    height: 100%;
    background-color: #f0f1fa; /* 设置底色 */
  }

  .template-tool {
    width: 60px;
    padding: 10px;
    background-color: #fff;
    box-shadow: 0 3px 6px rgb(175 175 175 / 16%);

    .tool-item {
      display: flex;
      padding: 10px 20px;
      cursor: pointer;
      flex-direction: column;
      align-items: center;

      img {
        width: 32px;
        height: 32px;
      }

      .tool-name {
        width: 60px;
        margin-top: 6px;
        font-size: 14px;
        line-height: 10px;
        text-align: center;
      }
    }
  }
}

::v-deep(.el-pagination) {
  position: absolute;
  bottom: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

/* 滑块样式 */
::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 6px;
}

/* 滚动条轨道样式 */
::-webkit-scrollbar-track {
  background-color: #f2f2f2;
  border-radius: 6px;
}

.voice-card :deep(.el-card__body) {
  padding: 0;
}

.speech-slider {
  &:deep(.el-slider__bar) {
    display: none;
  }

  &:deep(.el-slider__runway) {
    height: 2px;
  }

  &:deep(.el-slider__button-wrapper) {
    top: -17px;
  }

  &:deep(.el-slider__marks-stop) {
    top: -5px;
    width: 12px;
    height: 12px;
    background-color: #1989fa;
  }
}
</style>
