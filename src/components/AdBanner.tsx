import { useEffect, useState } from "react";
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

  if (!ads.length) return null;

  const handleClick = async (ad: any) => {
    await supabase.from("advertisements").update({ clicks_count: (ad.clicks_count || 0) + 1 }).eq("id", ad.id);
    if (ad.link_url) window.open(ad.link_url, "_blank", "noopener,noreferrer");
  };

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
