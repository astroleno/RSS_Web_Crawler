'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_MODELS, DEFAULT_SYSTEM_PROMPT, DEFAULT_PROXY_URLS, DEFAULT_API_KEY, LLMConfig } from '../types/llm';
import { DEFAULT_RSS_FEEDS } from '../types/feed';
import { saveAs } from 'file-saver';

interface SettingsProps {
  onSettingsChange: (settings: {
    apiKey: string;
    feeds: { url: string }[];
    llmConfig: {
      type: string;
      model: string;
      baseUrl: string;
      systemPrompt?: string;
    };
  }) => void;
}

const Settings = ({ onSettingsChange }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [feedUrl, setFeedUrl] = useState('');
  const [feeds, setFeeds] = useState<{ url: string }[]>([]);
  const [showLLMPanel, setShowLLMPanel] = useState(false);
  const [showRSSPanel, setShowRSSPanel] = useState(false);
  
  const [llmConfig, setLLMConfig] = useState<LLMConfig>({
    type: 'openai',
    model: 'gpt-3.5-turbo',
    baseUrl: DEFAULT_PROXY_URLS[0].url,
    systemPrompt: DEFAULT_SYSTEM_PROMPT
  });

  const [customModel, setCustomModel] = useState('');
  const [selectedProxyUrl, setSelectedProxyUrl] = useState(DEFAULT_PROXY_URLS[0].url);
  const [editableProxyUrl, setEditableProxyUrl] = useState(DEFAULT_PROXY_URLS[0].url);

  const [needsUpdate, setNeedsUpdate] = useState(false);

  const [customModels, setCustomModels] = useState<Array<{label: string, value: string}>>([]);
  const [showCustomFields, setShowCustomFields] = useState(false);

  useEffect(() => {
    if (feeds.length === 0) {
      const defaultFeeds = DEFAULT_RSS_FEEDS.map(feed => ({ url: feed.url }));
      setFeeds(defaultFeeds);
      onSettingsChange({ apiKey, feeds: defaultFeeds, llmConfig });
    }
  }, [feeds.length, apiKey, llmConfig, onSettingsChange]);

  const handleAddFeed = () => {
    if (feedUrl) {
      const newFeeds = [...feeds, { url: feedUrl }];
      setFeeds(newFeeds);
      setFeedUrl('');
      setNeedsUpdate(true);
    }
  };

  const handleRemoveFeed = (index: number) => {
    const newFeeds = feeds.filter((_, i) => i !== index);
    setFeeds(newFeeds);
    setNeedsUpdate(true);
  };

  const handleUpdate = () => {
    onSettingsChange({ apiKey, feeds, llmConfig });
    setNeedsUpdate(false);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomFields(true);
    } else {
      setShowCustomFields(false);
      setLLMConfig({
        ...llmConfig,
        model: value
      });
      setNeedsUpdate(true);
    }
  };

  const handleCustomModelSave = () => {
    if (customModel) {
      const newCustomModel = {
        label: customModel,
        value: `custom_${Date.now()}`
      };
      setCustomModels(prev => [...prev, newCustomModel]);
      
      setLLMConfig({
        ...llmConfig,
        model: newCustomModel.value
      });
      
      setCustomModel('');
      setShowCustomFields(false);
      setNeedsUpdate(true);
    }
  };

  const handleSystemPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newConfig = {
      ...llmConfig,
      systemPrompt: e.target.value
    };
    setLLMConfig(newConfig);
    onSettingsChange({ apiKey, feeds, llmConfig: newConfig });
  };

  const handleProxyUrlChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProxyUrl(value);
    setEditableProxyUrl(value);
    const newConfig = {
      ...llmConfig,
      baseUrl: value
    };
    setLLMConfig(newConfig);
    onSettingsChange({ apiKey, feeds, llmConfig: newConfig });
  };

  const handleEditableProxyUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditableProxyUrl(value);
    const newConfig = {
      ...llmConfig,
      baseUrl: value
    };
    setLLMConfig(newConfig);
    onSettingsChange({ apiKey, feeds, llmConfig: newConfig });
  };

  const handleMoveFeed = (index: number, direction: 'up' | 'down') => {
    const newFeeds = [...feeds];
    if (direction === 'up' && index > 0) {
      // 向上移动
      [newFeeds[index], newFeeds[index - 1]] = [newFeeds[index - 1], newFeeds[index]];
    } else if (direction === 'down' && index < newFeeds.length - 1) {
      // 向下移动
      [newFeeds[index], newFeeds[index + 1]] = [newFeeds[index + 1], newFeeds[index]];
    }
    setFeeds(newFeeds);
    setNeedsUpdate(true);
  };

  const handleExportData = () => {
    const data = {
      apiKey,
      feeds,
      llmConfig,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, 'rss-reader-settings.json');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.apiKey && Array.isArray(data.feeds) && data.llmConfig) {
          setApiKey(data.apiKey);
          setFeeds(data.feeds);
          setLLMConfig(data.llmConfig);
          onSettingsChange({
            apiKey: data.apiKey,
            feeds: data.feeds,
            llmConfig: data.llmConfig,
          });
        } else {
          alert('导入的数据格式不正确');
        }
      } catch {
        alert('导入失败：无效的JSON文件');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有本地数据吗？此操作不可恢复。')) {
      localStorage.clear();
      setApiKey('');
      setFeeds([]);
      setLLMConfig({
        type: 'openai',
        model: 'gpt-3.5-turbo',
        baseUrl: 'https://api.openai.com/v1',
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
      });
      onSettingsChange({
        apiKey: '',
        feeds: [],
        llmConfig: {
          type: 'openai',
          model: 'gpt-3.5-turbo',
          baseUrl: 'https://api.openai.com/v1',
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
        },
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
        >
          设置 {isOpen ? '▼' : '▶'}
        </button>
      </div>

      {isOpen && (
        <div className="w-full rounded-xl overflow-hidden backdrop-blur-xl bg-white/20 dark:bg-black/20 shadow-lg border border-white/30 dark:border-white/10 mb-8">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setShowLLMPanel(!showLLMPanel)}
                  className="w-full flex justify-between items-center text-sm text-white hover:text-white/80 bg-white/10 p-2 rounded-lg"
                >
                  <span>大语言模型设置</span>
                  <span>{showLLMPanel ? '▼' : '▶'}</span>
                </button>
                
                {showLLMPanel && (
                  <div className="mt-2 space-y-3 p-3 bg-white/5 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          onSettingsChange({ apiKey: e.target.value, feeds, llmConfig });
                        }}
                        className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white"
                        placeholder="输入你的 API Key"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white mb-1">
                        代理URL
                      </label>
                      <select
                        value={selectedProxyUrl}
                        onChange={handleProxyUrlChange}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-3 py-2 text-white"
                      >
                        {DEFAULT_PROXY_URLS.map(proxy => (
                          <option 
                            key={proxy.url} 
                            value={proxy.url}
                            className="text-black"
                          >
                            {proxy.name}
                          </option>
                        ))}
                        <option value="custom">自定义代理</option>
                      </select>
                      <input
                        type="text"
                        value={editableProxyUrl}
                        onChange={handleEditableProxyUrlChange}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-3 py-2 text-white"
                        placeholder="编辑代理URL"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        模型选择
                      </label>
                      <select
                        value={llmConfig.model}
                        onChange={handleModelChange}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-lg px-3 py-2 text-white"
                      >
                        {DEFAULT_MODELS.map(model => (
                          <option 
                            key={model.value} 
                            value={model.value}
                            className="text-black"
                          >
                            {model.label}
                          </option>
                        ))}
                        {customModels.map(model => (
                          <option
                            key={model.value}
                            value={model.value}
                            className="text-black"
                          >
                            {model.label}
                          </option>
                        ))}
                        <option value="custom" className="text-black">
                          添加自定义模型
                        </option>
                      </select>
                    </div>

                    {showCustomFields && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={customModel}
                          onChange={(e) => setCustomModel(e.target.value)}
                          placeholder="输入模型名称"
                          className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white"
                        />
                        <button
                          onClick={handleCustomModelSave}
                          className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg"
                        >
                          保存自定义模型
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        系统提示词
                      </label>
                      <textarea
                        value={llmConfig.systemPrompt}
                        onChange={handleSystemPromptChange}
                        className="w-full h-40 bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white"
                        placeholder="输入系统提示词"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setShowRSSPanel(!showRSSPanel)}
                  className="w-full flex justify-between items-center text-sm text-white hover:text-white/80 bg-white/10 p-2 rounded-lg"
                >
                  <span>RSS订阅源设置</span>
                  <span>{showRSSPanel ? '▼' : '▶'}</span>
                </button>

                {showRSSPanel && (
                  <div className="mt-2 space-y-3 p-3 bg-white/5 rounded-lg">
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={feedUrl}
                        onChange={(e) => setFeedUrl(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white"
                        placeholder="输入 RSS 订阅源 URL"
                      />
                      <button
                        onClick={handleAddFeed}
                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg"
                      >
                        添加
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {feeds.map((feed, index) => {
                        const defaultFeed = DEFAULT_RSS_FEEDS.find(f => f.url === feed.url);
                        return (
                          <div key={index} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleMoveFeed(index, 'up')}
                                disabled={index === 0}
                                className={`text-white/70 hover:text-white ${index === 0 ? 'opacity-30' : ''}`}
                                aria-label="向上移动"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMoveFeed(index, 'down')}
                                disabled={index === feeds.length - 1}
                                className={`text-white/70 hover:text-white ${index === feeds.length - 1 ? 'opacity-30' : ''}`}
                                aria-label="向下移动"
                              >
                                ▼
                              </button>
                            </div>
                            <span className="flex-1 text-sm text-white truncate">
                              {defaultFeed ? `${defaultFeed.name} - ` : ''}{feed.url}
                            </span>
                            <button
                              onClick={() => handleRemoveFeed(index)}
                              className="text-white/70 hover:text-white"
                              aria-label="删除"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {needsUpdate && (
                <button
                  onClick={handleUpdate}
                  className="w-full bg-green-500/20 hover:bg-green-500/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
                >
                  更新RSS内容
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">数据管理</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded-lg backdrop-blur-sm"
                  >
                    导出数据
                  </button>
                  
                  <label className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg backdrop-blur-sm cursor-pointer">
                    导入数据
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={handleClearData}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg backdrop-blur-sm"
                  >
                    清除数据
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        select option {
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          color: black !important;
        }
      `}</style>
    </div>
  );
};

export default Settings; 