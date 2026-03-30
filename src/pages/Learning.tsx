
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Brain, Palette, BookOpen, Globe, MapPin, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import Footer from '@/components/Footer';
import GlassMorphism from '@/components/GlassMorphism';
import LearningExplore from '@/components/learning/LearningExplore';
import LearningCreate from '@/components/learning/LearningCreate';
import { categories } from '@/components/learning/data/categories';

const Learning: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || '';
  const [activeTab, setActiveTab] = useState('overview');

  const handleBack = () => {
    setSearchParams({});
    setActiveTab('overview');
  };

  const stats = [
    { label: 'Cours disponibles', value: '340+', icon: BookOpen, change: '+24' },
    { label: 'Apprenants actifs', value: '2,150', icon: Users, change: '+180' },
    { label: 'Instructeurs', value: '87', icon: GraduationCap, change: '+12' },
    { label: 'Taux de réussite', value: '94%', icon: TrendingUp, change: '+3.2%' },
  ];

  const learningModes = [
    { title: 'Trainings', desc: 'Développement interactif de compétences', icon: Brain, color: 'text-violet-500' },
    { title: 'Seminars', desc: 'Sessions spécialisées avec experts', icon: GraduationCap, color: 'text-blue-500' },
    { title: 'Masterclasses', desc: 'Instruction avancée par des leaders', icon: Palette, color: 'text-pink-500' },
    { title: 'Lectures', desc: 'Présentations informatives', icon: BookOpen, color: 'text-emerald-500' },
  ];

  if (path === 'explore' || path === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <main className="container mx-auto px-4 py-12">
          <GlassMorphism className="p-6">
            {path === 'explore' ? (
              <LearningExplore onBack={handleBack} />
            ) : (
              <LearningCreate onBack={handleBack} />
            )}
          </GlassMorphism>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <main className="container mx-auto px-4 py-12">
        <GlassMorphism className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-violet-600" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  YAT LEARNING
                </h1>
                <p className="text-muted-foreground">Where Skills Grow Like Magic Beans 🌱✨</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setSearchParams({ path: 'explore' })}>
                Explorer les cours
              </Button>
              <Button variant="outline" onClick={() => setSearchParams({ path: 'create' })}>
                Créer un cours
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="text-xs">{stat.change}</span>
                    </div>
                  </div>
                  <stat.icon className="h-8 w-8 text-violet-600" />
                </div>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="types">Types de formation</TabsTrigger>
              <TabsTrigger value="categories">Catégories</TabsTrigger>
              <TabsTrigger value="modes">Modes d'apprentissage</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Développez vos compétences, transformez votre carrière</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Plateforme révolutionnaire où les talents accèdent aux meilleurs cours, trainings et masterclasses pour atteindre leur plein potentiel.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSearchParams({ path: 'explore' })}>
                  <div className="text-center">
                    <div className="inline-block p-4 bg-violet-100 rounded-full mb-4">
                      <Brain className="h-12 w-12 text-violet-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Explorer les formations</h3>
                    <p className="text-muted-foreground mb-4">Découvrez des cours pour transformer "je souhaite" en "je peux" !</p>
                    <Button className="w-full">Trouver des cours</Button>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSearchParams({ path: 'create' })}>
                  <div className="text-center">
                    <div className="inline-block p-4 bg-pink-100 rounded-full mb-4">
                      <GraduationCap className="h-12 w-12 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Partager votre expertise</h3>
                    <p className="text-muted-foreground mb-4">Créez votre propre cours et inspirez les autres !</p>
                    <Button variant="outline" className="w-full">Créer un cours</Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="types" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningModes.map((mode, i) => (
                  <Card key={i} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <mode.icon className={`h-8 w-8 ${mode.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{mode.title}</h3>
                        <p className="text-sm text-muted-foreground">{mode.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSearchParams({ path: 'explore', category: category.name.toLowerCase() })}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{category.subcategories.length} sous-catégories</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="modes" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-5">
                  <div className="flex items-start gap-4">
                    <Globe className="h-10 w-10 text-blue-500 shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold">Apprentissage à distance</h3>
                      <p className="text-sm text-muted-foreground italic mb-2">Sessions depuis chez vous !</p>
                      <div className="text-sm space-y-1">
                        <p>• Sessions privées (1:1)</p>
                        <p>• Expériences de groupe</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-10 w-10 text-emerald-500 shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold">Apprentissage en présentiel</h3>
                      <p className="text-sm text-muted-foreground italic mb-2">Interactions directes incluses !</p>
                      <div className="text-sm space-y-1">
                        <p>• Sessions privées (1:1)</p>
                        <p>• Expériences de groupe</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </GlassMorphism>
      </main>
      <Footer />
    </div>
  );
};

export default Learning;
