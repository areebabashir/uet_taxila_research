import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Building, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Search, 
  Filter,
  TrendingUp,
  Award,
  Globe,
  Users,
  BookOpen,
  Briefcase,
  Loader2,
  Star,
  Clock,
  Target,
  Zap,
  Plane
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const Funding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAmount, setSelectedAmount] = useState('all');

  // Fetch funding statistics
  const { data: fundingStats, isLoading: fundingLoading, error: fundingError } = useQuery({
    queryKey: ['dashboard-funding'],
    queryFn: api.getFundingStats,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Fetch funding opportunities and sources
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['funding-opportunities'],
    queryFn: api.getFundingOpportunities,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ['funding-sources'],
    queryFn: api.getFundingSources,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isLoading = fundingLoading || opportunitiesLoading || sourcesLoading;

  // Get opportunities and sources from API data
  const currentOpportunities = opportunitiesData?.opportunities || [];
  const fundingSources = sourcesData?.sources || [];

  // Filter opportunities
  const filteredOpportunities = currentOpportunities.filter(opportunity => {
    const matchesSearch = searchTerm === '' || 
      opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || opportunity.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesAmount = selectedAmount === 'all' || 
      (selectedAmount === 'small' && opportunity.amount < 100000) ||
      (selectedAmount === 'medium' && opportunity.amount >= 100000 && opportunity.amount < 1000000) ||
      (selectedAmount === 'large' && opportunity.amount >= 1000000);
    
    return matchesSearch && matchesCategory && matchesAmount;
  });

  const renderOpportunityCard = (opportunity: any) => (
    <Card key={opportunity.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white hover:bg-gray-50">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {opportunity.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{opportunity.agency}</span>
            </CardDescription>
                </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {opportunity.status}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {opportunity.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="text-lg font-bold text-green-600">
            ${opportunity.amount.toLocaleString()}
          </span>
          </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">
            Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                    </span>
                </div>

        <p className="text-sm text-gray-600 line-clamp-2">
                  {opportunity.description}
                </p>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Requirements:</p>
          <div className="flex flex-wrap gap-1">
            {opportunity.requirements.map((req: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {req}
              </Badge>
            ))}
                  </div>
                </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4" />
                  </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSourceCard = (source: any) => (
    <Card key={source.name} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white hover:bg-gray-50">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{source.logo}</div>
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {source.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-gray-600">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{source.country}</span>
              <Badge variant="outline" className="text-xs">
                {source.type}
              </Badge>
            </CardDescription>
                </div>
              </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          {source.description}
        </p>
        
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Focus Areas:</p>
          <div className="flex flex-wrap gap-1">
            {source.focusAreas.map((area: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              Avg: ${source.averageAmount.toLocaleString()}
            </span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={source.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Loading funding information...</p>
            </div>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">UET Taxila Funding & Opportunities</h1>
          </div>
          <p className="text-gray-600">Discover current engineering funding opportunities and explore all available funding sources for UET Taxila</p>
        </div>

        {/* Stats Cards */}
        {fundingStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-700">
                {fundingStats.overview?.totalFunding ? 
                  (fundingStats.overview.totalFunding >= 1000000 ? 
                    `$${(fundingStats.overview.totalFunding / 1000000).toFixed(1)}M` : 
                    `$${fundingStats.overview.totalFunding.toLocaleString()}`
                  ) : '$0'
                }
              </h3>
              <p className="text-green-600 font-medium">Total Funding</p>
            </Card>
            
            <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-700">{fundingStats.overview?.projectCount || 0}</h3>
              <p className="text-blue-600 font-medium">Active Projects</p>
            </Card>
            
            <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="h-6 w-6 text-white" />
                </div>
              <h3 className="text-2xl font-bold text-purple-700">{fundingStats.overview?.travelGrantCount || 0}</h3>
              <p className="text-purple-600 font-medium">Travel Grants</p>
            </Card>
            
            <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-orange-700">
                {fundingStats.combined?.byAgency ? Object.keys(fundingStats.combined.byAgency).length : 0}
              </h3>
              <p className="text-orange-600 font-medium">Funding Agencies</p>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Current Opportunities
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Funding Sources
            </TabsTrigger>
          </TabsList>

          {/* Current Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search opportunities by title, agency, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="research">Research</option>
                      <option value="travel">Travel</option>
                      <option value="innovation">Innovation</option>
                      <option value="development">Development</option>
                      <option value="collaboration">Collaboration</option>
                      <option value="student">Student</option>
                    </select>
                    <select
                      value={selectedAmount}
                      onChange={(e) => setSelectedAmount(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Amounts</option>
                      <option value="small">Under $100K</option>
                      <option value="medium">$100K - $1M</option>
                      <option value="large">Over $1M</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map(renderOpportunityCard)}
            </div>
          </TabsContent>

          {/* Funding Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fundingSources.map(renderSourceCard)}
            </div>
          </TabsContent>
        </Tabs>
        </div>

      <Footer />
    </div>
  );
};

export default Funding;