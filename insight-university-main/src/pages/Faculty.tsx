import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  BookOpen, 
  Loader2, 
  Search,
  Filter,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

const Faculty = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Fetch faculty from API
  const { data: faculty, isLoading, error } = useQuery({
    queryKey: ['faculty'],
    queryFn: api.getUsers,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const displayFaculty = Array.isArray(faculty) ? faculty.filter((user: any) => user.role === 'faculty') : [];
  
  // Get unique departments for filter
  const departments = Array.from(new Set(displayFaculty.map((f: any) => f.department))).filter(Boolean);
  
  // Filter faculty based on search and department
  const filteredFaculty = displayFaculty.filter((facultyMember: any) => {
    const matchesSearch = searchTerm === '' || 
      `${facultyMember.firstName} ${facultyMember.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyMember.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyMember.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyMember.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || facultyMember.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const renderFacultyCard = (facultyMember: any) => (
    <Card key={facultyMember._id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white hover:bg-gray-50">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            {facultyMember.profileImage ? (
              <img 
                src={facultyMember.profileImage} 
                alt={`${facultyMember.firstName} ${facultyMember.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-white" />
            )}
            </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {facultyMember.firstName} {facultyMember.lastName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 text-gray-600">
              <Building className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{facultyMember.department}</span>
            </CardDescription>
            <div className="mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Award className="h-3 w-3 mr-1" />
                {facultyMember.designation || 'Faculty Member'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{facultyMember.email}</span>
                </div>
                
        {facultyMember.position && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-green-500" />
              Position
            </p>
            <Badge variant="secondary" className="text-xs">
              {facultyMember.position}
            </Badge>
          </div>
        )}

        <Button 
          onClick={() => navigate(`/faculty/${facultyMember._id}`)}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
        >
          <span>View Profile</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">UET Taxila Faculty</h1>
          </div>
          <p className="text-gray-600">Meet our distinguished engineering faculty members and their research contributions at UET Taxila</p>
                </div>
                
        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search faculty by name, department, position, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                  </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                  </div>
                </div>
          </CardContent>
        </Card>

        {/* Faculty Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading faculty members...</p>
                </div>
              </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-600 text-lg mb-2">Failed to load faculty</p>
            <div className="text-gray-600">Please check your connection and try again</div>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg mb-2">No faculty members found</p>
            <div className="text-gray-500">
              {searchTerm || selectedDepartment !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'Check back later for faculty information'
              }
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map(renderFacultyCard)}
          </div>
        )}
        </div>

      <Footer />
    </div>
  );
};

export default Faculty;