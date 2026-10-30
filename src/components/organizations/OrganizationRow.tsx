import React from 'react';
import { BadgeCheck, Edit, Globe, Mail, MapPin, Phone, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

export interface OrganizationRowData {
  id: string | number;
  name: string;
  type: string;
  location: string;
  logo?: string;
  description: string;
  customDescription?: string;
  rating?: number;
  verified?: boolean;
  phone?: string;
  email?: string;
  website?: string;
}

interface OrganizationRowProps {
  org: OrganizationRowData;
  onView?: () => void;
  onEdit?: () => void;
}

/** Écusson : initiale ou logo dans un carré arrondi, comme un blason de club. */
export const OrganizationCrest: React.FC<{ name: string; logo?: string; className?: string }> = ({ name, logo, className = 'h-14 w-14 text-xl' }) => (
  <div className={`shrink-0 rounded-2xl bg-stage text-stage-foreground font-display font-semibold grid place-items-center overflow-hidden ring-1 ring-border ${className}`}>
    {logo && !logo.endsWith('placeholder.svg') ? (
      <img src={logo} alt="" className="h-full w-full object-cover" />
    ) : (
      <span aria-hidden>{name.charAt(0)}</span>
    )}
  </div>
);

/**
 * Une organisation dans l'annuaire. Tout ce qui peut être long (nom, lieu,
 * description) a min-w-0 / truncate, et les groupes de boutons passent à la
 * ligne : la ligne ne dépasse jamais la largeur de l'écran.
 */
const OrganizationRow: React.FC<OrganizationRowProps> = ({ org, onView, onEdit }) => {
  const { t } = useLanguage();

  return (
    <article className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <OrganizationCrest name={org.name} logo={org.logo} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 font-semibold text-base leading-snug">
              <span className="truncate">{org.name}</span>
              {org.verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label={t('orgDisc.verified')} />
              )}
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
              {org.type && <span>{org.type}</span>}
              {org.location && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{org.location}</span>
                </span>
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {typeof org.rating === 'number' && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {org.rating.toFixed(1)}
              </span>
            )}
            {onEdit && (
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} aria-label={t('common.edit')}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {org.customDescription && (
          <p className="mt-2 text-sm font-medium text-foreground break-words">{org.customDescription}</p>
        )}
        {org.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2 break-words">{org.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {onView && (
            <Button size="sm" onClick={onView}>
              <Users className="h-4 w-4" />
              {t('orgDisc.viewProfileBtn')}
            </Button>
          )}
          {org.phone && (
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${org.phone}`}><Phone className="h-3.5 w-3.5" />{t('orgDisc.call')}</a>
            </Button>
          )}
          {org.email && (
            <Button size="sm" variant="outline" asChild>
              <a href={`mailto:${org.email}`}><Mail className="h-3.5 w-3.5" />{t('orgDisc.email')}</a>
            </Button>
          )}
          {org.website && (
            <Button size="icon" variant="ghost" className="h-9 w-9" asChild>
              <a href={`https://${org.website}`} target="_blank" rel="noopener noreferrer" aria-label={org.website}>
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default OrganizationRow;
