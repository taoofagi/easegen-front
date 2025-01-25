
// 停顿时间
function parseTitleBlackHtml(domElem, children, editor) { 
  const text = domElem.firstChild?.textContent
  const myResume = {
    type: 'title-black',
    children: [{text: text || ''}]
  }

  return myResume
}

export const parseHtmlConf = {
  selector: 'span[data-w-e-type="title-black"]', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseTitleBlackHtml,
}
// 数字
function parseNumberValueHtml(domElem, children, editor) { 
  const text = domElem.firstChild?.textContent
  const numberVal = domElem.getAttribute('data-number') || ''
  const myResume = {
    type: 'number-value',
    numberVal: numberVal,
    children: [{text: text || ''}]
  }

  return myResume
}

export const parseNumberHtmlConf = {
  selector: 'span[data-w-e-type="number-value"]', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseNumberValueHtml,
}
//多音字
function parseTextValueHtml(domElem, children, editor) { 
  const text = domElem.firstChild?.textContent
  const textVal = domElem.getAttribute('data-text') || ''
  const myResume = {
    type: 'text-value',
    textVal: textVal,
    children: [{text: text || ''}]
  }

  return myResume
}

export const parseTextHtmlConf = {
  selector: 'span[data-w-e-type="text-value"]', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseTextValueHtml,
}