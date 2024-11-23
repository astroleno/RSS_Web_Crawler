import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export async function POST(request: Request) {
  try {
    const { feeds } = await request.json();

    if (!feeds || !Array.isArray(feeds)) {
      return NextResponse.json(
        { error: '无效的 RSS 源列表' },
        { status: 400 }
      );
    }

    const feedPromises = feeds.map(async (feed) => {
      try {
        const content = await parser.parseURL(feed.url);
        return {
          title: content.title,
          description: content.description,
          sourceUrl: feed.url,
          items: content.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            content: item.content
          }))
        };
      } catch (error) {
        console.error(`获取RSS源失败 ${feed.url}:`, error);
        return null;
      }
    });

    const results = await Promise.all(feedPromises);
    const validResults = results.filter(result => result !== null);

    return NextResponse.json({ feeds: validResults });
  } catch (error: unknown) {
    console.error('获取RSS内容失败:', error);
    return NextResponse.json(
      { error: '获取RSS内容失败' },
      { status: 500 }
    );
  }
} 