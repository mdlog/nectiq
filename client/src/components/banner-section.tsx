import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ExternalLink, X } from "lucide-react";
import { useState } from "react";

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  priority: number;
}

interface BannerSectionProps {
  position?: string;
  className?: string;
  userRole?: 'admin' | 'user';
}

export function BannerSection({ position = "below_live_prices", className = "", userRole = "user" }: BannerSectionProps) {
  const [dismissedBanners, setDismissedBanners] = useState<number[]>([]);

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["/api/banners", position],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const activeBanners = banners.filter(banner => !dismissedBanners.includes(banner.id));

  const handleDismiss = (bannerId: number) => {
    setDismissedBanners(prev => [...prev, bannerId]);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {activeBanners.map((banner) => (
        <Card 
          key={banner.id} 
          className={`relative overflow-hidden bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 ${
            banner.linkUrl ? 'cursor-pointer hover:shadow-lg' : ''
          }`}
          onClick={() => handleBannerClick(banner)}
        >
          {/* Dismiss Button - Only for Admin */}
          {userRole === 'admin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(banner.id);
              }}
              className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Banner Image Only */}
              {banner.imageUrl && (
                <div className="w-full">
                  <img
                    src={banner.imageUrl}
                    alt="Banner"
                    className="w-full h-auto object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
      ))}
    </div>
  );
}