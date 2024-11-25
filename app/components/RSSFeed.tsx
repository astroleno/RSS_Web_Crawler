'use client';

import { useEffect, useState } from 'react';
import LLMSummary from './LLMSummary';
import Settings from './Settings';
import { Feed, FeedItem, DEFAULT_RSS_FEEDS } from '../types/feed';
import { DEFAULT_SYSTEM_PROMPT } from '../types/llm';

// 添加常量用于 localStorage keys
const STORAGE_KEYS = {
  SETTINGS: 'rss_reader_settings',
  COLLAPSED_FEEDS: 'rss_reader_collapsed_feeds'
} as const;

// 创建默认设置
const DEFAULT_SETTINGS = {
  apiKey: '',
  feeds: [] as { url: string }[],
  llmConfig: {
    type: 'openai',
    model: 'gpt-3.5-turbo',
    baseUrl: 'https://api.openai.com/v1',
    systemPrompt: DEFAULT_SYSTEM_PROMPT
  }
} as const;

const RSSFeed = () => {
  // 使用 useState 的延迟初始化功能
  const [initialized, setInitialized] = useState(false);
  const [settings, setSettings] = useState<{
    apiKey: string;
    feeds: { url: string }[];
    llmConfig: {
      type: string;
      model: string;
      baseUrl: string;
      systemPrompt: string;
    };
  }>(DEFAULT_SETTINGS);
  const [feedsStatus, setFeedsStatus] = useState<Map<string, {
    data: Feed | null;
    error: string | null;
    loading: boolean;
    url: string;
  }>>(new Map());
  const [selectedItem, setSelectedItem] = useState<{
    item: FeedItem;
    feedTitle: string;
  } | null>(null);
  const [collapsedFeeds, setCollapsedFeeds] = useState<{[key: string]: boolean}>({});

  // 使用 useEffect 来处理客户端的初始化
  useEffect(() => {
    if (!initialized) {
      // 从 localStorage 加载设置
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else if (settings.feeds.length === 0) {
        // 如果没有保存的设置，使用默认的 RSS 源
        const defaultFeeds = DEFAULT_RSS_FEEDS.map(feed => ({ url: feed.url }));
        setSettings(prev => ({
          ...prev,
          feeds: defaultFeeds
        }));
      }

      // 从 localStorage 加载折叠状态，如果没有则设置所有频道为折叠状态
      const savedCollapsed = localStorage.getItem(STORAGE_KEYS.COLLAPSED_FEEDS);
      if (savedCollapsed) {
        setCollapsedFeeds(JSON.parse(savedCollapsed));
      } else {
        // 设置所有频道默认为折叠状态
        const defaultCollapsed = DEFAULT_RSS_FEEDS.reduce((acc, feed) => {
          acc[feed.url] = true; // true 表示折叠
          return acc;
        }, {} as {[key: string]: boolean});
        setCollapsedFeeds(defaultCollapsed);
        localStorage.setItem(STORAGE_KEYS.COLLAPSED_FEEDS, JSON.stringify(defaultCollapsed));
      }

      setInitialized(true);
    }
  }, [initialized, settings.feeds.length]);

  const extractTextContent = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.substring(0, 100) + '...';
  };

  // 修改折叠状态的处理函数
  const toggleFeedCollapse = (url: string) => {
    setCollapsedFeeds(prev => {
      const newState = {
        ...prev,
        [url]: !prev[url]
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.COLLAPSED_FEEDS, JSON.stringify(newState));
      }
      return newState;
    });
  };

  // 修改 setSettings 的处理函数
  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    }
  };

  // 新增单个 feed 的加载函数
  const fetchSingleFeed = async (feedUrl: string) => {
    try {
      const response = await fetch('/api/rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feeds: [{ url: feedUrl }] })
      });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const matchingFeed = data.feeds[0];
      setFeedsStatus(prev => {
        const newStatus = new Map(prev);
        newStatus.set(feedUrl, {
          data: matchingFeed || null,
          error: matchingFeed ? null : '该RSS源无法访问或格式不正确',
          loading: false,
          url: feedUrl
        });
        return newStatus;
      });
    } catch (err) {
      console.error(`RSS获取失败 (${feedUrl}):`, err);
      setFeedsStatus(prev => {
        const newStatus = new Map(prev);
        newStatus.set(feedUrl, {
          data: null,
          loading: false,
          error: err instanceof Error ? err.message : '获取RSS内容失败',
          url: feedUrl
        });
        return newStatus;
      });
    }
  };

  useEffect(() => {
    // 对每个 feed 设置初始状态并开始加载
    const unloadedFeeds = settings.feeds.filter(feed => !feedsStatus.has(feed.url));
    
    if (unloadedFeeds.length > 0) {
      // 一次性更新所有未加载的 feeds 的状态
      setFeedsStatus(prev => {
        const newStatus = new Map(prev);
        unloadedFeeds.forEach(feed => {
          newStatus.set(feed.url, {
            data: null,
            error: null,
            loading: true,
            url: feed.url
          });
        });
        return newStatus;
      });

      // 开始加载这些 feeds
      unloadedFeeds.forEach(feed => {
        fetchSingleFeed(feed.url);
      });
    }

    // 清理不再需要的 feed 状态
    const currentUrls = new Set(settings.feeds.map(feed => feed.url));
    setFeedsStatus(prev => {
      const newStatus = new Map();
      for (const [url, status] of prev.entries()) {
        if (currentUrls.has(url)) {
          newStatus.set(url, status);
        }
      }
      return newStatus;
    });
  }, [settings.feeds]);

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

  // 添加一个辅助函数来将文本拆分成字符数组
  const splitTextToChars = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
        {char}
      </span>
    ));
  };

  // 修改 find 函数的类型声明
  const findFeedName = (url: string) => {
    return DEFAULT_RSS_FEEDS.find((f: { url: string; name: string }) => f.url === url)?.name;
  };

  // 修改计算动画时长的辅助函数
  const getAnimationDuration = (itemCount: number) => {
    // 基础动画时长提高到 600ms，每10条内容增加200ms，最大2000ms
    const duration = Math.min(600 + Math.floor(itemCount / 10) * 200, 2000);
    return `${duration}ms`;
  };

  // 修改返回的 JSX，添加初始化检查
  if (!initialized) {
    return <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-breathe" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-breathe" />
      
      <div className="absolute inset-0 scroll-container">
        <div className="w-full py-8">
          <div className="max-w-[2000px] mx-auto px-4">
            <div className="w-full max-w-[2000px]">
              <div 
                className="transform transition-all ease-in-out hover:scale-[1.01]"
                style={{
                  transitionDuration: '500ms' // 设置按钮使用固定的较长动画时间
                }}
              >
                <Settings onSettingsChange={handleSettingsChange} />
              </div>
            </div>
            
            <div className="flex gap-6">
              <div 
                className={`transition-all duration-500 ease-in-out transform ${
                  selectedItem 
                    ? 'w-80 scale-95 origin-left' 
                    : 'w-full scale-100'
                }`}
              >
                <div className="space-y-4">
                  {settings.feeds.map((feed) => {
                    const status = feedsStatus.get(feed.url) || {
                      data: null,
                      error: null,
                      loading: true,
                      url: feed.url
                    };

                    return (
                      <div 
                        key={feed.url} 
                        className="rounded-xl overflow-hidden backdrop-blur-xl bg-white/20 dark:bg-black/20 shadow-lg border border-white/30 dark:border-white/10 transition-all ease-in-out hover:shadow-xl"
                        style={{
                          transitionDuration: getAnimationDuration(status.data?.items?.length || 0)
                        }}
                      >
                        <div 
                          className="p-4 backdrop-blur-sm bg-white/10 dark:bg-black/10 cursor-pointer flex items-center justify-between transition-all ease-in-out hover:bg-white/20 dark:hover:bg-white/15"
                          style={{
                            transitionDuration: getAnimationDuration(status.data?.items?.length || 0)
                          }}
                          onClick={() => toggleFeedCollapse(feed.url)}
                        >
                          <h2 className="text-lg font-bold text-white dark:text-white/90 flex items-center gap-2">
                            {status.data ? (
                              <>
                                <span>{status.data.title}</span>
                                <span className="text-sm font-normal text-white/70">
                                  ({status.data.items.length})
                                </span>
                              </>
                            ) : (
                              <>
                                {findFeedName(feed.url) ? (
                                  <span className="animate-float">
                                    {splitTextToChars(findFeedName(feed.url) || '')}
                                  </span>
                                ) : (
                                  <span>{feed.url}</span>
                                )}
                                <span className="text-sm font-normal text-white/70">
                                  {status.loading ? '(加载中...)' : ''}
                                </span>
                              </>
                            )}
                          </h2>
                          <button 
                            className="text-white/70 hover:text-white transition-all transform"
                            style={{
                              transitionDuration: getAnimationDuration(status.data?.items?.length || 0),
                              transform: `rotate(${collapsedFeeds[feed.url] ? 0 : 180}deg)`,
                              transformOrigin: 'center',
                              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                            aria-label={collapsedFeeds[feed.url] ? "展开" : "折叠"}
                          >
                            ▼
                          </button>
                        </div>

                        <div 
                          className={`transition-all ease-in-out overflow-hidden`}
                          style={{
                            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            transitionDuration: getAnimationDuration(status.data?.items?.length || 0),
                            maxHeight: collapsedFeeds[feed.url] ? '0' : 
                              status.data?.items ? `${Math.max((status.data.items.length * 150) + 100, 300)}px` : '200px',
                            opacity: collapsedFeeds[feed.url] ? '0' : '1',
                            transform: collapsedFeeds[feed.url] ? 'translateY(-10px)' : 'translateY(0)',
                            transitionProperty: 'max-height, opacity, transform',
                            transitionDelay: collapsedFeeds[feed.url] 
                              ? '0s, 0.1s, 0.2s'  // 折叠时，先改变高度，然后是透明度，最后是位移
                              : '0s, 0s, 0s',     // 展开时，同时开始所有动画
                          }}
                        >
                          {!collapsedFeeds[feed.url] && (
                            <>
                              {status.loading && !status.data && (
                                <div className="p-4 text-white/70">正在加载...</div>
                              )}
                              
                              {status.error && (
                                <div className="p-4 text-red-200 text-sm bg-red-500/20 rounded">
                                  错误: {status.error}
                                </div>
                              )}

                              {status.data && (
                                <div className={`${
                                  selectedItem 
                                    ? '' 
                                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4'
                                }`}>
                                  {status.data.items.map((item, itemIndex) => (
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
                                        feedTitle: status.data?.title || feed.url
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
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedItem && (
                <div 
                  className="flex-grow transition-all duration-500 ease-in-out transform translate-x-0 opacity-100"
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
                        收起文 ×
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSSFeed; 