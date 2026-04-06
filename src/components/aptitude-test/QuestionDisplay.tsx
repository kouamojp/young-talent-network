import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
          <label
            key={option.id}
            htmlFor={`option-${option.id}`}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedAnswer === option.id 
                ? 'border-primary bg-primary/5' 
                : 'border-transparent bg-muted/50 hover:bg-muted'
            }`}
          >
            <RadioGroupItem value={option.id} id={`option-${option.id}`} />
            <span className="text-sm">{option.text}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
};

export default QuestionDisplay;
