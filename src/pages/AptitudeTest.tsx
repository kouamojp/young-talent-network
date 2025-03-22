
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSidebar from '@/components/SocialSidebar';
import GlassMorphism from '@/components/GlassMorphism';
import { Button } from '@/components/ui/button';
import { Radio, RadioGroup, RadioIndicator, RadioItem } from '@/components/ui/radio-group';
import { BrainCircuit, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AptitudeTest: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  
  // Mock questions
  const questions = [
    {
      id: 1,
      question: 'When faced with a creative challenge, you prefer to:',
      options: [
        { id: 'a', text: 'Think through multiple possibilities before deciding' },
        { id: 'b', text: 'Trust your instincts and go with what feels right' },
        { id: 'c', text: 'Research what others have done in similar situations' },
        { id: 'd', text: 'Collaborate with others to find the best solution' },
      ]
    },
    {
      id: 2,
      question: 'In a group setting, you typically find yourself:',
      options: [
        { id: 'a', text: 'Leading the discussion and making decisions' },
        { id: 'b', text: 'Contributing ideas but letting others lead' },
        { id: 'c', text: 'Observing first, then sharing well-thought-out perspectives' },
        { id: 'd', text: 'Mediating between different viewpoints' },
      ]
    },
    {
      id: 3,
      question: 'When learning something new, you prefer to:',
      options: [
        { id: 'a', text: 'Read detailed instructions or theory first' },
        { id: 'b', text: 'Watch someone else demonstrate it' },
        { id: 'c', text: 'Jump in and learn through trial and error' },
        { id: 'd', text: 'Discuss the concept with an expert' },
      ]
    },
    {
      id: 4,
      question: 'When receiving feedback, you value most:',
      options: [
        { id: 'a', text: 'Specific, actionable suggestions for improvement' },
        { id: 'b', text: 'Recognition of your strengths and achievements' },
        { id: 'c', text: "Honest critique, even if it's difficult to hear" },
        { id: 'd', text: 'A balanced perspective that considers context' },
      ]
    },
    {
      id: 5,
      question: 'When working on a project, you typically:',
      options: [
        { id: 'a', text: 'Plan everything in detail before starting' },
        { id: 'b', text: 'Start quickly and adjust as you go' },
        { id: 'c', text: 'Focus on one aspect at a time, perfecting each part' },
        { id: 'd', text: 'Think about the big picture and overall impact' },
      ]
    },
  ];
  
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
  
  // Mock results based on answers
  const getTalentAreas = () => {
    return [
      { area: 'Visual Arts', score: 85, description: 'You show strong aptitude for visual expression and design thinking.' },
      { area: 'Performance', score: 72, description: 'You have good potential for performing arts and public presentation.' },
      { area: 'Writing', score: 68, description: 'You demonstrate solid verbal communication and storytelling abilities.' },
      { area: 'Technical/Production', score: 60, description: 'You have moderate aptitude for behind-the-scenes production work.' },
    ];
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
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Question {currentStep + 1} of {questions.length}</span>
                    <span>{Math.round(((currentStep + 1) / questions.length) * 100)}% Complete</span>
                  </div>
                  <Progress value={((currentStep + 1) / questions.length) * 100} />
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">{questions[currentStep].question}</h2>
                  
                  <RadioGroup 
                    value={answers[currentStep] || ''} 
                    onValueChange={handleSelectAnswer}
                    className="space-y-3"
                  >
                    {questions[currentStep].options.map(option => (
                      <div key={option.id} className="flex items-start">
                        <RadioItem value={option.id} id={`option-${option.id}`} className="mt-1">
                          <RadioIndicator />
                        </RadioItem>
                        <label 
                          htmlFor={`option-${option.id}`} 
                          className="ml-2 text-gray-700 cursor-pointer"
                        >
                          {option.text}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
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
              <div className="test-results">
                <div className="text-center mb-8">
                  <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
                  <p className="text-gray-600">
                    Based on your responses, we've identified your key talent areas and potential.
                  </p>
                </div>
                
                <div className="space-y-6 mb-8">
                  <h3 className="text-xl font-semibold">Your Talent Profile</h3>
                  
                  {getTalentAreas().map((area, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{area.area}</span>
                        <span className="text-sm">{area.score}%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${area.score}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{area.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <h3 className="font-semibold mb-2">Recommendation</h3>
                  <p className="text-sm">
                    Based on your profile, we recommend exploring courses and opportunities in Visual Arts and Performance. 
                    Connect with mentors in these fields to further develop your talents.
                  </p>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button>
                    View Detailed Results
                  </Button>
                  <Button variant="outline">
                    Retake Test
                  </Button>
                </div>
              </div>
            )}
          </GlassMorphism>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AptitudeTest;
