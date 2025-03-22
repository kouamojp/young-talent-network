
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Button } from '@/components/ui/button';
import { BrainCircuit, ArrowRight, ArrowLeft } from 'lucide-react';
import ProgressBar from '@/components/aptitude-test/ProgressBar';
import QuestionDisplay from '@/components/aptitude-test/QuestionDisplay';
import ResultsDisplay from '@/components/aptitude-test/ResultsDisplay';
import { questions, getTalentAreas } from '@/components/aptitude-test/testData';

const AptitudeTest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  
  const handleNextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete the test
      setTestCompleted(true);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSelectAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentStep]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto flex flex-col md:flex-row">
        <SocialSidebar />
        <main className="flex-1 p-4">
          <GlassMorphism className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <BrainCircuit className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Y&T Aptitude Test</h1>
            </div>
            
            {!testCompleted ? (
              <>
                <ProgressBar currentStep={currentStep} totalSteps={questions.length} />
                
                <QuestionDisplay 
                  question={questions[currentStep].question}
                  options={questions[currentStep].options}
                  selectedAnswer={answers[currentStep] || ''}
                  onSelectAnswer={handleSelectAnswer}
                />
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={handleNextStep}
                    disabled={!answers[currentStep]}
                  >
                    {currentStep < questions.length - 1 ? (
                      <>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      'Complete Test'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <ResultsDisplay talentAreas={getTalentAreas()} />
            )}
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AptitudeTest;
