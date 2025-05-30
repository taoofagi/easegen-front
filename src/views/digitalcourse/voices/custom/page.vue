<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item :label="t('voices.name')" prop="name">
        <el-input
          v-model="queryParams.name"
          :placeholder="t('common.inputText')+t('voices.name')"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item :label="t('table.createTime')" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          :start-placeholder="t('voices.startCreateTime')"
          :end-placeholder="t('voices.endCreateTime')"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> {{ t('table.search') }}</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> {{ t('table.reset') }}</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['digitalcourse:voices:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> {{ t('action.add') }}
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['digitalcourse:voices:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> {{ t('action.export') }}
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column :label="t('table.index')" align="center" prop="id" />
      <el-table-column :label="t('voices.name')" align="center" prop="name" />
      <el-table-column :label="t('voices.code')" align="center" prop="code" />
      <el-table-column :label="t('voices.language')" align="center" prop="language">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.DIGITALCOURSE_VOICES_LANGUAGE" :value="scope.row.language" />
        </template>
      </el-table-column>
      <el-table-column
        :label="t('table.createTime')"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column :label="t('voices.status')" align="center" prop="status">
        <template #default="scope">
          {{getStatusLabel(scope.row.status)}}
        </template>
      </el-table-column>
      <el-table-column :label="t('table.action')" align="center">
        <template #default="scope">
          <el-button
            v-if="superAdminProcess(scope.row.status)"
            :disabled="scope.row.status == 3"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            {{t('voices.handle')}}
          </el-button>
          <el-button
            :disabled="scope.row.status == 1 || scope.row.status == 2 || scope.row.status == 3"
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

  <!-- 表单弹窗：添加/修改 -->
  <VoicesForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as VoicesApi from '@/api/digitalcourse/voices'
import VoicesForm from './VoicesForm.vue'
import { useUserStoreWithOut } from '@/store/modules/user'
const userStore = useUserStoreWithOut() // 用户信息缓存
import { getStatusLabel } from '../../common'

defineOptions({ name: 'Voices' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  language: undefined,
  gender: undefined,
  quality: undefined,
  voiceType: undefined,
  createTime: [],
  status: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    queryParams.voiceType = 1
    const data = await VoicesApi.getVoicesPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}


const memberDelete = (state)=>{
  return userStore.getRoles.indexOf('super_admin') < 0 && ( state > 1 || state == 0)
}
const superAdminProcess = (status)=>{
  return (status == 4 && userStore.getRoles.indexOf('super_admin') < 0) || (userStore.getRoles.indexOf('super_admin') > -1 && status != 0)
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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await VoicesApi.deleteVoices(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await VoicesApi.exportVoices(queryParams)
    download.excel(data, '声音管理.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
