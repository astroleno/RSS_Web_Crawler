export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
}

export interface Feed {
  title: string;
  description: string;
  items: FeedItem[];
  sourceUrl: string;
}

export const DEFAULT_RSS_FEEDS = [
  { 
    url: 'https://plink.anyfeeder.com/weixin/ckxxwx',
    name: '参考消息'
  },
  { 
    url: 'http://feeds.feedburner.com/zhihu-daily',
    name: '知乎日报'
  },
  { 
    url: 'https://plink.anyfeeder.com/weixin/jianshuio',
    name: '简书'
  },
  { 
    url: 'https://wangyurui.com/feed.xml',
    name: '王玉瑞博客' 
  }
]; 