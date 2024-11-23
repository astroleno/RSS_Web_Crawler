'use client';

import { useState, useEffect } from 'react';

interface SettingsProps {
  onSettingsChange: (settings: {
    apiKey: string;
    feeds: { url: string }[];
  }) => void;
}

const Settings = ({ onSettingsChange }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [feeds, setFeeds] = useState<{ url: string }[]>([{ url: '' }]);

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('rssReaderSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setApiKey(parsed.apiKey || '');
      setFeeds(parsed.feeds?.length ? parsed.feeds : [{ url: '' }]);
      onSettingsChange(parsed);
    }
  }, []);

  const handleSave = () => {
    // 过滤掉空的feed
    const validFeeds = feeds.filter(feed => feed.url.trim() !== '');
    const settings = {
      apiKey: apiKey.trim(),
      feeds: validFeeds,
    };
    
    localStorage.setItem('rssReaderSettings', JSON.stringify(settings));
    onSettingsChange(settings);
    setIsOpen(false);
  };

  const handleAddFeed = () => {
    setFeeds([...feeds, { url: '' }]);
  };

  const handleRemoveFeed = (index: number) => {
    setFeeds(feeds.filter((_, i) => i !== index));
  };

  const handleFeedChange = (index: number, value: string) => {
    const newFeeds = [...feeds];
    newFeeds[index] = { url: value };
    setFeeds(newFeeds);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-300"
      >
        设置
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl p-6 rounded-xl w-full max-w-md border border-white/30">
            <h2 className="text-xl font-bold mb-4 text-white">设置</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                  placeholder="输入你的 API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  RSS 订阅源
                </label>
                {feeds.map((feed, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={feed.url}
                      onChange={(e) => handleFeedChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                      placeholder="输入 RSS 订阅源 URL"
                    />
                    <button
                      onClick={() => handleRemoveFeed(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors duration-300"
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddFeed}
                  className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-300 mt-2"
                >
                  添加订阅源
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-300"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-300"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 