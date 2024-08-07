<template>
  <div class="head-imgs">
    <div class="head-item" @click="createPPT">
      <img src="@/assets/imgs/ppt1.png" alt="" />
    </div>
    <div class="head-item">
      <img src="@/assets/imgs/ppt2.png" alt="" />
    </div>
    <div class="head-item">
      <img src="@/assets/imgs/ppt3.png" alt="" />
    </div>
  </div>
  <el-divider />
  <div class="content-list">
    <div class="content-head">我的项目</div>
    <div class="content">
      <div class="content-item" v-for="item in courseList" :key="item.id">
        <div class="item-img">
          <div class="item-bg"></div>
          <img src="@/assets/imgs/ppt3.png" alt="" />
          <div class="item-bg"></div>
        </div>
        <div class="page-model">ppt</div>
        <div class="item-name">{{ item.name }}</div>
        <div class="item-time">{{ formatDate(item.createTime) }}</div>
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
import { formatDate } from '@/utils/formatTime'
import { ref, reactive, onMounted } from "vue";
import * as pptTemplateApi from "@/api/pptTemplate";
import { useRouter } from 'vue-router'
const router = useRouter() // 路由
/** 查询数字人列表 */
const courseList = ref();
const loading = ref(true); // 列表的加载中
const total = ref(0);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 12,
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
  router.push('/chooseTemplate/index')
}
onMounted(async () => {
  await getList();
});
</script>

<style scoped lang="scss">
.head-imgs {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  .head-item {
    width: 30%;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.content-list {
  padding: 16px 0px;
  .content-head {
    line-height: 14px;
    border-left: 4px solid #0088fe;
    padding-left: 10px;
    margin-bottom: 16px;
    margin-left: 16px;
    font-size: 18px;
  }
  .content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    .content-item {
      width: 15%;
      margin-bottom: 30px;
      position: relative;
      .item-img {
        border: 2px solid #e9e9e9;
        border-radius: 10px;
        .item-bg {
          width: 100%;
          height: 40px;
          background: #f5f5f5;
        }
        img {
          width: 100%;
          height: 160px;
        }
      }
      .page-model {
        padding: 5px 10px;
        background: #c4dff7;
        color: #4094fd;
        border-radius: 5px 5px 20px 0;
        position: absolute;
        top: 0;
        left: 0;
      }
      .item-name {
        font-size: 18px;
        line-height: 30px;
        font-weight: bold;
      }
      .item-time {
        color: #959595;
        line-height: 30px;
      }
    }
  }
}
</style>
