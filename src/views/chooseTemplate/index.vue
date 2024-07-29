<template>
  <div class="pages">
    <div class="template-top">
      <div class="top-left">
        <div style="font-size: 16px" class="top-icon">
          <ArrowLeft style="width: 1em; height: 1em" />
        </div>
        <span class="back-text">返回</span>

        <el-input
          v-model="templatename"
          style="width: 140px"
          disabled
          size="small"
          placeholder="未命名草稿"
          :prefix-icon="Edit"
        />
        <span>时长:00:00:05</span>
        <span>总字数:28</span>
      </div>
      <div class="top-right">
        <span>16:55:14 已保存</span>
        <el-button size="small">保存</el-button>
        <el-button type="primary" size="small">合成视频</el-button>
      </div>
    </div>
    <div class="template-main">
      <div class="template-box template-left">
        <div class="page">
          <div> 页面(1页) </div>
          <div class="line"></div>
          <div>
            <el-upload ref="uploadRef" class="upload-demo" :before-upload='beforeUpload' :auto-upload="false">
              <template #trigger>
                <el-button type="primary" :icon="Upload" size="small">上传PPT</el-button>
              </template>
            </el-upload>
          </div>
        </div>
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
            @on-update="PPTListUpdate"
          >
            <template #item="{ element, index }">
              <div class="mt-2 w-100%">
                <div class="list" @click="choosePPt(element, index)">
                  <el-image class="ppt-bg" :src="element.pptbg" fit="contain" />
                  <el-image class="host" :src="element.hosturl" fit="contain" />
                </div>
              </div>
            </template>
          </draggable>
        </div>
        <div class="page-btn">
          <el-button type="primary" size="small" style="width: 90px" :icon="Plus" />
          <el-button type="primary" size="small" :icon="Delete" />
        </div>
      </div>
      <div class="template-box template-middle">
        <div class="middle-top">
          <el-select v-model="value" placeholder="Select" style="width: 140px">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="main-box">
          <div class="list">
            <div class="main-image-box">
              <el-image class="ppt-bg" :src="mainObj.pptbg" fit="contain" />
              <Vue3DraggableResizable
                :parent="true"
                :initW="300"
                :initH="200"
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
                <el-image class="minddle-host-image" :src="mainObj.hosturl" fit="contain" />
              </Vue3DraggableResizable>
            </div>
          </div>
        </div>
        <div class="voice-main">
          <el-text class="mx-1" type="primary" size="small">口播内容</el-text>
          <div class="voice-item">
            <span class="active-item">文本驱动</span>
            <span>声音驱动</span>
          </div>
          <div class="media-box">
            <el-button type="primary" :icon="Mic" size="small">晓晨</el-button>
            <el-button type="success" :icon="Headset" size="small" />
          </div>
        </div>

        <div class="middle-textarea">
          <el-input
            v-model="textarea"
            :rows="3"
            type="textarea"
            placeholder="请输入口部内容"
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
            <div> </div>
          </div>
          <el-button type="primary" :icon="VideoPlay" size="small" @click="getList">试听</el-button>
        </div>
      </div>
      <div class="template-box template-right">
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
            >{{ item.itemName }}</div
          >
        </div>
        <div class="host-list">
          <div
            class="host-item"
            v-for="(item, index) in hostList"
            :key="index"
            @click="chooseHost(item)"
          >
            <div class="host-name">{{ item.hostName }}</div>
            <el-image class="ppt-bg" :src="item.hosturl" fit="contain" />
          </div>
        </div>
      </div>
      <div class="template-box template-tool"> </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'

import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

import {
  Edit,
  ArrowLeft,
  Upload,
  Mic,
  Headset,
  Delete,
  Plus,
  QuestionFilled,
  VideoPlay
} from '@element-plus/icons-vue'
const emit = defineEmits(['PPTListUpdate'])
const templatename = ref('')
const textarea = ref('')
const choosePPtIndex = ref('0')
const PPTpositon = reactive({
  x: 450,
  y: 150,
  h: 100,
  w: 100,
  active: false
})
const print = (val) => {
  console.log(val)
}
const state = reactive({
  enabled: true,
  list: [
    { name: '西瓜', id: 0 },
    { name: '橙子', id: 1 },
    { name: '草莓', id: 2 }
  ],
  dragging: false
})
const tabs1 = [
  {
    itemName: '模特',
    itemValue: '1'
  },
  {
    itemName: '我的',
    itemValue: '2'
  }
]
const tabs1ActiveNum = ref('1')
const tabs2 = [
  {
    itemName: '全部',
    itemValue: '1'
  },
  {
    itemName: '男',
    itemValue: '2'
  },
  {
    itemName: '女',
    itemValue: '3'
  },
  {
    itemName: '站姿',
    itemValue: '4'
  },
  {
    itemName: '坐姿',
    itemValue: '5'
  }
]
const tabs2ActiveNum = ref('1')
const getList = () => {
  console.log(PPTArr)
}
const PPTArr = reactive([
  {
    pptbg: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    hosturl: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    id: 1
  },
  {
    pptbg: 'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
    hosturl: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    id: 2
  },
  {
    pptbg: 'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
    hosturl: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    id: 3
  },
  {
    pptbg: 'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
    hosturl: 'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    id: 4
  }
])
const hostList = reactive([
  {
    hostName: '玉婉',
    hosturl: 'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg'
  },
  {
    hostName: '玉婉',
    hosturl: 'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg'
  },
  {
    hostName: '玉婉',
    hosturl: 'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg'
  }
])
const value = ref('1')
const mainObj = ref({})
const checked5 = ref(false)
const options = [
  {
    value: '1',
    label: '16:9'
  },
  {
    value: '2',
    label: '16:10'
  }
]
const tabs1Click = (item) => {
  tabs1ActiveNum.value = item.itemValue
}
const tabs2Click = (item) => {
  tabs2ActiveNum.value = item.itemValue
}
const choosePPt = (item, index) => {
  console.log(item)
  choosePPtIndex.value = index
  mainObj.value = item
  console.log(mainObj)
}
const chooseHost = (item) => {
  console.log(item.hosturl)
  PPTArr.forEach((el) => {
    el.hosturl = item.hosturl
  })
  mainObj.value = PPTArr[choosePPtIndex.value]
}
const PPTListUpdate = (data) => {
  console.log(data)
}
const beforeUpload=(file,fileList)=>{
  console.log(file)
  console.log(fileList)
}
onMounted(() => {
  console.log(PPTArr)
  mainObj.value = PPTArr[choosePPtIndex.value]
})
</script>
<style scoped lang="scss">
.pages {
  background-color: #f5f7fa;
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
  padding: 20px 30px;
  border: 1px solid #ebeef5;
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
  padding: 10px 10px;
  justify-content: space-around;
  .template-left {
    box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
    border: 1px solid #ebeef5;
    background-color: #ffffff;
    width: 12%;
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
    }
    .image-list {
      border-bottom: 1px solid #ebeef5;
      height: 460px;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px;
      .list {
        position: relative;
        margin: 10px 0;
        width: 100%;
        height: 105px;
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
          background: #409eff;
          color: #ffffff;
        }
        .ppt-bg {
          width: 100%;
          height: 100%;
          box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
          border: 1px solid #ebeef5;
        }
        .host {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 30%;
          height: 30%;
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
        height: 24px;
        border-radius: 12px;
        overflow: hidden;
        width: 130px;
        background-color: #c9c9c9;
        span {
          display: inline-block;
          height: 24px;
          line-height: 24px;
          width: 48%;
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
  }
  .template-right {
    box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
    width: 20%;
    background-color: #ffffff;
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
        width: 45px;
        text-align: center;
        line-height: 24px;
        height: 24px;
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
      }
    }
  }
  .template-tool {
    width: 6%;
    box-shadow: 0px 3px 6px rgba(175, 175, 175, 0.16);
    background-color: #ffffff;
  }
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
