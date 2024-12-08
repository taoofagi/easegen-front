<template>
  <div>
    <el-row>
      <el-col>
        <el-button
          plain
          round
          size="small"
          @click="toDisgitalhumans"
        >
          {{ t('courseCenter.myModel') }}
        </el-button>
      </el-col>
    </el-row>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="200px"
      v-loading="formLoading"
    >
      <el-form-item :label="t('courseCenter.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('common.inputText')+t('courseCenter.name')" />
      </el-form-item>
      <el-form-item :label="t('courseCenter.digitalPeopleModel')" prop="useModel">
        <el-select v-model="formData.useModel" :placeholder="t('common.selectText')+t('courseCenter.digitalPeopleModel')">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.USE_MODEL)"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.useModel == 1" :label="t('courseCenter.image')" prop="pictureUrl">
        <UploadImg v-model="formData.pictureUrl" />
      </el-form-item>
      <el-form-item v-if="formData.useModel == 2" :label="t('courseCenter.video')" prop="videoUrl">
        <UploadFile v-model="formData.videoUrl" :fileType="['mp4']" :limit="1" :fileSize="20" @on-success="handleFileSuccess('videoUrl', $event)"/>
      </el-form-item>
    </el-form>
    <div>
      <el-button v-hasPermi="['humans:custom:submit']" @click="submitForm(1)" type="primary" :disabled="formLoading">{{t('courseCenter.submit')}}</el-button>
    </div>
  </div>
</template>


<script setup lang="ts">
import {DICT_TYPE, getIntDictOptions} from "@/utils/dict";
import * as DigitalHumansApi from "@/api/digitalcourse/digitalhumans";
const message = useMessage() // 消息弹窗\
const { t } = useI18n() // 国际化
import { useRouter } from 'vue-router';
const router = useRouter();
const formLoading = ref(false)
const formData = ref({
  id: undefined,
  expireStatus: undefined,
  finishTime: undefined,
  matting: 0,
  name: undefined,
  code: undefined,
  pictureUrl: undefined,
  posture: 1,
  snapshotHeight: undefined,
  snapshotUrl: undefined,
  snapshotWidth: undefined,
  type: 1,
  useGeneralModel: undefined,
  useModel: undefined,
  status: undefined,
})
const formRules = reactive({
  name: [{ required: true, message: t('courseCenter.name')+t('common.notEmpty'), trigger: 'blur' }],
  pictureUrl: [{ required: true, message: t('courseCenter.image')+t('common.notEmpty'), trigger: 'blur' }],
  useModel: [{ required: true, message: t('courseCenter.digitalPeopleModel')+t('common.notEmpty'), trigger: 'blur' }],
  videoUrl: [{ required: true, message: t('courseCenter.video')+t('common.notEmpty'), trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const submitForm = async (status) => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as DigitalHumansApi.DigitalHumansVO
    data.status = status
    if (!data.id) {
      await DigitalHumansApi.createDigitalHumans(data)
      message.success(t('common.createSuccess'))
    } else {
      await DigitalHumansApi.updateDigitalHumans(data)
      message.success(t('common.updateSuccess'))
    }
  } finally {
    formLoading.value = false
  }
}
const toDisgitalhumans = () => {
  router.push("/digitalcourse/digitalhumans/custom/page")
}
const save = async () => {
  // 校验表单
  // await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as DigitalHumansApi.DigitalHumansVO
    if (!data.id) {
      await DigitalHumansApi.createDigitalHumans(data)
      message.success(t('common.createSuccess'))
    } else {
      await DigitalHumansApi.updateDigitalHumans(data)
      message.success(t('common.updateSuccess'))
    }
  } finally {
    formLoading.value = false
  }
}

// 处理文件上传成功
const handleFileSuccess = (fileType,response) => {
  if (fileType === 'videoUrl') {
    formData.value.videoUrl = response.data;
  }
};


</script>



<style scoped lang="scss">

</style>
