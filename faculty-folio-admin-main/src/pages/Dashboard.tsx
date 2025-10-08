import React from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  FileText,
  Users,
  AlertCircle,
  TrendingUp,
  Plus,
  CheckCircle,
  Download,
  GraduationCap,
  Presentation,
  Plane,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Chart color palette
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Dashboard() {
  const { user } = useAuth();
  
  // Determine if user is admin or faculty
  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty';

  // Fetch statistics
  const { data: publicationStats } = useQuery({
    queryKey: ['publication-stats'],
    queryFn: () => apiClient.getPublicationStats(),
  });

  const { data: projectStats } = useQuery({
    queryKey: ['project-stats'],
    queryFn: () => apiClient.getProjectStats(),
  });

  const { data: fypStats } = useQuery({
    queryKey: ['fyp-stats'],
    queryFn: () => apiClient.getFYPStats(),
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => apiClient.getUserStats(),
  });

  const { data: eventStats } = useQuery({
    queryKey: ['event-stats'],
    queryFn: () => apiClient.getEventStats(),
  });

  const { data: travelStats } = useQuery({
    queryKey: ['travel-stats'],
    queryFn: () => apiClient.getTravelStats(),
  });

  // Fetch recent publications for pending approvals
  const { data: recentPublications } = useQuery({
    queryKey: ['recent-publications-pending'],
    queryFn: () => apiClient.getPublications({ page: 1, limit: 10, status: 'Pending' }),
  });

  // Fetch recent projects for pending approvals
  const { data: recentProjects } = useQuery({
    queryKey: ['recent-projects-pending'],
    queryFn: () => apiClient.getProjects({ page: 1, limit: 10, status: 'Pending' }),
  });

  // Fetch recent travel grants for pending approvals
  const { data: recentTravelGrants } = useQuery({
    queryKey: ['recent-travel-pending'],
    queryFn: () => apiClient.getTravelGrants({ page: 1, limit: 10, status: 'Pending' }),
  });

  // Fetch recent events for pending approvals
  const { data: recentEvents } = useQuery({
    queryKey: ['recent-events-pending'],
    queryFn: () => apiClient.getEvents({ page: 1, limit: 10, status: 'Pending' }),
  });

  // Fetch all publications for chart data
  const { data: allPublications } = useQuery({
    queryKey: ['all-publications'],
    queryFn: () => apiClient.getPublications({ page: 1, limit: 1000 }),
  });

  // Fetch all projects for chart data
  const { data: allProjects } = useQuery({
    queryKey: ['all-projects'],
    queryFn: () => apiClient.getProjects({ page: 1, limit: 1000 }),
  });

  // Process real data for charts
  const publicationsByDepartment = React.useMemo(() => {
    if (!allPublications?.data?.publications) return [];
    
    const deptCounts: { [key: string]: number } = {};
    allPublications.data.publications.forEach((pub: any) => {
      pub.authors?.forEach((author: any) => {
        const dept = author.department || 'Other';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
    });
    
    return Object.entries(deptCounts)
      .map(([department, publications]) => ({ department, publications }))
      .sort((a, b) => b.publications - a.publications)
      .slice(0, 5);
  }, [allPublications]);

  const fundingByAgency = React.useMemo(() => {
    if (!allProjects?.data?.projects) return [];
    
    const agencyCounts: { [key: string]: number } = {};
    allProjects.data.projects.forEach((project: any) => {
      const agency = project.fundingAgency?.name || 'Other';
      const amount = project.totalBudget || 0;
      agencyCounts[agency] = (agencyCounts[agency] || 0) + amount;
    });
    
    return Object.entries(agencyCounts)
      .map(([agency, amount], index) => ({ 
        agency, 
        amount, 
        color: CHART_COLORS[index % CHART_COLORS.length] 
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [allProjects]);

  const yearlyTrends = React.useMemo(() => {
    if (!allPublications?.data?.publications || !allProjects?.data?.projects) return [];
    
    const years = [2020, 2021, 2022, 2023, 2024];
    return years.map(year => {
      const yearPubs = allPublications.data.publications.filter((pub: any) => 
        new Date(pub.publicationDate).getFullYear() === year
      ).length;
      
      const yearProjects = allProjects.data.projects.filter((proj: any) => 
        new Date(proj.startDate).getFullYear() === year
      ).length;
      
      const yearFunding = allProjects.data.projects
        .filter((proj: any) => new Date(proj.startDate).getFullYear() === year)
        .reduce((sum: number, proj: any) => sum + (proj.totalBudget || 0), 0) / 1000000;
      
      return {
        year: year.toString(),
        publications: yearPubs,
        projects: yearProjects,
        funding: Number(yearFunding.toFixed(1))
      };
    });
  }, [allPublications, allProjects]);

  const pendingApprovals = React.useMemo(() => {
    const items: any[] = [];
    
    // Add pending publications
    if (recentPublications?.data?.publications) {
      recentPublications.data.publications.slice(0, 2).forEach((pub: any) => {
        items.push({
          id: pub._id,
          type: 'Publication',
          title: pub.title,
          faculty: pub.authors?.[0]?.name || 'Unknown',
          status: 'pending'
        });
      });
    }
    
    // Add pending projects
    if (recentProjects?.data?.projects) {
      recentProjects.data.projects.slice(0, 1).forEach((proj: any) => {
        items.push({
          id: proj._id,
          type: 'Project',
          title: proj.title,
          faculty: proj.principalInvestigator || 'Unknown',
          status: 'pending'
        });
      });
    }
    
    // Add pending travel grants
    if (recentTravelGrants?.data?.travelGrants) {
      recentTravelGrants.data.travelGrants.slice(0, 1).forEach((travel: any) => {
        items.push({
          id: travel._id,
          type: 'Travel Grant',
          title: travel.title || travel.purpose,
          faculty: travel.applicant || 'Unknown',
          status: 'pending'
        });
      });
    }
    
    return items.slice(0, 4);
  }, [recentPublications, recentProjects, recentTravelGrants]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? `Welcome back, ${user?.firstName}! Here's an overview of the entire research management system.`
              : `Welcome back, ${user?.firstName}! Here's an overview of your research activities.`
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
          <Button size="sm" className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            {isAdmin ? 'Quick Actions' : 'Add New'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isAdmin ? "Total Publications" : "My Publications"}
          value={publicationStats?.data.totalPublications?.toString() || "0"}
          change={`${publicationStats?.data.recentPublications || 0} this month`}
          changeType="positive"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title={isAdmin ? "Active Projects" : "My Projects"}
          value={projectStats?.data.activeProjects?.toString() || "0"}
          change={`$${((projectStats?.data.totalFunding || 0) / 1000000).toFixed(1)}M total funding`}
          changeType="neutral"
          icon={<FileText className="h-4 w-4" />}
        />
        {isAdmin && (
          <StatCard
            title="Faculty Members"
            value={userStats?.data.totalUsers?.toString() || "0"}
            change={`${userStats?.data.recentUsers || 0} new this month`}
            changeType="positive"
            icon={<Users className="h-4 w-4" />}
          />
        )}
        <StatCard
          title={isAdmin ? "FYP Projects" : "My FYP Projects"}
          value={fypStats?.data.totalFYPProjects?.toString() || "0"}
          change={`${fypStats?.data.ongoingFYP || 0} ongoing`}
          changeType="neutral"
          icon={<GraduationCap className="h-4 w-4" />}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isAdmin ? "Events & Workshops" : "My Events"}
          value={eventStats?.data.totalEvents?.toString() || "0"}
          change={`${eventStats?.data.upcomingEvents || 0} upcoming`}
          changeType="positive"
          icon={<Presentation className="h-4 w-4" />}
        />
        <StatCard
          title={isAdmin ? "Travel Grants" : "My Travel Grants"}
          value={travelStats?.data.totalTravelGrants?.toString() || "0"}
          change={`${travelStats?.data.approvedTravelGrants || 0} approved`}
          changeType="neutral"
          icon={<Plane className="h-4 w-4" />}
        />
        <StatCard
          title={isAdmin ? "Completed Projects" : "My Completed Projects"}
          value={projectStats?.data.completedProjects?.toString() || "0"}
          change="This year"
          changeType="positive"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        {isAdmin && (
          <StatCard
            title="Pending Reviews"
            value={publicationStats?.data.pendingPublications?.toString() || "0"}
            change="Action required"
            changeType="negative"
            icon={<AlertCircle className="h-4 w-4" />}
          />
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publications by Department */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Publications by Department
            </CardTitle>
            <CardDescription>Current academic year performance</CardDescription>
          </CardHeader>
          <CardContent>
            {publicationsByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={publicationsByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="publications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No publication data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funding Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Funding Distribution by Agency</CardTitle>
            <CardDescription>
              Total active funding: $
              {(fundingByAgency.reduce((sum, item) => sum + item.amount, 0) / 1000000).toFixed(2)}M
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fundingByAgency.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fundingByAgency}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ agency, percent }) => `${agency} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {fundingByAgency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${(value as number / 1000000).toFixed(1)}M`, "Funding"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No funding data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Yearly Trends */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Research Activity Trends</CardTitle>
          <CardDescription>5-year overview of publications, projects, and funding (in millions)</CardDescription>
        </CardHeader>
        <CardContent>
          {yearlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={yearlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="publications"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  name="Publications"
                />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  name="Projects"
                />
                <Line
                  type="monotone"
                  dataKey="funding"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={3}
                  name="Funding ($M)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <p>No trend data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Pending Approvals</span>
            <Badge variant="destructive" className="text-xs">
              {pendingApprovals.length} pending
            </Badge>
          </CardTitle>
          <CardDescription>Items requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Submitted by {item.faculty}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                    <Button size="sm" className="bg-gradient-success">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending approvals at this time</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BookOpen className="h-6 w-6" />
              <span>Add Publication</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Manage Faculty</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Export Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}