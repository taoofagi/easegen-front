<template>
  <Form ref="formRef" :labelWidth="200" :rules="rules" :schema="schema">
    <template #mobile="form">
      <el-input
        v-model="form['mobile']"
        type="text"
        placeholder="请绑定手机号"
        readonly
      >
        <template #suffix>
          <span class="input-action" @click="bindMobile" style="margin-right: 10px; color: #409EFF; cursor: pointer;">认证</span>
        </template>
      </el-input>
    </template>
    <template #sex="form">
      <el-radio-group v-model="form['sex']">
        <el-radio :value="1">{{ t('profile.user.man') }}</el-radio>
        <el-radio :value="2">{{ t('profile.user.woman') }}</el-radio>
      </el-radio-group>
    </template>
    <template #apikey="form">
      <el-input
        v-model="form['apikey']"
        type="password"
        placeholder="API Key"
        show-password
        :readonly="true"
        style="width: 300px;"
      >
        <template #suffix>
          <span class="input-action" @click="refreshApiKey" style="margin-right: 10px; color: #409EFF; cursor: pointer;">刷新</span>
          <span class="input-action" @click="copyApiKey" style="color: #409EFF; cursor: pointer;">复制</span>
        </template>
      </el-input>
    </template>
  </Form>
  <Dialog :before-close="handleClose" v-model="dialogVisible" title="手机号认证">
    <el-form
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入 手机号" />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入 验证码" >
          <template #append>
                  <span
                    v-if="mobileCodeTimer <= 0"
                    class="getMobileCode"
                    style="cursor: pointer"
                    @click="getSmsCode"
                  >
                    {{ t('login.getSmsCode') }}
                  </span>
            <span v-if="mobileCodeTimer > 0" class="getMobileCode" style="cursor: pointer">
                    {{ mobileCodeTimer }}秒后可重新获取
                  </span>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </template>
  </Dialog>
  <div style="text-align: center">
    <XButton :title="t('common.save')" type="primary" @click="submit()" />
    <XButton :title="t('common.reset')" type="danger" @click="init()" />
  </div>
</template>
<script lang="ts" setup>
import type { FormRules } from 'element-plus'
import { FormSchema } from '@/types/form'
import type { FormExpose } from '@/components/Form'
import {
  getUserProfile,
  updateUserProfile,
  UserProfileUpdateReqVO
} from '@/api/system/user/profile'
import { useUserStore } from '@/store/modules/user'
import { refreshUserApiKey } from '@/api/system/user'
import {sendSmsCode,changeOrBindMobile} from "@/api/login";
import {getTenantId} from "@/utils/auth";

defineOptions({ name: 'BasicInfo' })

const { t } = useI18n()
const message = useMessage() // 消息弹窗
const userStore = useUserStore()
// 表单校验
const rules = reactive<FormRules>({
  nickname: [{ required: true, message: t('profile.rules.nickname'), trigger: 'blur' }],
  mobile: [
    { required: true, message: t('profile.rules.phone'), trigger: 'blur' },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t('profile.rules.truephone'),
      trigger: 'blur'
    }
  ]
})
const formRules = reactive<FormRules>({
  mobile: [
    { required: true, message: t('profile.rules.phone'), trigger: 'blur' },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t('profile.rules.truephone'),
      trigger: 'blur'
    }
  ]
})
const formData = ref({})
const formLoading = ref(false)
const dialogVisible = ref(false)
const bindMobile = ()=>{
  dialogVisible.value = true
}
const handleClose = () => {
  formData.value = {}
  dialogVisible.value = false
}
const smsVO = reactive({
  smsCode: {
    mobile: '',
    scene: 5
  },
  loginSms: {
    mobile: '',
    code: ''
  }
})
const submitForm = async () => {
  smsVO.loginSms.mobile = formData.value.mobile
  smsVO.loginSms.code = formData.value.code
  let res = await changeOrBindMobile(smsVO.loginSms)
  if (res){
    message.success("绑定成功")
    await init()
    dialogVisible.value = false
  }
}
const mobileCodeTimer = ref(0)
const getSmsCode = async () => {
  await getTenantId()
  console.log(formData)
  if (!formData.value.mobile) {
    return message.warning("请输入手机号")
  }
  smsVO.smsCode.mobile = formData.value.mobile
  console.log(smsVO)
  await sendSmsCode(smsVO.smsCode).then(async () => {
    message.success(t('login.SmsSendMsg'))
    // 设置倒计时
    mobileCodeTimer.value = 60
    let msgTimer = setInterval(() => {
      mobileCodeTimer.value = mobileCodeTimer.value - 1
      if (mobileCodeTimer.value <= 0) {
        clearInterval(msgTimer)
      }
    }, 1000)
  })
}
const schema = reactive<FormSchema[]>([
  {
    field: 'nickname',
    label: t('profile.user.nickname'),
    component: 'Input'
  },
  {
    field: 'mobile',
    label: t('profile.user.mobile'),
    component: 'Input'
  },
  {
    field: 'email',
    label: t('profile.user.email'),
    component: 'Input'
  },
  {
    field: 'sex',
    label: t('profile.user.sex'),
    component: 'InputNumber',
    value: 0
  },
  {
    field: 'apikey',
    label: 'API Key',
    component: 'Input'
  }
])
const formRef = ref<FormExpose>() // 表单 Ref
const submit = () => {
  const elForm = unref(formRef)?.getElFormRef()
  if (!elForm) return
  elForm.validate(async (valid) => {
    if (valid) {
      const data = unref(formRef)?.formModel as UserProfileUpdateReqVO
      await updateUserProfile(data)
      message.success(t('common.updateSuccess'))
      const profile = await init()
      userStore.setUserNicknameAction(profile.nickname)
    }
  })
}
const refreshApiKey = async () => {
  // 实现刷新 API Key 的逻辑
  try {
    const res = await refreshUserApiKey()
    if (res) {
      init()
      message.success('API Key 刷新成功')
    } else {
      message.error('刷新 API Key 失败')
    }
  } catch (error) {
    console.error('刷新 API Key 时发生错误:', error)
    message.error('刷新 API Key 时发生错误')
  }
}

const copyApiKey = () => {
  const apiKey = unref(formRef)?.formModel.apikey
  if (apiKey) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(apiKey).then(() => {
        message.success('API Key 已复制到剪贴板')
      }).catch(() => {
        fallbackCopyTextToClipboard(apiKey)
      })
    } else {
      fallbackCopyTextToClipboard(apiKey)
    }
  } else {
    message.warning('API Key 为空')
  }
}

const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea")
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    const successful = document.execCommand('copy')
    if (successful) {
      message.success('API Key 已复制到剪贴板')
    } else {
      message.error('复制失败，请手动复制')
    }
  } catch (err) {
    message.error('复制失败，请手动复制')
  }
  document.body.removeChild(textArea)
}
const init = async () => {
  const res = await getUserProfile()
  unref(formRef)?.setValues(res)
  return res
}
onMounted(async () => {
  await init()
})
</script>
