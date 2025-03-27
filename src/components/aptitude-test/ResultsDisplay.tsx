
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TalentArea } from './testData';

type ResultsDisplayProps = {
  talentAreas: TalentArea[];
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ talentAreas }) => {
  return (
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
        
        {talentAreas.map((area, index) => (
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
  );
};

export default ResultsDisplay;
