import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Check, X, Clock, FileText } from 'lucide-react';

interface PendingContract {
  id: string;
  agent_id: string;
  talent_id: string;
  commission_rate: number | null;
  contract_duration_months: number | null;
  terms: string | null;
  start_date: string | null;
  status: string;
  agent_profile?: { name: string; avatar_url: string | null };
}

interface PendingContractsManagerProps {
  userId: string;
  userType: 'agent' | 'talent';
  onUpdate?: () => void;
}

const PendingContractsManager: React.FC<PendingContractsManagerProps> = ({ userId, userType, onUpdate }) => {
  const [contracts, setContracts] = useState<PendingContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingContracts();
  }, [userId]);

  const fetchPendingContracts = async () => {
    setLoading(true);
    const column = userType === 'talent' ? 'talent_id' : 'agent_id';
    const { data } = await supabase
      .from('agent_talent_contracts')
      .select('id, agent_id, talent_id, commission_rate, contract_duration_months, terms, start_date, status')
      .eq(column, userId)
      .eq('status', 'pending');

    if (data && data.length > 0) {
      const otherIds = data.map(c => userType === 'talent' ? c.agent_id : c.talent_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', otherIds);

      const enriched = data.map(c => ({
        ...c,
        agent_profile: profiles?.find(p => p.id === (userType === 'talent' ? c.agent_id : c.talent_id))
      }));
      setContracts(enriched);
    } else {
      setContracts([]);
    }
    setLoading(false);
  };

  const handleResponse = async (contractId: string, accept: boolean) => {
    const newStatus = accept ? 'active' : 'rejected';
    const { error } = await supabase
      .from('agent_talent_contracts')
      .update({ status: newStatus })
      .eq('id', contractId);

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: accept ? 'Contrat accepté' : 'Contrat refusé', description: accept ? 'Le partenariat est maintenant actif.' : 'L\'invitation a été déclinée.' });
      fetchPendingContracts();
      onUpdate?.();
    }
  };

  if (loading) return null;
  if (contracts.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Invitations en attente ({contracts.length})
        </h3>
        {contracts.map((contract) => (
          <div key={contract.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
            <Avatar className="h-10 w-10">
              <AvatarImage src={contract.agent_profile?.avatar_url || ''} />
              <AvatarFallback>{contract.agent_profile?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{contract.agent_profile?.name}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                {contract.commission_rate && <span>Commission: {contract.commission_rate}%</span>}
                {contract.contract_duration_months && <span>· {contract.contract_duration_months} mois</span>}
              </div>
              {contract.terms && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  <FileText className="h-3 w-3 inline mr-1" />{contract.terms}
                </p>
              )}
            </div>
            {userType === 'talent' && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleResponse(contract.id, false)} className="gap-1">
                  <X className="h-3 w-3" /> Refuser
                </Button>
                <Button size="sm" onClick={() => handleResponse(contract.id, true)} className="gap-1">
                  <Check className="h-3 w-3" /> Accepter
                </Button>
              </div>
            )}
            {userType === 'agent' && (
              <Badge variant="secondary">En attente</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingContractsManager;
