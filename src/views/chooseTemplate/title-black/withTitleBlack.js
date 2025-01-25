import { DomEditor } from '@wangeditor/editor'

function withTitleBlack(editor) {
  const { isInline, isVoid } = editor
  const newEditor = editor

  newEditor.isInline = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'title-black') return true
    if (type === 'number-value') return true
    if (type === 'text-value') return true
    return isInline(elem)
  }

  newEditor.isVoid = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'title-black') return true
    if (type === 'number-value') return true
    if (type === 'text-value') return true
    return isVoid(elem)
  }

  return newEditor // 返回 newEditor ，重要！！！
}

export default withTitleBlack;