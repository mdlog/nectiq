import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  
  const isHorizontal = className?.includes('horizontal-banners');

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["/api/banners", position],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const activeBanners = banners.filter(banner => !dismissedBanners.includes(banner.id));
  
  // Auto slideshow functionality
  useEffect(() => {
    console.log('🎬 [BANNER] Slideshow check:', { 
      isHorizontal, 
      bannersCount: activeBanners.length, 
      isAutoSliding,
      shouldSlide: isHorizontal && activeBanners.length >= 4 && isAutoSliding 
    });
    
    if (isHorizontal && activeBanners.length >= 4 && isAutoSliding) {
      console.log('🎬 [BANNER] Starting auto slideshow...');
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          const newIndex = prev + 3 >= activeBanners.length ? 0 : prev + 3;
          console.log('🎬 [BANNER] Auto slide:', prev, '->', newIndex);
          return newIndex;
        });
      }, 3000); // 3 seconds per slide for more dynamic feeling
      
      return () => {
        console.log('🎬 [BANNER] Clearing slideshow interval');
        clearInterval(interval);
      };
    }
  }, [isHorizontal, activeBanners.length, isAutoSliding]);

  const handleDismiss = (bannerId: number) => {
    setDismissedBanners(prev => [...prev, bannerId]);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const goToPrevious = () => {
    setIsAutoSliding(false);
    setCurrentIndex(prev => prev === 0 ? Math.max(0, activeBanners.length - 3) : Math.max(0, prev - 3));
    // Re-enable auto sliding after 10 seconds of manual interaction
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const goToNext = () => {
    setIsAutoSliding(false);
    setCurrentIndex(prev => (prev + 3) >= activeBanners.length ? 0 : prev + 3);
    // Re-enable auto sliding after 10 seconds of manual interaction
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  if (activeBanners.length === 0) {
    return null;
  }

  // Horizontal layout for banner section above Live Activity - Running Text Style
  if (isHorizontal) {
    return (
      <div className={`${className} overflow-hidden`}>
        <div className="relative bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg py-3">
          {/* Running text container */}
          <div className="overflow-hidden">
            <div className="flex animate-scroll-left whitespace-nowrap">
              {/* Duplicate banners for continuous scroll */}
              {[...activeBanners, ...activeBanners].map((banner, index) => (
                <div
                  key={`${banner.id}-${index}`}
                  className="inline-flex items-center mx-8 cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={() => handleBannerClick(banner)}
                >
                  {/* Banner content as running text */}
                  <div className="flex items-center gap-3">
                    {banner.imageUrl && (
                      <img
                        src={banner.imageUrl}
                        alt="Banner"
                        className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="text-white font-medium text-sm">
                      🔥 {banner.title || "Special Offer"} 
                      {banner.linkUrl && (
                        <ExternalLink size={12} className="inline ml-2" />
                      )}
                    </span>
                  </div>
                  
                  {/* Separator */}
                  <div className="mx-8 text-purple-400">•</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Admin dismiss controls - floating */}
          {userRole === 'admin' && (
            <div className="absolute top-1 right-2 flex gap-1">
              {activeBanners.map((banner) => (
                <button
                  key={banner.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(banner.id);
                  }}
                  className="p-1 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white transition-colors text-xs"
                  title={`Dismiss banner ${banner.id}`}
                >
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original vertical layout (sidebar)
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