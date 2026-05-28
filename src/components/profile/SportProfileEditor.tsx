import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { Trophy, Save, Loader2, Send, Sparkles } from 'lucide-react';
import { SPORT_SCHEMAS, SportField } from './sport-profile-schema';

interface Props {
  userId: string;
}

type Lang = 'en' | 'fr' | 'ru';

interface SportProfileRow {
  id: string;
  sport: string;
  data: Record<string, any>;
  is_public: boolean;
}

export const SportProfileEditor: React.FC<Props> = ({ userId }) => {
  const { language } = useLanguage();
  const lang = (language as Lang) || 'en';
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState(SPORT_SCHEMAS[0].id);
  const [rows, setRows] = useState<Record<string, SportProfileRow>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiFilling, setAiFilling] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('talent_sport_profiles')
        .select('*')
        .eq('user_id', userId);
      const map: Record<string, SportProfileRow> = {};
      (data || []).forEach((r: any) => { map[r.sport] = r; });
      setRows(map);
      setLoading(false);
    })();
  }, [userId]);

  useEffect(() => {
    const row = rows[activeSport];
    setFormData(row?.data || {});
    setIsPublic(row?.is_public ?? true);
  }, [activeSport, rows]);

  const schema = SPORT_SCHEMAS.find(s => s.id === activeSport)!;

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const existing = rows[activeSport];
    if (existing) {
      const { error } = await supabase.from('talent_sport_profiles')
        .update({ data: formData, is_public: isPublic })
        .eq('id', existing.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return; }
      setRows(prev => ({ ...prev, [activeSport]: { ...existing, data: formData, is_public: isPublic } }));
    } else {
      const { data, error } = await supabase.from('talent_sport_profiles')
        .insert({ user_id: userId, sport: activeSport, data: formData, is_public: isPublic })
        .select().single();
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return; }
      if (data) setRows(prev => ({ ...prev, [activeSport]: data as any }));
    }
    setSaving(false);
    toast({ title: lang === 'ru' ? 'Сохранено' : lang === 'fr' ? 'Enregistré' : 'Saved' });
  };

  const handleAIFill = async () => {
    setAiFilling(true);
    try {
      // Aggregate latest extracted data from all profile_sources
      const { data: sources } = await supabase
        .from('profile_sources')
        .select('extracted_data,url')
        .eq('user_id', userId)
        .eq('status', 'synced');
      const aggregated = (sources || []).map((s: any) => ({ url: s.url, data: s.extracted_data })).filter(s => s.data);
      if (!aggregated.length) {
        toast({ title: lang === 'ru' ? 'Нет источников' : lang === 'fr' ? 'Aucune source synchronisée' : 'No synced sources', variant: 'destructive' });
        return;
      }
      const { data, error } = await supabase.functions.invoke('extract-sport-profile', {
        body: { sport: activeSport, schema_fields: schema.fields.map(f => ({ key: f.key, label: f.label.en, type: f.type, options: f.options?.map(o => o.value) })), sources: aggregated },
      });
      if (error) throw error;
      if (data?.fields) {
        setFormData(prev => ({ ...prev, ...data.fields }));
        toast({ title: lang === 'ru' ? 'Поля заполнены ИИ' : lang === 'fr' ? 'Champs remplis par IA' : 'AI-filled fields' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'AI fill failed', variant: 'destructive' });
    } finally {
      setAiFilling(false);
    }
  };

  const handlePublishToFeed = async () => {
    const filled = Object.entries(formData).filter(([_, v]) => v !== '' && v !== null && v !== undefined && (!Array.isArray(v) || v.length));
    if (!filled.length) {
      toast({ title: lang === 'ru' ? 'Заполните поля' : 'Fill fields first', variant: 'destructive' });
      return;
    }
    const lines = [`🏆 ${schema.label[lang]}`];
    filled.forEach(([k, v]) => {
      const field = schema.fields.find(f => f.key === k);
      if (!field) return;
      const lbl = field.label[lang];
      let valStr = '';
      if (Array.isArray(v)) {
        valStr = v.map(val => field.options?.find(o => o.value === val)?.label[lang] || val).join(', ');
      } else if (field.options) {
        valStr = field.options.find(o => o.value === v)?.label[lang] || String(v);
      } else {
        valStr = String(v);
      }
      lines.push(`• ${lbl}: ${valStr}`);
    });
    setPublishing(true);
    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content: lines.join('\n'),
      visibility: 'public',
      is_published: true,
      status: 'published',
    });
    setPublishing(false);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: lang === 'ru' ? 'Опубликовано' : lang === 'fr' ? 'Publié' : 'Published' });
  };

  if (loading) return <Card><CardContent className="p-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></CardContent></Card>;

  const renderField = (f: SportField) => {
    const v = formData[f.key];
    if (f.type === 'text' || f.type === 'number') {
      return <Input type={f.type} value={v ?? ''} onChange={e => updateField(f.key, f.type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)} />;
    }
    if (f.type === 'textarea') {
      return <Textarea value={v ?? ''} onChange={e => updateField(f.key, e.target.value)} rows={2} />;
    }
    if (f.type === 'select') {
      return (
        <Select value={v ?? ''} onValueChange={val => updateField(f.key, val)}>
          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
          <SelectContent>
            {f.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label[lang]}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    if (f.type === 'multiselect') {
      const arr: string[] = Array.isArray(v) ? v : [];
      return (
        <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-muted/30 max-h-40 overflow-y-auto">
          {f.options?.map(o => {
            const checked = arr.includes(o.value);
            return (
              <label key={o.value} className={`flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer ${checked ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>
                <Checkbox className="h-3 w-3" checked={checked} onCheckedChange={c => {
                  const next = c ? [...arr, o.value] : arr.filter(x => x !== o.value);
                  updateField(f.key, next);
                }} />
                {o.label[lang]}
              </label>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              {lang === 'ru' ? 'Спортивный профиль' : lang === 'fr' ? 'Profil sportif détaillé' : 'Detailed sport profile'}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {lang === 'ru' ? 'Подробные параметры по виду спорта' : lang === 'fr' ? 'Paramètres détaillés par sport' : 'Detailed parameters by sport'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleAIFill} disabled={aiFilling}>
              {aiFilling ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
              {lang === 'ru' ? 'ИИ из источников' : lang === 'fr' ? 'Remplir via IA' : 'AI-fill from sources'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSport} onValueChange={setActiveSport}>
          <TabsList className="flex-wrap h-auto">
            {SPORT_SCHEMAS.map(s => (
              <TabsTrigger key={s.id} value={s.id} className="text-xs">
                {s.label[lang]}
                {rows[s.id] && <Badge variant="secondary" className="ml-1 h-4 px-1 text-[9px]">✓</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>

          {SPORT_SCHEMAS.map(s => (
            <TabsContent key={s.id} value={s.id} className="space-y-3 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {s.fields.map(f => (
                  <div key={f.key} className={f.type === 'multiselect' || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <Label className="text-xs mb-1 block">{f.label[lang]}</Label>
                    {renderField(f)}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex items-center justify-between gap-2 pt-4 border-t mt-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            {lang === 'ru' ? 'Виден всем' : lang === 'fr' ? 'Public' : 'Public'}
          </label>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handlePublishToFeed} disabled={publishing}>
              {publishing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
              {lang === 'ru' ? 'В ленту' : lang === 'fr' ? 'Publier' : 'Post to feed'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              {lang === 'ru' ? 'Сохранить' : lang === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SportProfileEditor;
