
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Edit, Users, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  email?: string;
  isLinkedTalent: boolean;
}

const StaffManager: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Talent Director',
      avatar: '/placeholder.svg',
      email: 'sarah@elitetalent.com',
      isLinkedTalent: false
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Casting Agent',
      avatar: '/placeholder.svg',
      isLinkedTalent: true
    }
  ]);

  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    email: '',
    avatar: '/placeholder.svg'
  });

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.role) {
      const staffMember: StaffMember = {
        id: Date.now(),
        name: newStaff.name,
        role: newStaff.role,
        avatar: newStaff.avatar,
        email: newStaff.email || undefined,
        isLinkedTalent: false
      };
      
      setStaff(prev => [...prev, staffMember]);
      setNewStaff({ name: '', role: '', email: '', avatar: '/placeholder.svg' });
      setIsAddingStaff(false);
    }
  };

  const handleRemoveStaff = (id: number) => {
    setStaff(prev => prev.filter(member => member.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-name">Name</Label>
                  <Input
                    id="staff-name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-role">Role/Position</Label>
                  <Input
                    id="staff-role"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Talent Agent, Director, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email (Optional)</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@company.com"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddStaff} className="flex-1">
                    Add Member
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingStaff(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No team members added yet</p>
            <p className="text-sm">Add employees manually or link existing talents</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{member.name}</h4>
                    {member.isLinkedTalent && (
                      <Badge variant="secondary" className="text-xs">
                        <Link className="h-3 w-3 mr-1" />
                        Linked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  {member.email && (
                    <p className="text-xs text-blue-600">{member.email}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleRemoveStaff(member.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">Link Existing Talents</h4>
          <p className="text-sm text-blue-700 mb-2">
            Connect talents from your network to your organization profile
          </p>
          <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
            <Link className="h-4 w-4 mr-2" />
            Browse Talents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffManager;
