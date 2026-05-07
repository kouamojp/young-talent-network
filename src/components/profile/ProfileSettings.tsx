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
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
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
        title: "Succès",
        description: "Mot de passe mis à jour avec succès",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Erreur",
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
      toast({ title: "Succès", description: "Localisation mise à jour" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
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
            Localisation
          </CardTitle>
          <CardDescription>
            Votre localisation est synchronisée avec tous les services YAT (Karta, Events, Work, Marketplace…)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <LocationPicker value={location} onChange={setLocation} />
          <Button onClick={handleSaveLocation} disabled={savingLocation}>
            {savingLocation ? 'Enregistrement…' : 'Enregistrer la localisation'}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Gérez votre mot de passe et la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
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
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
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
            Changer le mot de passe
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configurez vos préférences de notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications par email</p>
              <p className="text-sm text-muted-foreground">
                Recevoir des emails pour les mises à jour importantes
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
              <p className="font-medium">Notifications push</p>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications dans le navigateur
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
            Confidentialité
          </CardTitle>
          <CardDescription>
            Contrôlez qui peut voir votre profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Profil public</p>
              <p className="text-sm text-muted-foreground">
                Permettre à tous les utilisateurs de voir votre profil
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
            Actions du compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer le compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos données seront
                    définitivement supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
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
