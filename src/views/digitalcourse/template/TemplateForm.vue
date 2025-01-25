<template>
  <Dialog style="width: 60%;" :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="200px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item :label="t('template.name')" prop="templateName">
            <el-input v-model="formData.templateName" maxlength="50" :placeholder="t('common.inputText') + t('template.name')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('template.isShowBackground')" prop="showBackground">
            <el-select v-model="formData.showBackground" :placeholder="t('common.selectText') + t('template.isShowBackground')">
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
          <el-form-item :label="t('template.isShowDigitalPeople')" prop="showDigitalHuman">
            <el-select v-model="formData.showDigitalHuman" :placeholder="t('common.selectText') + t('template.isShowDigitalPeople')">
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
          <el-form-item :label="t('template.isShowPPt')" prop="showPpt">
            <el-select v-model="formData.showPpt" :placeholder="t('common.selectText') + t('template.isShowPPt')">
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
          <el-form-item :label="t('template.pptWidth')" prop="pptW">
            <el-input type="number" v-model="formData.pptW" :placeholder="t('common.inputText') + t('template.pptWidth')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('template.pptHeight')" prop="pptH">
            <el-input type="number" v-model="formData.pptH" :placeholder="t('common.inputText') + t('template.pptHeight')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="t('template.topPositionPPT')" prop="pptX">
            <el-input type="number" v-model="formData.pptX" :placeholder="t('common.inputText') + t('template.topPositionPPT')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('template.leftPositionPPT')" prop="pptY">
            <el-input type="number" v-model="formData.pptY" :placeholder="t('common.inputText') + t('template.leftPositionPPT')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="t('template.digitalPeopleWidth')" prop="humanW">
            <el-input type="number" v-model="formData.humanW" :placeholder="t('common.inputText') + t('template.digitalPeopleWidth')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('template.digitalPeopleHeight')" prop="humanH">
            <el-input type="number" v-model="formData.humanH" :placeholder="t('common.inputText') + t('template.digitalPeopleHeight')" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="t('template.topPositionDigitalPeople')" prop="humanX">
            <el-input type="number" v-model="formData.humanX" :placeholder="t('common.inputText') + t('template.topPositionDigitalPeople')" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('template.leftPositionDigitalPeople')" prop="humanY">
            <el-input type="number" v-model="formData.humanY" :placeholder="t('common.inputText') + t('template.leftPositionDigitalPeople')" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item :label="t('template.templateSize')" prop="templateSize">
            <el-select
              v-model="formData.templateSize"
              clearable
              :placeholder="t('common.selectText') + t('template.templateSize')"
              class="!w-240px"
            >
              <el-option
                v-for="dict in getStrDictOptions(DICT_TYPE.TEMPLATE_SIZE)"
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
          <el-form-item :label="t('template.backgroundImage')" prop="bgImage">
            <UploadImg v-model="formData.bgImage" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('template.reviewImage')" prop="previewImage">
            <UploadImg v-model="formData.previewImage" />
          </el-form-item>
        </el-col>
      </el-row>








    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">{{ t('common.ok') }}</el-button>
      <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { TemplateApi, TemplateVO } from '@/api/digitalcourse/template'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
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
  templateName: [{ required: true, message: t('template.name') + t('common.notEmpty'), trigger: 'blur' }],
  showBackground: [{ required: true, message: t('template.isShowBackground') + t('common.notEmpty'), trigger: 'blur' }],
  showDigitalHuman: [{ required: true, message: t('template.isShowDigitalPeople') + t('common.notEmpty'), trigger: 'blur' }],
  showPpt: [{ required: true, message: t('template.isShowPPt') + t('common.notEmpty'), trigger: 'blur' }],
  pptW: [{ required: true, message: t('template.pptWidth') + t('common.notEmpty'), trigger: 'blur' }],
  pptH: [{ required: true, message: t('template.pptHeight') + t('common.notEmpty'), trigger: 'blur' }],
  pptX: [{ required: true, message: t('template.topPositionPPT') + t('common.notEmpty'), trigger: 'blur' }],
  pptY: [{ required: true, message: t('template.leftPositionPPT') + t('common.notEmpty'), trigger: 'blur' }],
  humanW: [{ required: true, message: t('template.digitalPeopleWidth') + t('common.notEmpty'), trigger: 'blur' }],
  humanH: [{ required: true, message: t('template.digitalPeopleHeight') + t('common.notEmpty'), trigger: 'blur' }],
  humanX: [{ required: true, message: t('template.topPositionDigitalPeople') + t('common.notEmpty'), trigger: 'blur' }],
  humanY: [{ required: true, message: t('template.leftPositionDigitalPeople') + t('common.notEmpty'), trigger: 'blur' }],
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
