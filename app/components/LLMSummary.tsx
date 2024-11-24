'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LLMSummaryProps {
  content: string;
  apiKey: string;
  llmConfig: {
    type: string;
    model: string;
    baseUrl: string;
    systemPrompt?: string;
  };
}

const LLMSummary = ({ content, apiKey, llmConfig }: LLMSummaryProps) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          apiKey,
          llmConfig,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成摘要失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!summary && !loading && (
        <button
          onClick={generateSummary}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-300"
        >
          生成AI摘要
        </button>
      )}
      
      {loading && (
        <div className="text-white animate-pulse">
          正在生成摘要...
        </div>
      )}
      
      {error && (
        <div className="text-white text-sm bg-red-500/20 p-2 rounded">
          错误: {error}
        </div>
      )}
      
      {summary && (
        <div className="bg-white/10 rounded-lg p-4">
          <h4 className="text-white text-sm font-medium mb-2">AI摘要</h4>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // 所有元素统一使用白色文本
                h1: ({ ...props }) => (
                  <h1 {...props} className="!text-white text-2xl font-bold" />
                ),
                h2: ({ ...props }) => (
                  <h2 {...props} className="!text-white text-xl font-semibold" />
                ),
                h3: ({ ...props }) => (
                  <h3 {...props} className="!text-white text-lg font-medium" />
                ),
                p: ({ ...props }) => (
                  <p {...props} className="!text-white text-base" />
                ),
                a: ({ ...props }) => (
                  <a
                    {...props}
                    className="!text-white underline hover:text-white/80 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                ul: ({ ...props }) => (
                  <ul {...props} className="!text-white list-disc list-inside [&>li]:!text-white" />
                ),
                ol: ({ ...props }) => (
                  <ol {...props} className="!text-white list-decimal list-inside [&>li]:!text-white [&>li::marker]:!text-white" />
                ),
                li: ({ ...props }) => (
                  <li {...props} className="!text-white" />
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <code
                      {...props}
                      className="!text-white block bg-white/10 p-2 rounded-lg"
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      {...props}
                      className="!text-white bg-white/10 rounded px-1"
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ ...props }) => (
                  <blockquote
                    {...props}
                    className="!text-white border-l-4 border-white/30 pl-4"
                  />
                ),
                strong: ({ ...props }) => (
                  <strong {...props} className="!text-white font-bold" />
                ),
                em: ({ ...props }) => (
                  <em {...props} className="!text-white italic" />
                ),
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMSummary; 