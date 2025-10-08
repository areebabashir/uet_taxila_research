import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import DashboardStats from '@/components/DashboardStats';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardCharts from '@/components/DashboardCharts';
import FacultyFilter from '@/components/FacultyFilter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Briefcase, Plane, Calendar, User, MapPin, TrendingUp, BarChart3, Menu, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, api, type Publication, type Thesis, type TravelGrant, type FYPProject, type Event, type Project, type Stats } from '@/lib/api';
import { type FacultyName, type DepartmentName, getFacultyByDepartment } from '@/lib/facultyConstants';

// Empty data structure for fallback
const emptyData = {
  publications: [],
  theses: [],
  travelGrants: [],
  fypProjects: [],
  events: [],
  projects: [],
};

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [showCharts, setShowCharts] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Faculty and Department filter states
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyName | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentName | null>(null);

  // Fetch all data and stats
  const { data: apiData, isLoading: dataLoading, error: dataError } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: dashboardApi.getAllData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });


  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getAllStats,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: fundingStats, isLoading: fundingLoading, error: fundingError } = useQuery({
    queryKey: ['dashboard-funding'],
    queryFn: api.getFundingStats,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isLoading = dataLoading || statsLoading || fundingLoading;
  const error = dataError || statsError || fundingError;
  
  // Filter data based on faculty and department selection
  const filterDataByFacultyDepartment = (data: any[]) => {
    if (!selectedFaculty && !selectedDepartment) {
      return data; // Show all data
    }
    
    return data.filter((item) => {
      const itemDepartment = item.department || item.student?.department;
      
      if (selectedDepartment) {
        // If specific department is selected, show only that department
        return itemDepartment === selectedDepartment;
      } else if (selectedFaculty) {
        // If faculty is selected but no specific department, show all departments in that faculty
        const faculty = getFacultyByDepartment(itemDepartment);
        return faculty === selectedFaculty;
      }
      
      return true;
    });
  };

  const rawData = {
    publications: (apiData as any)?.publications || [],
    theses: (apiData as any)?.theses || [],
    travelGrants: (apiData as any)?.travelGrants || [],
    fypProjects: (apiData as any)?.fypProjects || [],
    events: (apiData as any)?.events || [],
    projects: (apiData as any)?.projects || [],
  };

  const safeData = {
    publications: filterDataByFacultyDepartment(rawData.publications),
    theses: filterDataByFacultyDepartment(rawData.theses),
    travelGrants: filterDataByFacultyDepartment(rawData.travelGrants),
    fypProjects: filterDataByFacultyDepartment(rawData.fypProjects),
    events: filterDataByFacultyDepartment(rawData.events),
    projects: filterDataByFacultyDepartment(rawData.projects),
  };


  const safeStats = statsData || {
    publications: { total: 0, byStatus: {} },
    theses: { total: 0, byStatus: {} },
    travelGrants: { total: 0, byStatus: {} },
    fypProjects: { total: 0, byStatus: {} },
    events: { total: 0, byStatus: {} },
    projects: { total: 0, byStatus: {} },
    users: { total: 0, byStatus: {} },
  };

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    if (mobileSidebarOpen && window.innerWidth < 1024) {
      setMobileSidebarOpen(false);
    }
  }, [filters, searchTerm]);

  const handleOverlayClick = () => {
    setMobileSidebarOpen(false);
  };

  // Faculty and Department filter handlers
  const handleFacultySelect = (faculty: FacultyName | null) => {
    if (faculty === "all" || faculty === null) {
      setSelectedFaculty(null);
    } else {
      setSelectedFaculty(faculty);
    }
    setSelectedDepartment(null); // Reset department when faculty changes
  };

  const handleDepartmentSelect = (department: DepartmentName | null) => {
    if (department === "all" || department === null) {
      setSelectedDepartment(null);
    } else {
      setSelectedDepartment(department);
    }
  };

  const handleFilterReset = () => {
    setSelectedFaculty(null);
    setSelectedDepartment(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileSidebarOpen]);

  const getFilteredData = (data: any[], type: string) => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(item => {
      if (!item) return false;

      // Enhanced search functionality
      const matchesSearch = searchTerm === '' || 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.abstract?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keywords?.some((keyword: string) => keyword?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.authors?.some((author: string) => author?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.principalInvestigator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supervisor?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Enhanced filter functionality
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || value === '') return true;

        switch (key) {
          case 'department':
            return item.student?.department?.toLowerCase().includes(String(value).toLowerCase()) ||
                   item.department?.toLowerCase().includes(String(value).toLowerCase()) ||
                   item.principalInvestigator?.department?.toLowerCase().includes(String(value).toLowerCase()) ||
                   item.applicant?.department?.toLowerCase().includes(String(value).toLowerCase());
          case 'keywords':
            return Array.isArray(value) ? 
              value.some((keyword: string) => item.keywords?.includes(keyword)) : true;
          case 'dateRange':
            if (!item.publicationDate && !item.startDate && !item.createdAt) return true;
            const itemDate = new Date(item.publicationDate || item.startDate || item.createdAt);
            const now = new Date();
            switch (value) {
              case 'last-month':
                return itemDate >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
              case 'last-3-months':
                return itemDate >= new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
              case 'last-6-months':
                return itemDate >= new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
              case 'last-year':
                return itemDate >= new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
              case 'last-2-years':
                return itemDate >= new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
              default:
                return true;
            }
          default:
            return true;
        }
      });

      return matchesSearch && matchesFilters;
    });
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const renderCard = (item: any, type: string) => {
    if (!item) return null;

    const baseClasses = "h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] border-l-4 border-l-transparent hover:border-l-blue-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800";

    switch (type) {
      case 'publications':
        return (
          <Card key={item._id || item.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-tight">{item.title || 'Untitled'}</CardTitle>
                <Badge variant={item.status === 'Published' ? 'default' : 'secondary'} className="shrink-0">
                  {item.status || 'Unknown'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {item.publicationType || 'Unknown Type'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authors</p>
                <p className="text-sm">{item.authors?.join(', ') || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-sm">
                  {item.publicationDate ? new Date(item.publicationDate).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              {item.doi && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">DOI</p>
                  <p className="text-sm font-mono">{item.doi}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-1 pt-2">
                {(item.keywords || []).map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'theses':
        return (
          <Card key={item._id || item.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-tight">{item.title || 'Untitled'}</CardTitle>
                <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'} className="shrink-0">
                  {item.status || 'Unknown'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                {item.thesisType || 'Unknown'} Thesis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Student</p>
                <p className="text-sm">
                  {item.student?.name || 'Unknown'} ({item.student?.rollNumber || 'Unknown'})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Research Area</p>
                <p className="text-sm">{item.researchArea || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Started</p>
                <p className="text-sm">
                  {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                {(item.keywords || []).map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'travel':
        return (
          <Card key={item._id || item.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-tight">{item.title || item.event?.name || item.purpose || 'Travel Grant'}</CardTitle>
                <Badge variant={item.status === 'Approved' ? 'default' : 'secondary'} className="shrink-0">
                  {item.status || 'Unknown'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                {item.event?.type || 'Travel Grant'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{item.travelDetails?.destinationCity || 'Unknown Location'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {item.travelDetails?.departureDate ? new Date(item.travelDetails.departureDate).toLocaleDateString() : 'Unknown'} - {item.travelDetails?.returnDate ? new Date(item.travelDetails.returnDate).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Funding</p>
                <p className="text-sm">${item.funding?.totalAmount || 0} ({item.funding?.fundingAgency?.name || 'Unknown'})</p>
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                {(item.keywords || []).map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'fyp':
        return (
          <Card key={item._id || item.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-tight">{item.title || item.description || 'FYP Project'}</CardTitle>
                <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'}>
                  {item.status || 'Unknown'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {item.projectType || 'Final Year Project'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Student: {item.student?.name || 'Unknown'} ({item.student?.rollNumber || 'Unknown'})</p>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Supervisor: {item.supervisor?.firstName || 'Unknown'} {item.supervisor?.lastName || ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Unknown'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                {(item.keywords || []).map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'events':
        return (
          <Card key={item._id || item.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                <Badge variant={item.status === 'Approved' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {item.eventType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{item.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                {item.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'projects':
        return (
          <Card key={item._id || item.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {item.projectType}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="text-sm">${item.totalBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Funding Agency</p>
                <p className="text-sm">{item.fundingAgency.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-2">
                {item.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { value: 'overview', label: 'Overview', count: 0 },
    { value: 'publications', label: 'Publications', count: safeData.publications.length },
    { value: 'theses', label: 'Theses', count: safeData.theses.length },
    { value: 'travel', label: 'Travel Grants', count: safeData.travelGrants.length },
    { value: 'fyp', label: 'FYP Projects', count: safeData.fypProjects.length },
    { value: 'events', label: 'Events', count: safeData.events.length },
    { value: 'projects', label: 'Research Projects', count: safeData.projects.length },
  ];


  const stats = {
    totalPublications: safeData.publications.length,
    totalTheses: safeData.theses.length,
    totalTravelGrants: safeData.travelGrants.length,
    totalFYPProjects: safeData.fypProjects.length,
    totalEvents: safeData.events.length,
    totalResearchProjects: safeData.projects.length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex flex-1 relative">
        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}

        {/* Sidebar */}
        <div 
          className={`
            fixed lg:sticky top-0 left-0 z-50 lg:z-auto
            h-screen lg:h-[calc(100vh-4rem)]
            transform transition-transform duration-300 ease-in-out
            ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <DashboardSidebar 
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            data={safeData}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 transition-all duration-300 lg:ml-0">
          <div className="p-4 lg:p-6">
            {/* Header with Gradient Background */}
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="lg:hidden bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/20"
                      onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    >
                      {mobileSidebarOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4 text-white" />}
                    </Button>
                    <div className="flex-1">
                      <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2 animate-fade-in">
                        🎓 UET Taxila Research Dashboard
                      </h1>
                      <p className="text-sm lg:text-lg text-white/90 leading-relaxed">
                        Comprehensive overview of research activities, publications, and academic excellence
                      </p>
                      {error && (
                        <div className="mt-4 p-4 bg-red-500/20 border border-red-300/30 rounded-xl backdrop-blur-sm">
                          <p className="text-sm text-white">
                            <strong>⚠️ Connection Error:</strong> Unable to connect to backend server. Please check your connection.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant={showCharts ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowCharts(!showCharts)}
                    className="hidden sm:flex bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/20 text-white"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {showCharts ? 'Hide' : 'Show'} Charts
                  </Button>
                </div>
                
                {/* Quick Stats in Header */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
                  {[
                    { label: 'Publications', value: stats.totalPublications, icon: <BookOpen className="h-4 w-4" /> },
                    { label: 'Theses', value: stats.totalTheses, icon: <GraduationCap className="h-4 w-4" /> },
                    { label: 'FYP Projects', value: stats.totalFYPProjects, icon: <Briefcase className="h-4 w-4" /> },
                    { label: 'Travel Grants', value: stats.totalTravelGrants, icon: <Plane className="h-4 w-4" /> },
                    { label: 'Events', value: stats.totalEvents, icon: <Calendar className="h-4 w-4" /> },
                    { label: 'Research Projects', value: stats.totalResearchProjects, icon: <TrendingUp className="h-4 w-4" /> },
                  ].map((stat, index) => (
                    <div 
                      key={stat.label}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2 text-white/80 mb-1">
                        {stat.icon}
                        <span className="text-xs font-medium">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Faculty and Department Filter */}
            <FacultyFilter
              selectedFaculty={selectedFaculty}
              selectedDepartment={selectedDepartment}
              onFacultySelect={handleFacultySelect}
              onDepartmentSelect={handleDepartmentSelect}
              onReset={handleFilterReset}
            />

            {/* Tabs with Enhanced Design */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-8">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 h-auto bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 p-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                  {tabs.map((tab, index) => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value} 
                      className="flex flex-col items-center gap-2 text-xs p-3 h-auto rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span className="font-semibold">{tab.label.split(' ')[0]}</span>
                      {tab.label.split(' ')[1] && (
                        <span className="text-[10px] opacity-80">{tab.label.split(' ')[1]}</span>
                      )}
                      {tab.count > 0 && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-white/20 border-white/30">
                          {tab.count}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                <DashboardStats data={safeData} stats={safeStats} funding={fundingStats} />

                {showCharts && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Analytics & Reports</h2>
                    </div>
                      <DashboardCharts 
                        data={safeData} 
                        stats={safeStats} 
                        funding={fundingStats}
                        selectedFaculty={selectedFaculty}
                        selectedDepartment={selectedDepartment}
                      />
                  </div>
                )}
              </TabsContent>

              {/* Individual Category Tabs */}
              {tabs.slice(1).map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-0">
                  {isLoading ? (
                    <div className="text-center py-16">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-500 border-t-transparent mb-4"></div>
                      <div className="text-lg font-medium text-muted-foreground animate-pulse">
                        Loading {tab.label.toLowerCase()}...
                      </div>
                      <div className="text-sm text-muted-foreground/60 mt-2">Please wait while we fetch the data</div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="text-destructive mb-4">Failed to load {tab.label.toLowerCase()}</div>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 animate-fade-in">
                        {(() => {
                          const dataKey = tab.value === 'travel' ? 'travelGrants' : 
                                         tab.value === 'fyp' ? 'fypProjects' : 
                                         tab.value === 'publications' ? 'publications' :
                                         tab.value === 'theses' ? 'theses' :
                                         tab.value === 'events' ? 'events' :
                                         tab.value === 'projects' ? 'projects' : tab.value;
                          const data = safeData[dataKey as keyof typeof safeData];
                          return getFilteredData(data, tab.value).map((item, index) => (
                            <div 
                              key={item._id || item.id || index}
                              className="animate-fade-in-up"
                              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
                            >
                              {renderCard(item, tab.value)}
                            </div>
                          ));
                        })()}
                      </div>
                      
                      {(() => {
                        const dataKey = tab.value === 'travel' ? 'travelGrants' : 
                                       tab.value === 'fyp' ? 'fypProjects' : 
                                       tab.value === 'publications' ? 'publications' :
                                       tab.value === 'theses' ? 'theses' :
                                       tab.value === 'events' ? 'events' :
                                       tab.value === 'projects' ? 'projects' : tab.value;
                        const data = safeData[dataKey as keyof typeof safeData];
                        return getFilteredData(data, tab.value).length === 0;
                      })() && (
                        <div className="text-center py-16">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 mb-4">
                            <span className="text-4xl">📭</span>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {(searchTerm || Object.keys(filters).length > 0) 
                              ? `No ${tab.label} Found`
                              : `No ${tab.label} Available`
                            }
                          </h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            {(searchTerm || Object.keys(filters).length > 0) 
                              ? `We couldn't find any ${tab.label.toLowerCase()} matching your search criteria. Try adjusting your filters.`
                              : `There are currently no ${tab.label.toLowerCase()} in the system.`
                            }
                          </p>
                          {(searchTerm || Object.keys(filters).length > 0) && (
                          <Button 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                            onClick={() => {
                              setSearchTerm('');
                              setFilters({});
                              setMobileSidebarOpen(false);
                            }}
                          >
                            Clear All Filters
                          </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;