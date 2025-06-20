import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ExternalLink, Clock, Filter } from 'lucide-react';

const News = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All News' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'stocks', name: 'Stocks' },
    { id: 'sports', name: 'Sports' },
    { id: 'politics', name: 'Politics' },
  ];

  const newsItems = [
    {
      id: '1',
      category: 'crypto',
      title: 'Bitcoin Surges Past $50,000 as Institutional Interest Grows',
      source: 'CryptoNews',
      timestamp: '2024-03-06T10:30:00Z',
      image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop',
      impact: 'high',
      trend: '+5.2%',
    },
    {
      id: '2',
      category: 'sports',
      title: 'India vs England: Final Test Match Preview and Analysis',
      source: 'SportsCentral',
      timestamp: '2024-03-06T09:15:00Z',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop',
      impact: 'medium',
    },
    {
      id: '3',
      category: 'stocks',
      title: 'Tesla Announces New Factory Location in Asia',
      source: 'MarketWatch',
      timestamp: '2024-03-06T08:45:00Z',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop',
      impact: 'high',
      trend: '+2.8%',
    },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const filteredNews = activeCategory === 'all' 
    ? newsItems 
    : newsItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 pt-safe-top pb-8">
        <div className="px-6">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Market News</h1>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-white text-indigo-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* News Content */}
      <div className="px-6 -mt-4">
        <div className="bg-white rounded-3xl shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="text-sm font-medium text-gray-700">
              Latest Updates
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredNews.map((news) => (
              <div key={news.id} className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        news.category === 'crypto' 
                          ? 'bg-amber-100 text-amber-800'
                          : news.category === 'sports'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
                      </span>
                      {news.trend && (
                        <span className="flex items-center text-xs font-medium text-emerald-600">
                          <TrendingUp className="h-3 w-3 mr-0.5" />
                          {news.trend}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        news.impact === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {news.impact.charAt(0).toUpperCase() + news.impact.slice(1)} Impact
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {news.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatTimeAgo(news.timestamp)}
                        </span>
                      </div>
                      <button className="p-1 hover:bg-gray-50 rounded-lg transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;