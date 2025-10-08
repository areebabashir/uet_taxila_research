import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, type Publication } from '@/lib/api';

const Publications = () => {
  // Fetch publications from API
  const { data: publications, isLoading, error } = useQuery({
    queryKey: ['publications'],
    queryFn: api.getPublications,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const displayPublications = Array.isArray(publications) ? publications : [];

  const renderPublicationCard = (publication: Publication) => (
    <Card key={publication._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{publication.title}</CardTitle>
          <Badge variant={publication.status === 'Published' ? 'default' : 'secondary'}>
            {publication.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {publication.publicationType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          Authors: {publication.authors.map(author => author.name).join(', ')}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          Published: {new Date(publication.publicationDate).toLocaleDateString()}
        </p>
        {publication.doi && (
          <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            DOI: 
            <a 
              href={`https://doi.org/${publication.doi}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {publication.doi}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        )}
        {publication.keywords && publication.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {publication.keywords.map((keyword: string, index: number) => (
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
          <h1 className="text-4xl font-bold text-primary mb-2">UET Taxila Publications</h1>
          <p className="text-muted-foreground">
            Engineering research papers, journal articles, and conference proceedings from UET Taxila
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading publications...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-destructive mb-4">Failed to load publications</div>
            <div className="text-muted-foreground">Please check your connection and try again</div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPublications.map(renderPublicationCard)}
        </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Publications;