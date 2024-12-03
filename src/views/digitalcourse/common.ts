const { t } = useI18n()
const buttonMap = new Map()
buttonMap.set(1,t('digitalhumans.accept'))
buttonMap.set(2,t('digitalhumans.startTrain'))
buttonMap.set(3,t('digitalhumans.train'))
buttonMap.set(4,t('digitalhumans.submit'))
buttonMap.set(5,t('digitalhumans.submit'))

const statusMap = new Map()
statusMap.set(1,'待处理')
statusMap.set(2,'已受理')
statusMap.set(3,'训练中')
statusMap.set(4,'不通过')
statusMap.set(0,'已完成')
statusMap.set(5,'训练失败')

export function getStatusMap (){
  return statusMap
}

export function getButtonTitle (status:number):string {
  return buttonMap.get(status)
}

export function getStatusLabel (status:number):string {
  return statusMap.get(status)
}
