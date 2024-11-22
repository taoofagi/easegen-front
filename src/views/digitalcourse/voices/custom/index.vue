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
      <el-form-item label="试听音频" prop="auditionUrl">
        <UploadFile v-model="formData.auditionUrl" :fileType="['mp3','wav']" :limit="1" @on-success="handleFileSuccess('audition', $event)"/>
      </el-form-item>
      <el-form-item label="语言类型" prop="language">
        <el-select v-model="formData.language" placeholder="请选择语言类型">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.DIGITALCOURSE_VOICES_LANGUAGE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
      <el-form-item label="介绍" prop="introduction">
        <el-input v-model="formData.introduction" placeholder="请输入介绍" />
      </el-form-item>
      <el-form-item label="音质评分" prop="quality">
        <el-input v-model="formData.quality" placeholder="请输入音质评分" />
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
  language: undefined,
  gender: undefined,
  introduction: undefined,
  quality: undefined,
  voiceType: 1,
  status: undefined,
})
const formRules = reactive({
  name: [{ required: true, message: '声音名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '声音编码不能为空', trigger: 'blur' }],
  avatarUrl: [{ required: true, message: '头像不能为空', trigger: 'blur' }],
  auditionUrl: [{ required: true, message: '试听URL不能为空', trigger: 'blur' }],
  language: [{ required: true, message: '语言类型不能为空', trigger: 'change' }],
  gender: [{ required: true, message: '性别不能为空', trigger: 'change' }],
  quality: [{ required: true, message: '音质评分不能为空', trigger: 'blur' }],
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


