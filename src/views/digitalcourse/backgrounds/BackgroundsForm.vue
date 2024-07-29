<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="背景类型" prop="backgroundType">
        <el-select v-model="formData.backgroundType" placeholder="请选择背景类型">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.DIGITALCOURSE_BACKGROUNDS_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="背景名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入背景名称" />
      </el-form-item>
      <el-form-item label="原始图片URL" prop="originalUrl">
        <UploadImg v-model="formData.originalUrl" />
      </el-form-item>
      <el-form-item label="图片URL" prop="pictureUrl">
        <UploadImg v-model="formData.pictureUrl" />
      </el-form-item>
      <el-form-item label="图片宽度" prop="width">
        <el-input v-model="formData.width" placeholder="请输入图片宽度" />
      </el-form-item>
      <el-form-item label="图片高度" prop="height">
        <el-input v-model="formData.height" placeholder="请输入图片高度" />
      </el-form-item>
      <el-form-item label="文件大小 " prop="size">
        <el-input v-model="formData.size" placeholder="请输入文件大小 " />
      </el-form-item>
      <el-form-item label="时长" prop="duration">
        <el-input v-model="formData.duration" placeholder="请输入时长" />
      </el-form-item>
      <el-form-item label="是否预设" prop="preset">
        <el-select v-model="formData.preset" placeholder="请选择是否预设">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.DIGITALCOURSE_DIGITALHUMAN_MATTING)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import * as BackgroundsApi from '@/api/digitalcourse/backgrounds'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  backgroundType: undefined,
  name: undefined,
  originalUrl: undefined,
  pictureUrl: undefined,
  width: undefined,
  height: undefined,
  size: undefined,
  duration: undefined,
  preset: undefined,
  status: undefined,
})
const formRules = reactive({
  backgroundType: [{ required: true, message: '背景类型不能为空', trigger: 'change' }],
  name: [{ required: true, message: '背景名称不能为空', trigger: 'blur' }],
  originalUrl: [{ required: true, message: '原始图片URL不能为空', trigger: 'blur' }],
  preset: [{ required: true, message: '预设标识不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
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
      formData.value = await BackgroundsApi.getBackgrounds(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as BackgroundsApi.BackgroundsVO
    if (formType.value === 'create') {
      await BackgroundsApi.createBackgrounds(data)
      message.success(t('common.createSuccess'))
    } else {
      await BackgroundsApi.updateBackgrounds(data)
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
    backgroundType: undefined,
    name: undefined,
    originalUrl: undefined,
    pictureUrl: undefined,
    width: undefined,
    height: undefined,
    size: undefined,
    duration: undefined,
    preset: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}
</script>