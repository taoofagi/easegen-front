<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item :label="t('digitalhumans.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('common.inputText') + t('digitalhumans.name')" />
      </el-form-item>
      <el-form-item :label="t('digitalhumans.gender')" prop="gender">
        <el-select v-model="formData.gender" :placeholder="t('common.selectText')+t('digitalhumans.gender')">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('digitalhumans.useModel')" prop="useModel">
        <el-select v-model="formData.useModel" :placeholder="t('common.selectText')+t('digitalhumans.useModel')">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.USE_MODEL)"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('digitalhumans.picture')" v-if="formData.useModel == 1" prop="pictureUrl">
        <UploadImg v-model="formData.pictureUrl" />
      </el-form-item>
      <el-form-item v-if="formData.useModel == 2" :label="t('digitalhumans.video')" prop="fixVideoUrl">
        <UploadFile v-model="formData.videoUrl" :fileType="['mp4']" :limit="1" @on-success="handleFileSuccess('videoUrl', $event)"/>
      </el-form-item>
      <el-form-item :label="t('digitalhumans.fixPicture')" v-if="formData.useModel == 1 && formData.status == 2" prop="fixPictureUrl">
        <UploadImg v-model="formData.fixPictureUrl" />
      </el-form-item>
      <el-form-item v-if="formData.useModel == 2 && formData.status == 2" :label="t('digitalhumans.fixVideo')" prop="fixVideoUrl">
        <UploadFile v-model="formData.fixVideoUrl" :fileType="['mp4']" :limit="1" @on-success="handleFileSuccess('fixVideoUrl', $event)"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm()" type="primary" :disabled="formLoading">{{ getButtonTitle(formData.status) }}</el-button>
      <el-button v-if="formData.status == 1" @click="submitForm(4)" type="danger" :disabled="formLoading">{{t('digitalhumans.reject')}}</el-button>
      <el-button @click="dialogVisible = false">{{t('common.cancel')}}</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import * as DigitalHumansApi from '@/api/digitalcourse/digitalhumans'
import { getButtonTitle } from '../../common'
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
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
  type: undefined,
  useGeneralModel: undefined,
  useModel: undefined,
  status: undefined,
})
const formRules = reactive({
  gender: [{ required: true, message: t('digitalhumans.gender')+t('common.notEmpty'), trigger: 'change' }],
  name: [{ required: true, message: t('digitalhumans.name')+t('common.notEmpty'), trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await DigitalHumansApi.getDigitalHumans(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async (status) => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    if (formData.value.status == 2) formData.value.status = 3
    if (formData.value.status == 1) formData.value.status = 2
    if (formData.value.status == 4) formData.value.status = 1
    if (formData.value.status == 5) formData.value.status = 1
    if (status) formData.value.status = 4
    const data = formData.value as unknown as DigitalHumansApi.DigitalHumansVO
    if (formType.value === 'create') {
      await DigitalHumansApi.createDigitalHumans(data)
      message.success(t('common.createSuccess'))
    } else {
      await DigitalHumansApi.updateDigitalHumans(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
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
    type: undefined,
    useGeneralModel: undefined,
    useModel: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}

const handleFileSuccess = (fileType,response) => {
  if (fileType === 'fixVideoUrl') {
    formData.value.fixVideoUrl = response.data;
  }
  if (fileType === 'videoUrl') {
    formData.value.videoUrl = response.data;
  }
};
</script>
