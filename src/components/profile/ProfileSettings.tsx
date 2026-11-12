import { useState } from "react";
import { CardBackgroundPicker } from "./CardBackgroundPicker";
import { useUserLevel } from "@/hooks/useUserLevel";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Lock, Bell, Eye, LogOut, Trash2, MapPin } from "lucide-react";
import { LocationPicker, LocationValue } from "@/components/location/LocationPicker";
import { tr } from '@/i18n';

interface Profile {
  id: string;
  name: string;
  email: string;
  location?: string | null;
  city?: string | null;
  country?: string | null;
}

interface ProfileSettingsProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

export const ProfileSettings = ({ profile, onUpdate }: ProfileSettingsProps) => {
  const initialLocation: LocationValue | null = profile.location || profile.city || profile.country
    ? { address: profile.location || [profile.city, profile.country].filter(Boolean).join(', '), city: profile.city ?? undefined, country: profile.country ?? undefined }
    : null;
  const [location, setLocation] = useState<LocationValue | null>(initialLocation);
  const [savingLocation, setSavingLocation] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: tr('settings.error'),
        description: tr('profileSettings.passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: tr('settings.error'),
        description: tr('profileSettings.passwordMustBeAtLeast6'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: tr('profileSettings.success'),
        description: tr('profileSettings.passwordUpdatedSuccessfully'),
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: tr('settings.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_current_user");
      if (error) throw error;

      toast({
        title: tr('common.accountDeleted'),
        description: tr('common.yourAccountAndYourDataHave'),
      });

      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: tr('settings.error'),
        description: error.message ?? tr('profileSettings.couldNotDeleteTheAccount'),
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    setSavingLocation(true);
    try {
      const updates = {
        location: location?.address ?? null,
        city: location?.city ?? null,
        country: location?.country ?? null,
      };
      const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
      if (error) throw error;
      onUpdate(updates as Partial<Profile>);
      toast({ title: tr('profileSettings.success'), description: tr('profileSettings.locationUpdated') });
    } catch (e: any) {
      toast({ title: tr('settings.error'), description: e.message, variant: "destructive" });
    } finally {
      setSavingLocation(false);
    }
  };

  const CardBackgroundSectionInner = () => {
    const { levelData, refetch } = useUserLevel(profile.id);
    if (!levelData) return null;
    return <CardBackgroundPicker userId={profile.id} currentBackground={levelData.card_background} onUpdate={() => refetch()} />;
  };

  return (
    <div className="space-y-6">
      {/* Card Background */}
      <CardBackgroundSectionInner />

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {tr('location.label')}
          </CardTitle>
          <CardDescription>
            {tr('profileSettings.yourLocationIsSyncedWithAll')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <LocationPicker value={location} onChange={setLocation} />
          <Button onClick={handleSaveLocation} disabled={savingLocation}>
            {savingLocation ? tr('profileSettings.saving') : tr('profileSettings.saveLocation')}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {tr('settings.security')}
          </CardTitle>
          <CardDescription>
            {tr('profileSettings.manageYourPasswordAndAccountSecurity')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{tr('profileSettings.currentPassword')}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{tr('auth.newPassword')}</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{tr('auth.confirmPassword')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button 
            onClick={handlePasswordChange} 
            disabled={loading || !newPassword}
          >
            {tr('settings.changePassword')}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {tr('nav.notifications')}
          </CardTitle>
          <CardDescription>
            {tr('profileSettings.setYourNotificationPreferences')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{tr('settings.emailNotif')}</p>
              <p className="text-sm text-muted-foreground">
                {tr('settings.emailNotifDesc')}
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{tr('settings.pushNotif')}</p>
              <p className="text-sm text-muted-foreground">
                {tr('profileSettings.receiveNotificationsInTheBrowser')}
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {tr('footer.privacy')}
          </CardTitle>
          <CardDescription>
            {tr('profileSettings.controlWhoCanSeeYourProfile')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{tr('settings.publicProfile')}</p>
              <p className="text-sm text-muted-foreground">
                {tr('profileSettings.allowAllUsersToSeeYour')}
              </p>
            </div>
            <Switch
              checked={profilePublic}
              onCheckedChange={setProfilePublic}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Settings className="h-5 w-5" />
            {tr('profileSettings.accountActions')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {tr('settings.logout')}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {tr('profileSettings.deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{tr('profileSettings.areYouSure')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {tr('profileSettings.thisActionCannotBeUndoneAll')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tr('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {loading ? tr('common.deleting') : tr('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
