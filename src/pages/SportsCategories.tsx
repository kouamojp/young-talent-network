
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, MapPin, User, Home, MessageSquare, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SportsCategories: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample news data
  const newsItems = [
    {
      id: 1,
      category: "Футбол",
      title: "Юные футболисты Киева провели...",
      date: "12.05.2023",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      category: "Теннис",
      title: "Юные теннисисты Киева провели...",
      date: "10.05.2023",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      category: "Футбол",
      title: "Юные футболисты Киева провели...",
      date: "08.05.2023",
      image: "/placeholder.svg"
    }
  ];

  // Calendar data
  const currentMonth = "Май";
  const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  
  // Mock calendar data with event indicators
  const calendarDays = Array.from({length: 31}, (_, i) => ({
    day: i + 1,
    hasEvent: [3, 7, 13, 19, 24, 29].includes(i + 1),
    isWeekend: (i + 1) % 7 === 6 || (i + 1) % 7 === 0
  }));

  // Featured events
  const featuredEvents = [
    { id: 1, title: "Соревнования по футболу", date: "12.05.2023" },
    { id: 2, title: "Теннисный турнир", date: "15.05.2023" },
    { id: 3, title: "Чемпионат по плаванию", date: "18.05.2023" },
    { id: 4, title: "Соревнование по легкой атлетике", date: "22.05.2023" },
    { id: 5, title: "Турнир по баскетболу", date: "25.05.2023" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main header section with background */}
      <div className="bg-[#145E76] text-white relative">
        <Navbar />
        
        {/* Hero content */}
        <div className="container mx-auto px-4 pt-24 pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-3">Поиск спортивных талантов</h1>
            <p className="text-lg mb-8">Находи себя! Прояви свой талант в спорте и стань звездой</p>
            
            {/* Search form */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input 
                  placeholder="Поиск..."
                  className="bg-white text-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select className="h-10 px-3 py-2 rounded-md border border-input bg-white text-black">
                  <option>Категория</option>
                  <option>Футбол</option>
                  <option>Баскетбол</option>
                  <option>Теннис</option>
                </select>
                <select className="h-10 px-3 py-2 rounded-md border border-input bg-white text-black">
                  <option>Возраст</option>
                  <option>6-10</option>
                  <option>11-14</option>
                  <option>15-18</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-1 text-white">
                    <span className="w-4 h-4 inline-block rounded-sm border border-white"></span>
                    <span>Фильтр</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                    <Search size={16} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
                    <span className="font-bold">A-Z</span>
                  </button>
                </div>
              </div>
            </div>
            
            <Button className="bg-[#F39C12] hover:bg-[#E67E22] text-white px-6 py-4 h-auto font-medium">
              Найти талант
            </Button>
            
            <p className="mt-3 text-sm">
              <Link to="/" className="underline">Расширенный поиск</Link>
            </p>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-full"
            style={{ transform: 'rotate(180deg)' }}
          >
            <path
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
              fill="white"
            ></path>
          </svg>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow bg-white">
        <div className="container mx-auto px-4 py-12">
          {/* Category icons section */}
          <div className="mb-16">
            <Tabs defaultValue="all">
              <TabsList className="w-full justify-center mb-6 bg-transparent">
                <TabsTrigger value="all" className="text-gray-600">Все</TabsTrigger>
                <TabsTrigger value="popular" className="text-gray-600">Популярные</TabsTrigger>
                <TabsTrigger value="new" className="text-gray-600">Новые</TabsTrigger>
                <TabsTrigger value="nearby" className="text-gray-600">Рядом</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: <MapPin size={32} />, title: "Спортивные секции в регионе", count: 258 },
                    { icon: <User size={32} />, title: "Спортивные тренеры", count: 98 },
                    { icon: <Home size={32} />, title: "Нужны ли спортивные площадки", count: 79 },
                    { icon: <MessageSquare size={32} />, title: "Дискуссии с спортсменами", count: 128 }
                  ].map((category, index) => (
                    <div key={index} className="bg-[#145E76] text-white p-6 rounded-md flex flex-col items-center text-center">
                      <div className="mb-4">
                        {category.icon}
                      </div>
                      <h3 className="text-sm font-medium mb-2">{category.title}</h3>
                      <p className="text-xs opacity-75">{category.count}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="popular" className="mt-0">
                <div className="text-center text-gray-600">
                  Популярные категории будут доступны скоро
                </div>
              </TabsContent>
              
              <TabsContent value="new" className="mt-0">
                <div className="text-center text-gray-600">
                  Новые категории будут доступны скоро
                </div>
              </TabsContent>
              
              <TabsContent value="nearby" className="mt-0">
                <div className="text-center text-gray-600">
                  Ближайшие категории будут доступны скоро
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* News section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Актуальные новости спорта</h2>
            
            {/* News grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, index) => {
                const item = newsItems[index % newsItems.length];
                return (
                  <div key={index} className="flex flex-col space-y-3">
                    <div className="font-medium text-sm text-gray-500">
                      {item.category}
                    </div>
                    <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="text-sm text-gray-500">{item.date}</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Video section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Мы делаем это лучше</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main video */}
              <div className="lg:col-span-2 aspect-video bg-gray-200 rounded-md overflow-hidden relative">
                <img 
                  src="/placeholder.svg" 
                  alt="Featured video" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-16 border-l-[#145E76] border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
              
              {/* Video thumbnails */}
              <div className="grid grid-cols-2 gap-2 content-start">
                {Array(8).fill(0).map((_, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                    <img 
                      src="/placeholder.svg" 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Talents section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Актуальные таланты</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array(12).fill(0).map((_, index) => (
                <div key={index} className="bg-[#145E76] text-white p-3 rounded-md">
                  <h3 className="text-sm font-medium mb-1">Футбол 10-12 лет</h3>
                  <p className="text-xs opacity-75 mb-1">Киев | 12.06.23</p>
                  <p className="text-xs opacity-75">10 мест</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Calendar section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Календарь предстоящих событий</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="col-span-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <button className="px-2 py-1">&lt;</button>
                    <h3 className="font-medium">{currentMonth} 2023</h3>
                    <button className="px-2 py-1">&gt;</button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {daysOfWeek.map((day, index) => (
                      <div 
                        key={index} 
                        className={`text-sm py-1 ${index >= 5 ? 'text-red-500' : ''}`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarDays.map((day, index) => (
                      <div 
                        key={index} 
                        className={`
                          relative p-1 
                          ${day.isWeekend ? 'text-red-500' : ''}
                        `}
                      >
                        <div className={`
                          aspect-square flex items-center justify-center rounded-full
                          ${day.hasEvent ? 'bg-blue-500 text-white' : ''}
                        `}>
                          {day.day}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Events list */}
              <div>
                <div className="space-y-3">
                  {featuredEvents.map(event => (
                    <div key={event.id} className="border-l-4 border-[#145E76] pl-3">
                      <div className="text-sm text-gray-500">{event.date}</div>
                      <div className="font-medium">{event.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-[#145E76] text-white">
        <Footer />
      </div>
    </div>
  );
};

export default SportsCategories;
