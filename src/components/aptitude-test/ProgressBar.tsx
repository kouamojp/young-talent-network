
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { tr } from '@/i18n';

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const percentage = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span>{tr('common.question')} {currentStep + 1} {tr('progressBar.of')} {totalSteps}</span>
        <span>{Math.round(percentage)}{tr('progressBar.complete')}</span>
      </div>
      <Progress value={percentage} />
    </div>
  );
};

export default ProgressBar;
