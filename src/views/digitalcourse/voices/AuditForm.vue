<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="声音名称" prop="name">
        <el-input disabled v-model="formData.name" placeholder="请输入声音名称" />
      </el-form-item>
      <el-form-item label="头像" prop="avatarUrl">
        <UploadFile :isShowDelete="false"  v-model="formData.avatarUrl" :fileType="['jpg','png']" :limit="1" @on-success="handleFileSuccess('avatar', $event)"/>
      </el-form-item>
      <el-form-item label="上传声音" prop="auditionUrl">
        <UploadFile :isShowDelete="false" v-model="formData.auditionUrl" :fileType="['mp3','wav']" :limit="1" @on-success="handleFileSuccess('audition', $event)"/>
      </el-form-item>
      <el-form-item v-if="formData.status > 1" label="修复后音频" prop="fixAuditionUrl">
        <UploadFile v-model="formData.fixAuditionUrl" :fileType="['mp3','wav','m4a']" describe="推荐上传10-20s音频，上传支持小于20M的wav、mp3、m4a格式文件，避免多人对话、明显杂音、噪音、混响等情况。" :limit="1" @on-success="handleFileSuccess('fixAuditionUrl', $event)"/>
      </el-form-item>
      <el-form-item v-if="formData.status == 0" label="过期时间">
        <el-date-picker
          v-model="formData.expireDate"
          placeholder="过期时间"
          type="datetime"
          value-format="x"
          class="!w-1/1"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm()" type="primary" :disabled="formLoading">{{ getButtonTitle(formData.status) || '保存' }}</el-button>
      <el-button v-if="formData.status == 1" @click="submitForm(4)" type="danger" :disabled="formLoading">驳 回</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
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
import { getButtonTitle } from '../common'
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
  name: [{ required: true, message: '声音名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '声音编码不能为空', trigger: 'blur' }],
  avatarUrl: [{ required: true, message: '头像不能为空', trigger: 'blur' }],
  auditionUrl: [{ required: true, message: '试听URL不能为空', trigger: 'blur' }],
  voiceType: [{ required: true, message: '声音类型 不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
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
