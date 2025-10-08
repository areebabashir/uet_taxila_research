import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, FYPProject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Eye, GraduationCap, Calendar, User, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UET_DEPARTMENTS } from '@/lib/constants';

const FYP: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedFYP, setSelectedFYP] = useState<FYPProject | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch FYP projects
  const { data: fypData, isLoading, error } = useQuery({
    queryKey: ['fyp', page, search, statusFilter, typeFilter, batchFilter],
    queryFn: () => apiClient.getFYPProjects({
      page,
      limit: 10,
      search: search || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      batch: batchFilter || undefined,
    }),
  });

  // Create FYP project mutation
  const createFYPMutation = useMutation({
    mutationFn: (fypData: Partial<FYPProject>) => apiClient.createFYPProject(fypData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fyp'] });
      setIsCreateDialogOpen(false);
      toast.success('FYP project created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete FYP project mutation
  const deleteFYPMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteFYPProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fyp'] });
      toast.success('FYP project deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateFYPMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FYPProject> }) => apiClient.updateFYPProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fyp'] });
      setIsEditDialogOpen(false);
      toast.success('FYP updated successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Approval mutations
  const approveFYPMutation = useMutation({
    mutationFn: (id: string) => apiClient.approveFYPProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fyp'] });
      toast.success('FYP project approved successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rejectFYPMutation = useMutation({
    mutationFn: (id: string) => apiClient.rejectFYPProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fyp'] });
      toast.success('FYP project rejected');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleCreateFYP = (formData: FormData) => {
    const title = (formData.get('title') as string || '').trim();
    const projectType = (formData.get('projectType') as string || '').trim();
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const studentName = (formData.get('studentName') as string || '').trim();
    const rollNumber = (formData.get('rollNumber') as string || '').trim();
    const studentEmail = (formData.get('studentEmail') as string || '').trim();
    const batch = (formData.get('batch') as string || '').trim();
    const degree = (formData.get('degree') as string || '').trim();
    const department = (formData.get('department') as string || '').trim();
    if (!title) return toast.error('Title is required');
    if (!projectType) return toast.error('Project type is required');
    if (!startDate) return toast.error('Start date is required');
    if (!endDate) return toast.error('End date is required');
    if (new Date(startDate) > new Date(endDate)) return toast.error('End date must be after start date');
    if (!studentName) return toast.error('Student name is required');
    if (!rollNumber) return toast.error('Roll number is required');
    if (!studentEmail) return toast.error('Student email is required');
    if (!batch) return toast.error('Batch is required');
    if (!degree) return toast.error('Degree is required');
    if (!department) return toast.error('Department is required');

    const fypData: Partial<FYPProject> = {
      title: formData.get('title') as string,
      projectType: formData.get('projectType') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      student: {
        name: studentName,
        rollNumber,
        email: studentEmail,
        batch,
        degree,
        department,
        cgpa: parseFloat(formData.get('cgpa') as string) || undefined,
      },
      description: formData.get('description') as string,
      keywords: (formData.get('keywords') as string).split(',').map(k => k.trim()),
    };

    createFYPMutation.mutate(fypData);
  };

  const handleDeleteFYP = (id: string) => {
    if (window.confirm('Are you sure you want to delete this FYP project?')) {
      deleteFYPMutation.mutate(id);
    }
  };

  const handleOpenEdit = (fyp: FYPProject) => {
    setSelectedFYP(fyp);
    setIsEditDialogOpen(true);
  };

  const handleUpdateFYP = (formData: FormData) => {
    if (!selectedFYP) return;
    const data: Partial<FYPProject> = {
      title: (formData.get('title') as string) || selectedFYP.title,
      projectType: (formData.get('projectType') as string) || selectedFYP.projectType,
      startDate: (formData.get('startDate') as string) || selectedFYP.startDate,
      endDate: (formData.get('endDate') as string) || selectedFYP.endDate,
      student: {
        name: (formData.get('studentName') as string) || selectedFYP.student.name,
        rollNumber: (formData.get('rollNumber') as string) || selectedFYP.student.rollNumber,
        email: (formData.get('studentEmail') as string) || selectedFYP.student.email,
        batch: (formData.get('batch') as string) || selectedFYP.student.batch,
        degree: (formData.get('degree') as string) || selectedFYP.student.degree,
        department: (formData.get('department') as string) || selectedFYP.student.department,
      } as any,
      description: (formData.get('description') as string) || selectedFYP.description,
      keywords: ((formData.get('keywords') as string) || (selectedFYP.keywords || []).join(',')).split(',').map(k => k.trim()).filter(Boolean),
    };
    updateFYPMutation.mutate({ id: selectedFYP._id, data });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Graded':
        return 'default';
      case 'Approved':
        return 'default';
      case 'Defended':
        return 'secondary';
      case 'Proposed':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading FYP projects: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FYP Management</h1>
          <p className="text-muted-foreground">Manage Final Year Projects</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add FYP Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New FYP Project</DialogTitle>
              <DialogDescription>
                Add a new Final Year Project to the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateFYP(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" name="title" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select name="projectType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FYP">FYP</SelectItem>
                      <SelectItem value="Capstone">Capstone</SelectItem>
                      <SelectItem value="Thesis">Thesis</SelectItem>
                      <SelectItem value="Research Project">Research Project</SelectItem>
                      <SelectItem value="Design Project">Design Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Select name="degree" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BS">BS</SelectItem>
                      <SelectItem value="BE">BE</SelectItem>
                      <SelectItem value="BSc">BSc</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MSc">MSc</SelectItem>
                      <SelectItem value="ME">ME</SelectItem>
                      <SelectItem value="MPhil">MPhil</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input id="studentName" name="studentName" required />
                </div>
                <div>
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input id="rollNumber" name="rollNumber" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentEmail">Student Email</Label>
                  <Input id="studentEmail" name="studentEmail" type="email" required />
                </div>
                <div>
                  <Label htmlFor="batch">Batch</Label>
                  <Input id="batch" name="batch" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select name="department" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {UET_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input id="cgpa" name="cgpa" type="number" step="0.01" min="0" max="4" />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input id="keywords" name="keywords" placeholder="Web Development, Database, UI/UX" />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createFYPMutation.isPending}>
                  {createFYPMutation.isPending ? 'Creating...' : 'Create FYP Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search FYP projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Proposed">Proposed</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Defended">Defended</SelectItem>
                  <SelectItem value="Graded">Graded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="FYP">FYP</SelectItem>
                  <SelectItem value="Capstone">Capstone</SelectItem>
                  <SelectItem value="Thesis">Thesis</SelectItem>
                  <SelectItem value="Research Project">Research Project</SelectItem>
                  <SelectItem value="Design Project">Design Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                placeholder="e.g., 2024"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setTypeFilter('');
                  setBatchFilter('');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FYP Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>FYP Projects</CardTitle>
          <CardDescription>
            {fypData?.data.pagination.totalItems || 0} total FYP projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading FYP projects...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fypData?.data.fypProjects.map((fyp) => (
                  <TableRow key={fyp._id}>
                    <TableCell className="font-medium">{fyp.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <div>
                          <div className="font-medium">{fyp.student.name}</div>
                          <div className="text-sm text-muted-foreground">{fyp.student.rollNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        {fyp.projectType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(fyp.status)}>
                        {fyp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{fyp.student.batch}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(fyp.startDate).toLocaleDateString()} - {new Date(fyp.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFYP(fyp);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(fyp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFYP(fyp._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {user?.role === 'admin' && fyp.status === "Proposed" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-success" 
                              title="Approve"
                              onClick={() => approveFYPMutation.mutate(fyp._id)}
                              disabled={approveFYPMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive" 
                              title="Reject"
                              onClick={() => rejectFYPMutation.mutate(fyp._id)}
                              disabled={rejectFYPMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View FYP Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFYP?.title}</DialogTitle>
            <DialogDescription>
              FYP project details and information
            </DialogDescription>
          </DialogHeader>
          {selectedFYP && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="text-sm font-medium">{selectedFYP.projectType}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusBadgeVariant(selectedFYP.status)}>
                    {selectedFYP.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Student Information</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Name:</strong> {selectedFYP.student.name}</div>
                    <div><strong>Roll Number:</strong> {selectedFYP.student.rollNumber}</div>
                    <div><strong>Email:</strong> {selectedFYP.student.email}</div>
                    <div><strong>Batch:</strong> {selectedFYP.student.batch}</div>
                    <div><strong>Degree:</strong> {selectedFYP.student.degree}</div>
                    <div><strong>Department:</strong> {selectedFYP.student.department}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <p className="text-sm">{new Date(selectedFYP.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>End Date</Label>
                  <p className="text-sm">{new Date(selectedFYP.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedFYP.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm">{selectedFYP.description}</p>
                </div>
              )}

              {selectedFYP.keywords && selectedFYP.keywords.length > 0 && (
                <div>
                  <Label>Keywords</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFYP.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit FYP Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit FYP</DialogTitle>
            <DialogDescription>Update FYP details</DialogDescription>
          </DialogHeader>
          {selectedFYP && (
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateFYP(new FormData(e.currentTarget)); }} className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" name="title" defaultValue={selectedFYP.title} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Input id="projectType" name="projectType" defaultValue={selectedFYP.projectType} />
                </div>
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input id="degree" name="degree" defaultValue={selectedFYP.student.degree} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" defaultValue={selectedFYP.startDate?.slice(0,10)} />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" defaultValue={selectedFYP.endDate?.slice(0,10)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input id="studentName" name="studentName" defaultValue={selectedFYP.student.name} />
                </div>
                <div>
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input id="rollNumber" name="rollNumber" defaultValue={selectedFYP.student.rollNumber} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentEmail">Student Email</Label>
                  <Input id="studentEmail" name="studentEmail" type="email" defaultValue={selectedFYP.student.email} />
                </div>
                <div>
                  <Label htmlFor="batch">Batch</Label>
                  <Input id="batch" name="batch" defaultValue={selectedFYP.student.batch} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select name="department" defaultValue={selectedFYP.student.department}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {UET_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input id="keywords" name="keywords" defaultValue={(selectedFYP.keywords || []).join(', ')} />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} defaultValue={selectedFYP.description || ''} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateFYPMutation.isPending}>{updateFYPMutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FYP;
