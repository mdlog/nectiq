import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ExternalLink, Star, Clock } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description?: string;
  eventType: string;
  isActive: boolean;
  isFeatured?: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  organizer?: string;
  location?: string;
  imageUrl?: string;
  linkUrl?: string;
}

export function EventsSection() {
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    retry: false,
  });

  // Filter to show only active events, sorted by priority and featured status
  const activeEvents = events
    .filter((event: Event) => event.isActive)
    .sort((a: Event, b: Event) => {
      // Featured events first, then by priority, then by start date
      if (a.isFeatured !== b.isFeatured) return b.isFeatured - a.isFeatured;
      if (a.priority !== b.priority) return b.priority - a.priority;
      return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
    })
    .slice(0, 6); // Show max 6 events

  if (activeEvents.length === 0) {
    return null; // Don't show section if no events
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'announcement': return '📢';
      case 'update': return '🔄';
      case 'promotion': return '🎉';
      case 'partnership': return '🤝';
      case 'community': return '👥';
      case 'technical': return '🔧';
      default: return '📅';
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'announcement': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'update': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'promotion': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'partnership': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'community': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
      case 'technical': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  const isEventLive = (event: Event) => {
    const now = new Date();
    const startDate = event.startDate ? new Date(event.startDate) : null;
    const endDate = event.endDate ? new Date(event.endDate) : null;
    
    if (startDate && endDate) {
      return now >= startDate && now <= endDate;
    }
    if (startDate && !endDate) {
      return now >= startDate;
    }
    return false;
  };

  const isEventUpcoming = (event: Event) => {
    const now = new Date();
    const startDate = event.startDate ? new Date(event.startDate) : null;
    return startDate && now < startDate;
  };

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 text-blue-400" size={20} />
          Latest Events & Announcements
        </CardTitle>
        <p className="text-slate-400 text-sm">Stay updated with the latest happenings in the Nectiq ecosystem</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeEvents.map((event: Event) => (
            <div 
              key={event.id} 
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
            >
              <div className="space-y-3">
                {/* Event Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                    {event.isFeatured && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {isEventLive(event) && (
                      <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        🔴 Live
                      </Badge>
                    )}
                    {isEventUpcoming(event) && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="w-3 h-3 mr-1" />
                        Upcoming
                      </Badge>
                    )}
                  </div>
                  {event.imageUrl && (
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden ml-2 flex-shrink-0">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Event Title and Type */}
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
                    {event.title}
                  </h3>
                  <Badge variant="outline" className={`text-xs ${getEventTypeColor(event.eventType)}`}>
                    {event.eventType}
                  </Badge>
                </div>

                {/* Event Description */}
                {event.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* Event Details */}
                <div className="space-y-1">
                  {event.organizer && (
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <span className="mr-1">👤</span>
                      <span className="truncate">{event.organizer}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  {event.startDate && (
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{new Date(event.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                      {event.endDate && (
                        <span> - {new Date(event.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {event.linkUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                    onClick={() => window.open(event.linkUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Learn More
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}