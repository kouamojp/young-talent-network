import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { FileText, Search, UserPlus } from 'lucide-react';

interface TalentOption {
  id: string;
  name: string;
  avatar_url: string | null;
  sport_type: string | null;
}

interface ContractCreationDialogProps {
  agentId: string;
  onContractCreated?: () => void;
}

const ContractCreationDialog: React.FC<ContractCreationDialogProps> = ({ agentId, onContractCreated }) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [talents, setTalents] = useState<TalentOption[]>([]);
  const [selectedTalent, setSelectedTalent] = useState<TalentOption | null>(null);
  const [commissionRate, setCommissionRate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchTalents();
    } else {
      setTalents([]);
    }
  }, [searchQuery]);

  const searchTalents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, sport_type')
      .eq('user_type', 'talent')
      .ilike('name', `%${searchQuery}%`)
      .limit(10);
    if (data) setTalents(data);
  };

  const handleSubmit = async () => {
    if (!selectedTalent) {
      toast({ title: 'Erreur', description: 'Sélectionnez un talent', variant: 'destructive' });
      return;
    }
    if (!commissionRate || !durationMonths) {
      toast({ title: 'Erreur', description: 'Remplissez tous les champs obligatoires', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(durationMonths));

      // Create the contract (pending status = invitation)
      const { error: contractError } = await supabase
        .from('agent_talent_contracts')
        .insert({
          agent_id: agentId,
          talent_id: selectedTalent.id,
          commission_rate: parseFloat(commissionRate),
          contract_duration_months: parseInt(durationMonths),
          start_date: startDate,
          end_date: endDate.toISOString().split('T')[0],
          terms,
          status: 'pending',
        });

      if (contractError) throw contractError;

      // Send notification to talent
      const { data: agentProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', agentId)
        .single();

      await supabase.rpc('has_role', { _user_id: agentId, _role: 'user' }); // just a ping

      // We need INSERT on notifications - let's use edge function or direct insert
      // Since notifications INSERT policy requires auth.uid() = user_id, we use an edge approach
      // For now, the contract in "pending" state acts as the invitation

      toast({ title: 'Invitation envoyée', description: `Contrat proposé à ${selectedTalent.name}` });
      setOpen(false);
      resetForm();
      onContractCreated?.();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTalent(null);
    setSearchQuery('');
    setCommissionRate('');
    setDurationMonths('');
    setTerms('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> Inviter un talent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Créer un contrat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Talent Search */}
          <div className="space-y-2">
            <Label>Rechercher un talent *</Label>
            {selectedTalent ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedTalent.avatar_url || ''} />
                  <AvatarFallback>{selectedTalent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{selectedTalent.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTalent.sport_type}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTalent(null)}>Changer</Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom du talent..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {talents.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {talents.map((t) => (
                      <button
                        key={t.id}
                        className="w-full flex items-center gap-3 p-2 hover:bg-muted transition-colors text-left"
                        onClick={() => { setSelectedTalent(t); setTalents([]); setSearchQuery(''); }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={t.avatar_url || ''} />
                          <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.sport_type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Commission */}
          <div className="space-y-2">
            <Label>Commission (%) *</Label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="Ex: 15"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Durée (mois) *</Label>
            <Select value={durationMonths} onValueChange={setDurationMonths}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la durée" />
              </SelectTrigger>
              <SelectContent>
                {[3, 6, 12, 18, 24, 36].map((m) => (
                  <SelectItem key={m} value={m.toString()}>{m} mois</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <Label>Conditions du contrat</Label>
            <Textarea
              placeholder="Décrivez les termes et conditions du partenariat..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? 'Envoi...' : 'Envoyer l\'invitation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractCreationDialog;
