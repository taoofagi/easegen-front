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
      <el-form-item :label="t('courseCenter.avatar')" prop="avatarUrl">
        <UploadImg v-model="formData.avatarUrl" />
      </el-form-item>
      <!-- 增加克隆类型，redio 1普通 2高级 -->
      <el-form-item :label="t('courseCenter.cloneType')" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio :label="1">普通</el-radio>
          <el-radio :label="2">高级</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('courseCenter.uploadSound')" prop="auditionUrl">
        <UploadFile v-model="formData.auditionUrl" :fileType="['wav','mp3','m4a']" fileSize="10" :describe="t('courseCenter.uploadSoundText')" :limit="1" @on-success="handleFileSuccess('audition', $event)"/>
        
      </el-form-item>
    </el-form>
    <div>
      <el-button v-hasPermi="['humans:custom:submit']" @click="submitForm(1)" type="primary" :disabled="formLoading">{{t('courseCenter.submit')}}</el-button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import * as VoicesApi from '@/api/digitalcourse/voices'
const message = useMessage() // 消息弹窗\
const { t } = useI18n() // 国际化
import { useRouter } from 'vue-router';
import * as ConfigApi from "@/api/infra/config";
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
  name: [{ required: true, message: t('courseCenter.name')+t('common.notEmpty'), trigger: 'blur' }],
  auditionUrl: [{ required: true, message:t('courseCenter.uploadSound')+t('common.notEmpty'), trigger: 'blur' }],
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
    // 提交成功后跳转到我的模型页面
    toVoices()
  } finally {
    formLoading.value = false
  }
}


onMounted(async ()=>{
  const data = await ConfigApi.getConfigKey('voices.avatarUrl')
  if (data && data.length > 0) {
    formData.value.avatarUrl = data
  }
})

const toVoices = () => {
  router.push("/digitalcourse/voices/custom/page")
}

</script>


