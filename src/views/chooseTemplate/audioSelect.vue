<template>
    <el-dialog
      v-model="audioSelectVisible"
      width="1000px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="AI声音" name="ai">
          <div class="language">
            <span v-for="(item,index) in languageList" :key="index" :class="{isActive: item.isActive}">{{item.name}}</span>
          </div>
          <div class="language">
            <span v-for="(item,index) in audioType" :key="index" :class="{isActive: item.isActive}">{{item.name}}</span>
          </div>
          <div class="table-list">
            <div>
              <img  />
              <div>
                 
              </div> 
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="定制声音" name="other">定制声音</el-tab-pane>
      </el-tabs>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
const audioSelectVisible = ref(true)
const activeName = ref('ai')
const languageList = reactive([
  {
    name: '中文',
    isActive: true
  },
  {
    name: '中文精品',
    isActive: false
  },
  {
    name: '英语',
    isActive: false
  },
  {
    name: '英式英语',
    isActive: false
  },
  {
    name: '法语',
    isActive: false
  },
  {
    name: '德语',
    isActive: false
  },
  {
    name: '俄语',
    isActive: false
  },
  {
    name: '西班牙语',
    isActive: false
  },
  {
    name: '葡萄牙语',
    isActive: false
  },
  {
    name: '阿拉伯语',
    isActive: false
  },
  {
    name: '日语',
    isActive: false
  }
])
const audioType = reactive([
  {
    name: '全部声音',
    isActive: true
  },
  {
    name: '男生',
    isActive: false
  },
  {
    name: '女生',
    isActive: false
  }
])
</script>

<style scoped lang='scss'>
  .language{
    height: 40px;
    line-height: 40px;
    span{
      margin-right: 30px;
      display: inline-block;
    }
    .isActive{
      color:#0770ca
    }
  }
  ::v-deep(.el-tabs__nav-scroll){
    display: flex !important;
    justify-content: center !important;
  }
  ::v-deep(.el-tabs__nav-wrap:after){
    display: none !important;
  }
</style>