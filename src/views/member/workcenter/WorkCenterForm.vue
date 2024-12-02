<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="行业" prop="industry">
        <el-select v-model="formData.industry" placeholder="请选择行业">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MEMBER_INDUSTRY)"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="场景" prop="scene">
        <el-select v-model="formData.scene" placeholder="请选择场景">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MEMBER_SCENE)"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="语种" prop="language">
        <el-select v-model="formData.language" placeholder="请选择语种">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MEMBER_LANGUAGE)"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="作品上传" prop="workUrl">
        <uploadFile v-if="!formData.workUrl" drag :limit="1" :modelValue="formData.workUrl" @getDuration="getDuration" v-model="formData.workUrl" :isShowFileList="false" :fileType="fileType"/>
        <video-player v-if="formData.workUrl" :property="videoProperty"/>
      </el-form-item>
      <el-form-item label="封面" prop="thumbnail">
        <UploadImg v-model="formData.thumbnail" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { WorkCenterApi, WorkCenterVO } from '@/api/member/workcenter'
import {DICT_TYPE, getIntDictOptions} from "@/utils/dict";
import VideoPlayer from "@/components/DiyEditor/components/mobile/VideoPlayer/index.vue";
import {VideoPlayerProperty} from "@/components/DiyEditor/components/mobile/VideoPlayer/config";
import {DiyComponent} from "@/components/DiyEditor/util";

/** 作品中心 表单 */
defineOptions({ name: 'WorkCenterForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const showVideo = ref(false)
const formData = ref({
  id: undefined,
  industry: undefined,
  scene: undefined,
  language: undefined,
  workType: undefined,
  workDuration: undefined,
  coverUrl: undefined,
  workName:'',
  workUrl: undefined,
})
const fileType = ref(['mp4','wmv'])
const formRules = reactive({
})
const formRef = ref() // 表单 Ref

const getDuration = (duration,name)=>{
  formData.value.workDuration = duration
  formData.value.workName = name
  console.log(formData.value,name)
}

const videoProperty = {
      videoUrl: '',
      posterUrl: '',
      autoplay: false,
      style: {
        bgType: 'color',
        bgColor: '#fff',
        marginBottom: 8,
        height: 300
  }
} as DiyComponent<VideoPlayerProperty>

watch(()=> formData.value.workUrl,(newVal,oldValue)=>{
  if (newVal && newVal.length > 0){
    videoProperty.videoUrl = newVal
    showVideo.value = true
  }
})

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
      formData.value = await WorkCenterApi.getWorkCenter(id)
      console.log(formData.value)
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
    const data = formData.value as unknown as WorkCenterVO
    if (formType.value === 'create') {
      await WorkCenterApi.createWorkCenter(data)
      message.success(t('common.createSuccess'))
    } else {
      await WorkCenterApi.updateWorkCenter(data)
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
    industry: undefined,
    scene: undefined,
    language: undefined,
    workType: undefined,
    workDuration: undefined,
    coverUrl: undefined,
    workName: undefined,
    workUrl: undefined,
  }
  formRef.value?.resetFields()
}
</script>
