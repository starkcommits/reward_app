import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp, Users, Timer, History, X, Filter } from 'lucide-react';

interface Market {
  id: string;
  category: string;
  title: string;
  traders: number;
  info: string;
  odds: { yes: number; no: number };
  trend: string;
  image?: string;
  type?: string;
}

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Bitcoin price prediction',
    'India vs England',
    'Tesla stock',
  ]);

  // Sample market data - in a real app, this would come from an API
  const markets: Market[] = [
    {
      id: '1',
      category: 'Cricket',
      title: 'New Zealand to win the 3rd T20I vs Pakistan?',
      traders: 3349,
      info: 'H2H last 5 T20: New Zealand 4, PAK 1',
      odds: { yes: 8.0, no: 2.0 },
      trend: '+12%',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop',
    },
    {
      id: '2',
      category: 'Crypto',
      title: 'Bitcoin to reach $50,000 by end of March?',
      traders: 2891,
      info: 'Current price: $48,235.21 (+2.4%)',
      odds: { yes: 3.5, no: 1.5 },
      trend: '+28%',
    },
    {
      id: '3',
      category: 'Youtube',
      title: 'MrBeast to hit 250M subscribers by April?',
      traders: 1567,
      info: 'Current: 247M, Growth rate: 100k/day',
      odds: { yes: 4.2, no: 1.8 },
      trend: '+15%',
    },
    {
      id: '4',
      category: 'Stocks',
      title: 'Tesla to announce new AI chip in Q2?',
      traders: 4231,
      info: 'Recent hints from Elon about AI advancement',
      odds: { yes: 5.5, no: 1.6 },
      trend: '+32%',
    },
  ];

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'cricket', name: 'Cricket' },
    { id: 'crypto', name: 'Crypto' },
    { id: 'stocks', name: 'Stocks' },
    { id: 'youtube', name: 'Youtube' },
    { id: 'politics', name: 'Politics' },
  ];

  const trendingSearches = [
    'World Cup 2024',
    'Bitcoin ETF approval',
    'US Elections',
    'IPL predictions',
  ];

  const filteredMarkets = markets.filter(market => {
    const matchesQuery = market.title.toLowerCase().includes(query.toLowerCase()) ||
                        market.category.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = activeFilter === 'all' || market.category.toLowerCase() === activeFilter;
    return matchesQuery && matchesFilter;
  });

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
    }
  };

  const handleMarketClick = (market: Market) => {
    navigate(`/event/${market.id}`, { state: { market } });
  };

  const clearSearch = () => {
    setQuery('');
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches(prev => prev.filter(s => s !== search));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white sticky top-0 z-20 pt-safe-top shadow-sm">
        <div className="px-6 py-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search markets, events..."
              className="w-full pl-12 pr-10 py-3 bg-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide -mx-6 px-6">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {query ? (
          // Search Results
          <div className="space-y-4">
            {filteredMarkets.length > 0 ? (
              filteredMarkets.map((market) => (
                <div
                  key={market.id}
                  onClick={() => handleMarketClick(market)}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer animate-fadeIn"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      market.category === 'Crypto' ? 'bg-amber-100 text-amber-800' :
                      market.category === 'Cricket' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {market.category}
                    </span>
                    <span className="flex items-center text-sm text-emerald-600 font-medium">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {market.trend}
                    </span>
                  </div>
                  <h3 className="font-medium mb-2">{market.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {market.traders.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Timer className="h-4 w-4 mr-1" />
                      2d left
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="py-2 px-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium text-center">
                      Yes ₹{market.odds.yes}
                    </div>
                    <div className="py-2 px-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium text-center">
                      No ₹{market.odds.no}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
                <p className="text-sm text-gray-500">Try different keywords or filters</p>
              </div>
            )}
          </div>
        ) : (
          // Initial Search Screen
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Searches</h2>
                  <button 
                    onClick={() => setRecentSearches([])}
                    className="text-sm text-indigo-600 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-3 rounded-xl"
                    >
                      <button
                        onClick={() => handleSearch(search)}
                        className="flex items-center text-gray-700"
                      >
                        <History className="h-4 w-4 mr-3 text-gray-400" />
                        {search}
                      </button>
                      <button
                        onClick={() => removeRecentSearch(search)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Trending Searches</h2>
              <div className="space-y-2">
                {trendingSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="flex items-center w-full bg-white p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 mr-3 text-emerald-500" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Search;