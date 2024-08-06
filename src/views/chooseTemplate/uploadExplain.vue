<template>
   <el-dialog
      title="PPT上传说明"
      v-model="uploadFormVisible"
      width="600px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="uploadForm" label-width="140px" ref="uploadFormRef">
        <el-form-item label="是否覆盖已有场景:" prop="name">
          <el-radio-group v-model="uploadForm.resolveType" disabled>
            <el-radio value="1">是，覆盖</el-radio>
            <el-radio value="2">否，新增</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图层模式:" prop="uploadType">
          <el-radio-group v-model="uploadForm.extlnfo" disabled>
            <el-radio value="1">画中画</el-radio>
            <el-radio value="2">背景</el-radio>
          </el-radio-group>
          <el-text>画中画模式可调整大小及位置;背景模式为固定铺满不可调整大小。</el-text>
        </el-form-item>
        <el-form-item label="口播稿:" prop="text">
          <el-radio-group v-model="uploadForm.docType" disabled>
            <el-radio value="1">读取PPT备注</el-radio>
            <el-radio value="2">AI创作</el-radio>
            <el-radio value="3">手动录入</el-radio>
          </el-radio-group>
          <el-text>每页读取前3000字。</el-text>
        </el-form-item>
        <el-form-item label="备注润色:" prop="remark">
          <el-switch
            v-model="uploadForm.aiPolish"
            inline-prompt
            active-text="开"
            inactive-text="关"
          />
          <el-text
            >会针对备注中文进行口语化润色，让数字人说话更自然，润色不会改变原意，建议开启。限时免费。</el-text
          >
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadSubmit">确 定</el-button>
      </template>
    </el-dialog>
</template>

<script setup lang="ts"> 
import { ref, reactive, onMounted } from "vue";
const uploadFormVisible = ref(false);
const uploadForm = reactive({
  resolveType: "1",
  extlnfo: "1",
  docType: "1",
  aiPolish: false,
});
//确定
const emit = defineEmits(['success']) 
const uploadSubmit = () => {
    emit('success',uploadForm);
    uploadFormVisible.value = false;
};
const open = () => {
  uploadFormVisible.value = true
}
defineExpose({ open })
</script>

<style scoped lang='scss'>

</style>