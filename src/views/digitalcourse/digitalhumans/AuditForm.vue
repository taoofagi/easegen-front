<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible"  width="50%">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item :label="t('digitalhumans.name')" prop="name">
        <el-input disabled v-model="formData.name" :placeholder="t('common.inputText') + t('digitalhumans.name')" />
      </el-form-item>
      <el-form-item :label="t('digitalhumans.code')" prop="code">
        <el-input disabled v-model="formData.code" :placeholder="t('common.inputText') + t('digitalhumans.code')" />
      </el-form-item>
      <el-form-item :label="t('digitalhumans.picture')" v-if="formData.useModel == 1" prop="pictureUrl">
        <UploadImg disabled v-model="formData.pictureUrl" />
      </el-form-item>
      <el-form-item v-if="formData.useModel == 2" :label="t('digitalhumans.video')" prop="videoUrl">
        <UploadFile v-if="!(formData.videoUrl || formData.fixVideoUrl)" v-model="formData.videoUrl" :fileType="['mp4']" :limit="1" @on-success="handleFileSuccess('fixVideoUrl', $event)"/>
        <video-player v-if="formData.videoUrl || formData.fixVideoUrl" :property="videoProperty"/>
      </el-form-item>
      <el-form-item :label="t('digitalhumans.type')" prop="type">
        <el-select disabled v-model="formData.type" :placeholder="t('common.selectText') + t('digitalhumans.type')">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.USE_MODEL)"
            :key="dict.value"
            ::label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('digitalhumans.fixPicture')" v-if="formData.useModel == 1 && formData.status > 1" prop="fixPictureUrl">
        <UploadImg readonly v-model="formData.fixPictureUrl" />
      </el-form-item>
      <el-form-item v-if="formData.useModel == 2 && formData.status > 1" :label="t('digitalhumans.fixVideo')" prop="fixVideoUrl">
        <div class="flex flex-col gap-2">
          <div class="flex items-start gap-2">
            <el-button v-if="formData.videoUrl && !formData.fixVideoUrl" @click="useOriginalVideo" type="primary">
              {{ t('digitalhumans.useOriginalVideo') }}
            </el-button>
          </div>
          <div class="flex flex-col gap-2">
            <div class="text-gray-500 text-sm mb-2">{{ t('digitalhumans.transparentBgTip') }}</div>
            <!-- 添加手动输入视频URL的输入框 -->
            <el-input
              v-model="formData.fixVideoUrl"
              :placeholder="t('digitalhumans.inputVideoUrl')"
              class="mb-2"
            >
              <template #append>
                <el-button @click="handleManualVideoUrl">{{ t('digitalhumans.confirm') }}</el-button>
              </template>
            </el-input>
            <!-- 保留原有的上传功能 -->
            <div class="text-gray-500 text-sm">{{ t('digitalhumans.orUploadVideo') }}</div>
            <UploadFile 
              v-model="formData.fixVideoUrl" 
              :fileType="['mp4','mov']" 
              :limit="1" 
              :file-size="1024" 
              @on-success="handleFileSuccess('fixVideoUrl', $event)"
            />
          </div>
        </div>
        <video-player v-if="formData.fixVideoUrl" :property="videoProperty"/>
      </el-form-item>
      <el-form-item v-if="formData.status == 0" :label="t('digitalhumans.expireDate')">
        <el-date-picker
          v-model="formData.expireDate"
          :placeholder="t('common.selectText') + t('digitalhumans.expireDate')"
          type="datetime"
          value-format="x"
          class="!w-1/1"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm()" type="primary" :disabled="formLoading">{{ getButtonTitle(formData.status) || t('common.save') }}</el-button>
      <el-button v-if="formData.status == 1" @click="submitForm(4)" type="danger" :disabled="formLoading">{{t('digitalhumans.reject')}}</el-button>
      <el-button @click="dialogVisible = false">{{t('common.cancel')}}</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import * as DigitalHumansApi from '@/api/digitalcourse/digitalhumans'
import { getButtonTitle } from '../common'
import VideoPlayer from "@/components/DiyEditor/components/mobile/VideoPlayer/index.vue";
import {DiyComponent} from "@/components/DiyEditor/util";
import {VideoPlayerProperty} from "@/components/DiyEditor/components/mobile/VideoPlayer/config";
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  expireStatus: undefined,
  finishTime: undefined,
  gender: undefined,
  matting: undefined,
  name: undefined,
  code: undefined,
  pictureUrl: undefined,
  posture: undefined,
  snapshotHeight: undefined,
  snapshotUrl: undefined,
  snapshotWidth: undefined,
  type: undefined,
  useGeneralModel: undefined,
  useModel: undefined,
  status: undefined,
})
const formRules = reactive({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  pictureUrl: [{ required: true, message: '图片URL不能为空', trigger: 'blur' }],
  snapshotHeight: [{ required: true, message: '快照高度不能为空', trigger: 'blur' }],
  snapshotUrl: [{ required: true, message: '快照URL不能为空', trigger: 'blur' }],
  snapshotWidth: [{ required: true, message: '快照宽度不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
  useGeneralModel: [{ required: true, message: '使用通用模型不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref

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

watch(()=> formData.value.videoUrl,(newVal,oldValue)=>{
  if (newVal && newVal.length > 0){
    videoProperty.videoUrl = formData.value.fixVideoUrl || newVal
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
      formData.value = await DigitalHumansApi.getDigitalHumans(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 处理手动输入的视频URL
const handleManualVideoUrl = async () => {
  if (!formData.value.fixVideoUrl) {
    message.warning(t('digitalhumans.pleaseInputVideoUrl'))
    return
  }
  
  // 验证URL格式
  try {
    new URL(formData.value.fixVideoUrl)
  } catch (e) {
    message.error(t('digitalhumans.invalidVideoUrl'))
    return
  }

  try {
    await DigitalHumansApi.updateDigitalHumans(formData.value)
    message.success(t('common.updateSuccess'))
  } catch (error) {
    message.error(t('common.updateError'))
  }
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async (status) => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    if (formData.value.status == 2) formData.value.status = 3
    if (formData.value.status == 1) formData.value.status = 2
    if (formData.value.status == 4) formData.value.status = 1
    if (status) formData.value.status = 4
    const data = formData.value as unknown as DigitalHumansApi.DigitalHumansVO
    if (formType.value === 'create') {
      await DigitalHumansApi.createDigitalHumans(data)
      message.success(t('common.createSuccess'))
    } else {
      await DigitalHumansApi.updateDigitalHumans(data)
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
    expireStatus: undefined,
    finishTime: undefined,
    gender: undefined,
    matting: undefined,
    name: undefined,
    code: undefined,
    pictureUrl: undefined,
    posture: undefined,
    snapshotHeight: undefined,
    snapshotUrl: undefined,
    snapshotWidth: undefined,
    type: undefined,
    useGeneralModel: undefined,
    useModel: undefined,
    status: undefined,
  }
  formRef.value?.resetFields()
}

const handleFileSuccess = (fileType,response) => {
  if (fileType === 'fixVideoUrl') {
    formData.value.fixVideoUrl = response.data;
  }
  if (fileType === 'videoUrl') {
    formData.value.videoUrl = response.data;
  }
};

const useOriginalVideo = async () => {
  formData.value.fixVideoUrl = formData.value.videoUrl;
  try {
    await DigitalHumansApi.updateDigitalHumans(formData.value);
    message.success(t('common.updateSuccess'));
  } catch (error) {
    message.error(t('common.updateError'));
  }
};
</script>

