import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Book, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import ReactSlider from 'react-slider';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface TradeState {
  market: {
    category: string;
    title: string;
    traders: number;
    info: string;
    odds: { yes: number; no: number };
    trend: string;
    image?: string;
  };
  choice: 'yes' | 'no';
}

interface OrderBookEntry {
  price: number;
  yesQty: number;
  noQty: number;
}

const TradeConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { market, choice } = location.state as TradeState;
  const [price, setPrice] = useState(4.5);
  const [quantity, setQuantity] = useState(10);
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [probabilityTimeframe, setProbabilityTimeframe] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const maxPrice = 10;
  const maxQuantity = 100;
  const commission = 0.2;
  const availableBalance = 214.86;

  const orderBook: OrderBookEntry[] = [
    { price: 4.5, yesQty: 109, noQty: 80 },
    { price: 5.5, yesQty: 78, noQty: 325 },
    { price: 6.0, yesQty: 5, noQty: 168 },
  ];

  useEffect(() => {
    if (showOrderBook) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showOrderBook]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    if (diff > 0) {
      setOffsetY(diff);
      if (diff > 100) {
        setIsConfirming(true);
      } else {
        setIsConfirming(false);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setOffsetY(0);
    if (isConfirming) {
      handleConfirmTrade();
    }
    setIsConfirming(false);
  };

  const handleConfirmTrade = () => {
    console.log('Trade confirmed:', {
      market: market.title,
      choice,
      amount: price * quantity,
      potentialWinnings
    });
    navigate('/');
  };

  const probabilityData = {
    labels: ['3:17 PM', '3:20 PM', '3:22 PM', '3:25 PM', '3:27 PM', '3:30 PM'],
    datasets: [
      {
        fill: true,
        label: 'Probability',
        data: [50, 48, 52, 45, 35, 33],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6B7280', font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: '#F3F4F6' },
        ticks: {
          color: '#6B7280',
          font: { size: 10 },
          callback: (value: number) => `${value}%`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const totalCost = price * quantity;
  const potentialWinnings = choice === 'yes' ? 
    totalCost * (1 / price) * (1 - commission) :
    totalCost * (1 / (10 - price)) * (1 - commission);

  return (
    <div className="h-full flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-lg">
        <div className="px-4 pt-safe-top pb-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">Event Details</h1>
            <button className="p-2 active:bg-gray-100 rounded-full transition-colors">
              <Share2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto pt-[calc(env(safe-area-inset-top)+4rem)] pb-[calc(env(safe-area-inset-bottom)+16rem)]">
        <div className="px-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl text-white">₿</span>
            </div>
            <h2 className="text-xl text-center font-medium mb-4 px-6">{market.title}</h2>
            <div className="inline-block px-4 py-1 bg-gray-100 rounded-full">
              <span className="text-sm font-medium">Bitcoin</span>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-2">💡</span>
              <p className="text-sm text-amber-800">{market.info}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 py-3 rounded-xl text-center font-medium transition-colors ${
                choice === 'yes' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Yes ₹{market.odds.yes}
            </button>
            <button
              className={`flex-1 py-3 rounded-xl text-center font-medium transition-colors ${
                choice === 'no' ? 'bg-rose-500 text-white' : 'bg-gray-100'
              }`}
            >
              No ₹{market.odds.no}
            </button>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">YES</span>
                <span className="text-sm font-medium text-blue-500">35% Probability</span>
              </div>
              <span className="text-sm text-gray-500">-33.3% All</span>
            </div>

            <div className="flex gap-4 mb-4">
              {['5m', '10m', 'all'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setProbabilityTimeframe(timeframe)}
                  className={`text-sm transition-colors ${
                    probabilityTimeframe === timeframe 
                      ? 'text-blue-500 font-medium' 
                      : 'text-gray-500'
                  }`}
                >
                  {timeframe === 'all' ? 'All' : timeframe}
                </button>
              ))}
            </div>

            <div className="h-48 w-full">
              <Line data={probabilityData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg">
        <div className="p-4 pb-safe-bottom">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium">Price</span>
              <div className="flex items-center">
                <span className="text-lg font-medium">₹ {price.toFixed(1)}</span>
                <span className="text-sm text-gray-500 ml-2">109 qty available</span>
              </div>
            </div>
            <ReactSlider
              className="w-full h-2 bg-gray-200 rounded-full mt-2"
              thumbClassName="w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-2 focus:outline-none shadow-md touch-none"
              trackClassName="h-2 bg-blue-500 rounded-full"
              min={0}
              max={maxPrice}
              step={0.1}
              value={price}
              onChange={setPrice}
            />
            <div className="flex justify-between mt-2">
              <button
                onClick={() => setPrice(Math.max(0, price - 0.1))}
                className="p-2 active:bg-gray-100 rounded-lg transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPrice(Math.min(maxPrice, price + 0.1))}
                className="p-2 active:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium">Quantity</span>
              <span className="text-lg font-medium">{quantity}</span>
            </div>
            <ReactSlider
              className="w-full h-2 bg-gray-200 rounded-full mt-2"
              thumbClassName="w-6 h-6 bg-white border-2 border-blue-500 rounded-full -mt-2 focus:outline-none shadow-md touch-none"
              trackClassName="h-2 bg-blue-500 rounded-full"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={setQuantity}
            />
            <div className="flex justify-between mt-2">
              <button className="p-2 text-blue-500 active:bg-gray-100 rounded-lg transition-colors">
                •••
              </button>
              <button className="p-2 text-blue-500 active:bg-gray-100 rounded-lg transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex justify-between mb-4 text-lg">
            <div>
              <p className="text-gray-500">You put</p>
              <p className="font-medium">₹{totalCost.toFixed(1)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">You get</p>
              <p className="font-medium text-green-600">₹{potentialWinnings.toFixed(1)}</p>
            </div>
          </div>

          <div 
            className="mb-4 cursor-pointer"
            onClick={() => setShowOrderBook(!showOrderBook)}
          >
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Book className="h-5 w-5 mr-2" />
                <span className="font-medium">Order Book</span>
              </div>
              {showOrderBook ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>

            {showOrderBook && (
              <div className="mt-4 overflow-y-auto max-h-[40vh]">
                <div className="sticky top-0 grid grid-cols-3 gap-4 px-3 py-2 bg-gray-100 rounded-t-xl">
                  <span className="text-sm font-medium">PRICE</span>
                  <span className="text-sm font-medium text-blue-500">QTY AT YES</span>
                  <span className="text-sm font-medium text-red-500">QTY AT NO</span>
                </div>
                {orderBook.map((entry, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 px-3 py-2 border-b">
                    <span>{entry.price}</span>
                    <span className="text-blue-500">{entry.yesQty}</span>
                    <span className="text-red-500">{entry.noQty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>Available Balance: ₹{availableBalance}</span>
            <span>Commission: {(commission * 100).toFixed(1)}%</span>
          </div>

          <button
            ref={confirmButtonRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `translateY(-${offsetY}px)`,
              opacity: isConfirming ? 0.8 : 1,
            }}
            className={`w-full bg-blue-500 text-white py-4 rounded-xl font-medium transition-all active:scale-[0.99] ${
              isConfirming ? 'shadow-lg' : ''
            }`}
          >
            Swipe up for {choice === 'yes' ? 'Yes' : 'No'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Sale or purchase of Crypto Currency or Digital Assets is neither encouraged nor allowed on this platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradeConfirmation;