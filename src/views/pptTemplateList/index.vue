<template>
  <div class="content">
    <div class="header">
      <div class="group_8 flex-row justify-end cursor-pointer" @click="createPPT">
        <div class="box_2 flex-col justify-between">
          <div class="text-group_2 flex-col justify-between">
            <span class="text_10">视频课件</span>
            <span class="text_11">模版式视频，一键生成</span>
          </div>
          <div class="box_3 flex-row">
            <div class="image-wrapper_2 flex-col">
              <img
                class="thumbnail_2"
                referrerpolicy="no-referrer"
                src="@/assets/digitalcourse/jiantou.png"
              />
            </div>
            <span class="text_12">去创作</span>
          </div>
        </div>
        <img
          class="image_3"
          referrerpolicy="no-referrer"
          src="@/assets/digitalcourse/pptmodel.png"
        />
      </div>
      <div class="group_8 flex-row justify-end cursor-pointer" @click="todigitalhumans">
        <div class="box_2 flex-col justify-between">
          <div class="text-group_2 flex-col justify-between">
            <span class="text_10">数字人形象定制</span>
            <span class="text_11">提交形象</span>
          </div>
          <div class="box_3 flex-row">
            <div class="image-wrapper_2 flex-col">
              <img
                class="thumbnail_2"
                referrerpolicy="no-referrer"
                src="@/assets/digitalcourse/jiantou.png"
              />
            </div>
            <span class="text_12">提交形象</span>
          </div>
        </div>
        <img
          class="image_3"
          referrerpolicy="no-referrer"
          src="@/assets/digitalcourse/pptmodel.png"
        />
      </div>
      <div class="group_8 flex-row justify-end cursor-pointer" @click="tovoice">
        <div class="box_2 flex-col justify-between">
          <div class="text-group_2 flex-col justify-between">
            <span class="text_10">数字人声音定制</span>
            <span class="text_11"></span>
          </div>
          <div class="box_3 flex-row">
            <div class="image-wrapper_2 flex-col">
              <img
                class="thumbnail_2"
                referrerpolicy="no-referrer"
                src="@/assets/digitalcourse/jiantou.png"
              />
            </div>
            <span class="text_12">提交声音</span>
          </div>
        </div>
        <img
          class="image_3"
          referrerpolicy="no-referrer"
          src="@/assets/digitalcourse/pptmodel.png"
        />
      </div>
      <!--      <div class="header-item">-->
      <!--        <img src="https://console-ai.bokecc.com/static/create_digitbot@2x.5e536992.png" alt="标准模式创作" />-->
      <!--        <div class="header-text">标准模式创作</div>-->
      <!--      </div>-->
      <!--      <a class="header-item" href="https://console-ai.bokecc.com/help/video" target="_blank" rel="noreferrer noopener">-->
      <!--        <img src="https://console-ai.bokecc.com/static/video_couse@2x.62b27923.png" alt="视频教程" />-->
      <!--        <div class="header-text" style="color: #fff;">视频教程</div>-->
      <!--      </a>-->
    </div>
    <div class="title">我的课程</div>
    <div class="project-list">
      <div class="project-item" v-for="item in courseList" :key="item.id" @click="detailPPT(item.id)">
        <div class="img-box">
          <div class="scene-item-box" :style="{ backgroundImage: `url(${item.thumbnail})` }">
            <div v-if="item.progress" class="item-progress">进度：{{ item.progress }}</div>
          </div>
        </div>
        <div class="name-row">
          <div class="type">PPT</div>
          <div class="type">{{ item.id }}</div>

        </div>

        <div class="icon-content">
          <!--          <el-icon size="20" color="#ffffff" style="margin-right: 5px" @click.stop="copyItem(item.id)">-->
          <!--            <CopyDocument />-->
          <!--          </el-icon>-->
          <el-icon size="20" color="#ffffff" style="margin-right: 5px" @click.stop="deleteItem(item.id)">
            <Delete />
          </el-icon>
        </div>
        <div class="name-row">
          <div class="name">{{ item.name }}</div>
          <div>{{ formatDate(item.createTime) }}</div>
        </div>
      </div>
    </div>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as pptTemplateApi from '@/api/pptTemplate';
import { useRouter } from 'vue-router';
import {
  Delete,
  CopyDocument,
} from "@element-plus/icons-vue";
import {auditing as auditHumans} from "@/api/digitalcourse/digitalhumans";
import {auditing as auditVoices} from "@/api/digitalcourse/voices";
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter();

//定时保存
const intervalId = ref()
const courseList = ref([]);
const loading = ref(true);
const total = ref(0);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
});


const todigitalhumans = async () => {
  await auditHumans().then(res=>{
    if (!res) return
    router.push('/digitalcourse/digitalhumans/custom/index')
  })

}
const tovoice = async () => {
  await auditVoices().then(res=>{
    if (!res) return
    router.push('/digitalcourse/voices/custom/index')
  })
}
const getList = async () => {
  loading.value = true;
  try {
    const data = await pptTemplateApi.courseList(queryParams);
    courseList.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
};

const startAutoRefresh = () => {
  // 立即执行一次
  getList();
  // 每10秒执行一次
  intervalId.value = setInterval(getList, 5000);
};

const stopAutoRefresh = () => {
  if (intervalId.value !== null) {
    clearInterval(intervalId.value);
    intervalId.value = null;
  }
};

const createPPT = () => {
  router.push('/chooseTemplate/index');
};

const detailPPT = (id) => {
  router.push({ path: '/chooseTemplate/index', query: { id } });
};

const deleteItem = async (id) => {
  console.log('删除项目', id);
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await pptTemplateApi.coursesDelete(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
};

const copyItem = (id) => {
  console.log('复制项目', id);
};

onMounted(async () => {
  startAutoRefresh();
});
onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped lang="scss">
.content {
  padding: 20px;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;

  .header-item {
    position: relative; /* 确保文字可以覆盖在图片上 */
    max-width: 344px;
    min-width: 221px;
    margin-right: 16px;
    border-radius: 4px;
    cursor: pointer;

    img {
      width: 100%;
      height: auto;
      border-radius: 4px; /* 确保图片也有圆角 */
    }

    .header-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%); /* 将文字居中 */
      color: #333;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      white-space: nowrap; /* 防止文字换行 */
    }
  }
  .group_8 {
    background-image: linear-gradient(
        139deg,
        rgba(230, 234, 245, 1) 0,
        rgba(238, 239, 253, 1) 56.291652%,
        rgba(229, 233, 250, 1) 100%
    );
    border-radius: 16px;
    width: 422px;
    height: 150px;
    margin-left: 17px;
  }

  .box_2 {
    width: 160px;
    height: 104px;
    margin: 24px 0 0 30px;
  }
  .text-group_2 {
    width: 160px;
    height: 56px;
  }
  .text_10 {
    width: 96px;
    height: 29px;
    overflow-wrap: break-word;
    color: rgba(76, 61, 135, 1);
    font-size: 24px;
    font-family: Alimama FangYuanTi VF-Bold-Round;
    font-weight: NaN;
    text-align: left;
    white-space: nowrap;
    line-height: 24px;
  }
  .text_11 {
    width: 160px;
    height: 19px;
    overflow-wrap: break-word;
    color: rgba(76, 61, 135, 1);
    font-size: 16px;
    font-family: Alimama FangYuanTi VF-Regular-Round;
    font-weight: NaN;
    text-align: left;
    white-space: nowrap;
    line-height: 16px;
    margin-top: 8px;
  }
  .box_3 {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 43px;
    width: 120px;
    height: 32px;
    margin-top: 16px;
  }
  .image-wrapper_2 {
    background-color: rgba(255, 255, 255, 0.66);
    border-radius: 50%;
    height: 30px;
    border: 1px solid rgba(17, 82, 150, 0.08);
    width: 30px;
    margin: 1px 0 0 1px;
  }
  .thumbnail_2 {
    width: 18px;
    height: 18px;
    margin: 6px 0 0 6px;
  }
  .text_12 {
    width: 48px;
    height: 19px;
    overflow-wrap: break-word;
    color: rgba(50, 107, 222, 1);
    font-size: 16px;
    font-family: Alimama FangYuanTi VF-SemiBold-Round;
    font-weight: NaN;
    text-align: left;
    white-space: nowrap;
    line-height: 16px;
    margin: 7px 24px 0 17px;
  }
  .image_3 {
    width: 125px;
    height: 150px;
    margin-left: 107px;
  }
}


.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.project-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .project-item {
    width: calc(20% - 16px);
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    position: relative;

    .img-box {
      height: 120px;
      background: #000;
      border-radius: 8px;
      overflow: hidden;

      .scene-item-box {
        width: 100%;
        height: 100%;
        position: relative;
        background-size: cover;
        background-position: center;
      }

      .portrait {
        position: absolute;
        bottom: 0;
        left: 8px;
        width: 40px;
        height: 60px;
      }
    }

    .item-progress {
      font-size: 12px;
      position: absolute;
      bottom: 1px; /* 距离底部的距离，可以根据需要调整 */
      right: 1px;  /* 距离右侧的距离，可以根据需要调整 */
      background-color: rgba(0, 0, 0, 0.5); /* 半透明背景色，可以根据需要调整 */
      color: #fff;  /* 文字颜色 */
      padding: 5px 10px; /* 内边距 */
      border-radius: 4px; /* 圆角 */
    }

    .type {
      margin-top: 10px;
      font-size: 12px;
      color: #4094fd;
      background: #c4dff7;
      padding: 3px 6px;
      border-radius: 3px;
      text-align: center;
      width: 50px;
    }

    .icon-content {
      position: absolute;
      top: 15px;
      right: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .name-row {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #333;

      .name {
        font-weight: bold;
      }
    }
  }
}
</style>
