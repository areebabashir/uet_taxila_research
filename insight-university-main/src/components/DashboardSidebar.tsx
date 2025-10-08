import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, Menu, X } from 'lucide-react';

interface DashboardSidebarProps {
  onFiltersChange: (filters: any) => void;
  onSearchChange: (search: string) => void;
  data?: {
    publications: any[];
    theses: any[];
    travelGrants: any[];
    fypProjects: any[];
    events: any[];
    projects: any[];
  };
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onFiltersChange, onSearchChange, data }) => {
  const [filters, setFilters] = React.useState({
    department: '',
    dateRange: '',
    keywords: [] as string[]
  });

  const [searchTerm, setSearchTerm] = React.useState('');
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleKeywordToggle = (keyword: string) => {
    const newKeywords = filters.keywords.includes(keyword)
      ? filters.keywords.filter(k => k !== keyword)
      : [...filters.keywords, keyword];
    
    handleFilterChange('keywords', newKeywords);
  };

  const clearFilters = () => {
    const clearedFilters = {
      department: '',
      dateRange: '',
      keywords: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setSearchTerm('');
    onSearchChange('');
  };

  // Generate dynamic filter options from actual data
  const generateDynamicFilters = () => {
    if (!data) return { departments: [], keywords: [] };

    const allItems = [
      ...(data.publications || []),
      ...(data.theses || []),
      ...(data.travelGrants || []),
      ...(data.fypProjects || []),
      ...(data.events || []),
      ...(data.projects || [])
    ];

    // Extract unique departments
    const departments = Array.from(new Set(
      allItems
        .map(item => item.department || item.student?.department || item.principalInvestigator?.department || item.applicant?.department)
        .filter(Boolean)
    )).sort();

    // Extract unique keywords
    const allKeywords = allItems
      .flatMap(item => item.keywords || [])
      .filter(Boolean);
    const keywords = Array.from(new Set(allKeywords)).sort();

    return { departments, keywords };
  };

  const { departments, keywords } = generateDynamicFilters();

  // Fallback to static data if no dynamic data available
  const popularKeywords = keywords.length > 0 ? keywords : [
    'Machine Learning', 'AI', 'Computer Vision', 'Data Science', 'Blockchain',
    'Cybersecurity', 'IoT', 'Cloud Computing', 'Mobile Development', 'Web Development',
    'Software Engineering', 'Database', 'Networking', 'Robotics', 'Healthcare'
  ];

  const staticDepartments = [
    'Computer Science', 'Engineering', 'Medicine', 'Business', 'Arts & Sciences',
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Psychology'
  ];

  const finalDepartments = departments.length > 0 ? departments : staticDepartments;

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="h-10 w-10"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        lg:sticky fixed top-0 left-0 w-80 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-r-4 border-r-blue-500/30 h-screen lg:h-[calc(100vh-4rem)] 
        overflow-y-auto overflow-x-hidden z-40 transform transition-transform duration-300 ease-in-out shadow-2xl backdrop-blur-xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:top-16
        scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent
      `}>
        <div className="p-6 space-y-6 pb-20">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold">Filters & Search</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search with Enhanced Design */}
          <div className="space-y-2">
            <Label htmlFor="search" className="font-semibold text-sm flex items-center gap-2">
              🔍 Search Research
            </Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5" />
              <Input
                id="search"
                placeholder="Search publications, theses, projects..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-12 border-2 border-blue-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 placeholder:text-slate-400"
              />
            </div>
          </div>


          {/* Filters with Gradient Card */}
          <Card className="border-2 border-purple-200 shadow-xl bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                <Filter className="h-5 w-5" />
                🎯 Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Department Filter */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={filters.department || 'all'} onValueChange={(value) => handleFilterChange('department', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {finalDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={filters.dateRange || 'all'} onValueChange={(value) => handleFilterChange('dateRange', value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="last-2-years">Last 2 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <Separator />

              {/* Keywords Filter */}
              <div className="space-y-3">
                <Label>Popular Keywords</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {popularKeywords.map((keyword) => (
                    <div key={keyword} className="flex items-center space-x-2">
                      <Checkbox
                        id={keyword}
                        checked={filters.keywords.includes(keyword)}
                        onCheckedChange={() => handleKeywordToggle(keyword)}
                      />
                      <Label
                        htmlFor={keyword}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {keyword}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Clear Filters - Only show when filters are applied */}
              {(searchTerm || Object.values(filters).some(value => 
                Array.isArray(value) ? value.length > 0 : value !== ''
              )) && (
                <Button 
                  onClick={clearFilters} 
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                >
                  🗑️ Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;