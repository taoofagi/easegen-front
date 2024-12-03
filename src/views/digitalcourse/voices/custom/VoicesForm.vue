<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item :label="t('voices.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('common.inputText')+t('voices.name')" />
      </el-form-item>
      <el-form-item :label="t('voices.avatar')" prop="avatarUrl">
        <UploadImg v-model="formData.avatarUrl" />
      </el-form-item>
      <el-form-item :label="t('voices.auditionUrl')" prop="auditionUrl">
        <UploadFile v-model="formData.auditionUrl" :fileType="['mp3','wav','m4a']" fileSize="20" :describe="t('voices.fixAuditionUrlTips')" :limit="1" @on-success="handleFileSuccess('audition', $event)"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm()" type="primary" :disabled="formLoading">{{ getButtonTitle(formData.status) }}</el-button>
      <el-button v-if="formData.status == 1" @click="submitForm(4)" type="danger" :disabled="formLoading">{{t('voices.reject')}}</el-button>
      <el-button @click="dialogVisible = false">{{t('common.cancel')}}</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import * as VoicesApi from '@/api/digitalcourse/voices'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
import { getButtonTitle } from '../../common'
const formData = ref({
  id: undefined,
  name: undefined,
  code: undefined,
  avatarUrl: undefined,
  auditionUrl: undefined,
  language: undefined,
  gender: undefined,
  introduction: undefined,
  quality: undefined,
  voiceType: undefined,
  status: undefined,
})
const formRules = reactive({
  name: [{ required: true, message:  t('voices.name')+t('common.notEmpty'), trigger: 'blur' }],
  auditionUrl: [{ required: true, message: t('voices.auditionUrl')+t('common.notEmpty'), trigger: 'blur' }],
  language: [{ required: true, message: t('voices.language')+t('common.notEmpty'), trigger: 'change' }],
  voiceType: [{ required: true, message: t('voices.language')+t('common.notEmpty'), trigger: 'change' }],
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
      formData.value = await VoicesApi.getVoices(id)
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
    if (status) formData.value.status = 4
    const data = formData.value as unknown as VoicesApi.VoicesVO
    if (formType.value === 'create') {
      await VoicesApi.createVoices(data)
      message.success(t('common.createSuccess'))
    } else {
      await VoicesApi.updateVoices(data)
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
    name: undefined,
    code: undefined,
    avatarUrl: undefined,
    auditionUrl: undefined,
    language: undefined,
    gender: undefined,
    introduction: undefined,
    quality: undefined,
    voiceType: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}

// 处理文件上传成功
const handleFileSuccess = (fileType,response) => {
  // 假设 response.data 是后端返回的文件 URL
  // 更新 formData.auditionUrl 为上传成功的第一个文件的 URL
  console.log('upload file response:',response);
  console.log('upload file fileType:',fileType);
  if (fileType === 'audition') {
    formData.value.auditionUrl = response.data;
  }
  if (fileType === 'fixAuditionUrl') {
    formData.value.fixAuditionUrl = response.data;
  }
  if (fileType === 'avatar') {
    formData.value.avatarUrl = response.data;
  }
};
</script>
