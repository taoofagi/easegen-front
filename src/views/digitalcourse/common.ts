const buttonMap = new Map()
buttonMap.set(1,'受 理')
buttonMap.set(2,'开始训练')
buttonMap.set(3,'训 练')
buttonMap.set(4,'提 交')

const statusMap = new Map()
statusMap.set(1,'待处理')
statusMap.set(2,'已受理')
statusMap.set(3,'训练中')
statusMap.set(4,'不通过')
statusMap.set(0,'已完成')
statusMap.set(5,'训练失败')


export function getButtonTitle (status:number):string {
  return buttonMap.get(status)
}

export function getStatusLabel (status:number):string {
  return statusMap.get(status)
}
