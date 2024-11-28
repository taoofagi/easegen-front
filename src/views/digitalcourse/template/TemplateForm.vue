<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="150px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="模板名称" prop="templateName">
            <el-input v-model="formData.templateName" maxlength="50" placeholder="请输入模板名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否显示背景" prop="showBackground">
            <el-select v-model="formData.showBackground" placeholder="请选择">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.IS_OR_NOT)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否显示数字人" prop="showDigitalHuman">
            <el-select v-model="formData.showDigitalHuman" placeholder="请选择">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.IS_OR_NOT)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否显示ppt" prop="showPpt">
            <el-select v-model="formData.showPpt" placeholder="请选择">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.IS_OR_NOT)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="ppt宽度" prop="pptW">
            <el-input type="number" v-model="formData.pptW" placeholder="请输入ppt宽" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ppt高度" prop="pptH">
            <el-input type="number" v-model="formData.pptH" placeholder="请输入ppt高" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="ppt距离顶部位置" prop="pptX">
            <el-input type="number" v-model="formData.pptX" placeholder="请输入ppt距离顶部位置" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="ppt距离左侧位置" prop="pptY">
            <el-input type="number" v-model="formData.pptY" placeholder="请输入ppt距离左侧位置" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="数字人宽度" prop="humanW">
            <el-input type="number" v-model="formData.humanW" placeholder="请输入数字人宽" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数字人高度" prop="humanH">
            <el-input type="number" v-model="formData.humanH" placeholder="请输入数字人高" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="数字人距离顶部位置" prop="humanX">
            <el-input type="number" v-model="formData.humanX" placeholder="请输入数字人距离顶部位置" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数字人距离左侧位置" prop="humanY">
            <el-input type="number" v-model="formData.humanY" placeholder="请输入数字人距离左侧位置" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="背景图片" prop="bgImage">
            <UploadImg v-model="formData.bgImage" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预览图片" prop="previewImage">
            <UploadImg v-model="formData.previewImage" />
          </el-form-item>
        </el-col>
      </el-row>








    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { TemplateApi, TemplateVO } from '@/api/digitalcourse/template'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
/** 模板 表单 */
defineOptions({ name: 'TemplateForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  showBackground: undefined,
  templateName: undefined,
  showDigitalHuman: undefined,
  showPpt: undefined,
  pptW: undefined,
  pptH: undefined,
  pptX: undefined,
  pptY: undefined,
  humanW: undefined,
  humanH: undefined,
  humanX: undefined,
  humanY: undefined,
  bgImage: undefined,
})
const formRules = reactive({
  templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
  showBackground: [{ required: true, message: '是否展示背景不能为空', trigger: 'blur' }],
  showDigitalHuman: [{ required: true, message: '是否展示数字人不能为空', trigger: 'blur' }],
  showPpt: [{ required: true, message: '是否展示ppt不能为空', trigger: 'blur' }],
  pptW: [{ required: true, message: 'ppt宽不能为空', trigger: 'blur' }],
  pptH: [{ required: true, message: 'ppt高不能为空', trigger: 'blur' }],
  pptX: [{ required: true, message: 'ppt距离顶部位置不能为空', trigger: 'blur' }],
  pptY: [{ required: true, message: 'ppt距离左侧位置不能为空', trigger: 'blur' }],
  humanW: [{ required: true, message: '数字人宽不能为空', trigger: 'blur' }],
  humanH: [{ required: true, message: '数字人高不能为空', trigger: 'blur' }],
  humanX: [{ required: true, message: '数字人距离顶部位置不能为空', trigger: 'blur' }],
  humanY: [{ required: true, message: '数字人距离左侧位置不能为空', trigger: 'blur' }],
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
      formData.value = await TemplateApi.getTemplate(id)
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
    const data = formData.value as unknown as TemplateVO
    if (formType.value === 'create') {
      await TemplateApi.createTemplate(data)
      message.success(t('common.createSuccess'))
    } else {
      await TemplateApi.updateTemplate(data)
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
    showBackground: undefined,
    showDigitalHuman: undefined,
    showPpt: undefined,
    pptW: undefined,
    pptH: undefined,
    pptX: undefined,
    pptY: undefined,
    humanW: undefined,
    humanH: undefined,
    humanX: undefined,
    humanY: undefined,
    bgImage: undefined,
  }
  formRef.value?.resetFields()
}
</script>
