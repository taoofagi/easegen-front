import * as ConfigApi from "@/api/infra/config";
import axios from 'axios'

interface ChatParams {
  business_code: string
  content_param: string
}

export class ChatApi {
  static async streamChat(params: ChatParams) {
    // 获取基础URL和API Key
    const baseUrl = await ConfigApi.getConfigKey('easegen.core.url')
    const apiKey = await ConfigApi.getConfigKey('easegen.core.key')

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    // 创建流式读取器
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = '' // 添加缓冲区存储不完整的JSON

    return {
      async *iterateStream() {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // 解码二进制数据
            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            
            // 处理返回的数据块
            const lines = buffer
              .split('data: ')
              .map(line => line.trim())
              .filter(Boolean)

            // 最后一行可能不完整，保存到buffer中
            buffer = lines.pop() || ''
              
            for (const line of lines) {
              if (line === '[DONE]') return
              
              try {
                const parsed = JSON.parse(line)
                yield parsed
              } catch (e) {
                console.error('Error parsing JSON:', e)
                // 不要清空buffer，因为可能是不完整的JSON
              }
            }
          }
          // 处理最后可能剩余的数据
          if (buffer) {
            const lines = buffer
              .split('data: ')
              .map(line => line.trim())
              .filter(Boolean)
              
            for (const line of lines) {
              if (line === '[DONE]') return
              
              try {
                const parsed = JSON.parse(line)
                yield parsed
              } catch (e) {
                console.error('Error parsing final buffer:', e)
              }
            }
          }
        } finally {
          reader.releaseLock()
        }
      }
    }
  }
}

// 使用示例:
/*
const chat = await ChatApi.streamChat({
  business_code: "BUSI_0003",
  content_param: JSON.stringify({
    ppt_title: "管理痛点",
    ppt_content: "...",
    image_url: "...",
    custom_requirements: ""
  })
})

for await (const chunk of chat.iterateStream()) {
  console.log(chunk)
}
*/