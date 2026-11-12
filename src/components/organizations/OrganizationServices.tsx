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
import { tr } from '@/i18n';

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
    if (error) { toast({ title: tr('common.couldNotSave'), description: error.message, variant: 'destructive' }); return; }
    toast({ title: editing === 'new' ? tr('organizationServices.serviceAdded') : tr('organizationServices.serviceUpdated') });
    setEditing(null);
    load();
  };

  const remove = async (s: Service) => {
    const { error } = await (supabase.from as any)('organization_services').delete().eq('id', s.id);
    if (error) { toast({ title: tr('common.couldNotDelete'), description: error.message, variant: 'destructive' }); return; }
    setServices(prev => prev.filter(x => x.id !== s.id));
    toast({ title: tr('organizationServices.serviceDeleted') });
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">{tr('organizationServices.services')}{services.length})</h3>
        {isOwner && <Button size="sm" onClick={() => open('new')}><Plus className="h-4 w-4 mr-1.5" />{tr('organizationServices.addAService')}</Button>}
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">{tr('common.noServices')}</h3>
            <p className="text-muted-foreground">
              {isOwner
                ? tr('organizationServices.presentWhatYouOfferTalentsCoaching')
                : tr('organizationServices.hasNotListedAnyServicesYet', { p0: ownerName })}
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
                    <Button size="sm" variant="outline" onClick={() => open(s)}><Pencil className="h-3.5 w-3.5 mr-1.5" />{tr('common.edit')}</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(s)}><Trash2 className="h-3.5 w-3.5 mr-1.5" />{tr('common.delete')}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing === 'new' ? tr('organizationServices.newService') : tr('organizationServices.editService')}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-title">{tr('organizationServices.serviceName')}</Label>
              <Input id="svc-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder={tr('organizationServices.eGU17ScoutingCamp')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="svc-category">{tr('categories.selectCategory')}</Label>
                <Input id="svc-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder={tr('organizationServices.eGCoaching')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="svc-price">{tr('organizationServices.price')}</Label>
                <Input id="svc-price" value={form.price_label} onChange={e => setForm({ ...form, price_label: e.target.value })} placeholder={tr('organizationServices.eGFree50Session')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-desc">{tr('events.description')}</Label>
              <Textarea id="svc-desc" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={tr('organizationServices.whoThisServiceIsForHow')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>{tr('common.cancel')}</Button>
            <Button onClick={save} disabled={!form.title.trim() || saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{tr('post.update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationServices;
