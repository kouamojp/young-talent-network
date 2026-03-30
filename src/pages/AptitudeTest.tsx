import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BrainCircuit, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    { label: 'Categories', value: testCategories.length.toString() },
    { label: 'Tests Taken', value: '2,847' },
    { label: 'Talents Matched', value: '1,203' },
    { label: 'Success Rate', value: '94%' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <BrainCircuit className="h-8 w-8" />
          <h1 className="text-2xl md:text-3xl font-bold">YAT Test</h1>
        </div>
        <p className="text-white/80 text-sm max-w-2xl">
          Discover your true aptitudes and connect with people who need your talents or share your strengths.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/15 rounded-lg p-3 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-6">
        {!selectedCategory ? (
          <CategorySelector categories={testCategories} onSelect={handleSelectCategory} />
        ) : !testCompleted ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{testCategories.find(c => c.id === selectedCategory)?.icon}</span>
                <h2 className="font-semibold">{testCategories.find(c => c.id === selectedCategory)?.name}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRetake}>
                Change Category
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
                Previous
              </Button>
              <Button onClick={handleNextStep} disabled={!answers[currentStep]}>
                {currentStep < questions.length - 1 ? (
                  <>Next <ArrowRight className="h-4 w-4 ml-2" /></>
                ) : (
                  'Complete Test'
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
  );
};

export default AptitudeTest;
