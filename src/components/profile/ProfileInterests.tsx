import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Plus, X, Sparkles } from "lucide-react";

interface UserInterest {
  id: string;
  interest_type: string;
  interest_value: string;
}

interface ProfileInterestsProps {
  userId: string;
}

const interestTypes = [
  { value: "hobby", label: "Loisir" },
  { value: "sport", label: "Sport" },
  { value: "music", label: "Musique" },
  { value: "art", label: "Art" },
  { value: "technology", label: "Technologie" },
  { value: "travel", label: "Voyage" },
  { value: "food", label: "Cuisine" },
  { value: "reading", label: "Lecture" },
  { value: "gaming", label: "Jeux vidéo" },
  { value: "other", label: "Autre" },
];

const typeColors: Record<string, string> = {
  hobby: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  sport: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  music: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  art: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  technology: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  travel: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  food: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  reading: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  gaming: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export const ProfileInterests = ({ userId }: ProfileInterestsProps) => {
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newInterestType, setNewInterestType] = useState<string>("hobby");
  const [newInterestValue, setNewInterestValue] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUserInterests();
  }, [userId]);

  const fetchUserInterests = async () => {
    try {
      const { data, error } = await supabase
        .from("user_interests")
        .select("id, interest_type, interest_value")
        .eq("user_id", userId);

      if (error) throw error;
      setUserInterests(data || []);
    } catch (error: any) {
      console.error("Error fetching user interests:", error);
    } finally {
      setLoading(false);
    }
  };

  const addInterest = async () => {
    if (!newInterestValue.trim()) return;

    try {
      const { error } = await supabase
        .from("user_interests")
        .insert({
          user_id: userId,
          interest_type: newInterestType,
          interest_value: newInterestValue.trim(),
        });

      if (error) throw error;

      toast({
        title: "Intérêt ajouté",
        description: "Votre centre d'intérêt a été ajouté",
      });

      fetchUserInterests();
      setDialogOpen(false);
      setNewInterestValue("");
      setNewInterestType("hobby");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeInterest = async (interestId: string) => {
    try {
      const { error } = await supabase
        .from("user_interests")
        .delete()
        .eq("id", interestId);

      if (error) throw error;

      setUserInterests(userInterests.filter(i => i.id !== interestId));
      toast({
        title: "Intérêt supprimé",
        description: "Le centre d'intérêt a été retiré",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Group interests by type
  const groupedInterests = userInterests.reduce((acc, interest) => {
    const type = interest.interest_type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(interest);
    return acc;
  }, {} as Record<string, UserInterest[]>);

  const getTypeLabel = (type: string) => {
    return interestTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Centres d'intérêt
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un centre d'intérêt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={newInterestType} onValueChange={setNewInterestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {interestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newInterestValue}
                  onChange={(e) => setNewInterestValue(e.target.value)}
                  placeholder="Ex: Piano, Football, Photographie..."
                />
              </div>
              <Button onClick={addInterest} className="w-full" disabled={!newInterestValue.trim()}>
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : userInterests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun centre d'intérêt ajouté</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedInterests).map(([type, interests]) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  {getTypeLabel(type)}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge
                      key={interest.id}
                      variant="outline"
                      className={`py-2 px-3 ${typeColors[type] || typeColors.other}`}
                    >
                      {interest.interest_value}
                      <button
                        onClick={() => removeInterest(interest.id)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
