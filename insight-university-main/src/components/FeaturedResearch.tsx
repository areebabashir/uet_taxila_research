import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, User, Award, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const FeaturedResearch = () => {
  // Fetch publications from API
  const { data: publications, isLoading, error } = useQuery({
    queryKey: ['featured-publications'],
    queryFn: api.getPublications,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Get the latest 4 publications as featured research
  const featuredResearch = Array.isArray(publications) 
    ? publications
        .sort((a: any, b: any) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime())
        .slice(0, 4)
        .map((pub: any) => ({
          title: pub.title,
          author: pub.authors?.map((author: any) => author.name).join(', ') || 'Unknown Author',
          year: new Date(pub.publicationDate).getFullYear().toString(),
          category: pub.researchArea || pub.category || 'Research',
          doi: pub.doi || 'N/A',
          image: '/api/placeholder/400/250',
          abstract: pub.abstract || pub.description || 'No abstract available for this publication.',
          quartile: pub.quartile || 'Q2',
          impact: pub.impactFactor || 'N/A',
          status: pub.status || 'Published'
        }))
    : [];

  if (isLoading) {
    return (
      <section className="section-padding bg-card">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">UET Taxila Featured Research</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover groundbreaking engineering research and publications from UET Taxila's distinguished faculty members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="card-academic p-0 overflow-hidden animate-pulse">
                <div className="h-48 bg-muted"></div>
                <div className="p-6">
                  <div className="h-4 w-3/4 bg-muted rounded mb-3"></div>
                  <div className="h-4 w-1/2 bg-muted rounded mb-4"></div>
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="h-8 w-24 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding bg-card">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">UET Taxila Featured Research</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover groundbreaking engineering research and publications from UET Taxila's distinguished faculty members
            </p>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 text-lg mb-2">Failed to load research publications</p>
            <div className="text-gray-600">Please check your connection and try again</div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredResearch.length === 0) {
    return (
      <section className="section-padding bg-card">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">UET Taxila Featured Research</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover groundbreaking engineering research and publications from UET Taxila's distinguished faculty members
            </p>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg mb-2">No publications found</p>
            <div className="text-gray-500">Check back later for featured research publications</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-card">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="font-poppins text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">UET Taxila Featured Research</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover groundbreaking engineering research and publications from UET Taxila's distinguished faculty members
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {featuredResearch.map((research, index) => (
            <div key={index} className="card-academic p-0 overflow-hidden group">
              <div className="relative h-48 bg-gradient-primary flex items-center justify-center">
                <div className="text-white text-6xl font-bold opacity-20">
                  {research.category.split(' ')[0]}
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    research.quartile === 'Q1' ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    {research.quartile} Journal
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded text-sm font-medium">
                    Impact: {research.impact}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {research.year}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {research.author.length > 30 ? research.author.substring(0, 30) + '...' : research.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {research.category}
                  </div>
                </div>
                
                <h3 className="font-poppins text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {research.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {research.abstract}
                </p>
                
                <div className="flex items-center justify-between">
                  {research.doi !== 'N/A' ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://doi.org/${research.doi}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        DOI Link
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      No DOI
                    </Button>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    Status: {research.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild className="btn-hero text-lg px-8 py-3">
            <Link to="/publications">
              View All Publications
              <ExternalLink className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedResearch;