
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#5181B8] text-white py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">Y&T</div>
              <div className="hidden md:flex items-center gap-6 text-sm">
                <Link to="/" className="hover:text-blue-200">Новости</Link>
                <Link to="/messages" className="hover:text-blue-200">Сообщения</Link>
                <Link to="/communities" className="hover:text-blue-200">Сообщества</Link>
                <Link to="/work" className="hover:text-blue-200">Работа</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Поиск"
                  className="bg-white/20 text-white placeholder-white/70 px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:border-white w-64"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-white/70" />
              </div>
              <div className="text-sm">Александр Иванов ▼</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Talent Search */}
      <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 min-h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background particles/stars effect */}
        <div className="absolute inset-0 opacity-50">
          <div className="w-full h-full bg-[length:40px_40px] bg-repeat" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`
               }}>
          </div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Найди таланта
          </h1>
          
          <div className="bg-white/95 p-6 rounded-lg shadow-xl max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Например: Дизайнер"
                className="col-span-1 md:col-span-4 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5181B8]"
              />
              
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5181B8] bg-white">
                <option>Направление</option>
                <option>Дизайн</option>
                <option>Разработка</option>
                <option>Маркетинг</option>
              </select>
              
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5181B8] bg-white">
                <option>Направление</option>
                <option>Frontend</option>
                <option>Backend</option>
                <option>Fullstack</option>
              </select>
              
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5181B8] bg-white">
                <option>Опыт</option>
                <option>Junior</option>
                <option>Middle</option>
                <option>Senior</option>
              </select>
              
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5181B8] bg-white">
                <option>Опыт</option>
                <option>1-2 года</option>
                <option>3-5 лет</option>
                <option>5+ лет</option>
              </select>
            </div>
            
            <Button className="w-full md:w-auto px-8 py-3 bg-[#2E9AFE] hover:bg-[#2681D4] text-white font-medium">
              Найти
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Наши проекты
          </h2>
          
          <div className="relative">
            {/* Navigation buttons */}
            <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg">
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg">
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Project 1 - Events */}
              <Card className="bg-[#4BB34B] text-white relative overflow-hidden h-80">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 transform -rotate-90 absolute left-4 top-1/2 -translate-y-1/2 origin-center">
                      События
                    </h3>
                  </div>
                  <div className="ml-12">
                    <p className="text-sm opacity-90">
                      Организация и участие в мероприятиях для развития талантов
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Project 2 - Landscape (Main) */}
              <Card className="relative overflow-hidden h-80">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")'
                  }}
                ></div>
                <CardContent className="relative z-10 p-6 h-full flex items-end">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2">Горные вершины</h3>
                    <p className="text-sm opacity-90">
                      Достижение новых высот в карьере
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Project 3 - Media */}
              <Card className="bg-[#2E9AFE] text-white relative overflow-hidden h-80">
                <CardContent className="p-6 h-full">
                  <div className="absolute top-6 right-6">
                    <ChevronRight className="h-8 w-8" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4">Медиа</h3>
                    <p className="text-sm opacity-90 mb-4">
                      Разнообразный и богатый опыт укрепление и развитие структуры способствует подготовки и реализации системы обучения.
                    </p>
                  </div>
                  <div className="absolute bottom-6 right-6">
                    <div 
                      className="w-24 h-16 bg-cover bg-center rounded"
                      style={{ 
                        backgroundImage: 'url("https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80")'
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              {/* Project 4 - Database */}
              <Card className="bg-[#FF6B35] text-white relative overflow-hidden h-80">
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 transform -rotate-90 absolute right-4 top-1/2 -translate-y-1/2 origin-center">
                      База данных
                    </h3>
                  </div>
                  <div className="mr-12">
                    <p className="text-sm opacity-90">
                      Управление талантами и их развитие
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Pagination dots */}
            <div className="flex justify-center mt-8 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((dot, index) => (
                <div 
                  key={dot}
                  className={`w-2 h-2 rounded-full ${
                    index === 1 ? 'bg-[#2E9AFE]' : 'bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
