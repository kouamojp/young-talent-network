
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface ResumeProps {
  id: number;
  title: string;
  category: string;
  skills: string[];
  experience: string;
  achievements: string[];
  isActive: boolean;
  lastUpdated: string;
}

interface ResumeCardProps {
  resume: ResumeProps;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onEdit, onDelete, onView }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{resume.title}</h3>
              {resume.isActive && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{resume.category} • {resume.experience}</p>
          </div>
          
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onView(resume.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View resume</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onEdit(resume.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit resume</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(resume.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete resume</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="flex flex-wrap gap-2 mt-2">
            {resume.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50">
                {skill}
              </Badge>
            ))}
            {resume.skills.length > 5 && (
              <Badge variant="outline">+{resume.skills.length - 5} more</Badge>
            )}
          </div>
        </div>
        
        {resume.achievements.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Key Achievements</h4>
            <ul className="text-sm text-gray-700 list-disc list-inside">
              {resume.achievements.slice(0, 2).map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))}
              {resume.achievements.length > 2 && (
                <p className="text-sm text-gray-500 italic">
                  +{resume.achievements.length - 2} more achievements
                </p>
              )}
            </ul>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-3">
          Last updated: {resume.lastUpdated}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeCard;
