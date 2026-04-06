import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BrainCircuit, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProgressBar from '@/components/aptitude-test/ProgressBar';
import QuestionDisplay from '@/components/aptitude-test/QuestionDisplay';
import ResultsDisplay from '@/components/aptitude-test/ResultsDisplay';
import CategorySelector from '@/components/aptitude-test/CategorySelector';
import { testCategories, questionsByCategory, getResultsByCategory } from '@/components/aptitude-test/testData';

const AptitudeTest: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [testCompleted, setTestCompleted] = useState(false);

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

  const stats = [
    { label: 'Catégories', value: testCategories.length.toString() },
    { label: 'Tests passés', value: '2,847' },
    { label: 'Talents connectés', value: '1,203' },
    { label: 'Taux de succès', value: '94%' },
  ];

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
              <p className="text-white/80 text-sm">Découvrez vos aptitudes, capacités et connectez-vous avec ceux qui les recherchent</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works - only on category selection */}
      {!selectedCategory && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6 justify-center text-sm text-muted-foreground">
            {[
              { step: '1', text: 'Choisissez une catégorie' },
              { step: '2', text: 'Répondez aux questions' },
              { step: '3', text: 'Découvrez vos aptitudes & contacts' },
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
            <CategorySelector categories={testCategories} onSelect={handleSelectCategory} />
          ) : !testCompleted ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentCat?.icon}</span>
                  <h2 className="font-semibold">{currentCat?.name}</h2>
                  <Badge variant="outline" className="ml-2">
                    Question {currentStep + 1}/{questions.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRetake}>
                  Changer de catégorie
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
                  Précédent
                </Button>
                <Button onClick={handleNextStep} disabled={!answers[currentStep]}>
                  {currentStep < questions.length - 1 ? (
                    <>Suivant <ArrowRight className="h-4 w-4 ml-2" /></>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Voir mes résultats</>
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
