import React from 'react';
import { BookOpen, DollarSign, GraduationCap, Globe, Users, Briefcase, Plane, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const StatsCards = () => {
  // Fetch comprehensive stats from API
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['comprehensive-stats'],
    queryFn: api.getComprehensiveStats,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch funding statistics
  const { data: fundingStats, isLoading: fundingLoading, error: fundingError } = useQuery({
    queryKey: ['funding-stats'],
    queryFn: api.getFundingStats,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch individual data for calculations
  const { data: publications } = useQuery({
    queryKey: ['publications-stats'],
    queryFn: api.getPublications,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: users } = useQuery({
    queryKey: ['users-stats'],
    queryFn: api.getUsers,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isLoading = statsLoading || fundingLoading;
  const error = statsError || fundingError;

  // Calculate real statistics
  const totalPublications = Array.isArray(publications) ? publications.length : 0;
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const facultyCount = Array.isArray(users) ? users.filter((user: any) => user.role === 'faculty').length : 0;

  // Get funding data from API
  const totalFunding = fundingStats?.overview?.totalFunding || 0;
  const totalProjects = fundingStats?.overview?.projectCount || 0;

  const statsData = [
    {
      icon: BookOpen,
      label: 'Publications',
      value: totalPublications.toLocaleString(),
      change: '+12% this year',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: DollarSign,
      label: 'Research Funding',
      value: `$${(totalFunding / 1000000).toFixed(1)}M`,
      change: '+8% this year',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      icon: Users,
      label: 'Faculty Members',
      value: facultyCount.toString(),
      change: '+5% this year',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Briefcase,
      label: 'Research Projects',
      value: totalProjects.toString(),
      change: '+15% this year',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  if (isLoading) {
    return (
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="card-academic p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-muted"></div>
                  <div className="h-4 w-16 bg-muted rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-muted rounded"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
                <div className="mt-4 w-full bg-muted rounded-full h-2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 text-lg mb-2">Failed to load statistics</p>
            <div className="text-gray-600">Please check your connection and try again</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="card-academic p-6 group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.change}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold font-poppins text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
                
                <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 group-hover:w-full ${
                      stat.color.includes('primary') ? 'bg-primary' :
                      stat.color.includes('secondary') ? 'bg-secondary' : 'bg-accent'
                    }`}
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsCards;