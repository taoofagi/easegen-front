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
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['digitalcourse:template:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['digitalcourse:template:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="模板名称" align="center" prop="templateName" />
      <el-table-column label="是否显示背景" align="center" prop="showBackground" >
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.IS_OR_NOT" :value="scope.row.showBackground" />
        </template>
      </el-table-column>
      <el-table-column label="是否显示数字人" align="center" prop="showDigitalHuman" >
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.IS_OR_NOT" :value="scope.row.showDigitalHuman" />
        </template>
      </el-table-column>
      <el-table-column label="是否显示ppt" align="center" prop="showPpt" >
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.IS_OR_NOT" :value="scope.row.showPpt" />
        </template>
      </el-table-column>
<!--      <el-table-column label="ppt宽" align="center" prop="pptW" />
      <el-table-column label="ppt高" align="center" prop="pptH" />
      <el-table-column label="ppt距离顶部位置" align="center" prop="pptX" />
      <el-table-column label="ppt距离左侧位置" align="center" prop="pptY" />
      <el-table-column label="数字人宽" align="center" prop="humanW" />
      <el-table-column label="数字人高" align="center" prop="humanH" />
      <el-table-column label="数字人距离顶部位置" align="center" prop="humanX" />
      <el-table-column label="数字人距离左侧位置" align="center" prop="humanY" />-->
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['digitalcourse:template:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['digitalcourse:template:delete']"
          >
            删除
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
  <TemplateForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { TemplateApi, TemplateVO } from '@/api/digitalcourse/template'
import TemplateForm from './TemplateForm.vue'
import {DICT_TYPE} from "@/utils/dict";

/** 模板 列表 */
defineOptions({ name: 'Template' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<TemplateVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  showBackground: undefined,
  showDigitalHuman: undefined,
  showPpt: undefined,
  pptW: undefined,
  pptH: undefined,
  pptX: undefined,
  pptY: undefined,
  humanW: undefined,
  humanH: undefined,
  humanX: undefined,
  humanY: undefined,
  bgImage: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TemplateApi.getTemplatePage(queryParams)
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
    await TemplateApi.deleteTemplate(id)
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
    const data = await TemplateApi.exportTemplate(queryParams)
    download.excel(data, '模板.xls')
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
