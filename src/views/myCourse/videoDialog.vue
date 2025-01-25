<template>
  <el-dialog
    :title="t('myCourse.videoPlayback')"
    v-model="videoDialogVisible"
    width="800px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <video width="100%" height="500px" controls :src="videoPath" style="object-fit: contain;">
      <track v-if="subtitlePath" kind="subtitles" :src="subtitlePath" srclang="zh" label="中文" default />
     {{ t('myCourse.videoPlaybackText')}}
    </video>
  </el-dialog>
</template>

<script setup name="videoDialog">
import { ref, defineExpose } from 'vue';
const { t } = useI18n() // 国际化
const videoDialogVisible = ref(false);
const videoPath = ref('');
const subtitlePath = ref(''); // 新增字幕路径

const open = (videoUrl, subtitleUrl) => {
  videoPath.value = '';
  subtitlePath.value = '';
  videoDialogVisible.value = false;

  // Allow DOM update
  setTimeout(() => {
    videoPath.value = videoUrl;
    subtitlePath.value = subtitleUrl || '';
    videoDialogVisible.value = true;
  }, 50);
};


defineExpose({ open });
</script>

<style scoped lang="scss"></style>
