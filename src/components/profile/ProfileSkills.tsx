import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, Plus, X } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

interface UserSkill {
  id: string;
  skill_id: string;
  level: string | null;
  years_experience: number | null;
  skill_name?: string;
  skill_category?: string;
}

interface ProfileSkillsProps {
  userId: string;
}

const levelLabels: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  expert: "Expert",
};

const levelColors: Record<string, string> = {
  beginner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  intermediate: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  expert: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
};

export const ProfileSkills = ({ userId }: ProfileSkillsProps) => {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("beginner");
  const { toast } = useToast();

  useEffect(() => {
    fetchUserSkills();
    fetchAvailableSkills();
  }, [userId]);

  const fetchUserSkills = async () => {
    try {
      // First get user skills
      const { data: userSkillsData, error: userSkillsError } = await supabase
        .from("user_skills")
        .select("id, skill_id, level, years_experience")
        .eq("user_id", userId);

      if (userSkillsError) throw userSkillsError;

      // Then get skills details
      const skillIds = userSkillsData?.map(us => us.skill_id) || [];
      
      if (skillIds.length > 0) {
        const { data: skillsData, error: skillsError } = await supabase
          .from("skills")
          .select("id, name, category")
          .in("id", skillIds);

        if (skillsError) throw skillsError;

        const enrichedSkills = userSkillsData?.map(us => {
          const skill = skillsData?.find(s => s.id === us.skill_id);
          return {
            ...us,
            skill_name: skill?.name,
            skill_category: skill?.category,
          };
        }) || [];

        setUserSkills(enrichedSkills);
      } else {
        setUserSkills([]);
      }
    } catch (error: any) {
      console.error("Error fetching user skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("id, name, category")
        .order("category", { ascending: true });

      if (error) throw error;
      setAvailableSkills(data || []);
    } catch (error: any) {
      console.error("Error fetching skills:", error);
    }
  };

  const addSkill = async () => {
    if (!selectedSkill) return;

    try {
      const { error } = await supabase
        .from("user_skills")
        .insert({
          user_id: userId,
          skill_id: selectedSkill,
          level: selectedLevel,
        });

      if (error) throw error;

      toast({
        title: "Compétence ajoutée",
        description: "Votre compétence a été ajoutée avec succès",
      });

      fetchUserSkills();
      setDialogOpen(false);
      setSelectedSkill("");
      setSelectedLevel("beginner");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      const { error } = await supabase
        .from("user_skills")
        .delete()
        .eq("id", skillId);

      if (error) throw error;

      setUserSkills(userSkills.filter(s => s.id !== skillId));
      toast({
        title: "Compétence supprimée",
        description: "La compétence a été retirée de votre profil",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Group skills by category
  const groupedSkills = userSkills.reduce((acc, skill) => {
    const category = skill.skill_category || "Autre";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, UserSkill[]>);

  // Filter out skills user already has
  const filteredAvailableSkills = availableSkills.filter(
    skill => !userSkills.some(us => us.skill_id === skill.id)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Mes compétences
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
              <DialogTitle>Ajouter une compétence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Compétence</label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une compétence" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAvailableSkills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name} {skill.category && `(${skill.category})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Niveau</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addSkill} className="w-full" disabled={!selectedSkill}>
                Ajouter la compétence
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : userSkills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune compétence ajoutée</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((userSkill) => (
                    <Badge
                      key={userSkill.id}
                      variant="outline"
                      className={`py-2 px-3 ${userSkill.level ? levelColors[userSkill.level] : ""}`}
                    >
                      <span className="mr-2">{userSkill.skill_name}</span>
                      {userSkill.level && (
                        <span className="text-xs opacity-75">
                          • {levelLabels[userSkill.level]}
                        </span>
                      )}
                      <button
                        onClick={() => removeSkill(userSkill.id)}
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
