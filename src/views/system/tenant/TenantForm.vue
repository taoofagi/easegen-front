<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item :label="t('tenant.name')" prop="name">
        <el-input v-model="formData.name" :placeholder="t('common.inputText')+t('tenant.name')" />
      </el-form-item>
      <el-form-item :label="t('tenant.package')" prop="packageId">
        <el-select v-model="formData.packageId" clearable :placeholder="t('common.selectText')+t('tenant.package')">
          <el-option
            v-for="item in packageList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('tenant.contactName')" prop="contactName">
        <el-input v-model="formData.contactName" :placeholder="t('common.inputText')+t('tenant.contactName')" />
      </el-form-item>
      <el-form-item :label="t('tenant.mobile')" prop="contactMobile">
        <el-input v-model="formData.contactMobile" :placeholder="t('common.inputText')+t('tenant.contactMobile')" />
      </el-form-item>
      <el-form-item v-if="formData.id === undefined" :label="t('tenant.username')" prop="username">
        <el-input v-model="formData.username" :placeholder="t('common.inputText')+t('tenant.username')" />
      </el-form-item>
      <el-form-item v-if="formData.id === undefined" :label="t('tenant.password')" prop="password">
        <el-input
          v-model="formData.password"
          :placeholder="t('common.inputText')+t('tenant.password')"
          show-password
          type="password"
        />
      </el-form-item>
      <el-form-item :label="t('tenant.accountLimit')" prop="accountCount">
        <el-input-number
          v-model="formData.accountCount"
          :min="0"
          controls-position="right"
          :placeholder="t('common.inputText')+t('tenant.accountLimit')"
        />
      </el-form-item>
      <el-form-item :label="t('tenant.expireTime')" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          clearable
          :placeholder="t('common.selectText')+t('tenant.expireTime')"
          type="date"
          value-format="x"
        />
      </el-form-item>
      <el-form-item :label="t('tenant.website')" prop="website">
        <el-input v-model="formData.website" :placeholder="t('common.selectText')+t('tenant.website')" />
      </el-form-item>
      <el-form-item :label="t('tenant.status')" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">{{ t('common.ok') }}</el-button>
      <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as TenantApi from '@/api/system/tenant'
import { CommonStatusEnum } from '@/utils/constants'
import * as TenantPackageApi from '@/api/system/tenantPackage'

defineOptions({ name: 'SystemTenantForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  packageId: undefined,
  contactName: undefined,
  contactMobile: undefined,
  accountCount: undefined,
  expireTime: undefined,
  website: undefined,
  status: CommonStatusEnum.ENABLE,
  // 新增专属
  username: undefined,
  password: undefined
})
const formRules = reactive({
  name: [{ required: true, message: t('tenant.name')+t('common.notEmpty'), trigger: 'blur' }],
  packageId: [{ required: true, message: t('tenant.package')+t('common.notEmpty'), trigger: 'blur' }],
  contactName: [{ required: true, message: t('tenant.contactName')+t('common.notEmpty'), trigger: 'blur' }],
  status: [{ required: true, message: t('tenant.status')+t('common.notEmpty'), trigger: 'blur' }],
  accountCount: [{ required: true, message: t('tenant.accountLimit')+t('common.notEmpty'), trigger: 'blur' }],
  expireTime: [{ required: true, message: t('tenant.expireTime')+t('common.notEmpty'), trigger: 'blur' }],
  website: [{ required: true, message: t('tenant.website')+t('common.notEmpty'), trigger: 'blur' }],
  username: [{ required: true, message: t('tenant.username')+t('common.notEmpty'), trigger: 'blur' }],
  password: [{ required: true, message:  t('tenant.password')+t('common.notEmpty'), trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const packageList = ref([] as TenantPackageApi.TenantPackageVO[]) // 租户套餐

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
      formData.value = await TenantApi.getTenant(id)
    } finally {
      formLoading.value = false
    }
  }
  // 加载套餐列表
  packageList.value = await TenantPackageApi.getTenantPackageList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as TenantApi.TenantVO
    if (formType.value === 'create') {
      await TenantApi.createTenant(data)
      message.success(t('common.createSuccess'))
    } else {
      await TenantApi.updateTenant(data)
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
    packageId: undefined,
    contactName: undefined,
    contactMobile: undefined,
    accountCount: undefined,
    expireTime: undefined,
    website: undefined,
    status: CommonStatusEnum.ENABLE,
    username: undefined,
    password: undefined
  }
  formRef.value?.resetFields()
}
</script>
