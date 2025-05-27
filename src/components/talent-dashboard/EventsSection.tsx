
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Calendar as CalendarIcon, Users, DollarSign, MapPin, Clock } from 'lucide-react';

const EventsSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [events] = useState([
    {
      id: 1,
      title: 'UX Design Masterclass',
      type: 'Workshop',
      date: '2024-12-20',
      time: '14:00 - 17:00',
      location: 'Online (Zoom)',
      capacity: 50,
      registered: 42,
      price: 49.99,
      revenue: 2079.58,
      status: 'Active'
    },
    {
      id: 2,
      title: 'Design Systems Meetup',
      type: 'Meetup',
      date: '2024-12-25',
      time: '18:00 - 20:00',
      location: 'San Francisco, CA',
      capacity: 100,
      registered: 78,
      price: 0,
      revenue: 0,
      status: 'Active'
    },
    {
      id: 3,
      title: 'Portfolio Review Concert',
      type: 'Concert',
      date: '2024-12-30',
      time: '19:00 - 22:00',
      location: 'Virtual Stage',
      capacity: 200,
      registered: 156,
      price: 25.00,
      revenue: 3900.00,
      status: 'Sold Out'
    }
  ]);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Workshop':
        return 'bg-blue-100 text-blue-800';
      case 'Meetup':
        return 'bg-green-100 text-green-800';
      case 'Concert':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Sold Out':
        return 'bg-red-100 text-red-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">🗓️ Event Management</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold mb-1">{event.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-gray-600" />
                      <span>{event.registered} / {event.capacity} registered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-gray-600" />
                      <span>
                        {event.price === 0 ? 'Free' : `$${event.price}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">
                        Revenue: ${event.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-gray-100 rounded-lg p-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Registration Progress</span>
                    <span>{Math.round((event.registered / event.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Event Creation */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 text-purple-900">🎟️ Quick Event Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Webinar
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Workshop
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              Meetup
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Concert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsSection;
