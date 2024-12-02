<template>
  <el-dialog
    :title="t('courseCenter.batchReplaceContent')"
    v-model="replaceDialogVisible"
    width="600px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="replacement-input">
      <div v-for="(replacement, index) in replacements" :key="index" class="replacement-row">
        <el-input
          v-model="replacement.from"
          :placeholder="t('courseCenter.batchReplaceContentFrom')"
          class="flat-input"
        />
        <el-input
          v-model="replacement.to"
          :placeholder="t('courseCenter.batchReplaceContentTo')"
          class="flat-input"
        />
        <el-button type="danger" @click="removeReplacement(index)" class="flat-button delete-button">{{t('form.delete')}}</el-button>
      </div>
    </div>
    <el-button class="flat-button add-button" @click="addReplacement">{{t('form.AddNewReplacement')}}</el-button>
    <el-button class="flat-button add-button" @click="getPunctuationMarks">{{t('form.replaceEnglishPunctuationMarks')}}</el-button>
    <template #footer>
      <el-button class="flat-button cancel-button" @click="replaceDialogVisible = false">{{t('common.cancel')}}</el-button>
      <el-button type="primary" class="flat-button confirm-button" @click="applyReplacements">{{t('common.ok')}}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, toRefs  } from 'vue';
const { t } = useI18n() // 国际化
const message = useMessage()
// 接收父组件传递的 props
const props = defineProps({
  pptArr: {
    type: Array,
    required: true,
  },
});

const { pptArr } = toRefs(props); // 解构 props

const replaceDialogVisible = ref(false);
const replacements = ref([{ from: '', to: '' }]);

// 触发确定操作的事件
const emit = defineEmits(['submit']);
const applyReplacements = () => {
  // 提交替换规则
  emit('submit', replacements.value);
  replaceDialogVisible.value = false;
};

// 添加新的替换行
const addReplacement = () => {
  replacements.value.push({ from: '', to: '' });
};

// 删除替换行
const removeReplacement = (index: number) => {
  replacements.value.splice(index, 1);
};

// 获取所有场景的英文标点符号并添加到替换行
const getPunctuationMarks = () => {
  // 英文标点符号到中文标点符号的映射表
  const punctuationMap = {
    ',': '，',
    '.': '。',
    '?': '？',
    '!': '！',
    ':': '：',
    ';': '；',
    "'": '‘',
    '"': '“'
  };

  let punctuationMarksSet = new Set<string>();

  // 遍历从父组件传递过来的 pptArr
  pptArr.value.forEach((item) => {
    const matches = item.pptRemark.match(/[.,?!:;'"]/g);
    if (matches) {
      matches.forEach(punctuation => punctuationMarksSet.add(punctuation));
    }
  });

  //如果punctuationMarksSet为空，则提示未获取到英文标点符号
  if (punctuationMarksSet.size === 0) {
    message.warning('未获取到英文标点符号！');
    return;
  }

  //先清空replacements
  replacements.value = [];

  // 将匹配到的标点符号添加到替换行中，使用映射表替换为中文标点符号
  punctuationMarksSet.forEach(punctuation => {
    const chinesePunctuation = punctuationMap[punctuation] || '';
    replacements.value.push({ from: punctuation, to: chinesePunctuation });
  });
};


// 打开弹出框的方法
const open = () => {
  replaceDialogVisible.value = true;
};

// 公开组件的 open 方法
defineExpose({ open });
</script>


<style scoped lang="scss">
.replacement-input {
  margin-bottom: 15px;
}

.replacement-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.flat-input {
  flex: 1;
  margin-right: 10px;
  border: none;
  border-radius: 6px;
  background-color: #f5f5f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 6px 10px; /* 缩小输入框的 padding */
  font-size: 12px; /* 缩小字体 */
}

.flat-button {
  border-radius: 6px; /* 缩小圆角 */
  font-weight: bold;
  padding: 6px 12px; /* 缩小按钮的 padding */
  background-color: #409eff;
  color: white;
  border: none;
  font-size: 12px; /* 缩小字体 */
  transition: background-color 0.3s ease;
}

.flat-button:hover {
  background-color: #66b1ff;
}

.delete-button {
  background-color: #ff4d4f;
  color: white;
  padding: 0 10px;
}

.delete-button:hover {
  background-color: #ff7875;
}

.add-button {
  margin-top: 10px;
  background-color: #5cb85c;
}

.add-button:hover {
  background-color: #4cae4c;
}

.cancel-button {
  background-color: #d9d9d9;
  color: black;
}

.cancel-button:hover {
  background-color: #bfbfbf;
}

.confirm-button {
  background-color: #409eff;
  color: white;
}

.confirm-button:hover {
  background-color: #66b1ff;
}
</style>
