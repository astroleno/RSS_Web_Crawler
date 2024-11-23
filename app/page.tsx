import RSSFeed from './components/RSSFeed';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">RSS阅读器</h1>
        <RSSFeed />
      </div>
    </main>
  );
}
