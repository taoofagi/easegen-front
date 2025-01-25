import withTitleBlack from "./withTitleBlack.js";
import {
  renderElemConf,
  renderNumberElemConf,
  renderTextPinyinElemConf,
} from "./render-elem.js";
import {
  elemToHtmlConf,
  elemNumberToHtmlConf,
  elemTextToHtmlConf,
} from "./elemToHtml.js";
import {
  parseHtmlConf,
  parseNumberHtmlConf,
  parseTextHtmlConf,
} from "./parseElemHtml.js";
const TitleBlack = {
  editorPlugin: withTitleBlack,
  renderElems: [renderElemConf, renderNumberElemConf, renderTextPinyinElemConf],
  elemsToHtml: [elemToHtmlConf, elemNumberToHtmlConf, elemTextToHtmlConf],
  parseElemsHtml: [parseHtmlConf, parseNumberHtmlConf, parseTextHtmlConf],
};

export default TitleBlack;
