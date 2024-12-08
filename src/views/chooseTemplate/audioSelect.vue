<template>
  <el-dialog
    v-model="audioSelectVisible"
    width="1000px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeName" @tab-change="handleClick">
      <el-tab-pane :label="child.label" :name="child.value" v-for="(child,ind) in voiceTypeList" :key="ind">
        <div class="language" v-if="activeName == 0">
          <span
            v-for="(item, index) in languageList"
            :key="index"
            :class="{ isActive: item.isActive }"
            @click="handleLanguage(item)"
            >{{ item.label }}</span
          >
        </div>
        <div class="language">
          <span
            v-for="(item, index) in audioType"
            :key="index"
            :class="{ isActive: item.isActive }"
            @click="handleAudio(item)"
            >{{ item.label }}</span
          >
        </div>
        <div v-if="audioList && audioList.length > 0">
          <div class="table-container">
            <div
              class="table-list"
              :style="{ borderColor: item.isSelect ? '#0183f4' : '' }"
              :class="{ isHover: item.isHover }"
              v-for="(item, index) in audioList"
              :key="index"
              @mouseenter="handleMouseenter(item)"
              @mouseleave="handleMouseleave(item)"
              @click="handleSelect(item)"
            >
              <div class="item-head">
                <img :src="item.avatarUrl" />
                <!-- <div class="head-btn">高级</div> -->
              </div>
              <div class="item-name">
                <span>{{ item.name }}</span>
                <span>{{ item.introduction }}</span>
              </div>
              <img
                class="play-img"
                v-if="item.isHover && !item.isPlay"
                src="@/assets/imgs/play.png"
                alt=""
                @click.stop="playAudio(item)"
              />
              <img
                class="play-img"
                v-if="item.isHover && item.isPlay"
                src="@/assets/imgs/pause.png"
                alt=""
                @click.stop="pauseAudio(item)"
              />
            </div>
          </div>
          <!-- 分页 -->
          <Pagination
            :total="total"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </div>
        <div v-else class="nodata">
          <img src="@/assets/imgs/nodata.png" alt="" />
        </div>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="audioSelectVisible = false">{{t('common.cancel')}}</el-button>
      <el-button type="primary" @click="submitForm">{{t('common.ok')}}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import * as pptTemplateApi from "@/api/pptTemplate";
import { DICT_TYPE, getIntDictOptions } from "@/utils/dict";
const { t } = useI18n() // 国际化
const message = useMessage();
const audioSelectVisible = ref(false);
const activeName = ref();
const languageList = ref();
const selectLanguage = ref();
// 获取语言字典
const getLanguageList = () => {
  const list = getIntDictOptions(DICT_TYPE.DIGITALCOURSE_VOICES_LANGUAGE);
  list.forEach((item) => {
    Reflect.set(item, "isActive", false);
  });
  languageList.value = list;
  // selectLanguage.value = list[0];
  // selectLanguage.value.isActive = true;
  // 移除默认选中
  selectLanguage.value = { value: '' };
};
const audioType = ref();
const selectAudio = ref();
const audioTypeCustom = ref();
//获取性别字典
const getAudioType = () => {
  const list = getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX);
  list.forEach((item) => {
    Reflect.set(item, "isActive", false);
  });
  audioType.value = list;
  audioTypeCustom.value = list;
  // selectAudio.value = list[0];
  // selectAudio.value.isActive = true;
  // 移除默认选中
  selectAudio.value = { value: '' };
};
//获取声音类别
const voiceTypeList = ref();
const getVoiceType = () => {
  const list = getIntDictOptions(DICT_TYPE.DIGITALCOURSE_VOICES_TYPE);
  voiceTypeList.value = list;
  selectAudio.value = list[0];
  activeName.value = list[0].value;
};
//列表数据
const loading = ref(true); // 列表的加载中
const total = ref(0);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 32,
  language: "",
  gender: "",
  voiceType: ""
});
const audioList = ref();
const getList = async () => {
  loading.value = true;
  try {
    queryParams.language = selectLanguage.value?.value || '';
    queryParams.gender = selectAudio.value?.value || '';
    queryParams.voiceType = activeName.value;
    const data = await pptTemplateApi.videlPageList(queryParams);
    data.list.forEach((item) => {
      item.isHover = false;
      item.isPlay = false;
      item.isSelect = false;
    });
    audioList.value = data.list;

    total.value = data.total;
  } finally {
    loading.value = false;
  }
};
//声音模型类型过滤
const handleClick = (item)=>{
   activeName.value = item;
   getList();
}
//语言过滤
const handleLanguage = (item) => {
  selectLanguage.value = item;
  languageList.value.forEach((child) => {
    if (child.label == item.label) {
      child.isActive = true;
    } else {
      child.isActive = false;
    }
  });
  getList();
};
//性别过滤
const handleAudio = (item) => {
  selectAudio.value = item;
  audioType.value.forEach((child) => {
    if (child.label == item.label) {
      child.isActive = true;
    } else {
      child.isActive = false;
    }
  });
  getList();
};
const handleMouseenter = (item) => {
  item.isHover = true;
};
const handleMouseleave = (item) => {
  item.isHover = false;
  item.isPlay = false;
};
//选择声音模型
const selectList = ref();
const handleSelect = (item) => {
  selectList.value = [item];
  audioList.value.forEach((child) => {
    if (child.id == item.id) {
      child.isSelect = true;
    } else {
      child.isSelect = false;
    }
  });
};
//确定
const emit = defineEmits(['success']) 
const submitForm = () => {
  if (!selectList.value || selectList.value.length == 0) {
    message.warning("请选择声音模型");
    return false;
  }else{
    emit('success',selectList.value);
    audioSelectVisible.value = false;
  }
};
//播放声音
const currentAudio = ref();
const playAudio = async (item) => {
  item.isPlay = !item.isPlay;
  await nextTick();
  // currentAudio.value[0].play();
  if (currentAudio.value && currentAudio.value.auditionUrl === item.auditionUrl) {
    currentAudio.value.play();
  } else {
    currentAudio.value = new Audio(item.auditionUrl);
    currentAudio.value.play();
  }
};
const pauseAudio = async (item) => {
  item.isPlay = !item.isPlay;
  await nextTick();
  // currentAudio.value[0].pause();
  if (currentAudio.value && currentAudio.value.auditionUrl === item.auditionUrl) {
    currentAudio.value.pause();
  } else {
    currentAudio.value = new Audio(item.auditionUrl);
    currentAudio.value.pause();
  }
};
const open = () => {
  audioSelectVisible.value = true
}
defineExpose({ open })
onMounted(async () => {
  await getVoiceType();
  await getLanguageList();
  await getAudioType();
  await getList();
});
</script>

<style scoped lang="scss">
.language {
  height: 40px;
  line-height: 40px;
  span {
    margin-right: 30px;
    display: inline-block;
    cursor: pointer;
  }
  .isActive {
    color: #0770ca;
  }
}
.table-container {
  display: flex;
  flex-wrap: wrap;
  .table-list {
    width: calc(20% - 30px);
    display: flex;
    align-items: center;
    padding: 5px;
    position: relative;
    border: 2px solid #ffffff;
    margin-right: 16px;
    .item-head {
      width: 80px;
      height: 80px;
      position: relative;
      margin-right: 20px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
      .head-btn {
        width: 80px;
        height: 20px;
        text-align: center;
        border-radius: 10px;
        background: linear-gradient(to right, #def6fb, #96d9fa);
        position: absolute;
        bottom: 0;
      }
    }
    .item-name {
      display: flex;
      flex-direction: column;
      align-items: center;
      span {
        line-height: 30px;
      }
    }
    .play-img {
      width: 32px;
      height: 32px;
      cursor: pointer;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      margin: auto;
    }
  }
  .isHover {
    background: #000;
    opacity: 0.5;
    border: 2px solid #0183f4;
  }
}
.nodata {
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 200px;
    height: 200px;
  }
}
::v-deep(.el-tabs__nav-scroll) {
  display: flex !important;
  justify-content: center !important;
}
::v-deep(.el-tabs__nav-wrap:after) {
  display: none !important;
}
</style>
