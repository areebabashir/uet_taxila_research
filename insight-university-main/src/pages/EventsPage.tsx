import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, type Event } from '@/lib/api';

const EventsPage = () => {
  // Fetch events from API
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: api.getEvents,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const displayEvents = Array.isArray(events) ? events : [];

  const renderEventCard = (event: Event) => (
    <Card key={event._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <Badge variant={event.status === 'Approved' ? 'default' : 'secondary'}>
            {event.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {event.eventType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {event.startTime} - {event.endTime}
        </p>
        {event.keywords && event.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.keywords.map((keyword: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container-max py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">UET Taxila Events</h1>
          <p className="text-muted-foreground">
            Engineering conferences, workshops, and symposiums at UET Taxila
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading events...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-4">Failed to load events</div>
            <div className="text-muted-foreground">Please check your connection and try again</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map(renderEventCard)}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default EventsPage;