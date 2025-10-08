import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, User, Calendar, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, type Thesis } from '@/lib/api';

const Theses = () => {
  // Fetch theses from API
  const { data: theses, isLoading, error } = useQuery({
    queryKey: ['theses'],
    queryFn: api.getTheses,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const displayTheses = Array.isArray(theses) ? theses : [];

  const renderThesisCard = (thesis: Thesis) => (
    <Card key={thesis._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{thesis.title}</CardTitle>
          <Badge variant={thesis.status === 'Completed' ? 'default' : 'secondary'}>
            {thesis.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          {thesis.thesisType} Thesis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Student: {thesis.student?.name || 'Unknown'} ({thesis.student?.rollNumber || 'Unknown'})
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Research Area: {thesis.researchArea}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Supervisor: {thesis.supervisor && typeof thesis.supervisor === 'object' ? `${thesis.supervisor.firstName} ${thesis.supervisor.lastName}` : thesis.supervisor || 'Not assigned'}
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Started: {new Date(thesis.startDate).toLocaleDateString()}
          {thesis.completionDate && (
            <span> - Completed: {new Date(thesis.completionDate).toLocaleDateString()}</span>
          )}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          {thesis.abstract}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {thesis.keywords.map((keyword: string, index: number) => (
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
          <h1 className="text-4xl font-bold text-primary mb-2">UET Taxila Theses</h1>
          <p className="text-muted-foreground">
            Engineering graduate research projects and doctoral dissertations from UET Taxila
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading theses...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-4">Failed to load theses</div>
            <div className="text-muted-foreground">Please check your connection and try again</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTheses.map(renderThesisCard)}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Theses;