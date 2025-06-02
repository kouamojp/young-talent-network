import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { 
  Rocket, Gem, Film, Heart, Zap, Search, Plus, Megaphone, sos,
  Play, Users, TrendingUp, TrendingDown, Coins, Clock, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TalentHubSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const TalentHubSidebar: React.FC<TalentHubSidebarProps> = ({ isOpen, onClose }) => {
  const [isOpenToWork, setIsOpenToWork] = useState(true);
  const [levelProgress, setLevelProgress] = useState(75);
  const [tokenPrice, setTokenPrice] = useState(24.50);
  const [priceChange, setPriceChange] = useState(+2.3);
  const [viewerCount, setViewerCount] = useState(1247);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  // Simulate token price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2;
      setTokenPrice(prev => Math.max(0, prev + change));
      setPriceChange(change);
      
      if (change > 1) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleBoostMe = () => {
    toast({
      title: "🚀 Boosting your talent!",
      description: "Your profile is now trending in the talent marketplace!",
    });
  };

  const handleGoLive = () => {
    toast({
      title: "🎬 Going live!",
      description: "Your audience is waiting for you!",
    });
  };

  const handleSOS = () => {
    toast({
      title: "🆘 SOS Boost activated!",
      description: "Emergency funding request sent to your network!",
    });
  };

  const handleShake = () => {
    const fortunes = [
      "🌟 Your next breakthrough is just one connection away!",
      "💎 Trust your instincts - they're your superpower!",
      "🚀 Today's failure is tomorrow's success story!",
      "✨ You're not just talented, you're irreplaceable!",
      "🎯 Focus on progress, not perfection!"
    ];
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    toast({
      title: "🥠 Talent Fortune Cookie",
      description: randomFortune,
    });
  };

  // Mock data for investors
  const investors = [
    { id: 1, name: "Alex", avatar: "/placeholder.svg", amount: "$500" },
    { id: 2, name: "Sam", avatar: "/placeholder.svg", amount: "$750" },
    { id: 3, name: "Jordan", avatar: "/placeholder.svg", amount: "$1000" },
  ];

  const skillTrends = [
    { skill: "React", trend: "up", change: "+15%" },
    { skill: "Design", trend: "up", change: "+8%" },
    { skill: "AI/ML", trend: "down", change: "-3%" },
  ];

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'} md:hidden`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Sidebar */}
      <div className={`absolute left-0 top-0 h-full w-80 bg-gradient-to-b from-purple-600 via-blue-600 to-pink-600 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full overflow-y-auto p-4 text-white">
          
          {/* Header - Your Talent HQ */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-lg">John Doe</h2>
                <p className="text-sm text-white/80">Your Talent HQ</p>
              </div>
            </div>
            
            {/* Status Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Open to Work</span>
                <Switch
                  checked={isOpenToWork}
                  onCheckedChange={setIsOpenToWork}
                />
              </div>
              
              {isOpenToWork && (
                <Badge className="bg-green-500 text-white animate-pulse">
                  💚 OPEN TO WORK
                </Badge>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>🔋 Charging to Level 10!</span>
                  <span>{levelProgress}%</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
            </div>
          </div>

          {/* Main Sections */}
          <div className="space-y-4">
            
            {/* Talent Launchpad */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="h-5 w-5 animate-bounce" />
                  <h3 className="font-semibold">🚀 Talent Launchpad</h3>
                </div>
                <p className="text-sm text-white/80 mb-3">3 new opportunities waiting</p>
                <Button 
                  onClick={handleBoostMe}
                  className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white border-0"
                >
                  Boost Me! 🚀
                </Button>
              </CardContent>
            </Card>

            {/* My Value */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Gem className="h-5 w-5 animate-bounce" />
                  <h3 className="font-semibold">💎 My Value</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${tokenPrice.toFixed(2)}</span>
                    <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="text-sm">{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/80 mb-2">My Investors ({investors.length})</p>
                    <div className="flex -space-x-2">
                      {investors.map((investor) => (
                        <Avatar key={investor.id} className="w-8 h-8 border-2 border-white/20">
                          <AvatarImage src={investor.avatar} />
                          <AvatarFallback>{investor.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/80 mb-2">Skills Stock Market</p>
                    <div className="space-y-1">
                      {skillTrends.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span>{skill.skill}</span>
                          <span className={skill.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                            {skill.trend === 'up' ? '↑' : '↓'} {skill.change}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Studio */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Film className="h-5 w-5 animate-bounce" />
                  <h3 className="font-semibold">🎬 Creator Studio</h3>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleGoLive}
                    className="w-full bg-red-500 hover:bg-red-600 text-white border-0"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    ▶️ Live HQ
                  </Button>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>🎥 My TV Channel</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{viewerCount}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                    🎓 Learnings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Work Flirts */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 animate-bounce" />
                  <h3 className="font-semibold">💌 Work Flirts</h3>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-white/80">5 job requests waiting</p>
                  <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white border-0">
                    ❤️ Swipe to Accept
                  </Button>
                  <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                    Drop a Hint 💡
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Talent Carnival */}
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 animate-bounce" />
                  <h3 className="font-semibold">🎪 Talent Carnival</h3>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <p className="text-sm text-white/80">🔥 3 trending stages live</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Toolbox */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <h3 className="font-semibold mb-3">🛠️ Toolbox</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Search className="h-4 w-4 mr-1" />
                🔍 Discovery
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Zap className="h-4 w-4 mr-1" />
                🧠 Talent GPT
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">⚡ Quick Actions</h4>
              <div className="grid grid-cols-1 gap-1">
                <Button variant="ghost" className="text-white hover:bg-white/10 justify-start">
                  💸 Cash Out
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10 justify-start">
                  <Megaphone className="h-4 w-4 mr-2" />
                  📣 Go Viral
                </Button>
                <Button 
                  onClick={handleSOS}
                  variant="ghost" 
                  className="text-white hover:bg-white/10 justify-start"
                >
                  <sos className="h-4 w-4 mr-2" />
                  🆘 SOS Boost
                </Button>
              </div>
            </div>
          </div>

          {/* Secret Easter Egg */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <Button 
              onClick={handleShake}
              variant="ghost" 
              className="w-full text-white hover:bg-white/10 text-xs"
            >
              🥠 Shake for Fortune Cookie
            </Button>
          </div>

          {/* Tagline */}
          <div className="mt-4 text-center">
            <p className="text-xs text-white/60 italic">
              "You're not a profile – you're a 🌟 universe."
            </p>
          </div>

          {/* Confetti Animation */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 via-transparent to-transparent animate-pulse">
                <div className="text-4xl animate-bounce absolute top-1/4 left-1/4">🎉</div>
                <div className="text-4xl animate-bounce absolute top-1/3 right-1/4">✨</div>
                <div className="text-4xl animate-bounce absolute top-1/2 left-1/3">🎊</div>
                <div className="text-4xl animate-bounce absolute top-2/3 right-1/3">💫</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentHubSidebar;
