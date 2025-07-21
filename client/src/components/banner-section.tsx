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
  
  const isHorizontal = className?.includes('horizontal-banners');

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ["/api/banners", position],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const activeBanners = banners.filter(banner => !dismissedBanners.includes(banner.id));
  
  // Static display - no auto slideshow

  const handleDismiss = (bannerId: number) => {
    setDismissedBanners(prev => [...prev, bannerId]);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? Math.max(0, activeBanners.length - 3) : Math.max(0, prev - 3));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 3) >= activeBanners.length ? 0 : prev + 3);
  };

  if (activeBanners.length === 0) {
    return null;
  }

  // Horizontal layout for banner section above Live Activity
  if (isHorizontal) {
    const visibleBanners = activeBanners.length <= 3 
      ? activeBanners 
      : activeBanners.slice(currentIndex, currentIndex + 3);

    return (
      <div className={`${className}`}>
        <div className="relative">
          {/* Navigation buttons - only show if more than 3 banners */}
          {activeBanners.length >= 4 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-surface/80 hover:bg-surface border-surface-light"
              >
                <ChevronLeft size={16} className="text-white" />
              </Button>
              
              <Button
                variant="outline" 
                size="sm"
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-surface/80 hover:bg-surface border-surface-light"
              >
                <ChevronRight size={16} className="text-white" />
              </Button>
            </>
          )}

          {/* Banners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-8">
            {visibleBanners.map((banner) => (
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
                    {/* Banner Image */}
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

          {/* Dot indicators for navigation */}
          {activeBanners.length >= 4 && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: Math.ceil(activeBanners.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index * 3);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    Math.floor(currentIndex / 3) === index 
                      ? 'bg-purple-500' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
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