import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdBannerProps {
  placement?: "feed" | "sidebar" | "banner";
  className?: string;
}

interface Advertisement {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  link_url?: string | null;
}

export const AdBanner = ({ placement = "feed", className = "" }: AdBannerProps) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("advertisements")
        .select("*")
        .eq("placement", placement)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setAds(data);
    })();
  }, [placement]);

  // Track impressions once per ad per mount
  useEffect(() => {
    ads.forEach((ad) => {
      if (trackedRef.current.has(ad.id)) return;
      trackedRef.current.add(ad.id);
      supabase.rpc("increment_ad_view", { _ad_id: ad.id });
    });
  }, [ads]);

  if (!ads.length) return null;

  const handleClick = async (ad: Advertisement) => {
    await supabase.rpc("increment_ad_click", { _ad_id: ad.id });
    if (ad.link_url) window.open(ad.link_url, "_blank", "noopener,noreferrer");
  };

  // Compact layout for sidebar
  if (placement === "sidebar") {
    return (
      <div className={`w-full min-w-0 space-y-2 ${className}`}>
        {ads.map((ad) => (
          <Card
            key={ad.id}
            onClick={() => handleClick(ad)}
            className="w-full min-w-0 cursor-pointer overflow-hidden hover:shadow-md transition border-primary/20"
          >
            {/* Mobile: vertical compact layout */}
            <div className="flex flex-col sm:hidden">
              {ad.image_url && (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="h-20 w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="px-1 py-0 text-[9px] leading-4">Реклама</Badge>
                  {ad.link_url && <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />}
                </div>
                <h4 className="break-words text-[11px] font-semibold leading-snug line-clamp-2">{ad.title}</h4>
                {ad.description && (
                  <p className="break-words text-[10px] leading-snug text-muted-foreground line-clamp-2">{ad.description}</p>
                )}
                {ad.link_url && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-1 h-6 w-full text-[10px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(ad);
                    }}
                  >
                    Подробнее
                  </Button>
                )}
              </div>
            </div>

            {/* Desktop/tablet: horizontal layout */}
            <div className="hidden min-w-0 items-start gap-2 p-2 sm:flex">
              {ad.image_url && (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
              )}
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="mb-1 flex min-w-0 items-center gap-1">
                  <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[9px] leading-4">Реклама</Badge>
                  {ad.link_url && <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />}
                </div>
                <h4 className="break-words text-xs font-semibold leading-snug line-clamp-2">{ad.title}</h4>
                {ad.description && (
                  <p className="mt-0.5 break-words text-[10px] leading-snug text-muted-foreground line-clamp-2">{ad.description}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {ads.map((ad) => (
        <Card
          key={ad.id}
          onClick={() => handleClick(ad)}
          className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow border-primary/20"
        >
          {ad.image_url && (
            <img src={ad.image_url} alt={ad.title} className="w-full h-32 object-cover" />
          )}
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px]">Реклама</Badge>
              {ad.link_url && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
            </div>
            <h4 className="font-semibold text-sm">{ad.title}</h4>
            {ad.description && <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AdBanner;
