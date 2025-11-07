export default {
  choose3DTemplate: {
    // 页面标题
    pageTitle: '3D数字人课程制作',

    // 左侧PPT列表
    pptList: 'PPT列表',
    uploadPPT: '上传PPT',
    uploadPPTTip: '支持.pptx或.pdf格式，单个文件不超过50MB',
    parsePPTProgress: 'PPT解析中',
    pptParseSuccess: 'PPT解析成功',
    pptParseFailed: 'PPT解析失败',
    noPPTUploaded: '请先上传PPT文件',

    // 场景操作
    sceneManagement: '场景管理',
    addScene: '添加场景',
    copyScene: '复制场景',
    deleteScene: '删除场景',
    batchDelete: '批量删除',
    confirmDelete: '确认删除该场景吗？',
    confirmBatchDelete: '确认删除选中的场景吗？',
    dragToSort: '拖拽排序',

    // 中间预览区
    previewArea: '预览区',
    currentScene: '当前场景',
    sceneInfo: '场景信息',
    pageIndex: '页码',
    duration: '时长',
    seconds: '秒',

    // 右侧配置区 - 标签页
    configuration: '配置',
    studioTab: '演播室场景',
    lookTab: '数字人形象',
    voiceTab: '音色选择',
    scriptTab: '口播稿编辑',

    // 演播室场景选择
    selectStudio: '选择演播室场景',
    studioCount: '个场景可选',
    studioStyle: '场景风格',
    studioType: '场景类型',
    cameraConfig: '画幅',
    allStyles: '全部风格',
    previewStudio: '预览场景',
    studioSelected: '已选择',

    // 数字人形象选择
    selectLook: '选择数字人形象',
    lookCount: '个形象可选',
    gender: '性别',
    allGender: '全部',
    male: '男性',
    female: '女性',
    age: '年龄段',
    allAge: '全部年龄',
    lookStyle: '风格',
    previewLook: '预览形象',
    lookPreview: '形象预览',

    // 音色选择
    selectVoice: '选择音色',
    voiceCount: '个音色可选',
    voiceGender: '声音性别',
    maleVoice: '男声',
    femaleVoice: '女声',
    language: '语言',
    allLanguage: '全部语言',
    chinese: '中文',
    english: '英文',
    voiceStyle: '音色风格',
    mild: '温和',
    energetic: '活力',
    cute: '可爱',
    warm: '温暖',
    audition: '试听',
    stopAudition: '停止',
    auditionFailed: '试听失败',
    noAudioAvailable: '该音色暂无试听音频',

    // 口播稿编辑
    editScript: '口播稿编辑',
    scriptPlaceholder: '请输入口播稿内容...',
    wordCount: '字数',
    estimatedDuration: '预计时长',
    minute: '分',
    second: '秒',
    scriptLengthWarning: '建议口播稿字数在 {min}-{max} 字之间，以获得最佳效果',
    scriptRequired: '口播稿不能为空',

    // 课程信息
    courseInfo: '课程信息',
    courseName: '课程名称',
    courseNamePlaceholder: '请输入课程名称',
    aspect: '视频比例',
    totalWordCount: '总字数',
    totalDuration: '总时长',

    // 底部操作按钮
    saveCourse: '保存课程',
    composeVideo: '合成视频',
    saveSuccess: '保存成功',
    saveFailed: '保存失败',
    composeSuccess: '3D视频合成任务已提交！',
    composeFailed: '合成失败',

    // 验证提示
    pleaseUploadPPT: '请先上传PPT文件',
    pleaseSelectStudio: '⚠️ 请先选择演播室场景！点击右侧"演播室场景"选项卡进行选择',
    pleaseSelectLook: '⚠️ 请先选择数字人形象！点击右侧"数字人形象"选项卡进行选择',
    pleaseSelectVoice: '⚠️ 请先选择音色！点击右侧"音色选择"选项卡进行选择',
    pleaseCompleteAllConfig: '请完成所有配置：演播室场景、数字人形象、音色',
    scriptEmptyAtPage: '⚠️ 第 {page} 页的口播稿不能为空！请在中间区域的"口播稿编辑"中为该页面添加内容',
    scriptTooLongAtPage: '⚠️ 第 {page} 页的口播稿超过2000字（当前 {count} 字），请减少内容或拆分场景',
    scriptTooShortAtPage: '⚠️ 第 {page} 页的口播稿少于10字（当前 {count} 字），建议增加内容以获得更好的语音效果',
    allScriptsEmpty: '⚠️ 所有页面的口播稿都为空！至少需要为一个页面添加口播内容',
    needAtLeastOneScene: '⚠️ 至少需要有一个PPT场景才能合成视频',

    // 保存提示
    saveBeforeCompose: '正在保存课程...',
    savingCourse: '保存中，请稍候...',
    courseNameEmpty: '课程名称不能为空',

    // 3D资源配置提示
    resourcesNotComplete: '3D资源配置未完成',
    resourcesCompleteHint: '已完成：演播室场景 ✓、数字人形象 ✓、音色 ✓',
    resourcesIncompleteHint: '缺少配置：{missing}',
    studioLabel: '演播室场景',
    lookLabel: '数字人形象',
    voiceLabel: '音色',

    // 资源过滤器
    filter: '筛选',
    clearFilter: '清除筛选',
    noDataAvailable: '暂无数据',
    loading: '加载中...',

    // 其他
    confirm: '确定',
    cancel: '取消',
    close: '关闭',
    back: '返回',
    next: '下一步',
    prev: '上一步'
  }
}
