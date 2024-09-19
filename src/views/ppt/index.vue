<template>
  <div id="docmee-container" style="height:600px"></div>
</template>

<script>
import { generateToken } from '@/api/ppt/docmee/index'; // 确保路径正确
//用户信息
import { useUserStore } from "@/store/modules/user";
//用户信息
const userStore = useUserStore();
const sysmessage = useMessage();
export default {
  name: 'PptIndex',
  async mounted() {
    const token = await generateToken();

    if (token) {
      const docmeeContainer = document.getElementById('docmee-container');
      if (docmeeContainer) {
        const docmeeUI = new DocmeeUI({
          token: token, // 使用获取到的token
          container: docmeeContainer, // 挂载 iframe 的容器
          page: 'creator', // 选择 'creator' 或 'dashboard'
          themeColor: '#001529', // 主题色
          background: 'linear-gradient(140deg, #001529, #3a506b, #5b84b1)', // 背景色
          padding: '40px', // 内边距
          onMessage(message) {
            console.log(message);
            if (message.type === 'invalid-token') {
              console.log('token 认证错误');
              sysmessage.error("认证错误");
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
            if (message.type === 'error') {
              console.log('失败', message.data);
              const { code } = message.data;
              if (code === 88) {
                sysmessage.error("您本时段内免费次数已用完，请稍候再试");
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