import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Users, CheckCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, type Project } from '@/lib/api';

const Projects = () => {
  // Fetch projects from API
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: api.getProjects,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const displayProjects = Array.isArray(projects) ? projects : [];

  const renderProjectCard = (project: Project) => (
    <Card key={project._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <Badge variant={project.status === 'Active' ? 'default' : project.status === 'Completed' ? 'secondary' : 'outline'}>
            {project.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {project.projectType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Users className="h-4 w-4" />
          PI: {project.principalInvestigator && typeof project.principalInvestigator === 'object' ? `${project.principalInvestigator.firstName} ${project.principalInvestigator.lastName}` : project.principalInvestigator || 'Not assigned'}
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Funding: ${project.funding?.totalAmount || 0} ({project.funding?.fundingAgency?.name || 'Unknown'})
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Duration: {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          {project.description}
        </p>
        {project.keywords && project.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {project.keywords.map((keyword: string, index: number) => (
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UET Taxila Research Projects</h1>
          <p className="text-gray-600">Explore ongoing and completed engineering research projects at UET Taxila</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading projects...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-2">Failed to load projects</p>
            <div className="text-muted-foreground">Please check your connection and try again</div>
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">No projects found</p>
            <div className="text-muted-foreground">Check back later for new projects</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map(renderProjectCard)}
          </div>
        )}
        </div>

      <Footer />
    </div>
  );
};

export default Projects;