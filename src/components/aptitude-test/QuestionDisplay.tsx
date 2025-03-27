
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type Option = {
  id: string;
  text: string;
};

type QuestionDisplayProps = {
  question: string;
  options: Option[];
  selectedAnswer: string;
  onSelectAnswer: (value: string) => void;
};

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  options, 
  selectedAnswer, 
  onSelectAnswer 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{question}</h2>
      
      <RadioGroup 
        value={selectedAnswer} 
        onValueChange={onSelectAnswer}
        className="space-y-3"
      >
        {options.map(option => (
          <div key={option.id} className="flex items-start">
            <div className="flex h-5 w-5 items-center justify-center">
              <RadioGroupItem value={option.id} id={`option-${option.id}`} className="mt-1" />
            </div>
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
  );
};

export default QuestionDisplay;
