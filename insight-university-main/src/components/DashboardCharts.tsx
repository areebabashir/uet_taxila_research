import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, ComposedChart } from 'recharts';
import type { Stats } from '@/lib/api';
import { FacultyName, DepartmentName, getFacultyByDepartment, getDepartmentsByFaculty } from '@/lib/facultyConstants';

interface DashboardChartsProps {
  data: {
    publications: any[];
    theses: any[];
    travelGrants: any[];
    fypProjects: any[];
    events: any[];
    projects: any[];
  };
  stats?: {
    publications: Stats;
    theses: Stats;
    travelGrants: Stats;
    fypProjects: Stats;
    events: Stats;
    projects: Stats;
    users: Stats;
  };
  funding?: {
    overview: {
      totalFunding: number;
      totalFundingSources: number;
      averageFunding: number;
      projectFunding: number;
      travelFunding: number;
      projectCount: number;
      travelGrantCount: number;
    };
    combined: {
      byAgency: { [key: string]: number };
      byDepartment: { [key: string]: number };
      byYear: { [key: string]: number };
      topAgencies: [string, number][];
      topDepartments: [string, number][];
    };
  };
  selectedFaculty?: FacultyName | null;
  selectedDepartment?: DepartmentName | null;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, stats, funding, selectedFaculty, selectedDepartment }) => {
  // Helper function to filter data based on faculty and department
  const filterDataByFacultyDepartment = (items: any[], departmentField: string = 'department') => {
    if (!selectedFaculty && !selectedDepartment) {
      return items;
    }

    return items.filter(item => {
      const itemDepartment = item[departmentField] || 
                            item.student?.[departmentField] || 
                            item.principalInvestigator?.[departmentField] ||
                            item.authors?.[0]?.[departmentField];

      if (selectedDepartment) {
        return itemDepartment === selectedDepartment;
      }

      if (selectedFaculty) {
        const facultyDepartments = getDepartmentsByFaculty(selectedFaculty);
        return facultyDepartments.includes(itemDepartment as DepartmentName);
      }

      return true;
    });
  };

  // Apply filters to all data
  const filteredData = {
    publications: filterDataByFacultyDepartment(data.publications || []),
    theses: filterDataByFacultyDepartment(data.theses || [], 'department'),
    travelGrants: filterDataByFacultyDepartment(data.travelGrants || []),
    fypProjects: filterDataByFacultyDepartment(data.fypProjects || [], 'department'),
    events: filterDataByFacultyDepartment(data.events || []),
    projects: filterDataByFacultyDepartment(data.projects || [])
  };

  // Return early if no data is available
  if (!data || (!data.publications && !data.theses && !data.events && !data.projects && !data.fypProjects && !data.travelGrants)) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-muted-foreground mt-4">Loading chart data...</p>
      </div>
    );
  }

  // Prepare real data for charts with null checks using filtered data
  const publicationTypes = filteredData.publications.reduce((acc: any, pub: any) => {
    const type = pub.publicationType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const thesisTypes = filteredData.theses.reduce((acc: any, thesis: any) => {
    const type = thesis.thesisType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const eventTypes = filteredData.events.reduce((acc: any, event: any) => {
    const type = event.eventType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const projectTypes = filteredData.projects.reduce((acc: any, project: any) => {
    const type = project.projectType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Generate monthly data from filtered data
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = months.indexOf(month);
      const monthDate = new Date(currentYear, monthIndex, 1);
      
      const publications = filteredData.publications.filter(pub => {
        const pubDate = new Date(pub.publicationDate);
        return pubDate.getMonth() === monthIndex && pubDate.getFullYear() === currentYear;
      }).length;

      const theses = filteredData.theses.filter(thesis => {
        const thesisDate = new Date(thesis.startDate);
        return thesisDate.getMonth() === monthIndex && thesisDate.getFullYear() === currentYear;
      }).length;

      const events = filteredData.events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === currentYear;
      }).length;

      const projects = filteredData.projects.filter(project => {
        const projectDate = new Date(project.startDate);
        return projectDate.getMonth() === monthIndex && projectDate.getFullYear() === currentYear;
      }).length;

      return {
        month,
        publications,
        theses,
        events,
        projects,
        total: publications + theses + events + projects
      };
    });
  };

  const monthlyData = generateMonthlyData();

  // Department distribution from filtered data
  const departmentData = (() => {
    const deptMap = new Map();
    
    // Process publications
    filteredData.publications.forEach(pub => {
      pub.authors?.forEach((author: any) => {
        const dept = author.department || 'Unknown';
        if (!deptMap.has(dept)) {
          deptMap.set(dept, { name: dept, publications: 0, projects: 0, theses: 0, students: 0 });
        }
        deptMap.get(dept).publications++;
      });
    });

    // Process projects
    filteredData.projects.forEach(project => {
      const dept = project.principalInvestigator?.department || 'Unknown';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { name: dept, publications: 0, projects: 0, theses: 0, students: 0 });
      }
      deptMap.get(dept).projects++;
    });

    // Process theses
    filteredData.theses.forEach(thesis => {
      const dept = thesis.student?.department || 'Unknown';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { name: dept, publications: 0, projects: 0, theses: 0, students: 0 });
      }
      deptMap.get(dept).theses++;
      deptMap.get(dept).students++;
    });

    return Array.from(deptMap.values()).slice(0, 6); // Top 6 departments
  })();

  // Status distribution pie chart data with filtered data
  const statusData = [
    { 
      name: 'Published/Completed', 
      value: filteredData.publications.filter(p => p.status === 'Published').length + 
             filteredData.theses.filter(t => t.status === 'Completed').length + 
             filteredData.projects.filter(p => p.status === 'Completed').length,
      color: '#10b981',
      fill: '#10b981'
    },
    { 
      name: 'Active/In Progress', 
      value: filteredData.projects.filter(p => p.status === 'Active').length + 
             filteredData.theses.filter(t => t.status === 'In Progress').length +
             filteredData.fypProjects.filter(f => f.status === 'In Progress').length,
      color: '#3b82f6',
      fill: '#3b82f6'
    },
    { 
      name: 'Under Review', 
      value: filteredData.publications.filter(p => p.status === 'Under Review').length +
             filteredData.travelGrants.filter(t => t.status === 'Under Review').length,
      color: '#f59e0b',
      fill: '#f59e0b'
    },
    { 
      name: 'Approved', 
      value: filteredData.events.filter(e => e.status === 'Approved').length +
             filteredData.travelGrants.filter(t => t.status === 'Approved').length,
      color: '#8b5cf6',
      fill: '#8b5cf6'
    },
  ].filter(item => item.value > 0);

  // Research activity overview with filtered data
  const activityData = [
    { name: 'Publications', value: filteredData.publications.length, color: '#3b82f6' },
    { name: 'Theses', value: filteredData.theses.length, color: '#10b981' },
    { name: 'Projects', value: filteredData.projects.length, color: '#f59e0b' },
    { name: 'Events', value: filteredData.events.length, color: '#8b5cf6' },
    { name: 'FYP Projects', value: filteredData.fypProjects.length, color: '#ef4444' },
    { name: 'Travel Grants', value: filteredData.travelGrants.length, color: '#06b6d4' },
  ].filter(item => item.value > 0);

  // Yearly trends from filtered data
  const yearlyTrends = (() => {
    const yearMap = new Map();
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 4; year <= currentYear; year++) {
      yearMap.set(year, { year, publications: 0, theses: 0, projects: 0 });
    }

    // Count publications by year
    filteredData.publications.forEach(pub => {
      const year = new Date(pub.publicationDate).getFullYear();
      if (yearMap.has(year)) {
        yearMap.get(year).publications++;
      }
    });

    // Count theses by year
    filteredData.theses.forEach(thesis => {
      const year = new Date(thesis.startDate).getFullYear();
      if (yearMap.has(year)) {
        yearMap.get(year).theses++;
      }
    });

    // Count projects by year
    filteredData.projects.forEach(project => {
      const year = new Date(project.startDate).getFullYear();
      if (yearMap.has(year)) {
        yearMap.get(year).projects++;
      }
    });

    return Array.from(yearMap.values());
  })();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Trends with Area Chart */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
              📈 Monthly Research Activity
            </CardTitle>
            <CardDescription className="text-white/80 font-medium">
              Research output trends over the current year
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorPublications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTheses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="publications" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="url(#colorPublications)" 
                  strokeWidth={2}
                  name="Publications"
                />
                <Area 
                  type="monotone" 
                  dataKey="theses" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="url(#colorTheses)" 
                  strokeWidth={2}
                  name="Theses"
                />
                <Area 
                  type="monotone" 
                  dataKey="events" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="url(#colorEvents)" 
                  strokeWidth={2}
                  name="Events"
                />
              </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

        {/* Research Activity Overview */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              Research Activity Overview
            </CardTitle>
            <CardDescription className="text-gray-600">
              Distribution of different research activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Detailed Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Publication Types */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              Publication Types Distribution
            </CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of different publication types
            </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(publicationTypes).map(([type, count]) => ({ type, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="type" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Performance */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              Department Performance
            </CardTitle>
            <CardDescription className="text-gray-600">
              Research output by department
            </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="publications" 
                  fill="#f59e0b" 
                  name="Publications"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="projects" 
                  fill="#ef4444" 
                  name="Projects"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="theses" 
                  fill="#10b981" 
                  name="Theses"
                  radius={[2, 2, 0, 0]}
                />
              </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </div>

      {/* Third Row - Status and Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Status Distribution */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-cyan-500 rounded-full mr-3"></div>
              Research Status Overview
            </CardTitle>
            <CardDescription className="text-gray-600">
              Distribution of research activities by status
            </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={30}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

        {/* Yearly Trends */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
              Yearly Research Trends
            </CardTitle>
            <CardDescription className="text-gray-600">
              Research output over the past 5 years
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="publications" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Publications"
                />
                <Line 
                  type="monotone" 
                  dataKey="theses" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Theses"
                />
                <Line 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Projects"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Additional Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Thesis Types */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
              Thesis Types Distribution
            </CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of different thesis types
            </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(thesisTypes).map(([type, count]) => ({ type, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="type" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Event Types */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-rose-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-3 h-3 bg-rose-500 rounded-full mr-3"></div>
              Event Types Distribution
            </CardTitle>
            <CardDescription className="text-gray-600">
              Breakdown of different event types
            </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(eventTypes).map(([type, count]) => ({ type, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="type" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Funding by Agency */}
        {funding?.combined?.byAgency && Object.keys(funding.combined.byAgency).length > 0 && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                Funding Distribution by Agency
              </CardTitle>
              <CardDescription className="text-gray-600">
                Total funding: ${funding.overview.totalFunding.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(funding.combined.byAgency).map(([agency, amount]) => ({ 
                  agency: agency.length > 15 ? agency.substring(0, 15) + '...' : agency, 
                  amount: amount as number,
                  fullAgency: agency
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="agency" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    content={(props) => (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold">{props.payload?.[0]?.payload?.fullAgency}</p>
                        <p className="text-emerald-600">${props.payload?.[0]?.value?.toLocaleString()}</p>
                      </div>
                    )}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;