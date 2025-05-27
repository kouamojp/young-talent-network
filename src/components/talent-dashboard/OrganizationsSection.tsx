
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building, Calendar, Briefcase, DollarSign, Users } from 'lucide-react';

const OrganizationsSection: React.FC = () => {
  const [affiliations] = useState([
    {
      id: 1,
      name: 'Google',
      role: 'UX Consultant',
      type: 'Employer',
      duration: '2023 - Present',
      status: 'Active',
      description: 'Leading design for Google Pay mobile experience',
      compensation: '$120/hour',
      logo: '/placeholder.svg'
    },
    {
      id: 2,
      name: 'TEDx San Francisco',
      role: 'Speaker',
      type: 'Partner',
      duration: '2024',
      status: 'Completed',
      description: 'Spoke about the future of human-centered design',
      compensation: 'Speaking Fee',
      logo: '/placeholder.svg'
    },
    {
      id: 3,
      name: 'Design Ventures',
      role: 'Portfolio Company',
      type: 'Investor',
      duration: '2023 - Present',
      status: 'Active',
      description: 'Seed investment in design tool startup',
      compensation: '2% equity',
      logo: '/placeholder.svg'
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Employer':
        return 'bg-blue-100 text-blue-800';
      case 'Partner':
        return 'bg-green-100 text-green-800';
      case 'Investor':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Employer':
        return Briefcase;
      case 'Partner':
        return Users;
      case 'Investor':
        return DollarSign;
      default:
        return Building;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">🏢 Organization Affiliations</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Affiliation
        </Button>
      </div>

      {/* Affiliations List */}
      <div className="space-y-4">
        {affiliations.map((org) => {
          const TypeIcon = getTypeIcon(org.type);
          
          return (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="h-6 w-6 text-gray-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{org.name}</h4>
                        <p className="text-gray-600">{org.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getTypeColor(org.type)}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {org.type}
                        </Badge>
                        <Badge className={getStatusColor(org.status)}>
                          {org.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{org.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {org.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {org.compensation}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Organization */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div className="text-center">
            <Building className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Add Organization Affiliation</h4>
            <p className="text-gray-600 mb-4">
              Connect with companies, partners, or investors you work with
            </p>
            
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm">
                <Briefcase className="h-4 w-4 mr-2" />
                Add Employer
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Add Partner
              </Button>
              <Button variant="outline" size="sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Add Investor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Briefcase className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">
              {affiliations.filter(org => org.type === 'Employer').length}
            </p>
            <p className="text-sm text-blue-600">Employers</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">
              {affiliations.filter(org => org.type === 'Partner').length}
            </p>
            <p className="text-sm text-green-600">Partners</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">
              {affiliations.filter(org => org.type === 'Investor').length}
            </p>
            <p className="text-sm text-purple-600">Investors</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationsSection;
