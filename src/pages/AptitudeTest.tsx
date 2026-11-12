import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { BrainCircuit, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProgressBar from '@/components/aptitude-test/ProgressBar';
import QuestionDisplay from '@/components/aptitude-test/QuestionDisplay';
import ResultsDisplay from '@/components/aptitude-test/ResultsDisplay';
import CategorySelector from '@/components/aptitude-test/CategorySelector';
import { testCategories, questionsByCategory, getResultsByCategory } from '@/components/aptitude-test/testData';
import { tr } from '@/i18n';
import { localeTag } from '@/i18n/format';

const AptitudeTest: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [history, setHistory] = useState<{ id: string; category: string; top_area: string | null; top_score: number | null; created_at: string }[]>([]);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase.from as any)('aptitude_test_results')
      .select('id, category, top_area, top_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    setHistory(data || []);
  };

  useEffect(() => { loadHistory(); }, []);

  const saveResults = async (category: string, finalAnswers: Record<number, string>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: tr('aptitudeTest.resultsNotSaved'), description: tr('aptitudeTest.logInToKeepYourResults') });
      return;
    }
    const results = getResultsByCategory(category, finalAnswers);
    const top = [...results].sort((a, b) => b.score - a.score)[0];
    const { error } = await (supabase.from as any)('aptitude_test_results').insert({
      user_id: user.id,
      category,
      results,
      top_area: top?.area ?? null,
      top_score: top ? Math.round(top.score) : null,
    });
    if (error) {
      toast({ title: tr('aptitudeTest.savingFailed'), description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: tr('aptitudeTest.resultsSaved') });
    loadHistory();
  };

  const questions = selectedCategory ? questionsByCategory[selectedCategory] || [] : [];
  const currentCat = testCategories.find(c => c.id === selectedCategory);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentStep(0);
    setAnswers({});
    setTestCompleted(false);
  };

  const handleNextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setTestCompleted(true);
      if (selectedCategory) saveResults(selectedCategory, answers);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSelectAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentStep]: value }));
  };

  const handleRetake = () => {
    setSelectedCategory(null);
    setCurrentStep(0);
    setAnswers({});
    setTestCompleted(false);
  };


  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-white/15">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">YAT Test</h1>
              <p className="text-white/80 text-sm">{tr('aptitudeTest.discoverYourAptitudesAndAbilitiesAnd')}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/80">{testCategories.length} {tr('aptitudeTest.testCategoriesAvailable')}</p>
        </div>
      </div>

      {/* How it works - only on category selection */}
      {!selectedCategory && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6 justify-center text-sm text-muted-foreground">
            {[
              { step: '1', text: tr('common.chooseACategory') },
              { step: '2', text: tr('aptitudeTest.answerTheQuestions') },
              { step: '3', text: tr('aptitudeTest.discoverYourAptitudesContacts') },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{s.step}</span>
                <span>{s.text}</span>
                {i < 2 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 ml-2" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="p-6">
          {!selectedCategory ? (
            <>
              <CategorySelector categories={testCategories} onSelect={handleSelectCategory} />
              {history.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">{tr('aptitudeTest.myLatestResults')}</h3>
                  <ul className="space-y-1.5">
                    {history.map(h => (
                      <li key={h.id} className="flex items-center justify-between text-sm gap-3">
                        <span className="truncate">
                          {testCategories.find(c => c.id === h.category)?.icon} {testCategories.find(c => c.id === h.category)?.name || h.category}
                          {h.top_area && <span className="text-muted-foreground"> · {h.top_area}</span>}
                        </span>
                        <span className="shrink-0 text-muted-foreground tabular-nums">
                          {h.top_score != null && <strong className="text-foreground">{h.top_score}%</strong>} · {new Date(h.created_at).toLocaleDateString(localeTag())}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : !testCompleted ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentCat?.icon}</span>
                  <h2 className="font-semibold">{currentCat?.name}</h2>
                  <Badge variant="outline" className="ml-2">
                    {tr('common.question')} {currentStep + 1}/{questions.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRetake}>
                  {tr('aptitudeTest.changeCategory')}
                </Button>
              </div>

              <ProgressBar currentStep={currentStep} totalSteps={questions.length} />

              <QuestionDisplay
                question={questions[currentStep].question}
                options={questions[currentStep].options}
                selectedAnswer={answers[currentStep] || ''}
                onSelectAnswer={handleSelectAnswer}
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {tr('common.previous')}
                </Button>
                <Button onClick={handleNextStep} disabled={!answers[currentStep]}>
                  {currentStep < questions.length - 1 ? (
                    <>{tr('common.next')} <ArrowRight className="h-4 w-4 ml-2" /></>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> {tr('aptitudeTest.seeMyResults')}</>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <ResultsDisplay
              talentAreas={getResultsByCategory(selectedCategory, answers)}
              category={selectedCategory}
              onRetake={handleRetake}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default AptitudeTest;
