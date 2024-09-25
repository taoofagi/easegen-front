<template>
   <el-dialog
      title="提示"
      v-model="warningDialogVisible"
      width="600px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
    >
    <div class="content">
      <el-icon :size="32" color="#ff4d4f"><CircleClose /></el-icon>
      <div style="font-size: 18px;font-weight: bold;">无法提交</div> 
      <div style="font-size: 16px;font-weight: 600;">请确保每页场景至少有已选声音、驱动内容2项信息。</div>
      <div style="font-size: 16px;font-weight: 600;">请确保将口播内容中阿拉伯数字修改为大写数字。</div>
      <div style="font-size: 16px;font-weight: 600;">请确保将口播内容中英文标点符号修改为中文标点符号或者同音中文。</div>
    </div>
     <div style="line-height: 30px;" v-html="warningStr"></div>
     <template #footer>
        <el-button @click="warningDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadSubmit">确 定</el-button>
      </template>
    </el-dialog>
</template>

<script setup lang="ts"> 
import {
  CircleClose
} from "@element-plus/icons-vue";
import { ref } from "vue";
const warningStr = ref("")
const warningDialogVisible = ref(false);
//确定
const emit = defineEmits(['success']) 
const uploadSubmit = () => {
    warningDialogVisible.value = false;
};
const open = (text) => {
  warningStr.value = text
  warningDialogVisible.value = true
}
defineExpose({ open })
</script>

<style scoped lang='scss'>
.content{
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 40px;
}
</style>