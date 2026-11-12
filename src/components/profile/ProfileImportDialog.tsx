import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { tr } from '@/i18n';
import type { TranslationKey } from '@/i18n/types';
import {
  achievementKey, applyProfileImport, educationKey, experienceKey, isEmptyImport, loadExistingProfileData,
  type ExistingProfileData, type ProfileFieldKey, type ProfileImport,
} from '@/lib/profileImport';

interface ProfileImportDialogProps {
  userId: string;
  /** Proposal to review; the dialog is open while it is set. */
  proposal: ProfileImport | null;
  sourceLabel?: string;
  onClose: () => void;
  onApplied?: () => void;
}

const FIELD_ORDER: ProfileFieldKey[] = ['name', 'professional_title', 'sport_type', 'bio', 'about_me', 'city', 'country', 'languages'];
const FIELD_LABEL: Record<ProfileFieldKey, TranslationKey> = {
  name: 'profileImport.fieldName',
  professional_title: 'profileImport.fieldTitle',
  sport_type: 'profileImport.fieldSpecialty',
  bio: 'profileImport.fieldBio',
  about_me: 'profileImport.fieldAbout',
  city: 'profileImport.fieldCity',
  country: 'profileImport.fieldCountry',
  languages: 'profileImport.fieldLanguages',
};

const show = (v: unknown): string => (Array.isArray(v) ? v.join(', ') : typeof v === 'string' ? v : v == null ? '' : String(v));
const isBlank = (v: unknown) => (Array.isArray(v) ? v.length === 0 : !show(v).trim());
const years = (a: number | string | null, b: number | string | null, current = false) => {
  const from = a ? String(a).slice(0, 4) : '';
  const to = current ? tr('profileImport.present') : b ? String(b).slice(0, 4) : '';
  return [from, to].filter(Boolean).join(' – ');
};

const Row: React.FC<{ id: string; checked: boolean; onToggle: (id: string) => void; disabled?: boolean; children: React.ReactNode }> = ({ id, checked, onToggle, disabled, children }) => (
  <label htmlFor={`imp-${id}`} className={`flex items-start gap-3 rounded-lg border border-border p-2.5 ${disabled ? 'opacity-60' : 'cursor-pointer hover:bg-muted/50'}`}>
    <Checkbox id={`imp-${id}`} checked={!disabled && checked} disabled={disabled} onCheckedChange={() => onToggle(id)} className="mt-0.5" />
    <div className="min-w-0 flex-1 text-sm">{children}</div>
    {disabled && <Badge variant="secondary" className="shrink-0 text-[10px]">{tr('profileImport.alreadyOnProfile')}</Badge>}
  </label>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
    {children}
  </section>
);

/**
 * Review screen for data extracted from an external source or a CV: the member
 * ticks what to copy into the profile. Filled profile fields are unticked by
 * default, and items already on the profile cannot be added twice.
 */
const ProfileImportDialog: React.FC<ProfileImportDialogProps> = ({ userId, proposal, sourceLabel, onClose, onApplied }) => {
  const [existing, setExisting] = useState<ExistingProfileData | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Build the list of selectable rows once the current profile is known.
  const rows = useMemo(() => {
    if (!proposal || !existing) return null;
    const fieldRows = FIELD_ORDER.filter((k) => !isBlank(proposal.fields[k])).map((k) => {
      const current = existing.fields[k];
      const same = show(current).trim().toLowerCase() === show(proposal.fields[k]).trim().toLowerCase();
      return { id: `field:${k}`, key: k, value: proposal.fields[k], current, same, replaces: !isBlank(current) && !same };
    }).filter((r) => !r.same);

    const knownSkills = proposal.skills
      .map((name) => ({ name, skillId: existing.skillCatalogue.get(name.toLowerCase()) }))
      .filter((s): s is { name: string; skillId: string } => !!s.skillId);
    const skillRows = knownSkills.map((s) => ({ id: `skill:${s.skillId}`, ...s, exists: existing.ownedSkillIds.has(s.skillId) }));
    const unknownSkills = proposal.skills.filter((name) => !existing.skillCatalogue.has(name.toLowerCase()));

    return {
      fieldRows,
      skillRows,
      unknownSkills,
      experiences: proposal.experiences.map((e, i) => ({ id: `exp:${i}`, item: e, exists: existing.experienceKeys.has(experienceKey(e)) })),
      education: proposal.education.map((e, i) => ({ id: `edu:${i}`, item: e, exists: existing.educationKeys.has(educationKey(e)) })),
      achievements: proposal.achievements.map((a, i) => ({ id: `ach:${i}`, item: a, exists: existing.achievementKeys.has(achievementKey(a)) })),
      socialLinks: proposal.socialLinks.map((l, i) => ({ id: `link:${i}`, item: l, exists: existing.socialUrls.has(l.url.trim().toLowerCase()) })),
    };
  }, [proposal, existing]);

  useEffect(() => {
    setExisting(null);
    setChecked(new Set());
    if (!proposal) return;
    let cancelled = false;
    loadExistingProfileData(userId, proposal).then((data) => { if (!cancelled) setExisting(data); });
    return () => { cancelled = true; };
  }, [proposal, userId]);

  // Default selection: empty profile fields and new items are ticked; nothing overwrites silently.
  useEffect(() => {
    if (!rows) return;
    const next = new Set<string>();
    rows.fieldRows.forEach((r) => { if (!r.replaces) next.add(r.id); });
    [...rows.skillRows, ...rows.experiences, ...rows.education, ...rows.achievements, ...rows.socialLinks]
      .forEach((r) => { if (!r.exists) next.add(r.id); });
    setChecked(next);
  }, [rows]);

  const toggle = (id: string) => setChecked((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const apply = async () => {
    if (!rows) return;
    setSaving(true);
    const fields: Record<string, unknown> = {};
    rows.fieldRows.filter((r) => checked.has(r.id)).forEach((r) => { fields[r.key] = r.value; });
    const picked = <T,>(list: { id: string; item: T; exists: boolean }[]) => list.filter((r) => checked.has(r.id) && !r.exists).map((r) => r.item);
    const { applied, errors } = await applyProfileImport(userId, {
      fields,
      skillIds: rows.skillRows.filter((r) => checked.has(r.id) && !r.exists).map((r) => r.skillId),
      experiences: picked(rows.experiences),
      education: picked(rows.education),
      achievements: picked(rows.achievements),
      socialLinks: picked(rows.socialLinks),
    });
    setSaving(false);
    if (errors.length) toast({ title: tr('profileImport.partial'), description: errors[0], variant: 'destructive' });
    if (applied > 0) {
      toast({ title: tr('profileImport.applied', { n: applied }) });
      window.dispatchEvent(new Event('profile-updated'));
      onApplied?.();
    }
    if (applied > 0 || !errors.length) onClose();
  };

  const empty = !!proposal && isEmptyImport(proposal);
  const nothingNew = !!rows && rows.fieldRows.length === 0 && [...rows.skillRows, ...rows.experiences, ...rows.education, ...rows.achievements, ...rows.socialLinks].every((r) => r.exists);

  const rp = (id: string) => ({ id, checked: checked.has(id), onToggle: toggle });

  return (
    <Dialog open={!!proposal} onOpenChange={(o) => { if (!o && !saving) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{tr('profileImport.title')}</DialogTitle>
          <DialogDescription>
            {tr('profileImport.description')}
            {sourceLabel ? ` ${tr('profileImport.source', { name: sourceLabel })}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {empty ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{tr('profileImport.nothing')}</p>
          ) : !rows ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : nothingNew ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{tr('profileImport.nothingNew')}</p>
          ) : (
            <>
              {rows.fieldRows.length > 0 && (
                <Section title={tr('profileImport.sectionInfo')}>
                  {rows.fieldRows.map((r) => (
                    <Row key={r.id} {...rp(r.id)}>
                      <p className="font-medium">{tr(FIELD_LABEL[r.key])}</p>
                      <p className="break-words whitespace-pre-line">{show(r.value)}</p>
                      {r.replaces && (
                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 break-words">
                          {tr('profileImport.replaces', { value: show(r.current).slice(0, 160) })}
                        </p>
                      )}
                    </Row>
                  ))}
                </Section>
              )}

              {(rows.skillRows.length > 0 || rows.unknownSkills.length > 0) && (
                <Section title={tr('profileImport.sectionSkills')}>
                  {rows.skillRows.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rows.skillRows.map((r) => <Row key={r.id} {...rp(r.id)} disabled={r.exists}><span className="break-words">{r.name}</span></Row>)}
                    </div>
                  )}
                  {rows.unknownSkills.length > 0 && (
                    <p className="text-xs text-muted-foreground break-words">{tr('profileImport.unknownSkills', { list: rows.unknownSkills.join(', ') })}</p>
                  )}
                </Section>
              )}

              {rows.experiences.length > 0 && (
                <Section title={tr('profileImport.sectionExperience')}>
                  {rows.experiences.map((r) => (
                    <Row key={r.id} {...rp(r.id)} disabled={r.exists}>
                      <p className="font-medium break-words">{r.item.title}{r.item.organization ? ` · ${r.item.organization}` : ''}</p>
                      <p className="text-xs text-muted-foreground">{[years(r.item.start_date, r.item.end_date, r.item.is_current), r.item.city].filter(Boolean).join(' · ')}</p>
                      {r.item.description && <p className="mt-1 text-xs line-clamp-2 break-words">{r.item.description}</p>}
                    </Row>
                  ))}
                </Section>
              )}

              {rows.education.length > 0 && (
                <Section title={tr('profileImport.sectionEducation')}>
                  {rows.education.map((r) => (
                    <Row key={r.id} {...rp(r.id)} disabled={r.exists}>
                      <p className="font-medium break-words">{r.item.institution}</p>
                      <p className="text-xs text-muted-foreground break-words">
                        {[r.item.degree, r.item.field_of_study, years(r.item.start_year, r.item.end_year)].filter(Boolean).join(' · ')}
                      </p>
                    </Row>
                  ))}
                </Section>
              )}

              {rows.achievements.length > 0 && (
                <Section title={tr('profileImport.sectionAchievements')}>
                  {rows.achievements.map((r) => (
                    <Row key={r.id} {...rp(r.id)} disabled={r.exists}>
                      <p className="font-medium break-words">{r.item.title}{r.item.date ? ` · ${r.item.date.slice(0, 4)}` : ''}</p>
                      {r.item.description && <p className="text-xs line-clamp-2 break-words">{r.item.description}</p>}
                    </Row>
                  ))}
                </Section>
              )}

              {rows.socialLinks.length > 0 && (
                <Section title={tr('profileImport.sectionLinks')}>
                  {rows.socialLinks.map((r) => (
                    <Row key={r.id} {...rp(r.id)} disabled={r.exists}>
                      <p className="font-medium capitalize">{r.item.platform}</p>
                      <p className="text-xs text-muted-foreground break-all">{r.item.url}</p>
                    </Row>
                  ))}
                </Section>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{tr('common.cancel')}</Button>
          <Button onClick={apply} disabled={saving || !rows || checked.size === 0}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {tr('profileImport.apply', { n: checked.size })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImportDialog;
