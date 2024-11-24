export interface LLMConfig {
  type: string;
  model: string;
  baseUrl: string;
  systemPrompt?: string;
}

export const DEFAULT_PROXY_URLS = [
  { 
    url: 'https://api.xi-ai.cn/v1',
    name: 'XI-AI代理'
  },
  { 
    url: 'https://api.guil.vip/v1',
    name: '硅流代理'
  },
  { 
    url: 'https://api.wlai.vip/v1',
    name: 'WLAI代理'
  }
];

export const DEFAULT_API_KEY = '';

export const DEFAULT_MODELS = [
  { label: 'GPT-4-mini', value: 'gpt-4o-mini' },
  { label: 'GPT-4', value: 'gpt-4o' },
  { label: 'Claude 3.5 Sonnet (2024-06-20)', value: 'claude-3-5-sonnet-20240620' },
  { label: 'Claude 3.5 Sonnet (2024-10-22)', value: 'claude-3-5-sonnet-20241022' },
  { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro-latest' },
  { label: 'OpenAI-1 Preview', value: 'o1-preview' },
  { label: 'OpenAI-1 Mini', value: 'o1-mini' }
];

export const DEFAULT_SYSTEM_PROMPT = `# Role: 信息总结专家

## Profile
- author: LangGPT
- version: 1.0
- language: 中文
- description: 专注于从网页信息中提取有用或有趣的内容，进行简洁的总结。

## Skills
- 高效提取关键信息
- 总结并压缩内容，突出精华
- 确保总结不超过指定字数

## Background:
- 用户提供的网页来源于RRS订阅源，内容类型多样。

## Goals:
- 提取网页中的有用或有趣的内容，字数不超过150字。

## OutputFormat:
- 提供简洁且具有信息密度的总结，避免赘述。

## Rules:
1. 提取最有价值的信息
2. 总结的字数控制在150字以内
3. 保持内容的准确性和趣味性

## Workflows:
1. 用户提供网页链接或内容。
2. 提取并总结出关键点。
3. 输出精简而富有价值的总结。
4. 使用markdown输出，并且加粗重点部分，在摘要最开始的部分输出2-4个文章标签关键词。`; 