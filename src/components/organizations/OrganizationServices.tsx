import React, { useEffect, useState } from 'react';
import { Briefcase, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface Service {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string | null;
  price_label: string | null;
}

const EMPTY = { title: '', description: '', category: '', price_label: '' };

/** Services proposés par une organisation. Le propriétaire peut les ajouter, modifier et supprimer. */
const OrganizationServices: React.FC<{ ownerId: string; isOwner: boolean; ownerName: string }> = ({ ownerId, isOwner, ownerName }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | 'new' | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await (supabase.from as any)('organization_services')
      .select('id, owner_id, title, description, category, price_label')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [ownerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = (s: Service | 'new') => {
    setEditing(s);
    setForm(s === 'new' ? EMPTY : {
      title: s.title, description: s.description || '', category: s.category || '', price_label: s.price_label || '',
    });
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const row = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      price_label: form.price_label.trim() || null,
    };
    const query = editing === 'new'
      ? (supabase.from as any)('organization_services').insert({ ...row, owner_id: ownerId })
      : (supabase.from as any)('organization_services').update({ ...row, updated_at: new Date().toISOString() }).eq('id', (editing as Service).id);
    const { error } = await query;
    setSaving(false);
    if (error) { toast({ title: 'Enregistrement impossible', description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing === 'new' ? 'Service ajouté' : 'Service mis à jour' });
    setEditing(null);
    load();
  };

  const remove = async (s: Service) => {
    const { error } = await (supabase.from as any)('organization_services').delete().eq('id', s.id);
    if (error) { toast({ title: 'Suppression impossible', description: error.message, variant: 'destructive' }); return; }
    setServices(prev => prev.filter(x => x.id !== s.id));
    toast({ title: 'Service supprimé' });
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">Services ({services.length})</h3>
        {isOwner && <Button size="sm" onClick={() => open('new')}><Plus className="h-4 w-4 mr-1.5" />Ajouter un service</Button>}
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">Aucun service</h3>
            <p className="text-muted-foreground">
              {isOwner
                ? 'Présentez ce que vous proposez aux talents : coaching, détection, stages, formations…'
                : `${ownerName} n'a pas encore présenté de service.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold break-words">{s.title}</h4>
                  {s.price_label && <span className="shrink-0 text-sm font-semibold text-primary">{s.price_label}</span>}
                </div>
                {s.category && <Badge variant="secondary">{s.category}</Badge>}
                {s.description && <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{s.description}</p>}
                {isOwner && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => open(s)}><Pencil className="h-3.5 w-3.5 mr-1.5" />Modifier</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(s)}><Trash2 className="h-3.5 w-3.5 mr-1.5" />Supprimer</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === 'new' ? 'Nouveau service' : 'Modifier le service'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-title">Nom du service *</Label>
              <Input id="svc-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ex. Stage de détection U17" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="svc-category">Catégorie</Label>
                <Input id="svc-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="ex. Coaching" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-price">Tarif</Label>
                <Input id="svc-price" value={form.price_label} onChange={e => setForm({ ...form, price_label: e.target.value })} placeholder="ex. Gratuit, 50 € / séance" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-desc">Description</Label>
              <Textarea id="svc-desc" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="À qui s'adresse ce service, comment y participer…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={save} disabled={!form.title.trim() || saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationServices;
