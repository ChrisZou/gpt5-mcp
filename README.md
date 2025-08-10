# GPT-5 MCP 服务器

一个提供 GPT-5 问答功能的模型上下文协议（MCP）服务器。

## 使用方法

1. clone此仓库
2. 安装依赖：
   ```bash
   npm install && npm run build
   ```

### Claude Code 集成
运行
  ```
  claude mcp add --json gpt5 '
  {
    "mcpServers": {
      "gpt5": {
        "command": "node",
        "args": ["/path/to/your/gpt5-mcp/dist/index.js"],
        "env": {
          "OPENAI_API_KEY": "这里换成你的API KEY"
        }
      }
    }
   }'
   ```
记得把其中的 “/path/to/your/gpt5-mcp”换成你把这个项目clone到的所在目录。然后把OPENAI_API_KEY换成你自己的

## 使用举例
在claude code里面可以这么说：
  - "问一下 GPT5 今天的天气怎么样？"
  - "使用 gpt5 来review我的代码"

## 可用tools

### gpt5_chat

与 GPT-5 进行问答和协助。

**参数：**
- `message`（必需）：发送给 GPT-5 的消息或问题
- `model`（可选）：要使用的 GPT 模型（默认："gpt-5"）
- `max_tokens`（可选）：响应中的最大 token 数（默认：4096）
- `temperature`（可选）：采样温度 0-2（默认：0.7）

**示例：**
```json
{
  "message": "法国的首都是什么？",
  "model": "gpt-5",
  "max_tokens": 500,
  "temperature": 0.5
}
```