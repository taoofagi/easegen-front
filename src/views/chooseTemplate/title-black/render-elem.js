import { h } from "snabbdom";
// 停顿时间
function renderTitleBlack(elem, children, editor) {
  const text = elem.children[0].text || "";
  const vnode = h(
    "span",
    {
      style: {
        margin: "3px",
        color: "#ffffff",
        background: "#7d78e7",
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: "12px",
      },
    },
    [text]
  );

  return vnode;
}

export const renderElemConf = {
  type: "title-black",
  renderElem: renderTitleBlack,
};
//数字
function renderNumberValue(elem, children, editor) {
  const text = elem.children[0].text || "";
  const {numberVal = ''} = elem
  // 附件 icon 图标 vnode
  const iconVnode = h("img", {
    props: {
      src: "https://chat.tydiczt.com/tdh-portal/assets/close-fill-72619c56.svg",
    }, // HTML 属性，驼峰式写法
    style: {
      width: "15px",
      height: "15px",
      minHeight: "10px",
      minWidth: "10px",
      marginLeft: "1px",
      cursor: "pointer",
      fontSize: "12px",
      verticalAlign: "sub",
    }, // HTML style ，驼峰式写法
    on: {
      click() {
        editor.deleteBackward()
        editor.insertText(numberVal)
      },
    },
  });
  const buttonNode = h(
    "span",
    {
      style: {
        display: "inline-block",
        marginLeft: "3px",
        color: "#ffffff",
        background: "orange",
        padding: "3px",
        cursor: "pointer",
        fontSize: "12px",
      },
    },
    [text, iconVnode]
  );
  const leftNode = h(
    "span",
    {
      style: {
        display: "inline-block",
        color: "orange",
      },
    },
    ["「"]
  );
  const rightNode = h(
    "span",
    {
      style: {
        display: "inline-block",
        color: "orange",
      },
    },
    ["」"]
  );
  const vNode = h(
    "span",
    {
      style: {
        display: "inline-block",
      },
    },
    [buttonNode, leftNode, numberVal, rightNode]
  );
  return vNode;
}

export const renderNumberElemConf = {
  type: "number-value",
  renderElem: renderNumberValue,
};

// 多音字
function renderTextPinyinValue(elem, children, editor) {
  const text = elem.children[0].text || "";
  const {textVal = ''} = elem
  const textNode = `${textVal}[=${text}]`
  const vNode = h(
    "span",
    {
      style: {
        display: "inline-block",
        marginLeft: "3px",
        color: "orange",
        padding: "3px",
        cursor: "pointer",
      },
    },
    [textNode]
  );
  return vNode;
}

export const renderTextPinyinElemConf = {
  type: "text-value",
  renderElem: renderTextPinyinValue,
};