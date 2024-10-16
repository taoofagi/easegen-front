<template>
  <!-- 定义 tab 组件：撰写/回复等 -->
  <DefineTab v-slot="{ active, text, itemClick }">
    <span
      :class="active ? 'text-black shadow-md' : 'hover:bg-[#DDDFE3]'"
      class="inline-block w-1/2 rounded-full cursor-pointer text-center leading-[30px] relative z-1 text-[5C6370] hover:text-black"
      @click="itemClick"
    >
      {{ text }}
    </span>
  </DefineTab>
  <!-- 定义 label 组件：题型 难度 -->
  <DefineLabel v-slot="{ label, hint, hintClick }">
    <h3 class="mt-5 mb-3 flex items-center justify-between text-[14px]">
      <span>{{ label }}</span>
      <span
        v-if="hint"
        class="flex items-center text-[12px] text-[#846af7] cursor-pointer select-none"
        @click="hintClick"
      >
        <Icon icon="ep:question-filled" />
        {{ hint }}
      </span>
    </h3>
  </DefineLabel>

  <div class="flex flex-col" v-bind="$attrs">
    <!-- tab -->
    <div class="w-full pt-2 bg-[#f5f7f9] flex justify-center">
      <div class="w-[303px] rounded-full bg-[#DDDFE3] p-1 z-10">
        <div
          :class="
            selectedTab === GenQuestionTypeEnum.DOC && 'after:transform after:translate-x-[100%]'
          "
          class="flex items-center relative after:content-[''] after:block after:bg-white after:h-[30px] after:w-1/2 after:absolute after:top-0 after:left-0 after:transition-transform after:rounded-full"
        >
          <ReuseTab
            v-for="tab in tabs"
            :key="tab.value"
            :active="tab.value === selectedTab"
            :itemClick="() => switchTab(tab.value)"
            :text="tab.text"
          />
        </div>
      </div>
    </div>
    <div
      class="px-7 pb-2 flex-grow overflow-y-auto lg:block w-[380px] box-border bg-[#f5f7f9] h-full"
    >
      <div>
        <ReuseLabel :hint-click="() => example('write')" hint="" label="题目要求" />
        <el-input
          v-model="formData.text"
          :maxlength="10000"
          :rows="5"
          placeholder="请输入题目要求"
          showWordLimit
          type="textarea"
        />

        <ReuseLabel label="上传文件" v-if="selectedTab === 2" />
        <template v-if="selectedTab === 2">
          <el-upload
            v-loading="isUploading"
            :loading="isUploading"
            ref="uploadRef"
            class="custom-upload"
            accept=".pdf,.txt,.docx"
            :limit="1"
            :headers="headers"
            :action="`${config.base_url}/infra/file/upload`"
            :on-exceed="handleExceed"
            :on-change="handleChange"
            :on-success="handleSuccess"
            :on-error="handleError"
            :show-file-list="false"
            drag
          >
            <div class="upload-content" style="background-color: #F2F7FC; border: 1px dashed #d9d9d9; display: flex; align-items: center; justify-content: center; height: 200px;">
              <div class="upload-area" style="text-align: center;">
                <img src="data:image/png;base64,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" alt="Upload Icon" class="upload-icon" style="width: 32px; height: 37px; margin-bottom: 10px;" />
                <p class="upload-text" style="font-size: 14px; color: #409eff;">
                  <span class="upload-link" style="color: #409eff; text-decoration: underline;">点击上传</span>，或拖动文档到这里
                </p>
                <p class="upload-hint" style="font-size: 12px; color: #999;">支持扩展名：.pdf,.txt,.docx。单个文档大小限制20M</p>
              </div>
            </div>
          </el-upload>
        </template>

        <ReuseLabel label="选择题型" />
        <Tag v-model="formData.questionType" :tags="getIntDictOptions(DICT_TYPE.DIGITALCOURSE_GENQUESTION_QUESTION_TYPE)" />
        <ReuseLabel label="试题难度" />
        <Tag v-model="formData.difficulty" :tags="getIntDictOptions(DICT_TYPE.DIGITALCOURSE_GENQUESTION_DIFFICULTY)" />
        <ReuseLabel label="生成数量" />
        <el-input v-model="formData.numQuestions" type="number" :min="1" :max="50" />

        <div class="flex items-center justify-center mt-3">
          <el-button :disabled="isWriting" @click="reset">重置</el-button>
          <el-button :loading="isWriting" color="#846af7" @click="submit">生成</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { createReusableTemplate } from '@vueuse/core'
import { ref, reactive, computed } from 'vue'
import Tag from './Tag.vue'
import { omit } from 'lodash-es'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { docparseApi, GenQuestionVO } from "@/api/digitalcourse/genQuestion";
import { GenQuestionTypeEnum } from "@/views/digitalcourse/utils/constants";
import { config } from "@/config/axios/config";
import { getAccessToken, getTenantId } from "@/utils/auth";
import { UploadRawFile } from "element-plus";

const message = useMessage() // 消息弹窗

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isWriting: {
    type: Boolean,
    default: false
  }
})

/** 通过计算属性，双向绑定，更改生成的内容，考虑到用户想要更改生成文章的情况 */
const compContent = computed({
  get() {
    return props.content
  },
  set(val) {
    formData.value.text = val
  }
})

const isUploading = ref(false);
const handleError = (err) => {
  console.error('上传错误', err);
  isUploading.value = false;
  uploadRef.value!.clearFiles();
};

const emits = defineEmits<{
  (e: 'submit', params: Partial<GenQuestionVO>)
  (e: 'uploadsuccess', params)
  (e: 'example', param: 'write' | 'reply')
  (e: 'reset')
}>()

/** 点击示例的时候，将定义好的文章作为示例展示出来 **/
const example = (type: 'write' | 'reply') => {
  formData.value = {
    ...initData,
    ...omit(WriteExample[type], ['data'])
  }
  emits('example', type)
}

/** 重置，将表单值作为初选值 **/
const reset = () => {
  formData.value = { ...initData }
  emits('reset')
}

const selectedTab = ref<TabType>(GenQuestionTypeEnum.REQUIRE)
const tabs: {
  text: string
  value: TabType
}[] = [
  { text: '按照要求生成', value: GenQuestionTypeEnum.REQUIRE },
  { text: '依据资料生成', value: GenQuestionTypeEnum.DOC }
]
const [DefineTab, ReuseTab] = createReusableTemplate<{
  active?: boolean
  text: string
  itemClick: () => void
}>()

/**
 * 可以在 template 里边定义可复用的组件，DefineLabel，ReuseLabel 是采用的解构赋值，都是 Vue 组件
 *
 * 直接通过组件的形式使用，<DefineLabel v-slot="{ label, hint, hintClick }"> 中间是需要复用的组件代码 <DefineLabel />，通过 <ReuseLabel /> 来使用定义的组件
 * DefineLabel 里边的 v-slot="{ label, hint, hintClick }"相当于是解构了组件的 prop，需要注意的是 boolean 类型，需要显式的赋值比如 <ReuseLabel :flag="true" />
 * 事件也得以 prop 形式传入，不能是 @event的形式，比如下面的 hintClick 需要<ReuseLabel :hintClick="() => { doSomething }"/>
 *
 * @see https://vueuse.org/createReusableTemplate
 */
const [DefineLabel, ReuseLabel] = createReusableTemplate<{
  label: string
  class?: string
  hint?: string
  hintClick?: () => void
}>()

const initData: GenQuestionVO = {
  type: 1,
  text: '',
  questionType: 'single_choice', // 题型
  difficulty: 'easy', // 难度
  numQuestions: 5 // 题目数量
}
const formData = ref<GenQuestionVO>({ ...initData })

/** 用来记录切换之前所填写的数据，切换的时候给赋值回来 **/
const recordFormData = {} as Record<GenQuestionTypeEnum, GenQuestionVO>

/** 切换tab **/
const switchTab = (value: TabType) => {
  if (value !== selectedTab.value) {
    // 保存之前的久数据
    recordFormData[selectedTab.value] = formData.value
    selectedTab.value = value
    // 将之前的旧数据赋值回来
    formData.value = { ...initData, ...recordFormData[value] }
  }
}

/** 提交写作 */
const submit = () => {
  if (!formData.value.text) {
    message.warning(`请输入${selectedTab.value === 1 ? '题目要求' : '参考资料'}内容`)
    return
  }
  if (!formData.value.questionType) {
    message.warning(`请选择题型`)
    return
  }
  if (!formData.value.difficulty) {
    message.warning(`请选择难度`)
    return
  }
  if (!formData.value.numQuestions) {
    message.warning(`请输入生成数量`)
    return
  }
  emits('submit', {
    /** 撰写的时候没有 originalContent 字段**/
    ...(selectedTab.value === 1 ? omit(formData.value, ['originalContent']) : formData.value),
    /** 使用选中 tab 值覆盖当前的 type 类型 **/
    type: selectedTab.value
  })
}

const uploadRef = ref()
const headers = {
  Accept: 'application/json, text/plain, */*',
  Authorization: 'Bearer ' + getAccessToken(),
  'tenant-id': getTenantId()
}
const uploadFileObj = reactive({
  filename: '',
  text: 0,
})
const handleExceed = (files) => {
  isUploading.value = false;
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}
const handleChange = (files) => {
  isUploading.value = true;
  uploadFileObj.filename = files.name;
};

const handleSuccess = async (rawFile) => {
  uploadRef.value!.clearFiles();
  message.success('上传成功，开始解析文件！')
  try {
    const response = await docparseApi({
      type: 'text',
      fileUrl: rawFile.data
    })
    console.log('response:',response)
    formData.value.text = response
    message.success('文件解析成功！')
  } catch (error) {
    console.error('解析文件异常', error)
    message.success('文件解析失败！')
  } finally {
    isUploading.value = false;
  }
}
</script>
