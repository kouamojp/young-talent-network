
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { streamCategories } from './data/liveData';
import { VideoIcon, MapPin, Sparkles, LightbulbIcon, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { tr } from '@/i18n';
import { useLiveBroadcaster } from '@/hooks/useLiveStream';
import { mediaErrorMessage } from '@/lib/webrtc';
import LiveStudio from './LiveStudio';

interface LiveBroadcastProps {
  /** The live is over (ended by the streamer, or closed elsewhere). */
  onEnded?: () => void;
}

const LiveBroadcast: React.FC<LiveBroadcastProps> = ({ onEnded }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [detectedLocation, setDetectedLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const live = useLiveBroadcaster();

  // The live was closed from elsewhere (another device, or considered abandoned).
  const endedByMeRef = useRef(false);
  useEffect(() => {
    if (live.status !== 'ended' || endedByMeRef.current) return;
    toast({ title: tr('liveStudio.endedRemotely'), variant: 'destructive' });
    onEnded?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.status]);

  useEffect(() => {
    const loadCountry = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('country').eq('id', user.id).single();
      if (data?.country) setDetectedLocation(data.country);
    };
    loadCountry();
  }, []);

  const titleSuggestions = [
    tr('liveBroadcast.myFirstGuitarComposition'),
    tr('liveBroadcast.footballTrainingDrillsDay5'),
    tr('liveBroadcast.paintingLandscapesWithWatercolors'),
    tr('liveBroadcast.codingASimpleGameInPython')
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
  
  const handleGoLive = async () => {
    if (submitting) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: tr('messages.loginRequired'), description: tr('liveBroadcast.logInToStartALive'), variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const categoryName = streamCategories.find(c => c.id === category)?.name || category;

    try {
      // Opens the camera first: nothing is published if it is refused.
      const id = await live.start({ title: title.trim(), description: description.trim(), category: categoryName });
      if (id) {
        toast({
          title: tr('liveBroadcast.youReLive'),
          description: tr('liveBroadcast.yourStreamHasStartedShareIt'),
          variant: "default",
        });
      }
    } catch (err) {
      toast({ title: tr('liveBroadcast.couldNotStart'), description: mediaErrorMessage(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async () => {
    if (ending) return;
    setEnding(true);
    endedByMeRef.current = true;
    await live.stop();
    toast({ title: tr('liveWatch.streamEnded') });
    onEnded?.();
  };

  if (live.status === 'live') {
    return (
      <LiveStudio
        title={title.trim()}
        localStream={live.localStream}
        viewers={live.viewers}
        startedAt={live.startedAt}
        micOn={live.micOn}
        camOn={live.camOn}
        frontCamera={live.frontCamera}
        canSwitchCamera={live.canSwitchCamera}
        ending={ending}
        onToggleMic={live.toggleMic}
        onToggleCam={live.toggleCam}
        onSwitchCamera={live.switchCamera}
        onEnd={handleEnd}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/60 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <VideoIcon className="h-5 w-5 text-red-500" />
          {tr('liveBroadcast.goLiveShareYourTalent')}
        </h2>
        <p className="text-gray-600 mb-6">{tr('liveBroadcast.simple3StepSetupToStart')}</p>
        
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
                  {stepNumber === 1 ? tr('settings.theme') : stepNumber === 2 ? tr('post.addLocation') : tr('liveBroadcast.details')}
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
            <h3 className="text-lg font-medium mb-2">{tr('liveBroadcast.whatSYourVibeToday')}</h3>
            <div className="space-y-4">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={tr('liveBroadcast.selectACategory')} />
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
                  <label className="block text-sm font-medium mb-2">{tr('liveBroadcast.subcategories')}</label>
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
              <Button onClick={goToNextStep} disabled={!category}>{tr('liveBroadcast.nextLocation')}</Button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-2">{tr('liveBroadcast.shareYourCreativeSpace')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md">
                <MapPin className="h-5 w-5 text-blue-500" />
                <div>
                  <span className="font-medium">{tr('liveBroadcast.autoDetected')}</span> <span className="text-gray-600">{detectedLocation || tr('liveBroadcast.notSet')}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">{tr('liveBroadcast.useADifferentLocationOptional')}</label>
                <Input 
                  placeholder={tr('liveBroadcast.enterCityCountry')}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">{tr('liveBroadcast.leaveBlankToUseTheAuto')}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPrevStep}>{tr('liveBroadcast.backTheme')}</Button>
              <Button onClick={goToNextStep}>{tr('liveBroadcast.nextDetails')}</Button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-2">{tr('liveBroadcast.almostReadyToGoLive')}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">{tr('liveBroadcast.streamTitle')}</label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={selectRandomTitle}
                    className="text-xs flex items-center gap-1 h-6 text-purple-600"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{tr('liveBroadcast.suggest')}</span>
                  </Button>
                </div>
                <Input 
                  placeholder={tr('liveBroadcast.enterACatchyTitleForYour')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">{tr('liveBroadcast.catchyTitleMoreViewers')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{tr('liveBroadcast.streamDescriptionOptional')}</label>
                <Textarea 
                  placeholder={tr('liveBroadcast.tellViewersWhatToExpectIn')}
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
                  <h4 className="font-medium text-sm">{tr('liveBroadcast.proTips')}</h4>
                  <ul className="text-xs text-gray-700 list-disc list-inside mt-1 space-y-1">
                    <li>{tr('liveBroadcast.goodLightingMakesYourStreamLook')}</li>
                    <li>{tr('liveBroadcast.testYourMicBeforeGoingLive')}</li>
                    <li>{tr('liveBroadcast.interactWithYourViewersByResponding')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={goToPrevStep}>{tr('liveBroadcast.backLocation')}</Button>
              <Button
                onClick={handleGoLive}
                disabled={!title.trim() || submitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <VideoIcon className="mr-2 h-4 w-4" />}
                {tr('liveBroadcast.goLiveNow')}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-sm">{tr('liveBroadcast.surpriseRewardsForFirstTimeStreamers')}</h3>
          <p className="text-xs text-gray-700 mt-1">
            {tr('liveBroadcast.completeYourFirstStreamAndGet')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveBroadcast;
