import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Plane, 
  Calendar,
  Loader2,
  ArrowLeft,
  Award
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

const FacultyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('publications');

  // Fetch faculty member data
  const { data: facultyMember, isLoading: facultyLoading, error: facultyError } = useQuery({
    queryKey: ['faculty-member', id],
    queryFn: () => api.getUserById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch faculty publications
  const { data: publications, isLoading: publicationsLoading } = useQuery({
    queryKey: ['faculty-publications', id],
    queryFn: () => api.getPublications(),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch faculty theses
  const { data: theses, isLoading: thesesLoading } = useQuery({
    queryKey: ['faculty-theses', id],
    queryFn: () => api.getTheses(),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch faculty projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['faculty-projects', id],
    queryFn: () => api.getProjects(),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch faculty travel grants
  const { data: travelGrants, isLoading: travelLoading } = useQuery({
    queryKey: ['faculty-travel', id],
    queryFn: () => api.getTravelGrants(),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Filter data for this faculty member (only when facultyMember is available)
  const facultyPublications = facultyMember ? (publications || []).filter(pub => {
    // Skip null/undefined items
    if (!pub) return false;
    
    // Check if any author matches the faculty member
    return pub.authors?.some((author: any) => {
      // Handle different author data structures
      if (typeof author === 'string') {
        return author.toLowerCase().includes(facultyMember.firstName?.toLowerCase()) ||
               author.toLowerCase().includes(facultyMember.lastName?.toLowerCase());
      }
      if (typeof author === 'object' && author) {
        return author.faculty === id || 
               author._id === id ||
               (author.firstName && author.lastName && 
                author.firstName === facultyMember.firstName && 
                author.lastName === facultyMember.lastName);
      }
      return false;
    });
  }) : [];

  const facultyTheses = facultyMember ? (theses || []).filter(thesis => {
    // Skip null/undefined items
    if (!thesis) return false;
    
    // Check supervisor field - could be ID, object, or name
    if (typeof thesis.supervisor === 'string') {
      return thesis.supervisor === id ||
             thesis.supervisor.toLowerCase().includes(facultyMember.firstName?.toLowerCase()) ||
             thesis.supervisor.toLowerCase().includes(facultyMember.lastName?.toLowerCase());
    }
    if (typeof thesis.supervisor === 'object' && thesis.supervisor) {
      return thesis.supervisor._id === id ||
             thesis.supervisor.id === id ||
             (thesis.supervisor.firstName === facultyMember.firstName && 
              thesis.supervisor.lastName === facultyMember.lastName);
    }
    return false;
  }) : [];

  const facultyProjects = facultyMember ? (projects || []).filter(project => {
    // Skip null/undefined items
    if (!project) return false;
    
    // Check principal investigator field
    if (typeof project.principalInvestigator === 'string') {
      return project.principalInvestigator === id ||
             project.principalInvestigator.toLowerCase().includes(facultyMember.firstName?.toLowerCase()) ||
             project.principalInvestigator.toLowerCase().includes(facultyMember.lastName?.toLowerCase());
    }
    if (typeof project.principalInvestigator === 'object' && project.principalInvestigator) {
      return project.principalInvestigator._id === id ||
             project.principalInvestigator.id === id ||
             (project.principalInvestigator.firstName === facultyMember.firstName && 
              project.principalInvestigator.lastName === facultyMember.lastName);
    }
    return false;
  }) : [];

  const facultyTravelGrants = facultyMember ? (travelGrants || []).filter(travel => {
    // Skip null/undefined items
    if (!travel) return false;
    
    // Check applicant field
    if (typeof travel.applicant === 'string') {
      return travel.applicant === id ||
             travel.applicant.toLowerCase().includes(facultyMember.firstName?.toLowerCase()) ||
             travel.applicant.toLowerCase().includes(facultyMember.lastName?.toLowerCase());
    }
    if (typeof travel.applicant === 'object' && travel.applicant) {
      return travel.applicant._id === id ||
             travel.applicant.id === id ||
             (travel.applicant.firstName === facultyMember.firstName && 
              travel.applicant.lastName === facultyMember.lastName);
    }
    return false;
  }) : [];

  // Debug logging (only when facultyMember is available)
  if (facultyMember) {
    console.log('Faculty Member:', facultyMember);
    console.log('All Publications:', publications);
    console.log('All Theses:', theses);
    console.log('All Projects:', projects);
    console.log('All Travel Grants:', travelGrants);
    console.log('Filtered Publications:', facultyPublications);
    console.log('Filtered Theses:', facultyTheses);
    console.log('Filtered Projects:', facultyProjects);
    console.log('Filtered Travel Grants:', facultyTravelGrants);
  }

  const renderPublicationCard = (publication: any) => (
    <Card key={publication._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight">{publication.title}</CardTitle>
          <Badge variant="outline">{publication.publicationType}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {publication.journalName || publication.conferenceName || 'Publication'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          {publication.authors?.map((author: any) => author.name).join(', ')}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(publication.publicationDate).toLocaleDateString()}
          </span>
          <Badge variant="secondary">{publication.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderThesisCard = (thesis: any) => (
    <Card key={thesis._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight">{thesis.title}</CardTitle>
          <Badge variant="outline">{thesis.thesisType}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          {thesis.degree} Thesis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Student:</strong> {thesis.student?.name} ({thesis.student?.rollNumber})
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Research Area:</strong> {thesis.researchArea}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Started: {new Date(thesis.startDate).toLocaleDateString()}
          </span>
          <Badge variant="secondary">{thesis.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderProjectCard = (project: any) => (
    <Card key={project._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
          <Badge variant="outline">{project.projectType}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Research Project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Funding:</strong> ${project.funding?.totalAmount || 0} ({project.funding?.fundingAgency?.name || 'Unknown'})
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
          </span>
          <Badge variant="secondary">{project.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderTravelGrantCard = (travel: any) => (
    <Card key={travel._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight">
            {travel.event?.name || travel.purpose}
          </CardTitle>
          <Badge variant="outline">{travel.event?.type || 'Travel Grant'}</Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Plane className="h-4 w-4" />
          {travel.event?.location || 'Travel Grant'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Funding:</strong> ${travel.funding?.totalAmount || 0} ({travel.funding?.fundingAgency?.name || 'Unknown'})
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(travel.event?.startDate || travel.createdAt).toLocaleDateString()}
          </span>
          <Badge variant="secondary">{travel.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  if (facultyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading faculty profile...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (facultyError || !facultyMember) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 text-lg mb-2">Faculty member not found</p>
            <Button onClick={() => navigate('/faculty')} variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Faculty
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            onClick={() => navigate('/faculty')} 
            variant="outline" 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Faculty
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Faculty Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center pb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {facultyMember.profileImage ? (
                    <img 
                      src={facultyMember.profileImage} 
                      alt={`${facultyMember.firstName} ${facultyMember.lastName}`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                  {facultyMember.firstName} {facultyMember.lastName}
                </CardTitle>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Building className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 font-medium">{facultyMember.department}</span>
                </div>
                
                <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                  <Award className="h-3 w-3 mr-1" />
                  {facultyMember.designation || 'Faculty Member'}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{facultyMember.email}</span>
                </div>
                
                {facultyMember.position && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-green-500" />
                      Position
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {facultyMember.position}
                    </Badge>
                  </div>
                )}

                {facultyMember.isActive !== undefined && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-500" />
                      Status
                    </h4>
                    <Badge variant={facultyMember.isActive ? "default" : "secondary"} className="text-xs">
                      {facultyMember.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Research Portfolio
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Explore the research contributions and academic achievements
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="publications">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Publications ({facultyPublications.length})
                    </TabsTrigger>
                    <TabsTrigger value="theses">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Theses ({facultyTheses.length})
                    </TabsTrigger>
                    <TabsTrigger value="projects">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Projects ({facultyProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="travel">
                      <Plane className="h-4 w-4 mr-2" />
                      Travel ({facultyTravelGrants.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="publications" className="mt-6">
                    <div className="space-y-4">
                      {publicationsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <span className="ml-2 text-gray-600">Loading publications...</span>
                        </div>
                      ) : facultyPublications.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg">No publications found</p>
                          <p className="text-gray-500">This faculty member hasn't published any papers yet.</p>
                        </div>
                      ) : (
                        facultyPublications.map(renderPublicationCard)
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="theses" className="mt-6">
                    <div className="space-y-4">
                      {thesesLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                          <span className="ml-2 text-gray-600">Loading theses...</span>
                        </div>
                      ) : facultyTheses.length === 0 ? (
                        <div className="text-center py-12">
                          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg">No thesis supervisions found</p>
                          <p className="text-gray-500">This faculty member hasn't supervised any theses yet.</p>
                        </div>
                      ) : (
                        facultyTheses.map(renderThesisCard)
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="mt-6">
                    <div className="space-y-4">
                      {projectsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                          <span className="ml-2 text-gray-600">Loading projects...</span>
                        </div>
                      ) : facultyProjects.length === 0 ? (
                        <div className="text-center py-12">
                          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg">No projects found</p>
                          <p className="text-gray-500">This faculty member hasn't led any research projects yet.</p>
                        </div>
                      ) : (
                        facultyProjects.map(renderProjectCard)
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="travel" className="mt-6">
                    <div className="space-y-4">
                      {travelLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                          <span className="ml-2 text-gray-600">Loading travel grants...</span>
                        </div>
                      ) : facultyTravelGrants.length === 0 ? (
                        <div className="text-center py-12">
                          <Plane className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg">No travel grants found</p>
                          <p className="text-gray-500">This faculty member hasn't received any travel grants yet.</p>
                        </div>
                      ) : (
                        facultyTravelGrants.map(renderTravelGrantCard)
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FacultyProfile;