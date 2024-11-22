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
          我的模型
        </el-button>
      </el-col>
    </el-row>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="formData.gender" placeholder="请选择性别">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数字人模式" prop="useModel">
        <el-select v-model="formData.useModel" placeholder="请选择数字人模式">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.USE_MODEL)"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.useModel == 1" label="图片" prop="pictureUrl">
        <UploadImg v-model="formData.pictureUrl" />
      </el-form-item>
      <el-form-item v-if="formData.useModel == 2" label="视频" prop="videoUrl">
        <UploadFile v-model="formData.videoUrl" :fileType="['mp4']" :limit="1" @on-success="handleFileSuccess('videoUrl', $event)"/>
      </el-form-item>
      <el-form-item label="抠图标识" prop="matting">
        <el-select v-model="formData.matting" placeholder="请选择抠图标识">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.DIGITALCOURSE_DIGITALHUMAN_MATTING)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="姿势" prop="posture">
        <el-select v-model="formData.posture" placeholder="请选择姿势">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.DIGITALCOURSE_DIGITALHUMAN_POSTURE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
<!--      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.DIGITALCOURSE_DIGITALHUMAN_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>-->
    </el-form>
    <div>
<!--      <el-button v-hasPermi="['humans:custom:submit']" @click="save" type="primary" :disabled="formLoading">存为草稿</el-button>-->
      <el-button v-hasPermi="['humans:custom:submit']" @click="submitForm(1)" type="primary" :disabled="formLoading">提 交</el-button>
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
  gender: undefined,
  matting: undefined,
  name: undefined,
  code: undefined,
  pictureUrl: undefined,
  posture: undefined,
  snapshotHeight: undefined,
  snapshotUrl: undefined,
  snapshotWidth: undefined,
  type: 1,
  useGeneralModel: undefined,
  useModel: undefined,
  status: undefined,
})
const formRules = reactive({
  gender: [{ required: true, message: '性别不能为空', trigger: 'change' }],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  pictureUrl: [{ required: true, message: '图片URL不能为空', trigger: 'blur' }],
  posture: [{ required: true, message: '姿势不能为空', trigger: 'change' }],
  snapshotHeight: [{ required: true, message: '快照高度不能为空', trigger: 'blur' }],
  snapshotUrl: [{ required: true, message: '快照URL不能为空', trigger: 'blur' }],
  snapshotWidth: [{ required: true, message: '快照宽度不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
  useGeneralModel: [{ required: true, message: '使用通用模型不能为空', trigger: 'change' }]
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
