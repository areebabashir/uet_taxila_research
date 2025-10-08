import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, User, Calendar, GraduationCap, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api, type FYPProject } from '@/lib/api';

const FYPProjects = () => {
  // Fetch FYP projects from API
  const { data: fypProjects, isLoading, error } = useQuery({
    queryKey: ['fyp-projects'],
    queryFn: api.getFYPProjects,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const displayFYPProjects = Array.isArray(fypProjects) ? fypProjects : [];

  const renderFYPProjectCard = (project: FYPProject) => (
    <Card key={project._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <Badge variant={project.status === 'Completed' ? 'default' : project.status === 'In Progress' ? 'secondary' : 'outline'}>
            {project.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          {project.projectType}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Student: {project.student?.name || 'Unknown'} ({project.student?.rollNumber || 'Unknown'})
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Supervisor: {project.supervisor && typeof project.supervisor === 'object' ? `${project.supervisor.firstName} ${project.supervisor.lastName}` : project.supervisor || 'Not assigned'}
        </p>
        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground mb-3">
          {project.description}
        </p>
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Technologies:</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {project.technologies.map((tech: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UET Taxila Final Year Projects</h1>
          <p className="text-gray-600">Explore innovative engineering projects completed by UET Taxila students</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading FYP projects...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-2">Failed to load FYP projects</p>
            <div className="text-muted-foreground">Please check your connection and try again</div>
          </div>
        ) : displayFYPProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">No FYP projects found</p>
            <div className="text-muted-foreground">Check back later for new projects</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFYPProjects.map(renderFYPProjectCard)}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default FYPProjects;