'use client';

import { useState, useEffect } from 'react';

interface SettingsProps {
  onSettingsChange: (settings: {
    apiKey: string;
    feeds: { url: string }[];
    llmConfig: {
      type: string;
      model: string;
      baseUrl: string;
    };
  }) => void;
}

const Settings = ({ onSettingsChange }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [feeds, setFeeds] = useState<{ url: string }[]>([{ url: '' }]);
  const [llmConfig, setLlmConfig] = useState({
    type: 'openai', // 默认类型
    model: 'gpt-3.5-turbo', // 默认模型
    baseUrl: 'https://api.openai.com/v1', // 默认URL
  });

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('rssReaderSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setApiKey(parsed.apiKey || '');
      setFeeds(parsed.feeds?.length ? parsed.feeds : [{ url: '' }]);
      setLlmConfig(parsed.llmConfig || {
        type: 'openai',
        model: 'gpt-3.5-turbo',
        baseUrl: 'https://api.openai.com/v1',
      });
      onSettingsChange(parsed);
    }
  }, []);

  const handleSave = () => {
    const validFeeds = feeds.filter(feed => feed.url.trim() !== '');
    const settings = {
      apiKey: apiKey.trim(),
      feeds: validFeeds,
      llmConfig,
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
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-300"
      >
        设置
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl p-6 rounded-xl w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">设置</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="输入你的 API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  大模型类型
                </label>
                <select
                  value={llmConfig.type}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="qwen">通义千问</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  模型名称
                </label>
                <input
                  type="text"
                  value={llmConfig.model}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="输入模型名称，如 gpt-3.5-turbo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  API 基础URL
                </label>
                <input
                  type="text"
                  value={llmConfig.baseUrl}
                  onChange={(e) => setLlmConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="输入API基础URL"
                />
              </div>

              {/* RSS源设置 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  RSS源
                </label>
                {feeds.map((feed, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feed.url}
                      onChange={(e) => handleFeedChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="输入RSS源URL"
                    />
                    <button
                      onClick={() => handleRemoveFeed(index)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg"
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddFeed}
                  className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg mt-2"
                >
                  添加RSS源
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg"
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