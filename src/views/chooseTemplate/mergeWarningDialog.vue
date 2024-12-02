<template>
   <el-dialog
      :title="t('courseCenter.tip')"
      v-model="warningDialogVisible"
      width="600px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
    >
    <div class="content">
      <el-icon :size="32" color="#ff4d4f"><CircleClose /></el-icon>
      <div style="font-size: 18px;font-weight: bold;">{{t('courseCenter.tip1')}}</div>
      <div style="font-size: 16px;font-weight: 600;">{{t('courseCenter.tip2')}}</div>
      <div style="font-size: 16px;font-weight: 600;">{{t('courseCenter.tip3')}}</div>
      <div style="font-size: 16px;font-weight: 600;">{{t('courseCenter.tip4')}}</div>
    </div>
     <div style="line-height: 30px;" v-html="warningStr"></div>
     <template #footer>
        <el-button @click="warningDialogVisible = false">{{t('common.cancel')}}</el-button>
        <el-button type="primary" @click="uploadSubmit">{{t('common.ok')}}</el-button>
      </template>
    </el-dialog>
</template>

<script setup lang="ts"> 
import {
  CircleClose
} from "@element-plus/icons-vue";
import { ref } from "vue";
const { t } = useI18n() // 国际化
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
