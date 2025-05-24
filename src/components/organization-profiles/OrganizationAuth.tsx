
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Building } from 'lucide-react';

interface OrganizationAuthProps {
  onLogin: (type: 'talent' | 'organization') => void;
}

const OrganizationAuth: React.FC<OrganizationAuthProps> = ({ onLogin }) => {
  const [userType, setUserType] = useState<'talent' | 'organization'>('organization');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(userType);
    }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(userType);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login to Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Side-by-side email and password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-type">Account Type</Label>
                  <Select value={userType} onValueChange={(value: 'talent' | 'organization') => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talent">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Talent</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="organization">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>Organization</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create New Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-type-register">I am a...</Label>
                  <Select value={userType} onValueChange={(value: 'talent' | 'organization') => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talent">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Talent (Individual)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="organization">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>Organization/Agency</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-name">
                    {userType === 'organization' ? 'Organization Name' : 'Full Name'}
                  </Label>
                  <Input 
                    id="reg-name" 
                    placeholder={userType === 'organization' ? 'Your Company Name' : 'John Doe'} 
                    required 
                  />
                </div>

                {/* Side-by-side email and password for registration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input 
                      id="reg-email" 
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : `Create ${userType === 'organization' ? 'Organization' : 'Talent'} Account`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationAuth;
