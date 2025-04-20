
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { streamCategories } from './data/liveData';
import { VideoIcon, MapPin, Sparkles, LightbulbIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const LiveBroadcast: React.FC = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const titleSuggestions = [
    "My First Guitar Composition 🎸",
    "Soccer Training Drills - Day 5",
    "Painting Landscapes with Watercolors",
    "Coding a Simple Game in Python"
  ];
  
  const selectRandomTitle = () => {
    const random = Math.floor(Math.random() * titleSuggestions.length);
    setTitle(titleSuggestions[random]);
  };
  
  const goToNextStep = () => {
    setStep(prev => prev + 1);
  };
  
  const goToPrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };
  
  const handleGoLive = () => {
    toast({
      title: "You're live!",
      description: "Your stream has started. Share it with your followers!",
      variant: "default",
    });
    // In a real app, we would start the streaming process here
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white/60 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <VideoIcon className="h-5 w-5 text-red-500" />
          Go LIVE! Share Your Talent
        </h2>
        <p className="text-gray-600 mb-6">Simple 3-step setup to start streaming</p>
        
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map(stepNumber => (
            <div 
              key={stepNumber}
              className={`flex-1 relative ${
                step === stepNumber ? 'text-purple-600 font-semibold' : 
                step > stepNumber ? 'text-gray-400' : 'text-gray-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step === stepNumber ? 'bg-purple-100 border-2 border-purple-500' : 
                    step > stepNumber ? 'bg-purple-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  {step > stepNumber ? '✓' : stepNumber}
                </div>
                <span className="text-sm">
                  {stepNumber === 1 ? 'Theme' : stepNumber === 2 ? 'Location' : 'Details'}
                </span>
              </div>
              
              {stepNumber < 3 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                  step > stepNumber ? 'bg-purple-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-2">What's your vibe today?</h3>
            <div className="space-y-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {streamCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {category && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategories</label>
                  <div className="flex flex-wrap gap-2">
                    {streamCategories.find(c => c.id === category)?.subcategories.map((sub, index) => (
                      <Button key={index} variant="outline" size="sm" className="rounded-full">
                        {sub}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={goToNextStep} disabled={!category}>Next: Location</Button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-2">Share your creative space!</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md">
                <MapPin className="h-5 w-5 text-blue-500" />
                <div>
                  <span className="font-medium">Auto-detected:</span> <span className="text-gray-600">New York, USA</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Use different location (optional)</label>
                <Input 
                  placeholder="Enter city, country..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use auto-detected location</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPrevStep}>Back: Theme</Button>
              <Button onClick={goToNextStep}>Next: Details</Button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-2">Almost ready to go live!</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">Stream Title</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={selectRandomTitle}
                    className="text-xs flex items-center gap-1 h-6 text-purple-600"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Suggest</span>
                  </Button>
                </div>
                <Input 
                  placeholder="Enter a catchy title for your stream..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Catchy title = more viewers!</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Stream Description (optional)</label>
                <Textarea 
                  placeholder="Tell viewers what to expect in your stream..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 flex items-start gap-3">
                <LightbulbIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Pro Tips</h4>
                  <ul className="text-xs text-gray-700 list-disc list-inside mt-1 space-y-1">
                    <li>Good lighting makes your stream look professional</li>
                    <li>Test your mic before going live</li>
                    <li>Interact with your viewers by responding to comments</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPrevStep}>Back: Location</Button>
              <Button 
                onClick={handleGoLive} 
                disabled={!title.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <VideoIcon className="mr-2 h-4 w-4" />
                Go LIVE Now!
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-sm">Surprise Rewards for First-Time Streamers!</h3>
          <p className="text-xs text-gray-700 mt-1">
            Complete your first stream and get special badges and increased visibility on the platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveBroadcast;
