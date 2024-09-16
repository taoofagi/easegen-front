<template>
  <div class="content">
    <div class="header">
      <div class="header-item" @click="createPPT">
        <img src="@/assets/imgs/create_course.png" alt="PPT模式创作" />
        <div class="header-text">PPT模式创作</div>
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
    <div class="title">我的项目</div>
    <div class="project-list">
      <div class="project-item" v-for="item in courseList" :key="item.id" @click="detailPPT(item.id)">
        <div class="img-box">
          <div class="scene-item-box" :style="{ backgroundImage: `url(${item.background})` }">
            <img v-if="item.portrait" :src="item.portrait" class="portrait" />
          </div>
        </div>
        <div class="type">PPT</div>
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
import { ref, reactive, onMounted } from 'vue';
import * as pptTemplateApi from '@/api/pptTemplate';
import { useRouter } from 'vue-router';
import {
  Delete,
  CopyDocument,
} from "@element-plus/icons-vue";
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter();

const courseList = ref([]);
const loading = ref(true);
const total = ref(0);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
});

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
  await getList();
});
</script>

<style scoped lang="scss">
.content {
  padding: 20px;
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
    width: calc(18% - 16px);
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
      font-size: 14px;
      color: #333;

      .name {
        font-weight: bold;
      }
    }
  }
}
</style>
