import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, type TravelGrant } from '@/lib/api';

const TravelGrants = () => {
  // Fetch travel grants from API
  const { data: travelGrants, isLoading, error } = useQuery({
    queryKey: ['travel-grants'],
    queryFn: api.getTravelGrants,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const displayTravelGrants = Array.isArray(travelGrants) ? travelGrants : [];

  const renderTravelGrantCard = (grant: TravelGrant) => (
    <Card key={grant._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{grant.title}</CardTitle>
          <Badge variant={grant.status === 'Approved' ? 'default' : 'secondary'}>
            {grant.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Plane className="h-4 w-4" />
          {grant.event?.type || 'Unknown'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {grant.event?.location || 'Unknown'}
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {new Date(grant.startDate).toLocaleDateString()} - {new Date(grant.endDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Funding: ${grant.funding?.totalAmount || 0} ({grant.funding?.fundingAgency?.name || 'Unknown'})
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Applicant: {grant.applicant && typeof grant.applicant === 'object' ? `${grant.applicant.firstName} ${grant.applicant.lastName}` : grant.applicant || 'Unknown'}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Purpose: {grant.purpose}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {grant.keywords.map((keyword: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container-max py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">UET Taxila Travel Grants</h1>
          <p className="text-muted-foreground">
            Engineering conference funding opportunities and research visits for UET Taxila faculty and students
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading travel grants...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-4">Failed to load travel grants</div>
            <div className="text-muted-foreground">Please check your connection and try again</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTravelGrants.map(renderTravelGrantCard)}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default TravelGrants;