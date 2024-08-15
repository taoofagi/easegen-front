<template>
  <div class="pages">
    <div class="template-top">
      <div class="top-left">
        <div style="font-size: 16px" class="top-icon">
          <ArrowLeft style="width: 1em; height: 1em" />
        </div>
        <span class="back-text" @click="goBack">返回</span>
        <el-input
          v-model="courseInfo.name"
          style="width: 140px"
          size="small"
          placeholder="请输入课程名称"
          :prefix-icon="Edit"
        />
        <span>时长: {{ videoDuration }}</span>
        <span>总字数:{{ videoText }}</span>
      </div>
      <div class="top-right">
        <span v-if="saveTime">{{ saveTime }} 已保存</span>
        <el-button size="small" @click="saveSubmit('save')">保存</el-button>
        <el-button type="primary" size="small" @click="saveSubmit('')"
          >合成视频</el-button
        >
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
            accept=".ppt,.pptx"
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
                    <el-image
                      class="ppt-bg"
                      :style="element.isActive ? 'border-color: #0683ee' : ''"
                      :src="element.pictureUrl"
                      fit="cover"
                    />
                    <el-image
                      class="host"
                      :style="{
                        width: leftWidth,
                        height: leftHeight,
                        top: leftTop,
                        left: leftLeft,
                      }"
                      :src="selectHost ? selectHost.pictureUrl : ''"
                      fit="cover"
                    />
                    <div
                      class="list-index"
                      :style="element.isActive ? 'background: #409eff' : ''"
                    >
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
            <el-button
              type="primary"
              size="small"
              :icon="Delete"
              @click.stop="deleteMore"
            />
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
      <div class="template-box template-middle">
        <div class="middle-top">
          <el-select
            v-model="courseInfo.aspect"
            placeholder="Select"
            style="width: 140px"
          >
            <el-option
              v-for="item in options"
              :key="item.label"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </div>
        <div class="main-box">
          <div class="list">
            <div class="main-image-box">
              <el-image class="ppt-bg" :src="selectPPT.pictureUrl" fit="cover" />
              <Vue3DraggableResizable
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
              >
                <el-image
                  class="minddle-host-image"
                  :src="selectHost ? selectHost.pictureUrl : ''"
                  fit="cover"
                />
              </Vue3DraggableResizable>
            </div>
          </div>
        </div>
        <div class="voice-main">
          <el-text class="mx-1" type="primary" size="small">口播内容</el-text>
          <div class="voice-item">
            <span
              :class="item.isActive ? 'active-item' : ''"
              v-for="(item, index) in driveType"
              :key="index"
              @click="driveTypeChange(item)"
              >{{ item.name }}</span
            >
          </div>
          <div class="media-box">
            <el-button type="primary" :icon="Mic" size="small" @click="openSelect"
              >晓晨</el-button
            >
            <el-button type="success" :icon="Headset" size="small" />
          </div>
        </div>
        <div v-if="selectDriveType.itemValue == 1" style="position: relative">
          <div class="middle-textarea">
            <el-input
              v-model="selectPPT.pptRemark"
              ref="textareaRef"
              :rows="3"
              type="textarea"
              placeholder="请输入口播内容"
              show-word-limit
              maxlength="10000"
              resize="none"
            />
          </div>
          <div class="tool-box">
            <div class="tool-btn">
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
        <div v-else class="audio-upload">
          <el-tooltip
            effect="dark"
            content="支持mp3,wav等格式;1GB以内;时长60分钟以内"
            placement="top"
          >
            <el-upload
              ref="uploadAudioRef"
              class="upload-demo"
              accept=".wav,.mp3"
              :limit="1"
              :headers="headers"
              :action="`${config.base_url}/infra/file/upload`"
              :on-success="handleAudioSuccess"
              :show-file-list="false"
            >
              <template #trigger>
                <el-button type="primary" :icon="Upload">上传音频</el-button>
              </template>
            </el-upload>
          </el-tooltip>
        </div>
      </div>
      <div class="template-box template-right" v-if="!showHeadImageTool">
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
      <div class="template-box template-right" v-if="showHeadImageTool">
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
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import draggable from "vuedraggable";

import Vue3DraggableResizable from "vue3-draggable-resizable";
import "vue3-draggable-resizable/dist/Vue3DraggableResizable.css";
import { config } from "@/config/axios/config";
import { genFileId } from "element-plus";
import type { UploadRawFile } from "element-plus";
import { getAccessToken, getTenantId } from "@/utils/auth";
import * as pptTemplateApi from "@/api/pptTemplate";
import uploadExplain from "./uploadExplain.vue";
import AudioSelect from "./audioSelect.vue";
import user from "@/assets/imgs/user.png";
import userActive from "@/assets/imgs/user-active.png";
import bg from "@/assets/imgs/bg.png";
import bgActive from "@/assets/imgs/bg-active.png";
//用户信息
import { useUserStore } from "@/store/modules/user";
import {
  Edit,
  ArrowLeft,
  Upload,
  Mic,
  Headset,
  Delete,
  QuestionFilled,
  VideoPlay,
  CopyDocument,
} from "@element-plus/icons-vue";
import { generateUUID } from "@/utils";
import { useRoute, useRouter } from "vue-router";
import { cloneDeep } from "lodash-es";
const router = useRouter(); // 路由
const route = useRoute(); //
//用户信息
const userStore = useUserStore();
const userId = computed(() => userStore.user.id);
const message = useMessage();
//课程基本信息
const courseInfo = ref({
  id: 0,
  accountId: "",
  aspect: "16:9",
  name: "未命名草稿",
  duration: 0,
  status: 0,
  pageMode: 2,
  matting: 1,
  height: 1080,
  width: 1920,
});
const PPTpositon = reactive({
  x: 450,
  y: 150,
  h: 180,
  w: 300,
  depth: 0,
  active: false,
});
const componentsInfo = reactive({
  width: PPTpositon.w / 3,
  height: PPTpositon.h / 3,
  marginLeft: PPTpositon.x / 3,
  top: PPTpositon.y / 3,
  depth: PPTpositon.depth,
});
//PPT数字人头像设置
const showHeadImageTool = ref(false);
//左侧ppt数字人位置
const leftWidth = computed(() => {
  return PPTpositon.w / 3 + "px";
});
const leftHeight = computed(() => {
  return PPTpositon.h / 3 + "px";
});
const leftTop = computed(() => {
  return PPTpositon.y / 3 + "px";
});
const leftLeft = computed(() => {
  return PPTpositon.x / 3 + "px";
});
const print = (val) => {
  console.log(val);
};
const state = reactive({
  dragging: false,
});
//数字人tab
const tabs1 = [
  {
    itemName: "模特",
    itemValue: "0",
  },
  {
    itemName: "我的",
    itemValue: "1",
  },
];
const tabs1ActiveNum = ref("0");
const tabs2ActiveNum = ref("");
const tabs2 = [
  {
    itemName: "全部",
    itemValue: "",
  },
  {
    itemName: "男",
    itemValue: "1",
  },
  {
    itemName: "女",
    itemValue: "2",
  },
];
const tabs3ActiveNum = ref();
const tabs3 = [
  {
    itemName: "站姿",
    itemValue: "1",
  },
  {
    itemName: "坐姿",
    itemValue: "2",
  },
];
const tabs1Click = (item) => {
  tabs1ActiveNum.value = item.itemValue;
  getList();
};
const tabs2Click = (item) => {
  tabs2ActiveNum.value = item.itemValue;
  getList();
};
const tabs3Click = (item) => {
  tabs3ActiveNum.value = item.itemValue;
  getList();
};
//驱动类型
const selectDriveType = ref({
  name: "文本驱动",
  itemValue: 1,
  isActive: true,
});
const driveType = reactive([
  {
    name: "文本驱动",
    itemValue: 1,
    isActive: true,
  },
  {
    name: "声音驱动",
    isActive: false,
    itemValue: 2,
  },
]);
const driveTypeChange = (item) => {
  selectDriveType.value = item;
  driveType.forEach((child) => {
    if (child.name == item.name) {
      child.isActive = true;
    } else {
      child.isActive = false;
    }
  });
};
//右侧设置
const rightTools = reactive([
  {
    name: "数字人",
    url: user,
    activeUrl: userActive,
    isActive: true,
  },
  {
    name: "背景",
    url: bg,
    activeUrl: bgActive,
    isActive: false,
  },
]);
const handleChangeTool = (item) => {
  rightTools.forEach((child) => {
    if (child.name == item.name) {
      child.isActive = true;
    } else {
      child.isActive = false;
    }
  });
  if (item.name == "背景") {
    showHeadImageTool.value = true;
  } else {
    showHeadImageTool.value = false;
  }
};

const PPTArr = ref();
//ppt解析进度
const percentagePPT = ref(0);
const showLeftList = ref(true);

const selectPPT = ref({
  pictureUrl: "",
  pptRemark: "",
}); //选择的PPT
const checked5 = ref(false);
const options = [
  {
    value: "1",
    label: "16:9",
  },
  {
    value: "2",
    label: "16:10",
  },
];
const uploadRef = ref();
const headers = {
  Accept: "application/json, text/plain, */*",
  Authorization: "Bearer " + getAccessToken(),
  "tenant-id": getTenantId(),
};
//上传文件对象
const uploadFileObj = reactive({
  filename: "",
  size: 0,
  url: "",
  md5: "16b4c5e61897159b11405883ebd6749c",
  courseId: 23388,
  docType: 1,
  status: 0,
  extInfo:
    '{"addMode":true,"docType":1,"pptNotes":true,"pptContent":false,"notesPolish":false}',
  resolveType: 1,
});
const handleExceed = (files) => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
};
const handleChange = (files) => {
  uploadFileObj.filename = files.name;
  uploadFileObj.size = files.size;
};
const uploadExplainRef = ref();
const handleSuccess = (rawFile) => {
  message.success("上传成功！");
  uploadFileObj.url = rawFile.data;
  uploadExplainRef.value.open();
  uploadRef.value!.clearFiles();
};
//上传音频
const uploadAudioRef = ref();
const uploadAudioUrl = ref();
const handleAudioSuccess = (rawFile) => {
  message.success("上传成功！");
  uploadAudioUrl.value.url = rawFile.data;
  uploadAudioRef.value!.clearFiles();
};
//ppt上传说明回调
const uploadSubmit = (uploadForm) => {
  console.log("-------ppt上传说明", uploadForm);
  pptTemplateApi.createPPT(uploadFileObj).then((res) => {
    if (res) {
      schedulePPT(res);
    }
  });
};
//解析ppt
const schedulePPTTimer = ref();
const schedulePPT = (id) => {
  showLeftList.value = false;
  schedulePPTTimer.value = setInterval(() => {
    pptTemplateApi.getSchedule(id).then((res) => {
      if (res && typeof res == "string") {
        percentagePPT.value = parseInt(`${Number(res) * 100}`);
      } else if (res && res.length > 0) {
        res.forEach((item) => {
          item.isActive = false;
          item.isChecked = false;
          item.businessId = generateUUID();
        });
        PPTArr.value = res;
        PPTArr.value[0].isActive = true;
        selectPPT.value = PPTArr.value[0];
        showLeftList.value = true;
        clearInterval(schedulePPTTimer.value);
        //轮询保存课程
        saveInter();
      }
    });
  }, 5000);
};
//视频总字数、时长
const videoText = ref();
const videoDuration = ref();
watch(
  () => PPTArr.value,
  (val) => {
    if (!val) {
      return;
    }
    // 计算
    videoText.value = val.reduce(
      (prev, curr) => (prev + curr.pptRemark ? curr.pptRemark.length : 0),
      0
    );
    //视频时长换算
    let videoTime = (videoText.value / 200) * 60;
    videoDuration.value = formateVideoTime(Math.ceil(videoTime));
  },
  { deep: true }
);
//视频时长换算
const formateVideoTime = (times: any) => {
  let hours: any = parseInt(`${times / 60 / 60}`); // 计算小时数
  let restMinutes: any = parseInt(`${(times / 60) % 60}`); // 分钟数取余，得到剩余分钟数
  let seconds: any = parseInt(`${times % 60}`); // 将剩余分钟数转换为秒数
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (restMinutes < 10) {
    restMinutes = "0" + restMinutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + restMinutes + ":" + seconds;
};
//取消解析ppt
const cancelAnalyze = () => {
  showLeftList.value = true;
  clearInterval(schedulePPTTimer.value);
};
const copyDocument = (item, index) => {
  let copyItem = cloneDeep(item);
  pptTemplateApi.copyPPT(item.id).then((res) => {
    if (res) {
      copyItem.id = res;
      copyItem.isActive = false;
      PPTArr.value.splice(index + 1, 0, copyItem);
    }
  });
};
const deleteDocument = (item) => {
  PPTArr.value = PPTArr.value.filter((child) => child.id !== item.id);
};
//删除多个ppt
const deleteMore = () => {
  let selected = PPTArr.value.filter((child) => child.isChecked == true);
  if (selected.length == 0) {
    message.warning("请先选择要删除的ppt");
  } else {
    let newPPTArr = PPTArr.value.filter((child) => child.isChecked !== true);
    PPTArr.value = newPPTArr;
  }
};
/** 查询数字人列表 */
const hostList = ref();
const loading = ref(true); // 列表的加载中
const total = ref(0);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  type: "",
  gender: "",
  posture: "",
});
const getList = async () => {
  loading.value = true;
  try {
    queryParams.type = tabs1ActiveNum.value;
    queryParams.gender = tabs2ActiveNum.value;
    queryParams.posture = tabs3ActiveNum.value;
    const data = await pptTemplateApi.pageList(queryParams);
    data.list.forEach((item) => {
      item.isActive = false;
    });
    hostList.value = data.list;
    selectHost.value = hostList.value[0];
    total.value = data.total;
  } finally {
    loading.value = false;
  }
};
const choosePPt = (item) => {
  PPTArr.value.forEach((child) => {
    if (child.id == item.id) {
      child.isActive = true;
    } else {
      child.isActive = false;
    }
  });
  selectPPT.value = item;
};
const selectHost = ref(); // 选择的数字人
const chooseHost = (item) => {
  console.log(item.pictureUrl);
  hostList.value.forEach((el) => {
    if (el.id == item.id) {
      el.isActive = true;
    } else {
      el.isActive = false;
    }
  });
  selectHost.value = item;
};
//打开弹框
const audioSelect = ref();
const audioSelectData = ref();
const openSelect = () => {
  audioSelect.value.open();
};
const selectAudio = (data) => {
  audioSelectData.value = data;
};
//生成课程id
const coursesCreate = () => {
  const params = {
    accountId: userId.value,
  };
  pptTemplateApi.coursesCreate(params).then((res) => {
    console.log(res);
    if (res) {
      courseInfo.value.id = res;
    }
  });
};

//获取保存时间
const saveTime = ref();
const getSaveTime = () => {
  const date = new Date();
  let h: any = date.getHours(); //hour
  let m: any = date.getMinutes(); //minute
  let s: any = date.getSeconds(); //second
  if (h < 10) {
    h = "0" + h;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (s < 10) {
    s = "0" + s;
  }
  return h + ":" + m + ":" + s;
};
const saveSubmit = (type) => {
  //保存课程
  let saveSubmitForm = {
    accountId: courseInfo.value.accountId,
    aspect: courseInfo.value.aspect,
    duration: courseInfo.value.duration,
    height: courseInfo.value.height,
    id: 0,
    matting: courseInfo.value.matting,
    name: courseInfo.value.name,
    pageMode: courseInfo.value.pageMode,
    ppt: [],
    scenes: [],
    status: courseInfo.value.status,
    width: courseInfo.value.width,
    pageInfo: "",
    subtitlesStyle: "{}",
  };
  saveSubmitForm.id = courseInfo.value.id;
  //组装数据
  const scenes: any = [];
  const pageInfo = {
    docInfo: {
      docType: 1,
      fileName: uploadFileObj.filename,
      fileSize: uploadFileObj.size,
    },
    scenes: [] as any[],
  };
  const components = [
    {
      name: selectHost.value.name,
      src: selectHost.value.pictureUrl,
      cover: selectHost.value.pictureUrl,
      width: componentsInfo.width,
      height: componentsInfo.height,
      originWidth: componentsInfo.width,
      originHeight: componentsInfo.height,
      category: 1,
      depth: componentsInfo.depth,
      top: componentsInfo.top,
      marginLeft: componentsInfo.marginLeft,
      entityId: selectHost.value.id,
      entityType: 1,
      businessId: generateUUID(),
      digitbotType: tabs1ActiveNum.value,
      matting: 1,
      marker: 1,
    },
  ];
  PPTArr.value.forEach((item, index) => {
    pageInfo.scenes.push(item.businessId);
    const formatItem = {
      background: {
        backgroundType: item.backgroundType,
        entityId: "",
        width: item.width,
        height: item.height,
        depth: 0,
        src: item.pictureUrl,
        cover: item.pictureUrl,
        originWidth: item.width,
        originHeight: item.height,
        color: "#ffffff",
        pptRemark: item.pptRemark,
      },
      components: components,
      driverType: selectDriveType.value.itemValue,
      duration: "",
      orderNo: index + 1,
      textDriver: {
        pitch: "",
        speed: "",
        volume: "",
        smartSpeed: "",
        textJson: "",
      },
      audioDriver: {
        audioId: "",
        audioUrl: "",
        useVideoBackgroundAudio: "",
      },
      voice: {
        entityId: audioSelectData.value && audioSelectData.value[0].id,
        tonePitch: "",
        voiceType: "",
        speechRate: "",
        name: audioSelectData.value && audioSelectData.value[0].name,
      },
      businessId: item.businessId,
    };
    scenes.push(formatItem);
  });
  saveSubmitForm.pageInfo = JSON.stringify(pageInfo);
  saveSubmitForm.scenes = scenes;
  if (type == "save") {
    pptTemplateApi.coursesSave(saveSubmitForm).then((res) => {
      if (res) {
        message.success("保存成功！");
        saveTime.value = getSaveTime();
      }
    });
  } else {
    //合成视频
    pptTemplateApi.megerMedia(saveSubmitForm).then((res) => {
      console.log("---------", res);
      if (res) {
        message.success("视频合成成功！");
      }
    });
  }
};
//定时保存
const saveTimer = ref();
const saveInter = () => {
  saveTimer.value = setInterval(() => {
    saveSubmit("save");
  }, 10000);
};
//生成试听
const showAudioPlay = ref(false); //显示试听
const textareaRef = ref();
const selectTextarea = ref();
const selectPPTText = () => {
  if (textareaRef.value) {
    textareaRef.value.focus();
    const selection = window.getSelection() || document.getSelection();
    if (selection) {
      selectTextarea.value = selection.toString();
    }
  }
};
const currentAudio = ref();
const createAudio = async () => {
  await selectPPTText();
  if (!audioSelectData.value || audioSelectData.value.length == 0) {
    message.warning("请选择声音模型！");
    return false;
  }
  if (!selectTextarea.value || selectTextarea.value.length == 0) {
    message.warning("请划选至少一个汉字");
    return false;
  }
  const params = {
    text: selectTextarea.value,
    speed: 18,
    pitch: 17,
    volume: 45,
    voiceType: 37,
    voiceTypeId: 51,
    voiceId: audioSelectData.value[0].id,
    smartSpeed: 34,
  };
  pptTemplateApi.createAudio(params).then((res) => {
    if (res) {
      showAudioPlay.value = true;
      currentAudio.value = new Audio(res);
      currentAudio.value.play();
    }
  });
};
//取消试听
const pauseAudio = () => {
  currentAudio.value.pause();
  currentAudio.value = null;
  showAudioPlay.value = false;
};
//返回
const goBack = () => {
  router.go(-1);
};
const getCourseDetail = (id) => {
  pptTemplateApi.coursesDetail(id).then((res) => {
    console.log(res);
    if (res) {
      //回显数据处理
      if (res.scenes && res.scenes.length > 0) {
        //左侧数据列表
        res.scenes.forEach((item) => {
          item.isActive = false;
          item.isChecked = false;
          item.pictureUrl = item.background.src;
          item.pptRemark = item.background.pptRemark;
          item.backgroundType = item.background.backgroundType;
          item.width = item.background.width;
          item.height = item.background.height;
        });
        PPTArr.value = res.scenes;
        PPTArr.value[0].isActive = true;
        selectPPT.value = PPTArr.value[0];
        //选择的数字人信息
        const hostInfo = res.scenes[0].components[0];
        selectHost.value.name = hostInfo.name;
        selectHost.value.pictureUrl = hostInfo.src;
        selectHost.value.id = hostInfo.entityId;
        //数字人位置信息
        componentsInfo.width = hostInfo.width;
        componentsInfo.height = hostInfo.height;
        componentsInfo.top = hostInfo.top;
        componentsInfo.marginLeft = hostInfo.marginLeft;
        componentsInfo.depth = hostInfo.depth;
        //数字人类型
        tabs1ActiveNum.value = hostInfo.digitbotType;
        driveType.forEach((child) => {
          if (child.name == hostInfo.driverType) {
            selectDriveType.value = child;
          }
        });
        audioSelectData.value = [
          {
            id: hostInfo.entityId,
            name: hostInfo.name,
          },
        ];
      }
      // 课程基本信息
      courseInfo.value = res;
      //上传文件信息
      const pageInfo = res.pageInfo ? JSON.parse(res.pageInfo) : "";
      uploadFileObj.filename = pageInfo ? pageInfo.docInfo.fileName : "";
      uploadFileObj.size = pageInfo ? pageInfo.docInfo.fileSize : "";
    }
  });
};
onMounted(async () => {
  await getList();
  if (route.query.id) {
    await getCourseDetail(route.query.id);
  } else {
    coursesCreate();
  }
});
onUnmounted(() => {
  clearInterval(saveTimer.value);
});
</script>
<style scoped lang="scss">
.pages {
  background-color: #f5f7fa;
  height: 100%;
}
.minddle-host-image {
  width: 100%;
  height: 100%;
}
.template-top {
  display: flex;
  justify-content: space-between;
  box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
  background-color: #ffffff;
  padding: 0 30px;
  border: 1px solid #ebeef5;
  line-height: 60px;
  height: 60px;
  .top-left {
    display: flex;
    align-items: center;
    .top-icon {
      display: flex;
      align-items: center;
    }
    .back-text {
      margin-left: 10px;
      margin-right: 20px;
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
  height: calc(100% - 82px);
  display: flex;
  padding: 10px 10px;
  justify-content: space-around;
  .template-left {
    box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
    border: 1px solid #ebeef5;
    background-color: #ffffff;
    width: 15%;
    position: relative;
    .page {
      margin: 0;
      div {
        border-bottom: 1px solid #ebeef5;
        padding: 5px 10px;
        height: 30px;
        margin: 0;
        line-height: 30px;
      }
      .line {
        width: 30px;
        height: 3px;
        background-color: aqua;
        margin: 0;
        padding: 0;
      }
      .upload-demo {
        text-align: center;
      }
    }
    .left-upload-setting {
      height: calc(100% - 86px);
      display: flex;
      isplay: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0 20px;
      text-align: center;
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
      border-bottom: 1px solid #ebeef5;
      height: calc(100% - 70px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      .list {
        position: relative;
        margin: 10px 0;
        width: 260px;
        height: 120px;
        .list-index {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 100;
          width: 25px;
          height: 25px;
          text-align: center;
          line-height: 25px;
          border-radius: 5px;
          background: #122121;
          color: #ffffff;
        }
        .ppt-bg {
          width: 100%;
          height: 100%;
          box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
          border: 2px solid #ffffff;
        }
        .host {
          position: absolute;
        }
        .icon-content {
          position: absolute;
          top: 5px;
          right: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
      }
    }
    .page-btn {
      position: absolute;
      width: 85%;
      bottom: 10px;
      padding: 0 10px;
    }
  }
  .template-middle {
    box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
    width: 56%;
    background-color: #ffffff;
    .middle-top {
      padding: 10px 20px;
    }
    .main-box {
      padding: 10px 50px;
      display: flex;
      justify-content: center;
      border: 1px solid #ebeef5;
      padding: 10px 20px;
      .main-image-box {
        border: 1px solid #ebeef5;
        position: relative;
        height: 360px;
        width: 760px;
      }
      .list {
        width: 95%;
        height: 360px;
        position: relative;
        display: flex;
        justify-content: center;
      }
      .ppt-bg {
        width: 100%;
        height: 100%;
      }
      .host {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 300px;
      }
    }
    .voice-main {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      .voice-item {
        height: 30px;
        border-radius: 12px;
        overflow: hidden;
        width: 180px;
        background-color: #c9c9c9;
        cursor: pointer;
        span {
          display: inline-block;
          height: 30px;
          line-height: 30px;
          width: 50%;
          text-align: center;
        }
        .active-item {
          background-color: #409eff;
          color: #ffffff;
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
      justify-content: space-between;
      border-top: 1px solid #ebeef5;
      padding: 10px;
      .tool-btn {
        display: flex;
        align-items: center;
      }
    }
    .audio-play {
      width: 100%;
      height: 100%;
      padding: 20px 0;
      display: flex;
      align-items: center;
      flex-direction: column;
      line-height: 40px;
      background: #000;
      opacity: 0.5;
      position: absolute;
      top: 0;
      left: 0;
      color: #ffffff;
    }
  }
  .template-right {
    box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
    width: 20%;
    background-color: #ffffff;
    position: relative;
    .tabs-1 {
      display: flex;
      justify-content: space-around;
      padding: 10px 30px;
      border-bottom: 1px solid #ebeef5;
      .tabs-item {
        width: 30px;
        text-align: center;
        font-size: 14px;
        cursor: pointer;
        span {
          display: block;
          width: 30px;
          height: 2px;
          background: #409eff;
          margin-top: 5px;
        }
      }
    }
    .tabs-2 {
      padding: 10px;
      display: flex;
      justify-content: space-around;
      div {
        width: 60px;
        text-align: center;
        line-height: 30px;
        height: 30px;
        border-radius: 5px;
        cursor: pointer;
      }
      .tabs-active {
        background-color: #409eff;
        color: #ffffff !important;
      }
    }
    .host-list {
      height: 500px;
      overflow-y: auto;
      border-top: 1px solid #ebeef5;
      .host-item {
        width: 45%;
        margin: 5px 0;
        margin-left: 10px;
        position: relative;
        display: inline-block;
        cursor: pointer;
        height: 90px;
        .host-name {
          position: absolute;

          width: 30px;
          height: 20px;
          text-align: center;
          line-height: 20px;
          bottom: 10px;
          left: 5px;
          z-index: 100;
          background: rgba(225, 225, 225, 0.7);
          font-size: 10px;
          border-radius: 5px;
        }
        .ppt-bg {
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
  .template-tool {
    width: 6%;
    box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
    background-color: #ffffff;
    padding: 10px;
    .tool-item {
      padding: 10px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      img {
        width: 32px;
        height: 32px;
      }
      .tool-name {
        line-height: 30px;
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
</style>
