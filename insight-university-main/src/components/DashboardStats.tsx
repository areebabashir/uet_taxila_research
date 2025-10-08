import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Plane, Briefcase, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Stats } from '@/lib/api';

interface DashboardStatsProps {
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
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ data, stats, funding }) => {
  // Calculate growth percentages (mock data for demonstration)
  const calculateGrowth = (current: number, previous: number = Math.floor(current * 0.8)) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const statsConfig = [
    {
      title: 'Publications',
      value: stats?.publications?.total || (data.publications || []).length,
      icon: BookOpen,
      description: 'Research papers and articles',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
      statusBreakdown: stats?.publications?.byStatus,
      growth: calculateGrowth(stats?.publications?.total || (data.publications || []).length),
      trend: 'up'
    },
    {
      title: 'Theses',
      value: stats?.theses?.total || (data.theses || []).length,
      icon: GraduationCap,
      description: 'Graduate research projects',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600',
      statusBreakdown: stats?.theses?.byStatus,
      growth: calculateGrowth(stats?.theses?.total || (data.theses || []).length),
      trend: 'up'
    },
    {
      title: 'Travel Grants',
      value: stats?.travelGrants?.total || (data.travelGrants || []).length,
      icon: Plane,
      description: 'Conference and research visits',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600',
      statusBreakdown: stats?.travelGrants?.byStatus,
      growth: calculateGrowth(stats?.travelGrants?.total || (data.travelGrants || []).length),
      trend: 'up'
    },
    {
      title: 'FYP Projects',
      value: stats?.fypProjects?.total || (data.fypProjects || []).length,
      icon: Briefcase,
      description: 'Final year projects',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-orange-600',
      statusBreakdown: stats?.fypProjects?.byStatus,
      growth: calculateGrowth(stats?.fypProjects?.total || (data.fypProjects || []).length),
      trend: 'up'
    },
    {
      title: 'Events',
      value: stats?.events?.total || (data.events || []).length,
      icon: Calendar,
      description: 'Conferences and workshops',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-red-600',
      statusBreakdown: stats?.events?.byStatus,
      growth: calculateGrowth(stats?.events?.total || (data.events || []).length),
      trend: 'up'
    },
    {
      title: 'Research Projects',
      value: stats?.projects?.total || (data.projects || []).length,
      icon: TrendingUp,
      description: 'Ongoing research initiatives',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-200',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-indigo-600',
      statusBreakdown: stats?.projects?.byStatus,
      growth: calculateGrowth(stats?.projects?.total || (data.projects || []).length),
      trend: 'up'
    },
    {
      title: 'Total Funding',
      value: funding?.overview?.totalFunding ? 
        (funding.overview.totalFunding >= 1000000 ? 
          `$${(funding.overview.totalFunding / 1000000).toFixed(1)}M` : 
          `$${funding.overview.totalFunding.toLocaleString()}`
        ) : '$0',
      icon: TrendingUp,
      description: 'Research funding secured',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600',
      statusBreakdown: {
        'Projects': funding?.overview?.projectFunding || 0,
        'Travel Grants': funding?.overview?.travelFunding || 0
      },
      growth: calculateGrowth(funding?.overview?.totalFunding || 0),
      trend: 'up'
    },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Mobile-first responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          const isPositiveGrowth = stat.growth >= 0;
          
          return (
            <Card 
              key={index} 
              className={`hover:shadow-lg transition-all duration-300 border-2 ${stat.borderColor} bg-white/90 backdrop-blur-sm`}
            >
              <CardContent className="p-4">
                {/* Header with icon and title */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center text-xs font-medium ${
                    isPositiveGrowth ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositiveGrowth ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(stat.growth)}%
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-700 mb-1 truncate">
                  {stat.title}
                </h3>
                
                {/* Main value */}
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                
                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2">
                  {stat.description}
                </p>
                
                {/* Status breakdown - only show on larger screens */}
                {stat.statusBreakdown && Object.keys(stat.statusBreakdown).length > 0 && (
                  <div className="hidden lg:block space-y-1 pt-2 border-t border-gray-100">
                    {Object.entries(stat.statusBreakdown).slice(0, 1).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 capitalize truncate">
                          {status.toLowerCase().replace('_', ' ')}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0.5 ${
                            status === 'Published' || status === 'Completed' ? 'border-green-200 text-green-700 bg-green-50' :
                            status === 'Active' || status === 'In Progress' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            status === 'Under Review' || status === 'Pending' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                            'border-gray-200 text-gray-700 bg-gray-50'
                          }`}
                        >
                          {count as number}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className={`h-1 rounded-full bg-gradient-to-r ${stat.gradientFrom} ${stat.gradientTo}`}
                    style={{ 
                      width: `${Math.min((stat.value / Math.max(...statsConfig.map(s => s.value))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStats;