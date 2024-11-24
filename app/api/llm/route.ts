import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { content, apiKey, llmConfig } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: '请在设置中配置 API Key' },
        { status: 400 }
      );
    }

    let summary;

    switch (llmConfig.type) {
      case 'openai':
        const openai = new OpenAI({
          baseURL: llmConfig.baseUrl,
          apiKey: apiKey,
        });

        const openaiResponse = await openai.chat.completions.create({
          model: llmConfig.model,
          messages: [
            {
              role: "system",
              content: "你是一个专业的内容分析师，善于总结文章要点。请用简洁的语言总结文章的主要内容，并提取关键信息。"
            },
            {
              role: "user",
              content
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        summary = openaiResponse.choices[0].message.content;
        break;

      case 'anthropic':
        const anthropic = new Anthropic({
          apiKey: apiKey,
          baseURL: llmConfig.baseUrl,
        });

        const anthropicResponse = await anthropic.messages.create({
          model: llmConfig.model,
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: "请总结以下文章的主要内容：\n\n" + content
            }
          ],
        });

        summary = anthropicResponse.content[0].text;
        break;

      case 'qwen':
        const qwenResponse = await fetch(llmConfig.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: llmConfig.model,
            messages: [
              {
                role: "system",
                content: "你是一个专业的内容分析师，善于总结文章要点。请用简洁的语言总结文章的主要内容，并提取关键信息。"
              },
              {
                role: "user",
                content
              }
            ],
          }),
        });

        const qwenData = await qwenResponse.json();
        summary = qwenData.choices[0].message.content;
        break;

      default:
        throw new Error('不支持的模型类型');
    }

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error('LLM处理失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'LLM处理失败' },
      { status: 500 }
    );
  }
} 