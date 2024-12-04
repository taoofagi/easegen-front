export default {
  tenant:{
    name:'租户名',
    contactName:'联系人',
    mobile:'联系手机',
    status:'租户状态',
    startCreateTime:'开始日期',
    endCreateTime:'结束日期',
    package:'租户套餐',
    systemTenant:'系统租户',
    accountLimit:'账号额度',
    expireTime:'过期时间',
    website:'绑定域名',
    username:'用户名称',
    password:'用户密码',
  },
  tenantPackage:{
    packageName:'套餐名',
    startCreateTime:'开始日期',
    endCreateTime:'结束日期',
    menuPermissions:'菜单权限',
    switch:'全选/全不选',
    yes:'是',
    no:'否',
    menuExpand:'全部展开/折叠',
    unfold:'展开',
    fold:'折叠',
    treeLoding:'加载中，请稍候',
    associatedMenu:'关联的菜单编号',
  },
  user:{
    username:'用户名称',
    mobile:'手机号码',
    status:'状态',
    startCreateTime:'开始日期',
    endCreateTime:'结束日期',
    nickname:'用户昵称',
    dept:'部门',
    type:'用户类型',
    resetPasseword:'重置密码',
    assignRoles:'分配角色',
    more:'更多',
    resetPasswordText:'的新密码',
    resetPasswordTip:'修改成功，新密码是',
    enabled:'启用',
    disabled:'停用',
    changeStatusTextPre:'确认要',
    changeStatusTextSuffix:'用户吗?',
    role:'角色',
    email:'邮箱',
    password:'用户密码',
    sex:'用户性别',
    post:'岗位',
    correct:'正确的',
  },
  role:{
    name:'角色名称',
    code:'角色标识',
    status:'状态',
    startCreateTime:'开始日期',
    endCreateTime:'结束日期',
    type:'角色类型',
    displayOrder:'显示顺序',
    menuPermissions:'菜单权限',
    dataPermissions:'数据权限',
    permissionsScope:'权限范围',

    switch:'全选/全不选',
    yes:'是',
    no:'否',
    menuExpand:'全部展开/折叠',
    unfold:'展开',
    fold:'折叠',
    menuExpandText:'父子联动(选中父节点，自动选择子节点)',
    treeLoding:'加载中，请稍候',
  },
  menu:{
    name:"菜单名称",
    type:"菜单类型",
    status:'菜单状态',
    visible:'显示状态',
    visibleTip:'选择隐藏时，路由将不会出现在侧边栏，但仍然可以访问',
    menuExpand:'展开/折叠',
    refreshMenuCache:'刷新菜单缓存',
    refreshMenuCacheText:'即将更新缓存刷新浏览器！',
    icon:'图标',
    sort:'排序',
    permission:'权限标识',
    permissionTip:'Controller 方法上的权限字符，如：@PreAuthorize(`@ss.hasPermission(\'system:user:list\')`)',
    componentPath:'组件路径',
    componentPathPlaceholder:'例如说：system/user/index',
    routePath:'路由地址',
    routePathTip:'访问的路由地址，如：`user`。如需外网地址时，则以 `http(s)://` 开头',
    componentName:'组件名称',
    componentNamePlaceholder:'例如说：SystemUser',
    parentName:"上级菜单",
    display:'显示',
    hide:'隐藏',
    alwaysDisplay:'总是显示',
    alwaysDisplayTip:'选择不是时，当该菜单只有一个子菜单时，不展示自己，直接展示子菜单',
    always:'总是',
    no:'不是',
    cacheStatus:'缓存状态',
    cacheStatusTip:'选择缓存时，则会被 `keep-alive` 缓存，必须填写「组件名称」字段',
    cache:'缓存',
    notCache:'不缓存',
  },
  dept:{
    name:'部门名称',
    parentName:'上级部门',
    status:'部门状态',
    menuExpand:'展开/折叠',
    person:'负责人',
    sort:'排序',
    phone:'联系电话',
    email:'邮箱',
    correct:'正确的',
  },
  post:{
    name:'岗位名称',
    code:'岗位编码',
    status:'状态',
    sort:'岗位顺序',
    remark:'岗位备注',
  },
  dict:{
    name:'字典名称',
    type:'字典类型',
    status:'状态',
    startCreateTime:'开始日期',
    endCreateTime:'结束日期',
    data:'数据',

    dictTag:'字典标签',
    dataStatus:'数据状态',
    dictKey:'字典键值',
    sort:'字典排序',
    colorType:'颜色类型',
    cssClass:'CSS Class',
  },
  sms:{
    signature:'短信签名',
    status:'启用状态',
    startCreateTime:'开始日期',
    endCreateTime:'结束日期',
    channelCode:'渠道编码',
    apiKey:'短信 API 的账号',
    apiSecret:'短信 API 的密钥',
    callbackUrl:'短信发送回调 URL',
  }
}
