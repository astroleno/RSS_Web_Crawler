import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const DEFAULT_SYSTEM_PROMPT = `# Role: 信息总结专家

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
4. 使用markdown输出，并且加粗重点部分，在摘要最开始的部分输出2-4个文章标签关键词。

## Init:
请提供您想要总结的网页链接或内容，我将根据这些信息为您生成简短的总结。`;

export async function POST(request: Request) {
  try {
    const { content, apiKey, llmConfig } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: '请在设置中配置 API Key' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      baseURL: 'https://api.xi-ai.cn/v1',
      apiKey: apiKey,
    });

    const openaiResponse = await openai.chat.completions.create({
      model: llmConfig.model,
      messages: [
        {
          role: "system",
          content: llmConfig.systemPrompt || DEFAULT_SYSTEM_PROMPT
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const summary = openaiResponse.choices[0].message.content;
    return NextResponse.json({ summary });
    
  } catch (error: unknown) {
    console.error('LLM处理失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'LLM处理失败' },
      { status: 500 }
    );
  }
} 