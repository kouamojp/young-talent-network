
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassMorphism from '@/components/GlassMorphism';
import AnimatedText from '@/components/AnimatedText';
import { Facebook, Users, Building } from 'lucide-react';

const Authentication: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userType, setUserType] = useState<'talent' | 'organization'>('talent');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (userType === 'organization') {
        navigate('/organization-profiles');
      } else {
        navigate('/profile');
      }
    }, 1500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (userType === 'organization') {
        navigate('/organization-profiles');
      } else {
        navigate('/profile');
      }
    }, 1500);
  };

  const handleFacebookLogin = () => {
    setIsLoading(true);
    // Simulate Facebook login process
    console.log("Facebook login initiated");
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <GlassMorphism className="w-full max-w-md p-6">
        <AnimatedText text="Welcome to Y&T" tag="h1" className="text-2xl font-bold text-center mb-6" />
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Sign in to your Y&T account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="user-type">I am a...</Label>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required autoComplete="username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required autoComplete="current-password" />
                    </div>
                  </div>
                  <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>
                  Create your Y&T account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <Label htmlFor="user-type-reg">I am a...</Label>
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
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="reg-name">{userType === 'organization' ? 'Organization Name' : 'Full Name'}</Label>
                    <Input id="reg-name" placeholder={userType === 'organization' ? 'Your Company Name' : 'John Doe'} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" type="email" placeholder="your@email.com" required autoComplete="username" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input id="reg-password" type="password" required autoComplete="new-password" />
                    </div>
                  </div>
                  <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : `Create ${userType === 'organization' ? 'Organization' : 'Talent'} Account`}
                  </Button>
                </form>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2">Or continue with</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </GlassMorphism>
    </div>
  );
};

export default Authentication;
