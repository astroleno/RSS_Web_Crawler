'use client';

import { useEffect, useState } from 'react';
import feeds from '@/rss-feeds.json';
import LLMSummary from './LLMSummary';
import Settings from './Settings';
import { Feed } from '../types/feed';

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
}

interface Feed {
  title: string;
  description: string;
  items: FeedItem[];
  sourceUrl: string;
}

const RSSFeed = () => {
  const [settings, setSettings] = useState<{
    apiKey: string;
    feeds: { url: string }[];
    llmConfig: {
      type: string;
      model: string;
      baseUrl: string;
    };
  }>({
    apiKey: '',
    feeds: [],
    llmConfig: {
      type: 'openai',
      model: 'gpt-3.5-turbo',
      baseUrl: 'https://api.openai.com/v1',
    }
  });

  const [feedsStatus, setFeedsStatus] = useState<{
    data: Feed | null;
    error: string | null;
    loading: boolean;
    url: string;
  }[]>([]);

  const [selectedItem, setSelectedItem] = useState<{
    item: FeedItem;
    feedTitle: string;
  } | null>(null);

  const extractTextContent = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.substring(0, 100) + '...';
  };

  useEffect(() => {
    setFeedsStatus(settings.feeds.map(feed => ({
      data: null,
      error: null,
      loading: true,
      url: feed.url
    })));
  }, [settings]);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const response = await fetch('/api/rss', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ feeds: settings.feeds })
        });
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setFeedsStatus(prev => prev.map(feed => {
          const matchingFeed = data.feeds.find((f: Feed) => f.sourceUrl === feed.url);
          return {
            ...feed,
            data: matchingFeed,
            loading: false,
            error: matchingFeed ? null : '该RSS源无法访问或格式不正确'
          };
        }));
      } catch (err) {
        console.error('RSS获取失败:', err);
        setFeedsStatus(prev => prev.map(feed => ({
          ...feed,
          loading: false,
          error: err instanceof Error ? err.message : '获取RSS内容失败'
        })));
      }
    };

    if (settings.feeds.length > 0) {
      fetchFeeds();
    }
  }, [settings]);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    const scrollContainer = document.querySelector('.scroll-container');

    const handleScroll = () => {
      if (scrollContainer) {
        scrollContainer.classList.add('is-scrolling');
        
        clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
          scrollContainer.classList.remove('is-scrolling');
        }, 500);
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <Settings onSettingsChange={setSettings} />
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-breathe" />
      <div className="absolute inset-0 scroll-container">
        <div className="w-full px-4 py-8">
          <div className="flex gap-6 max-w-[2000px] mx-auto">
            <div 
              className={`transition-all duration-500 ease-in-out transform ${
                selectedItem 
                  ? 'w-80 scale-95 origin-left' 
                  : 'w-full scale-100'
              }`}
            >
              <div className="space-y-4">
                {feedsStatus.map((feed) => (
                  <div 
                    key={feed.url} 
                    className="rounded-xl overflow-hidden backdrop-blur-xl bg-white/20 dark:bg-black/20 shadow-lg border border-white/30 dark:border-white/10"
                  >
                    <div className="p-4 backdrop-blur-sm bg-white/10 dark:bg-black/10">
                      <h2 className="text-lg font-bold mb-2 text-white dark:text-white/90">
                        {feed.data?.title || feed.url}
                      </h2>
                      {feed.loading && (
                        <div className="text-white/70">正在加载...</div>
                      )}
                      {feed.error && (
                        <div className="text-red-200 text-sm bg-red-500/20 p-2 rounded">
                          错误: {feed.error}
                        </div>
                      )}
                    </div>

                    {feed.data && (
                      <div className={`divide-y divide-white/10 dark:divide-white/5 ${
                        selectedItem 
                          ? '' 
                          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4'
                      }`}>
                        {feed.data.items.map((item, itemIndex) => (
                          <button 
                            key={itemIndex}
                            className={`w-full text-left group ${
                              selectedItem 
                                ? 'px-4 py-2 hover:bg-white/10 dark:hover:bg-white/5' 
                                : 'p-4 rounded-lg hover:bg-white/10 dark:hover:bg-white/5'
                            } transition-all duration-300 ease-in-out ${
                              selectedItem?.item === item ? 'bg-white/20 dark:bg-white/10' : ''
                            }`}
                            onClick={() => setSelectedItem({ 
                              item, 
                              feedTitle: feed.data?.title || feed.url
                            })}
                          >
                            <h3 className={`font-medium text-white dark:text-white/90 ${
                              selectedItem ? 'text-sm line-clamp-2' : 'text-lg mb-2'
                            } group-hover:translate-x-1 transition-transform duration-300`}>
                              {item.title}
                            </h3>
                            {!selectedItem && (
                              <p className="text-sm text-white/70 dark:text-white/60 mb-2 line-clamp-3">
                                {extractTextContent(item.content)}
                              </p>
                            )}
                            <time className="text-xs text-white/50 block">
                              {new Date(item.pubDate).toLocaleDateString('zh-CN')}
                            </time>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div 
              className={`flex-grow transition-all duration-500 ease-in-out transform ${
                selectedItem ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
              style={{ display: selectedItem ? 'block' : 'none' }}
            >
              <div className="sticky top-8 rounded-xl overflow-hidden backdrop-blur-xl bg-white/20 dark:bg-black/20 shadow-lg border border-white/30 dark:border-white/10">
                <div className="flex justify-between items-center p-6 backdrop-blur-sm bg-white/10 dark:bg-black/10">
                  <div className="text-sm text-white">
                    {selectedItem?.feedTitle}
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-sm text-white hover:text-white/80 transition-colors duration-300"
                  >
                    收起文章 ×
                  </button>
                </div>
                <div className="relative">
                  <article 
                    key={selectedItem?.item.title}
                    className="p-6 animate-fade-in"
                  >
                    <div className="max-w-4xl mx-auto">
                      <h1 className="text-2xl font-bold mb-4 text-white">
                        {selectedItem?.item.title}
                      </h1>
                      <div className="flex items-center gap-4 mb-8">
                        <time className="text-sm text-white">
                          {selectedItem?.item.pubDate && new Date(selectedItem.item.pubDate).toLocaleString('zh-CN')}
                        </time>
                        <a 
                          href={selectedItem?.item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white hover:text-white/80 transition-colors duration-300 underline"
                        >
                          查看原文
                        </a>
                      </div>
                      
                      <LLMSummary 
                        content={selectedItem?.item.content || ''} 
                        apiKey={settings.apiKey}
                        llmConfig={settings.llmConfig}
                      />
                      
                      <div 
                        className="prose prose-invert max-w-none mt-8 [&>*]:text-white
                          prose-headings:text-white 
                          prose-h1:text-2xl prose-h1:font-bold
                          prose-h2:text-xl prose-h2:font-semibold
                          prose-h3:text-lg prose-h3:font-medium
                          prose-p:text-base
                          prose-a:text-white prose-a:underline hover:prose-a:text-white/80
                          prose-strong:text-white prose-strong:font-bold
                          prose-em:text-white prose-em:italic
                          prose-code:text-white prose-code:bg-white/10
                          prose-pre:bg-white/10 prose-pre:text-white
                          prose-ol:text-white prose-ul:text-white
                          prose-li:text-white
                          prose-blockquote:text-white prose-blockquote:border-white/30"
                        dangerouslySetInnerHTML={{ __html: selectedItem?.item.content || '' }}
                      />
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSSFeed; 