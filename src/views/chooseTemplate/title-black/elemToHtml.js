// 停顿时间
function titleBlackToHtml(elem, childrenHtml) {
  const text = elem.children[0].text || "";
  return `<span data-w-e-is-void data-w-e-is-inline data-w-e-type="title-black">${text}</span>`;
}

export const elemToHtmlConf = {
  type: "title-black",
  elemToHtml: titleBlackToHtml,
};
// 数字
function NumberValueToHtml(elem, childrenHtml) {
  const text = elem.children[0].text || "";
  const {numberVal = ''} = elem
  return `<span data-w-e-is-void data-w-e-is-inline data-w-e-type="number-value"  data-number="${numberVal}">${text}</span>`;
}

export const elemNumberToHtmlConf = {
  type: "number-value",
  elemToHtml: NumberValueToHtml,
};
//多音字
function TextValueToHtml(elem, childrenHtml) {
  const text = elem.children[0].text || "";
  const {textVal = ''} = elem
  return `<span data-w-e-is-void data-w-e-is-inline data-w-e-type="text-value" data-text="${textVal}">${text}</span>`;
}

export const elemTextToHtmlConf = {
  type: "text-value",
  elemToHtml: TextValueToHtml,
};