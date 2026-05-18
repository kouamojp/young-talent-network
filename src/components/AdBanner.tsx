import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface AdBannerProps {
  placement?: "feed" | "sidebar" | "banner";
  className?: string;
}

export const AdBanner = ({ placement = "feed", className = "" }: AdBannerProps) => {
  const [ads, setAds] = useState<any[]>([]);
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

  const handleClick = async (ad: any) => {
    await supabase.rpc("increment_ad_click", { _ad_id: ad.id });
    if (ad.link_url) window.open(ad.link_url, "_blank", "noopener,noreferrer");
  };

  // Compact layout for sidebar
  if (placement === "sidebar") {
    return (
      <div className={`space-y-2 ${className}`}>
        {ads.map((ad) => (
          <Card
            key={ad.id}
            onClick={() => handleClick(ad)}
            className="cursor-pointer overflow-hidden hover:shadow-md transition border-primary/20 p-2 flex gap-2 items-center"
          >
            {ad.image_url && (
              <img src={ad.image_url} alt={ad.title} className="w-12 h-12 rounded object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <Badge variant="secondary" className="text-[9px] px-1 py-0">Ad</Badge>
                {ad.link_url && <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />}
              </div>
              <h4 className="font-semibold text-xs truncate">{ad.title}</h4>
              {ad.description && (
                <p className="text-[10px] text-muted-foreground line-clamp-1">{ad.description}</p>
              )}
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
