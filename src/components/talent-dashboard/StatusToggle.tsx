
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Edit3 } from 'lucide-react';

interface StatusToggleProps {
  isOpenToWork: boolean;
  workStatus: string;
  onToggle: (value: boolean) => void;
  onStatusChange: (status: string) => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  isOpenToWork,
  workStatus,
  onToggle,
  onStatusChange
}) => {
  const [tagline, setTagline] = React.useState('Seeking freelance design projects');
  const [isEditingTagline, setIsEditingTagline] = React.useState(false);

  const getStatusColor = () => {
    switch (workStatus) {
      case 'Actively Looking':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Open to Offers':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Not Searching':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className={`mb-6 border-2 ${isOpenToWork ? 'border-green-200 bg-green-50/50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-purple-600" />
              <div className="flex items-center gap-2">
                <span className="font-medium">Open to Work</span>
                <Switch
                  checked={isOpenToWork}
                  onCheckedChange={onToggle}
                />
              </div>
            </div>

            {isOpenToWork && (
              <div className="flex items-center gap-3">
                <Select value={workStatus} onValueChange={onStatusChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actively Looking">Actively Looking</SelectItem>
                    <SelectItem value="Open to Offers">Open to Offers</SelectItem>
                    <SelectItem value="Not Searching">Not Searching</SelectItem>
                  </SelectContent>
                </Select>

                <Badge className={getStatusColor()}>
                  {workStatus}
                </Badge>
              </div>
            )}
          </div>

          {isOpenToWork && (
            <div className="flex items-center gap-2">
              {isEditingTagline ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-64"
                    placeholder="Enter your tagline..."
                  />
                  <Button
                    size="sm"
                    onClick={() => setIsEditingTagline(false)}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 italic">"{tagline}"</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingTagline(true)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusToggle;
