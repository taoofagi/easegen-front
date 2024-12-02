<template>
   <el-dialog
      :title="t('courseCenter.PPTUploadInstructions')"
      v-model="uploadFormVisible"
      width="600px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="uploadForm" label-width="140px" ref="uploadFormRef">
        <el-form-item :label="t('courseCenter.coverExistingScene')+':'" prop="name">
          <el-radio-group v-model="uploadForm.resolveType" disabled>
            <el-radio value="1">{{ t('courseCenter.coverYes') }}</el-radio>
            <el-radio value="2">{{ t('courseCenter.coverNo') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('courseCenter.coverNo')+':'" prop="uploadType">
          <el-radio-group v-model="uploadForm.extlnfo" disabled>
            <el-radio value="1">{{ t('courseCenter.pictureInPicture') }}</el-radio>
            <el-radio value="2">{{ t('courseCenter.background') }}</el-radio>
          </el-radio-group>
          <el-text>{{ t('courseCenter.layerModeText') }}</el-text>
        </el-form-item>
        <el-form-item :label="t('courseCenter.oralDraft')+':'" prop="text">
          <el-radio-group v-model="uploadForm.docType" disabled>
            <el-radio value="1">{{ t('courseCenter.readPPTNotes') }}</el-radio>
            <el-radio value="2">{{ t('courseCenter.AICreation') }}</el-radio>
            <el-radio value="3">{{ t('courseCenter.manualInput') }}</el-radio>
          </el-radio-group>
          <el-text>{{ t('courseCenter.oralDraftText') }}</el-text>
        </el-form-item>
        <el-form-item :label="t('courseCenter.remarksPolishing')+':'" prop="remark">
          <el-switch
            v-model="uploadForm.aiPolish"
            inline-prompt
            :active-text="t('courseCenter.open')"
            :inactive-text="t('courseCenter.close')"
          />
          <el-text
            >{{t('courseCenter.remarksPolishingText')}}</el-text
          >
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadFormVisible = false">{{t('common.cancel')}}</el-button>
        <el-button type="primary" @click="uploadSubmit">{{t('common.ok')}}</el-button>
      </template>
    </el-dialog>
</template>

<script setup lang="ts">
const { t } = useI18n() // 国际化
import { ref, reactive } from "vue";
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
