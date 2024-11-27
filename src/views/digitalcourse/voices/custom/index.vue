<template>
  <div>
    <el-row>
      <el-col>
        <el-button
          plain
          round
          size="small"
          @click="toVoices"
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
      <el-form-item label="声音名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入声音名称" />
      </el-form-item>
      <el-form-item label="头像" prop="avatarUrl">
        <UploadFile v-model="formData.avatarUrl" :fileType="['jpg','png']" :limit="1" @on-success="handleFileSuccess('avatar', $event)"/>
      </el-form-item>
      <el-form-item label="上传声音" prop="auditionUrl">
        <UploadFile v-model="formData.auditionUrl" :fileType="['mp3','wav','m4a']" fileSize="20" describe="推荐上传10-20s音频，上传支持小于20M的wav、mp3、m4a格式文件，避免多人对话、明显杂音、噪音、混响等情况。" :limit="1" @on-success="handleFileSuccess('audition', $event)"/>
      </el-form-item>
    </el-form>
    <div>
      <el-button v-hasPermi="['humans:custom:submit']" @click="submitForm(1)" type="primary" :disabled="formLoading">提 交</el-button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import * as VoicesApi from '@/api/digitalcourse/voices'
const message = useMessage() // 消息弹窗\
const { t } = useI18n() // 国际化
import { useRouter } from 'vue-router';
const router = useRouter();
const formLoading = ref(false)
const formData = ref({
  id: undefined,
  name: undefined,
  code: undefined,
  avatarUrl: undefined,
  auditionUrl: undefined,
  language: 1,
  gender: undefined,
  introduction: undefined,
  quality: undefined,
  voiceType: 1,
  status: undefined,
})
const formRules = reactive({
  name: [{ required: true, message: '声音名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '声音编码不能为空', trigger: 'blur' }],
  auditionUrl: [{ required: true, message: '试听URL不能为空', trigger: 'blur' }],
  // gender: [{ required: true, message: '性别不能为空', trigger: 'change' }],
  // quality: [{ required: true, message: '音质评分不能为空', trigger: 'blur' }],
  voiceType: [{ required: true, message: '声音类型 不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
})
const formRef = ref() // 表单 Ref
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as VoicesApi.VoicesVO
    data.status = 1
    if (!data.id) {
      await VoicesApi.createVoices(data)
      message.success(t('common.createSuccess'))
    } else {
      await VoicesApi.updateVoices(data)
      message.success(t('common.updateSuccess'))
    }
  } finally {
    formLoading.value = false
  }
}


const toVoices = () => {
  router.push("/digitalcourse/voices/custom/page")
}

</script>


