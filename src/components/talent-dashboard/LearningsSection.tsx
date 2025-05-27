
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Headphones, FileText, Video } from 'lucide-react';

const LearningsSection: React.FC = () => {
  const [learnings] = useState([
    {
      id: 1,
      title: 'Complete Python Masterclass',
      type: 'Course',
      description: 'From beginner to advanced Python programming',
      price: '$49.99',
      students: 2847,
      rating: 4.8,
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      title: 'Design Thinking Podcast',
      type: 'Podcast',
      description: 'Weekly discussions on UX design principles',
      episodes: 24,
      subscribers: 1534,
      icon: Headphones,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 3,
      title: 'React Development Guide',
      type: 'E-book',
      description: 'Complete guide to modern React development',
      price: '$19.99',
      downloads: 456,
      rating: 4.6,
      icon: FileText,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 4,
      title: 'Live UI/UX Workshop',
      type: 'Workshop',
      description: 'Interactive design session every Friday',
      nextDate: 'Dec 15, 2024',
      registered: 89,
      icon: Video,
      color: 'bg-orange-100 text-orange-600'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Course':
        return BookOpen;
      case 'Podcast':
        return Headphones;
      case 'E-book':
        return FileText;
      case 'Workshop':
        return Video;
      default:
        return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Course':
        return 'bg-blue-100 text-blue-800';
      case 'Podcast':
        return 'bg-purple-100 text-purple-800';
      case 'E-book':
        return 'bg-green-100 text-green-800';
      case 'Workshop':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Learning Content</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learnings.map((item) => {
          const IconComponent = getTypeIcon(item.type);
          
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{item.description}</p>

                <div className="flex justify-between text-sm">
                  {item.type === 'Course' && (
                    <>
                      <span>{item.students} students</span>
                      <span className="font-semibold">{item.price}</span>
                    </>
                  )}
                  {item.type === 'Podcast' && (
                    <>
                      <span>{item.episodes} episodes</span>
                      <span>{item.subscribers} subscribers</span>
                    </>
                  )}
                  {item.type === 'E-book' && (
                    <>
                      <span>{item.downloads} downloads</span>
                      <span className="font-semibold">{item.price}</span>
                    </>
                  )}
                  {item.type === 'Workshop' && (
                    <>
                      <span>Next: {item.nextDate}</span>
                      <span>{item.registered} registered</span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Edit
                  </Button>
                  <Button size="sm" className="flex-1">
                    View Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-4">Share your knowledge and create learning content</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Course
            </Button>
            <Button variant="outline" size="sm">
              <Headphones className="h-4 w-4 mr-2" />
              Podcast
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              E-book
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Workshop
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningsSection;
