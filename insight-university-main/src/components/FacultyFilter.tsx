import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, ArrowLeft, Filter } from 'lucide-react';
import { UET_FACULTIES, type FacultyName, type DepartmentName, getFacultyByDepartment } from '@/lib/facultyConstants';

interface FacultyFilterProps {
  selectedFaculty: FacultyName | null;
  selectedDepartment: DepartmentName | null;
  onFacultySelect: (faculty: FacultyName | null) => void;
  onDepartmentSelect: (department: DepartmentName | null) => void;
  onReset: () => void;
}

const FacultyFilter: React.FC<FacultyFilterProps> = ({
  selectedFaculty,
  selectedDepartment,
  onFacultySelect,
  onDepartmentSelect,
  onReset
}) => {
  const facultyNames = Object.keys(UET_FACULTIES) as FacultyName[];
  const selectedFacultyDepartments = selectedFaculty ? UET_FACULTIES[selectedFaculty] : [];

  return (
    <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-blue-900">
              Faculty & Department Filter
            </CardTitle>
          </div>
          {(selectedFaculty || selectedDepartment) && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Faculty Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Select Faculty
          </label>
          <Select
            value={selectedFaculty || 'all'}
            onValueChange={(value) => onFacultySelect(value === 'all' ? null : value as FacultyName)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Faculties (University-wide)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties (University-wide)</SelectItem>
              {facultyNames.map((faculty) => (
                <SelectItem key={faculty} value={faculty}>
                  {faculty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Selection - Only show if faculty is selected */}
        {selectedFaculty && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Department
            </label>
            <Select
              value={selectedDepartment || 'all'}
              onValueChange={(value) => onDepartmentSelect(value === 'all' ? null : value as DepartmentName)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`All Departments in ${selectedFaculty}`} />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments in {selectedFaculty}</SelectItem>
              {selectedFacultyDepartments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
            </Select>
          </div>
        )}

        {/* Current Selection Display */}
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedFaculty && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Faculty: {selectedFaculty}
            </Badge>
          )}
          {selectedDepartment && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Department: {selectedDepartment}
            </Badge>
          )}
          {!selectedFaculty && !selectedDepartment && (
            <Badge variant="outline" className="text-gray-600">
              Showing: All University Data
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FacultyFilter;
