import { DOMElement } from "@wangeditor/editor/dist/editor/src/utils/dom";

export const useEditorHtml = () => {
  return {
    elemToHtml: (html) => {
      const newHtml = html
        .replace(/<p>/g, "<speak>")
        .replace(/<\/p>/g, "</speak>");
      // 使用 DOMParser 解析 HTML 内容
      const parser = new DOMParser();
      const doc = parser.parseFromString(newHtml, "text/html");

      // 找到所有
      //停顿节点
      const titleNodes = doc.querySelectorAll(
        'span[data-w-e-type="title-black"]'
      );
      // 数字节点
      const numberNodes = doc.querySelectorAll(
        'span[data-w-e-type="number-value"]'
      );
      // 多音字节点
      const textNodes = doc.querySelectorAll(
        'span[data-w-e-type="text-value"]'
      );
      titleNodes.forEach((node:any) => {
        const newNode = document.createElement("break");
        const time = node.getHTML();
        if (time.trim() == "1秒") {
          newNode.setAttribute("time", "1s");
        } else if (time.trim() == "0.5秒") {
          newNode.setAttribute("time", "500ms");
        } else if (time.trim() == "2秒") {
          newNode.setAttribute("time", "2s");
        }
        node.parentNode.replaceChild(newNode, node);
      });
      numberNodes.forEach((node:any) => {
        const newNode = document.createElement("say-as");
        const number = node.getAttribute("data-number");
        const text = node.getHTML();
        if (text.trim() == "读数值") {
          newNode.setAttribute("interpret-as", "number");
        } else if (text.trim() == "读数字") {
          newNode.setAttribute("interpret-as", "digits");
        }
        newNode.append(number);
        node.parentNode.replaceChild(newNode, node);
      });
      textNodes.forEach((node:any) => {
        const newNode = document.createElement("phoneme");
        const text = node.getAttribute("data-text");
        const textPY = node.getHTML();
        newNode.setAttribute("alphabet", "py");
        newNode.setAttribute("ph", textPY);
        newNode.append(text);
        node.parentNode.replaceChild(newNode, node);
      });
      return doc.body.innerHTML;
    },
    parseElemHtml: (html) => {
        const newHtml = html
        .replace(/<speak>/g, "<p>")
        .replace(/<\/speak>/g, "</p>");
      // 使用 DOMParser 解析 HTML 内容
      const parser = new DOMParser();
      const doc = parser.parseFromString(newHtml, "text/html");

      // 找到所有
      //停顿节点
      const titleNodes = doc.querySelectorAll(
        'break'
      );
      // 数字节点
      const numberNodes = doc.querySelectorAll(
        'say-as'
      );
      // 多音字节点
      const textNodes = doc.querySelectorAll(
        'phoneme'
      );
      titleNodes.forEach((node:any) => {
        const newNode:any = document.createElement("span");
        newNode.setAttribute("data-w-e-is-void",true);
        newNode.setAttribute("data-w-e-is-inline",true);
        newNode.setAttribute("data-w-e-type",'title-black');
        const time = node.getAttribute("time");
        if (time.trim() == "1s") {
          newNode.append('1秒');
        } else if (time.trim() == "500ms") {
          newNode.append('0.5秒');
        } else if (time.trim() == "2s") {
          newNode.append('2秒');
        }
        node.parentNode.replaceChild(newNode, node);
      });
      numberNodes.forEach((node:any) => {
        const newNode:any = document.createElement("span");
        newNode.setAttribute("data-w-e-is-void",true);
        newNode.setAttribute("data-w-e-is-inline",true);
        newNode.setAttribute("data-w-e-type",'number-value');
        const number = node.getHTML();
        newNode.setAttribute("data-number",number);
        const text = node.getAttribute("interpret-as");
        if (text.trim() == "digits") {
          newNode.append('读数字');
        } else if (text.trim() == "number") {
          newNode.append('读数值');
        }
        node.parentNode.replaceChild(newNode, node);
      });
      textNodes.forEach((node:any) => {
        const newNode:any = document.createElement("span");
        newNode.setAttribute("data-w-e-is-void",true);
        newNode.setAttribute("data-w-e-is-inline",true);
        newNode.setAttribute("data-w-e-type",'text-value');
        const text = node.getHTML();
        const textPY = node.getAttribute("ph");
        newNode.setAttribute("data-text",text);
        newNode.append(textPY);
        node.parentNode.replaceChild(newNode, node);
      });
      return doc.body.innerHTML;
    }
  };
};
