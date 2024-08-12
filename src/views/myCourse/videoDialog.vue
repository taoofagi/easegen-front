<template>
  <el-dialog
    title="视频播放"
    v-model="videoDialogVisible"
    width="800px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
  <video width="100%" height="500px" controls :src="videoPath" style="object-fit: fill;">
    
  </video>
  </el-dialog>
</template>

<script setup name="videoDialog">
const videoDialogVisible = ref(false);
const videoPath = ref()
const open = (videoUrl) => {
  videoPath.value = videoUrl;
  videoDialogVisible.value = true
}
defineExpose({ open })
</script>

<style scoped lang="scss"></style>
