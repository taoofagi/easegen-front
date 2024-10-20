<template>
  <Form ref="formRef" :labelWidth="200" :rules="rules" :schema="schema">
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

defineOptions({ name: 'BasicInfo' })

const { t } = useI18n()
const message = useMessage() // 消息弹窗
const userStore = useUserStore()
// 表单校验
const rules = reactive<FormRules>({
  nickname: [{ required: true, message: t('profile.rules.nickname'), trigger: 'blur' }],
  email: [
    { required: true, message: t('profile.rules.mail'), trigger: 'blur' },
    {
      type: 'email',
      message: t('profile.rules.truemail'),
      trigger: ['blur', 'change']
    }
  ],
  mobile: [
    { required: true, message: t('profile.rules.phone'), trigger: 'blur' },
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: t('profile.rules.truephone'),
      trigger: 'blur'
    }
  ]
})
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
    console.log('res', res)
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
    navigator.clipboard.writeText(apiKey).then(() => {
      message.success('API Key 已复制到剪贴板')
    }).catch(() => {
      message.error('复制失败，请手动复制')
    })
  } else {
    message.warning('API Key 为空')
  }
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
