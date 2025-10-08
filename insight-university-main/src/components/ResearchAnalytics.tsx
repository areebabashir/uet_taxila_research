import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, Award, Building, Calendar, BarChart3, PieChart, LineChart, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const ResearchAnalytics = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');

  // Fetch data from APIs
  const { data: publications, isLoading: publicationsLoading } = useQuery({
    queryKey: ['analytics-publications'],
    queryFn: api.getPublications,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: fundingStats, isLoading: fundingLoading } = useQuery({
    queryKey: ['analytics-funding'],
    queryFn: api.getFundingStats,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['analytics-users'],
    queryFn: api.getUsers,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isLoading = publicationsLoading || fundingLoading || usersLoading;

  // Get unique departments from users
  const departments = Array.isArray(users) 
    ? ['All Departments', ...Array.from(new Set(users.map((user: any) => user.department).filter(Boolean)))]
    : ['All Departments'];

  const years = ['2024', '2023', '2022', '2021', '2020'];

  // Calculate publication trends by year
  const publicationTrend = years.map(year => {
    const yearPublications = Array.isArray(publications) 
      ? publications.filter((pub: any) => new Date(pub.publicationDate).getFullYear().toString() === year)
      : [];
    return {
      year,
      publications: yearPublications.length
    };
  });

  // Calculate quartile distribution
  const quartileData = [
    { quartile: 'Q1', count: 0, percentage: 0, color: 'bg-secondary' },
    { quartile: 'Q2', count: 0, percentage: 0, color: 'bg-primary' },
    { quartile: 'Q3', count: 0, percentage: 0, color: 'bg-accent' },
    { quartile: 'Q4', count: 0, percentage: 0, color: 'bg-muted' },
  ];

  if (Array.isArray(publications)) {
    const totalPubs = publications.length;
    quartileData.forEach(quartile => {
      const count = publications.filter((pub: any) => pub.quartile === quartile.quartile).length;
      quartile.count = count;
      quartile.percentage = totalPubs > 0 ? Math.round((count / totalPubs) * 100) : 0;
    });
  }

  // Calculate funding distribution from API data
  const fundingData: { agency: string; amount: number; percentage: number; color: string }[] = [];
  let totalFunding = 0;

  if (fundingStats?.combined?.byAgency) {
    const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-destructive', 'bg-muted-foreground', 'bg-muted'];
    let colorIndex = 0;

    Object.entries(fundingStats.combined.byAgency).forEach(([agency, amount]) => {
      fundingData.push({
        agency,
        amount: amount as number,
        percentage: fundingStats.overview.totalFunding > 0 ? Math.round(((amount as number) / fundingStats.overview.totalFunding) * 100) : 0,
        color: colors[colorIndex % colors.length]
      });
      colorIndex++;
    });

    totalFunding = fundingStats.overview.totalFunding;
  }

  if (isLoading) {
    return (
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Research Analytics</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive insights into UET Taxila's engineering research performance and academic impact
            </p>
          </div>

          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading research analytics...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="font-poppins text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Research Analytics</span>
          </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive insights into UET Taxila's engineering research performance and academic impact
            </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept, index) => (
                  <SelectItem key={index} value={dept.toLowerCase().replace(' ', '-')}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="px-6">
            Generate Report
          </Button>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Publications Trend */}
          <div className="card-academic p-6">
            <div className="flex items-center space-x-2 mb-6">
              <LineChart className="h-5 w-5 text-primary" />
              <h3 className="font-poppins text-xl font-semibold">Publications by Year</h3>
            </div>
            <div className="space-y-4">
              {publicationTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium w-12">{item.year}</div>
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
                        style={{ width: `${Math.max(10, (item.publications / Math.max(...publicationTrend.map(p => p.publications), 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary">{item.publications}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center space-x-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {publicationTrend.length > 1 
                    ? `+${Math.round(((publicationTrend[0].publications - publicationTrend[1].publications) / Math.max(publicationTrend[1].publications, 1)) * 100)}% growth this year`
                    : 'New data this year'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Publications by Quartile */}
          <div className="card-academic p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="h-5 w-5 text-secondary" />
              <h3 className="font-poppins text-xl font-semibold">Publications by Quartile</h3>
            </div>
            <div className="space-y-4">
              {quartileData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.quartile} Journals</span>
                    <span className="text-lg font-semibold">{item.count}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funding Distribution */}
          <div className="card-academic p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-accent" />
                <h3 className="font-poppins text-xl font-semibold">Funding Distribution by Agency</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {totalFunding >= 1000000 ? 
                  `$${(totalFunding / 1000000).toFixed(1)}M` : 
                  `$${totalFunding.toLocaleString()}`
                } (2024)
              </div>
            </div>
            
            {fundingData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fundingData.map((agency, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border/50 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{agency.agency}</h4>
                      <div className={`w-4 h-4 rounded-full ${agency.color}`}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        ${agency.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${agency.color}`}
                            style={{ width: `${agency.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">{agency.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg mb-2">No funding data available</p>
                <div className="text-gray-500">Funding information will appear here when projects are added</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResearchAnalytics;