<p align="center">
  <a href="./README.md">English</a> |
  <a href="./README_cn.md">简体中文</a> 
</p>

我 全栈工程师，AGI时代超级个体践行者，希望通过开源为AI发展做贡献。

如果这个项目让你有所收获，记得 Star 关注哦，这对我是非常不错的鼓励与支持。

## 🐶 新手必读

* nodejs > 16.18.0 && pnpm > 8.6.0 (强制使用pnpm)
* 演示地址【Vue3 + element-plus】：<http://1.95.87.0:48083> 请注册体验
* 启动文档、操作手册：请加入飞书群获取
  ![飞书](public/image/feishu.png)
* 项目合作&技术交流加微信，备注easegen：
![微信](public/image/wechat.png)

## 🐯 平台简介

**easegen**，开源数字人课程制作平台。

* 前端基于 [yudao-ui-admin-vue3](https://gitee.com/yudaocode/yudao-ui-admin-vue3) 实现
* 后端基于 [ruoyi-vue-pro](https://gitee.com/zhijiantianya/ruoyi-vue-pro) 实现
* 智能课件基于[文多多](https://easegen.docmee.cn)实现
* 文档解析基于[doc2x](https://doc2x.noedgeai.com/)实现

* 课程制作

![课程制作](public/image/digitalhuman_course.gif)

* 智能课件

![智能课件](public/image/aippt.gif)
* 智能出题

![智能出题](public/image/ai_gen_test.gif)

*  [样课展示](https://www.bilibili.com/video/av113088116297160/)

[![B站视频](public/image/demo_course.png)](https://www.bilibili.com/video/av113088116297160/)

## ✨ 核心功能

### 📱 2D数字人课程制作
- **课程模板系统**：支持多种预设模板，快速创建课程
- **智能脚本生成**：AI自动生成课程口播稿
- **数字人定制**：支持形象和声音的个性化定制
- **PPT课件集成**：自动解析PPT，生成数字人讲解视频
- **文本配音**：支持多种音色的文本转语音
- **SSML语法**：精细控制语音效果（音调、停顿、语速等）

### 🎬 3D数字人课程制作（新增）
基于魔珐星云3D数字人引擎，提供超写实的数字人视频课程制作能力。

**主要特性：**
- **3D演播室场景**
  - 多种风格演播室场景（简约、商务、发布会等）
  - 1屏/3屏多种布局选择
  - 自定义背景和灯光效果

- **超写实数字人**
  - 3D超写实人物形象
  - 多种性别、年龄、风格可选
  - 自然的面部表情和肢体动作
  - 支持全身和半身模式

- **高级语音合成**
  - 多语言支持（中文、英文等）
  - 多种音色风格（温和、活力、专业等）
  - SSML标签支持
  - 音调、语速、音量精细控制

- **智能课件集成**
  - PPT自动解析和排版
  - 画中画模式展示课件
  - 自动同步口播内容和PPT页面
  - 支持拖拽排序和批量管理

- **完善的校验系统**
  - 3D资源配置检查（演播室、数字人、音色）
  - 口播稿内容校验（空、过短、过长）
  - 实时配置状态指示
  - 友好的错误提示和操作引导

- **用户体验优化**
  - 实时预览
  - 批量场景管理
  - 自动保存
  - 详细的调试日志
  - 中英文双语支持

### 🤖 AI智能辅助
- **智能课件生成**：基于文档自动生成PPT课件
- **AI出题系统**：根据课程内容智能生成试题
- **文档解析**：支持多种格式文档的智能解析
- **口播稿优化**：AI辅助优化课程讲解文本

## 🗺️ 开发路线图

以下是我们计划在未来实现的主要功能和改进：

**已完成功能：**
- [x] 支持课程模板
- [x] 支持讲稿智能生成
- [x] 支持数字人形象声音定制
- [x] 支持docker快速部署
- [x] 支持AI生成口播稿
- [x] 新增文本配音功能
- [x] 声音支持SSML语法
- [x] **3D数字人课程制作系统（新增）**
  - [x] 3D演播室场景选择
  - [x] 超写实3D数字人形象
  - [x] 高级语音合成系统
  - [x] PPT课件智能集成
  - [x] 完善的校验和提示系统
  - [x] 实时配置状态指示
  - [x] 中英文国际化支持

**计划中功能：**
- [ ] 增加数字人极速克隆模式
- [ ] 增加口播视频合成功能
- [ ] 增加教案生成
- [ ] 增加教案转课件，生成可控PPT
- [ ] 支持实时数字人讲课功能
- [ ] 增加智能助理
- [ ] 3D数字人实时互动功能
- [ ] 多角色3D数字人对话

## 架构图

![easegen_diagram.png](public/image/easegen_diagram.png)

## 技术栈

| 框架                                                                   | 说明               | 版本     |
|----------------------------------------------------------------------|------------------|--------|
| [Vue](https://staging-cn.vuejs.org/)                                 | Vue 框架           | 3.3.8 |
| [Vite](https://cn.vitejs.dev//)                                      | 开发与构建工具          | 4.5.0  |
| [Element Plus](https://element-plus.org/zh-CN/)                      | Element Plus     | 2.4.2 |
| [TypeScript](https://www.typescriptlang.org/docs/)                   | JavaScript 的超集   | 5.2.2  |
| [pinia](https://pinia.vuejs.org/)                                    | Vue 存储库 替代 vuex5 | 2.1.7 |
| [vueuse](https://vueuse.org/)                                        | 常用工具集            | 10.6.1 |
| [vue-i18n](https://kazupon.github.io/vue-i18n/zh/introduction.html/) | 国际化              | 9.6.5  |
| [vue-router](https://router.vuejs.org/)                              | Vue 路由           | 4.2.5  |
| [unocss](https://uno.antfu.me/)                                      | 原子 css          | 0.57.4  |
| [iconify](https://icon-sets.iconify.design/)                         | 在线图标库            | 3.1.1  |
| [wangeditor](https://www.wangeditor.com/)                            | 富文本编辑器           | 5.1.23 |

## 部署手册
* [docker部署手册](https://ozij45g3ts.feishu.cn/docx/V1qmd6gsWobsRWxJFepcdrnbnXF)
* [后端部署手册](https://ozij45g3ts.feishu.cn/docx/EgS3dm1HtoKOPkxReEQcn3MCncg)
* [前端部署+系统初始化手册](https://ozij45g3ts.feishu.cn/docx/OIN8daguXoTzESx8nxFcJOvsnWc)


## 开发工具

推荐 VS Code 开发，配合插件如下：

| 插件名                           | 功能                  |
|-------------------------------|---------------------|
| Vue - Official                | Vue 与 TypeScript 支持 |
| unocss                        | unocss for vscode   |
| Iconify IntelliSense          | Iconify 预览和搜索       |
| i18n Ally                     | 国际化智能提示             |
| Stylelint                     | Css    格式化          |
| Prettier                      | 代码格式化               |
| ESLint                        | 脚本代码检查              |
| DotENV                        | env 文件高亮            |

## 🔥 后端

Spring Boot：

① easegen-admin：<https://github.com/taoofagi/easegen-admin>


### 若依其他系统功能
请参考[ruoyi-vue-pro](https://gitee.com/zhijiantianya/ruoyi-vue-pro#-%E5%86%85%E7%BD%AE%E5%8A%9F%E8%83%BD)


## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=taoofagi/easegen-front&type=Date)](https://star-history.com/#taoofagi/easegen-front&Date)

## 🤝 获奖信息
1. [2024年华彩杯算力大赛总决赛二等奖，项目编号L01610474065](https://mp.weixin.qq.com/s/SE10-cxLVurf0BfAMaegmw)]

## 🧾 免责声明/许可

1. `代码`：`easegen-front` 的代码采用 `Apache` 许可证发布，学术用途和商业用途都可以。
2. `AIGC`：本项目旨在积极影响基于人工智能的文字、语音、视频生成领域。用户被授予使用此工具创建文字、语音、视频的自由，但他们应该遵守当地法律，并负责任地使用。开发人员不对用户可能的不当使用承担任何责任。