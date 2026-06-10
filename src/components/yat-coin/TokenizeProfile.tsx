import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Coins, Plus, X, Upload, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useYatScore } from '@/hooks/useYatScore';

const TokenizeProfile: React.FC = () => {
  const { t } = useLanguage();
  const { data: yat, loading: yatLoading } = useYatScore();
  const [profileData, setProfileData] = useState({ name: '', title: '', description: '', category: '', initialTokenPrice: 10, totalSupply: 10000, royaltyPercentage: 5 });

  // Apply suggested price once when YAT Score arrives
  React.useEffect(() => {
    if (yat?.suggested_token_price) {
      setProfileData(prev => ({ ...prev, initialTokenPrice: Math.round(yat.suggested_token_price) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yat?.suggested_token_price]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');

  const addSkill = () => { if (newSkill.trim() && !skills.includes(newSkill.trim())) { setSkills([...skills, newSkill.trim()]); setNewSkill(''); } };
  const removeSkill = (skill: string) => setSkills(skills.filter(s => s !== skill));
  const addAchievement = () => { if (newAchievement.trim() && !achievements.includes(newAchievement.trim())) { setAchievements([...achievements, newAchievement.trim()]); setNewAchievement(''); } };
  const removeAchievement = (a: string) => setAchievements(achievements.filter(x => x !== a));
  const calculateMarketCap = () => (profileData.initialTokenPrice * profileData.totalSupply).toLocaleString();
  const profileCompleteness = () => { const f = [profileData.name, profileData.title, profileData.description, profileData.category, skills.length > 0, achievements.length > 0]; return Math.round((f.filter(Boolean).length / f.length) * 100); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5" />{t('tokenize.createToken')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="name">{t('tokenize.fullName')}</Label><Input id="name" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} placeholder={t('tokenize.fullNamePlaceholder')} /></div>
                <div><Label htmlFor="title">{t('tokenize.professionalTitle')}</Label><Input id="title" value={profileData.title} onChange={(e) => setProfileData({...profileData, title: e.target.value})} placeholder={t('tokenize.titlePlaceholder')} /></div>
              </div>
              <div><Label htmlFor="description">{t('tokenize.description')}</Label><Textarea id="description" value={profileData.description} onChange={(e) => setProfileData({...profileData, description: e.target.value})} placeholder={t('tokenize.descPlaceholder')} rows={4} /></div>
              <div><Label htmlFor="category">{t('tokenize.category')}</Label><Input id="category" value={profileData.category} onChange={(e) => setProfileData({...profileData, category: e.target.value})} placeholder={t('tokenize.categoryPlaceholder')} /></div>
              <div>
                <Label>{t('tokenize.skills')}</Label>
                <div className="flex gap-2 mb-2"><Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder={t('tokenize.addSkill')} onKeyPress={(e) => e.key === 'Enter' && addSkill()} /><Button onClick={addSkill} size="sm"><Plus className="h-4 w-4" /></Button></div>
                <div className="flex flex-wrap gap-2">{skills.map(skill => (<Badge key={skill} variant="secondary" className="flex items-center gap-1">{skill}<X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} /></Badge>))}</div>
              </div>
              <div>
                <Label>{t('tokenize.achievements')}</Label>
                <div className="flex gap-2 mb-2"><Input value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} placeholder={t('tokenize.addAchievement')} onKeyPress={(e) => e.key === 'Enter' && addAchievement()} /><Button onClick={addAchievement} size="sm"><Plus className="h-4 w-4" /></Button></div>
                <div className="space-y-2">{achievements.map(a => (<div key={a} className="flex items-center justify-between p-2 bg-muted rounded"><span className="text-sm">{a}</span><X className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => removeAchievement(a)} /></div>))}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('tokenize.tokenEconomics')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div><Label>{t('tokenize.initialPrice')}: ${profileData.initialTokenPrice}</Label><Slider value={[profileData.initialTokenPrice]} onValueChange={(v) => setProfileData({...profileData, initialTokenPrice: v[0]})} min={1} max={100} step={1} className="mt-2" /><p className="text-sm text-muted-foreground mt-1">{t('tokenize.initialPriceDesc')}</p></div>
              <div><Label>{t('tokenize.totalSupply')}: {profileData.totalSupply.toLocaleString()}</Label><Slider value={[profileData.totalSupply]} onValueChange={(v) => setProfileData({...profileData, totalSupply: v[0]})} min={1000} max={100000} step={1000} className="mt-2" /><p className="text-sm text-muted-foreground mt-1">{t('tokenize.totalSupplyDesc')}</p></div>
              <div><Label>{t('tokenize.royalty')}: {profileData.royaltyPercentage}%</Label><Slider value={[profileData.royaltyPercentage]} onValueChange={(v) => setProfileData({...profileData, royaltyPercentage: v[0]})} min={1} max={20} step={1} className="mt-2" /><p className="text-sm text-muted-foreground mt-1">{t('tokenize.royaltyDesc')}</p></div>
              <div className="p-4 bg-primary/5 rounded-lg"><h4 className="font-semibold mb-2">{t('tokenize.projectedMarketCap')}</h4><p className="text-2xl font-bold text-primary">${calculateMarketCap()}</p><p className="text-sm text-muted-foreground">{t('tokenize.basedOnSettings')}</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {yat && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <h4 className="font-semibold text-sm">Valorisation basée sur votre YAT Score</h4>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-primary">{yat.yat_score}/100</span>
                  <span className="text-sm text-muted-foreground">Prix suggéré: <span className="font-bold text-foreground">${yat.suggested_token_price}</span></span>
                </div>
                <Progress value={yat.yat_score} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  {yat.tips[0]?.tip ? `Pour augmenter votre valeur : ${yat.tips[0].tip}` : 'Excellent score — votre token a une bonne valorisation.'}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>{t('tokenize.profilePreview')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3"><AvatarImage src="/placeholder.svg" /><AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback></Avatar>
                <Button variant="outline" size="sm" className="mb-3"><Upload className="h-4 w-4 mr-2" />{t('tokenize.uploadPhoto')}</Button>
                <h3 className="font-semibold">{profileData.name || t('tokenize.yourName')}</h3>
                <p className="text-sm text-muted-foreground">{profileData.title || t('tokenize.yourTitle')}</p>
              </div>
              <div><p className="text-sm text-muted-foreground mb-2">{t('tokenize.profileCompleteness')}</p><Progress value={profileCompleteness()} className="mb-1" /><p className="text-xs text-muted-foreground">{profileCompleteness()}% {t('tokenize.complete')}</p></div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('tokenize.tokenPrice')}</span><span className="font-semibold">${profileData.initialTokenPrice}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('tokenize.marketCap')}</span><span className="font-semibold">${calculateMarketCap()}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">{t('tokenize.royaltyLabel')}</span><span className="font-semibold">{profileData.royaltyPercentage}%</span></div>
              </div>
              {skills.length > 0 && (<div><p className="text-sm font-medium mb-2">{t('tokenize.skills')}</p><div className="flex flex-wrap gap-1">{skills.slice(0, 3).map(skill => (<Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>))}{skills.length > 3 && (<Badge variant="outline" className="text-xs">+{skills.length - 3} {t('tokenize.more')}</Badge>)}</div></div>)}
            </CardContent>
          </Card>
          <Button className="w-full" size="lg" disabled={profileCompleteness() < 80}><TrendingUp className="h-4 w-4 mr-2" />{t('tokenize.launchToken')}</Button>
          {profileCompleteness() < 80 && (<p className="text-sm text-center text-muted-foreground">{t('tokenize.completeProfile')}</p>)}
        </div>
      </div>
    </div>
  );
};

export default TokenizeProfile;
