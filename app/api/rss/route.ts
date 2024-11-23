import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import feeds from '@/rss-feeds.json';

const parser = new Parser();

export async function GET() {
  try {
    const feedPromises = feeds.feeds.map(async (feed) => {
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
  } catch (error) {
    return NextResponse.json(
      { error: '获取RSS内容失败' },
      { status: 500 }
    );
  }
} 