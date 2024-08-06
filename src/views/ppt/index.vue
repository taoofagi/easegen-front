<template>
  <div id="docmee-container" style="height:100%"></div>
</template>

<script>
import { createApiToken } from '@/api/ppt/docmee/index'; // 确保路径正确

export default {
  name: 'PptIndex',
  async mounted() {
    const apiKey = 'ak_sK8RJjr33EE6TRAVLW'; // 替换为实际的API-KEY
    const uid = 'test'; // 可选，替换为实际的用户ID或保持为空
    const token = await createApiToken(apiKey, uid, 2);

    if (token) {
      const docmeeContainer = document.getElementById('docmee-container');
      if (docmeeContainer) {
        const docmeeUI = new DocmeeUI({
          token: token, // 使用获取到的token
          container: docmeeContainer, // 挂载 iframe 的容器
          page: 'creator', // 选择 'creator' 或 'dashboard'
          themeColor: '#a83aaf', // 主题色
          background: 'linear-gradient(140deg, #ec81af, #af22ce)', // 背景色
          padding: '40px', // 内边距
          onMessage(message) {
            console.log(message);
            if (message.type === 'invalid-token') {
              console.log('token 认证错误');
            }
            if (message.type === 'beforeGenerate') {
              const { subtype, fields } = message.data;
              if (subtype === 'outline') {
                console.log('即将生成ppt大纲', fields);
                return true; // 允许生成
              } else if (subtype === 'ppt') {
                console.log('即将生成ppt', fields);
                docmeeUI.sendMessage({
                  type: 'success',
                  content: '继续生成PPT',
                });
                return true; // 允许生成
              }
            }
            if (message.type === 'beforeDownload') {
              return `PPT_${new Date().getTime()}.pptx`;
            }
          },
        });
      }
    } else {
      console.error('Failed to obtain token');
    }
  },
};
</script>

<style scoped>
v#docmee-container {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 1000px;
  width: 100vw;
}
</style>