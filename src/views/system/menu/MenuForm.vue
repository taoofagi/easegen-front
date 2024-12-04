<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item :label="t('menu.parentName')">
        <el-tree-select
          v-model="formData.parentId"
          :data="menuTree"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          check-strictly
          node-key="id"
        />
      </el-form-item>
      <el-form-item :label="t('menu.name')" prop="name">
        <el-input
          v-model="formData.name"
          clearable
          :placeholder="t('common.inputText') + t('menu.name')"
        />
      </el-form-item>
      <el-form-item :label="t('menu.type')" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_TYPE)"
            :key="dict.label"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" :label="t('menu.icon')">
        <IconSelect v-model="formData.icon" clearable />
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" :label="t('menu.routePath')" prop="path">
        <template #label>
          <Tooltip :routePathTip="t('menu.routePath')" :title="t('menu.routePath')" />
        </template>
        <el-input
          v-model="formData.path"
          clearable
          :placeholder="t('common.inputText') + t('menu.routePath')"
        />
      </el-form-item>
      <el-form-item v-if="formData.type === 2" :label="t('menu.componentPath')" prop="component">
        <el-input
          v-model="formData.component"
          clearable
          :placeholder="t('menu.componentPathPlaceholder')"
        />
      </el-form-item>
      <el-form-item
        v-if="formData.type === 2"
        :label="t('menu.componentName')"
        prop="componentName"
      >
        <el-input
          v-model="formData.componentName"
          clearable
          :placeholder="t('menu.componentNamePlaceholder')"
        />
      </el-form-item>
      <el-form-item v-if="formData.type !== 1" :label="t('menu.permission')" prop="permission">
        <template #label>
          <Tooltip :message="t('menu.permissionTip')" :title="t('menu.permission')" />
        </template>
        <el-input
          v-model="formData.permission"
          clearable
          :placeholder="t('common.inputText') + t('menu.permission')"
        />
      </el-form-item>
      <el-form-item :label="t('menu.sort')" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" clearable controls-position="right" />
      </el-form-item>
      <el-form-item :label="t('menu.status')" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.label"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" :label="t('menu.visible')" prop="visible">
        <template #label>
          <Tooltip :message="t('menu.visibleTip')" :title="t('menu.visible')" />
        </template>
        <el-radio-group v-model="formData.visible">
          <el-radio key="true" :value="true" border>{{ t('menu.display') }}</el-radio>
          <el-radio key="false" :value="false" border>{{ t('menu.hide') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" :label="t('menu.alwaysDisplay')" prop="alwaysShow">
        <template #label>
          <Tooltip :message="t('menu.alwaysDisplayTip')" :title="t('menu.alwaysDisplay')" />
        </template>
        <el-radio-group v-model="formData.alwaysShow">
          <el-radio key="true" :value="true" border>{{ t('menu.always') }}</el-radio>
          <el-radio key="false" :value="false" border>{{ t('menu.no') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type === 2" :label="t('menu.cacheStatus')" prop="keepAlive">
        <template #label>
          <Tooltip :message="t('menu.cacheStatusTip')" :title="t('menu.cacheStatus')" />
        </template>
        <el-radio-group v-model="formData.keepAlive">
          <el-radio key="true" :value="true" border>{{ t('menu.cache') }}</el-radio>
          <el-radio key="false" :value="false" border>{{ t('menu.notCache') }}</el-radio>
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
import * as MenuApi from '@/api/system/menu'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { CommonStatusEnum, SystemMenuTypeEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SystemMenuForm' })

const { wsCache } = useCache()
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: '',
  permission: '',
  type: SystemMenuTypeEnum.DIR,
  sort: Number(undefined),
  parentId: 0,
  path: '',
  icon: '',
  component: '',
  componentName: '',
  status: CommonStatusEnum.ENABLE,
  visible: true,
  keepAlive: true,
  alwaysShow: true
})
const formRules = reactive({
  name: [{ required: true, message: t('menu.name')+t('common.notEmpty'), trigger: 'blur' }],
  sort: [{ required: true, message: t('menu.sort')+t('common.notEmpty'), trigger: 'blur' }],
  path: [{ required: true, message: t('menu.routePath')+t('common.notEmpty'), trigger: 'blur' }],
  status: [{ required: true, message: t('menu.status')+t('common.notEmpty'), trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number, parentId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (parentId) {
    formData.value.parentId = parentId
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await MenuApi.getMenu(id)
    } finally {
      formLoading.value = false
    }
  }
  // 获得菜单列表
  await getTree()
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
    if (
      formData.value.type === SystemMenuTypeEnum.DIR ||
      formData.value.type === SystemMenuTypeEnum.MENU
    ) {
      if (!isExternal(formData.value.path)) {
        if (formData.value.parentId === 0 && formData.value.path.charAt(0) !== '/') {
          message.error('路径必须以 / 开头')
          return
        } else if (formData.value.parentId !== 0 && formData.value.path.charAt(0) === '/') {
          message.error('路径不能以 / 开头')
          return
        }
      }
    }
    const data = formData.value as unknown as MenuApi.MenuVO
    if (formType.value === 'create') {
      await MenuApi.createMenu(data)
      message.success(t('common.createSuccess'))
    } else {
      await MenuApi.updateMenu(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
    // 清空，从而触发刷新
    wsCache.delete(CACHE_KEY.ROLE_ROUTERS)
  }
}

/** 获取下拉框[上级菜单]的数据  */
const menuTree = ref<Tree[]>([]) // 树形结构
const getTree = async () => {
  menuTree.value = []
  const res = await MenuApi.getSimpleMenusList()
  let menu: Tree = { id: 0, name: '主类目', children: [] }
  menu.children = handleTree(res)
  menuTree.value.push(menu)
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    permission: '',
    type: SystemMenuTypeEnum.DIR,
    sort: Number(undefined),
    parentId: 0,
    path: '',
    icon: '',
    component: '',
    componentName: '',
    status: CommonStatusEnum.ENABLE,
    visible: true,
    keepAlive: true,
    alwaysShow: true
  }
  formRef.value?.resetFields()
}

/** 判断 path 是不是外部的 HTTP 等链接 */
const isExternal = (path: string) => {
  return /^(https?:|mailto:|tel:)/.test(path)
}
</script>
