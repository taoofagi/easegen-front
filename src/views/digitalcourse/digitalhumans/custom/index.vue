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
        <div v-if="formData.useModel === 2" class="tip-text">
          上传30秒-5分钟绿幕录制视频，支持背景更换，制作您专属的虚拟数字人分身，适用于企业宣传、教育培训、口播视频等各大应用场景，并结合数字人口播技术，可替代真人出镜。！
          <br/>视频方向：纵向；
          <br/>文件格式：mp4；
          <br/>视频编码：.h264；
          <br/>视频时长：30 秒 ~ 5 分钟；
          <br/>分辨率：建议分辨率为9：16的720p或 1080p；
          <br/>文件大小：小于 100MB。
        </div>
        <div v-if="formData.useModel === 3" class="tip-text">
          上传5秒-5分钟的视频，1分钟内即可获取您的免费数字分身！
          <br/>视频方向：纵向；
          <br/>文件格式：mp4；
          <br/>视频编码：.h264；
          <br/>视频时长：5 秒 ~ 5 分钟；
          <br/>分辨率：建议分辨率为9：16的720p或 1080p；
          <br/>文件大小：小于 100MB。
        </div>
      </el-form-item>
      <el-form-item v-if="formData.useModel == 1" :label="t('courseCenter.image')" prop="pictureUrl">
        <UploadImg v-model="formData.pictureUrl" />
      </el-form-item>
      <el-form-item v-if="formData.useModel == 2 || formData.useModel == 3" :label="t('courseCenter.video')" prop="videoUrl">
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
    toDisgitalhumans()
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
    // 提交成功后跳转到我的模型页面
    toDisgitalhumans()
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
