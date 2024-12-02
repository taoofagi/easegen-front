<template>
  <!-- 搜索 -->
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item :label="t('myCourse.videoName')" prop="name">
        <el-input
          v-model="queryParams.name"
          :placeholder="t('common.inputText')+t('myCourse.videoName')"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />
          {{t('table.search')}}
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
          {{t('table.reset')}}
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column :label="t('myCourse.videoCode')" align="center" prop="id" />
      <el-table-column :label="t('myCourse.videoName')" align="center" prop="name" />
      <el-table-column :label="t('myCourse.duration')" align="center" prop="duration">
        <template #default="scope">
          {{ formatDuration(scope.row.duration) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('myCourse.courseName')" align="center" prop="courseName">
        <template #default="scope">
          <el-link type="primary" @click="goDetail(scope.row.courseId)">{{ scope.row.courseName }}</el-link>
        </template>
      </el-table-column>
      <el-table-column
        :label="t('table.createTime')"
        align="center"
        prop="createTime"
        width="120"
        :formatter="dateFormatter"
      />
      <el-table-column
        :label="t('myCourse.finishTime')"
        align="center"
        prop="finishTime"
        width="120"
        :formatter="dateFormatter"
      />
      <el-table-column :label="t('myCourse.progress')" align="center" prop="progress">
        <template #default="scope">
          <el-progress :percentage="getProgress(scope.row.status, scope.row.progress)" />
        </template>
      </el-table-column>
      <el-table-column :label="t('myCourse.SynthesisTime')" align="center">
        <template #default="scope">
          {{ calculateDuration(scope.row.createTime, scope.row.finishTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('myCourse.errorReason')" align="center" prop="errorReason">
        <template #default="scope">
          <el-tooltip :content="scope.row.errorReason || '--'" placement="top">
            <span>
              {{ scope.row.errorReason ? (scope.row.errorReason.length > 20 ? scope.row.errorReason.slice(0, 20) + '...' : scope.row.errorReason) : '--' }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column :label="t('myCourse.status')" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.VIDEO_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="t('table.action')" align="center" min-width="110" fixed="right">
        <template #default="scope">
          <template v-if="scope.row.status == 2">
            <el-button
              link
              type="primary"
              @click="openPreview(scope.row)"
            >
              {{t('myCourse.preview')}}
            </el-button>
            <el-button
              link
              type="primary"
              @click="handleDownload(scope.row.previewUrl,scope.row.courseName)"
            >
              {{t('myCourse.downloadVideo')}}
            </el-button>
            <el-button
              v-if="scope.row.subtitlesUrl"
              link
              type="primary"
              @click="handleDownload(scope.row.subtitlesUrl,scope.row.courseName)"
            >
              {{t('myCourse.downloadSubtitles')}}
            </el-button>
          </template>
          <template v-if=" scope.row.status == 3">
            <el-button
              link
              type="warning"
              @click="reMegerMedia(scope.row.id)"
            >
              {{t('myCourse.resynthesize')}}
            </el-button>
          </template>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            {{ t('action.del') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
  <!-- 视频播放弹框 -->
  <videoDialog ref="videoRef" />
</template>
<script lang="ts" setup>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as pptTemplateApi from '@/api/pptTemplate'
import { useRouter } from 'vue-router'
import videoDialog from "./videoDialog.vue"
const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20,
  name: undefined
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await pptTemplateApi.myCourseList(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 预览按钮*/
const videoRef = ref()
const openPreview = (row) => {
  if(row){
    videoRef.value.open(row.previewUrl, row.subtitlesVttUrl);
  }
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await pptTemplateApi.deleteMyCourse(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 下载按钮操作 */
const handleDownload = (url, courseName) => {
  //如果url为空，则提示未找到资源文件
  if (!url) {
    message.warning("未找到资源文件！");
    return;
  }
  const link = document.createElement('a');
  link.href = url;
  link.download = courseName;
  link.target = '_blank'; // 强制新标签页下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const goDetail = (id) => {
  router.push(
    { path: '/chooseTemplate/index', query: { id }}
  )
}

/** 格式化视频时长 */
const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs > 0 ? `${hrs}时` : ''}${mins > 0 ? `${mins}分` : ''}${secs}秒`;
}

/** 重新合成按钮操作 */
const reMegerMedia = async (id: number) => {
  try {
    // 开启 loading
    loading.value = true

    // 重新合成视频
    const res = await pptTemplateApi.reMegerMedia({ id });

    console.log("---------", res);
    if (res) {
      message.success("合成视频任务提交成功，请到我的视频中查看！");
    }

  } catch (error) {
    console.error(error);
  } finally {
    // 刷新列表
    getList();
    // 无论成功还是失败，都需要关闭 loading
    loading.value = false;
  }
}

/** 根据创建时间和完成时间计算合成耗时 */
const calculateDuration = (createTime: string, finishTime: string) => {
  if (!createTime || !finishTime) return '未完成';

  const start = new Date(createTime).getTime();
  const end = new Date(finishTime).getTime();

  const duration = (end - start) / 1000; // 转换为秒
  const hrs = Math.floor(duration / 3600);
  const mins = Math.floor((duration % 3600) / 60);
  const secs = Math.floor(duration % 60);

  return `${hrs > 0 ? `${hrs}时` : ''}${mins > 0 ? `${mins}分` : ''}${secs}秒`;
}

/** 获取合成进度，关联状态 */
const getProgress = (status: number, completionPercentage: number) => {
  if (status === 2) {
    return 100; // 已完成，进度固定为100%
  } else if (status === 0) {
    return 0; // 未启动，进度固定为0%
  } else {
    return completionPercentage || 0; // 合成中或合成失败，按实际进度展示
  }
}
/** 初始化 **/
onMounted(async () => {
  await getList()
})
</script>
