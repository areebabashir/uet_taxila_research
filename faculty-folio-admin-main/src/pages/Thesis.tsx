import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ThesisSupervision } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Eye, Calendar, GraduationCap, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UET_DEPARTMENTS } from '@/lib/constants';

const Thesis: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selected, setSelected] = useState<ThesisSupervision | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: thesisData, isLoading, error } = useQuery({
    queryKey: ['thesis', page, search, statusFilter, typeFilter, batchFilter],
    queryFn: () => apiClient.getThesisSupervisions({
      page,
      limit: 10,
      search: search || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      batch: batchFilter || undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ThesisSupervision>) => apiClient.createThesisSupervision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thesis'] });
      setIsCreateDialogOpen(false);
      toast.success('Thesis created successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteThesisSupervision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thesis'] });
      toast.success('Thesis deleted successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Approval mutations
  const approveThesisMutation = useMutation({
    mutationFn: (id: string) => apiClient.approveThesisSupervision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thesis'] });
      toast.success('Thesis supervision approved successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rejectThesisMutation = useMutation({
    mutationFn: (id: string) => apiClient.rejectThesisSupervision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thesis'] });
      toast.success('Thesis supervision rejected');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleCreate = (formData: FormData) => {
    const title = (formData.get('title') as string || '').trim();
    const thesisType = (formData.get('thesisType') as string || '').trim();
    const degree = (formData.get('degree') as string || '').trim();
    const startDate = formData.get('startDate') as string;
    const expectedCompletionDate = formData.get('expectedCompletionDate') as string;
    const researchArea = (formData.get('researchArea') as string || '').trim();
    const studentName = (formData.get('studentName') as string || '').trim();
    const rollNumber = (formData.get('rollNumber') as string || '').trim();
    const studentEmail = (formData.get('studentEmail') as string || '').trim();
    const batch = (formData.get('batch') as string || '').trim();
    const studentDegree = (formData.get('degree') as string || '').trim();
    const department = (formData.get('department') as string || '').trim();

    if (!title) return toast.error('Title is required');
    if (!thesisType) return toast.error('Thesis type is required');
    if (!degree) return toast.error('Degree is required');
    if (!startDate) return toast.error('Start date is required');
    if (!expectedCompletionDate) return toast.error('Expected completion date is required');
    if (new Date(startDate) > new Date(expectedCompletionDate)) return toast.error('Expected completion must be after start');
    if (!researchArea) return toast.error('Research area is required');
    if (!studentName || !rollNumber || !studentEmail || !batch || !studentDegree || !department) return toast.error('All student fields are required');

    const data: Partial<ThesisSupervision> = {
      title,
      thesisType,
      degree,
      startDate,
      expectedCompletionDate,
      student: {
        name: studentName,
        rollNumber,
        email: studentEmail,
        batch,
        degree: studentDegree,
        department,
      } as any,
      researchArea,
      keywords: (formData.get('keywords') as string)?.split(',').map(k => k.trim()).filter(Boolean) || [],
    };
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this record?')) deleteMutation.mutate(id);
  };

  const statusVariant = (s?: string) => {
    const v = (s || '').toLowerCase();
    if (v === 'completed' || v === 'defended') return 'default';
    if (v === 'in progress') return 'secondary';
    return 'outline';
  };

  if (error) return <div className="p-8 text-center text-red-500">{(error as Error).message}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Thesis Supervision</h1>
          <p className="text-muted-foreground">Manage MS/PhD thesis records</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Thesis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Thesis</DialogTitle>
              <DialogDescription>Provide thesis details</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thesis Type</Label>
                  <Select name="thesisType" required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MPhil">MPhil</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Post Doc">Post Doc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Degree</Label>
                  <Select name="degree" required>
                    <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MPhil">MPhil</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Post Doc">Post Doc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input name="startDate" type="date" required />
                </div>
                <div>
                  <Label>Expected Completion</Label>
                  <Input name="expectedCompletionDate" type="date" required />
                </div>
              </div>
              <div>
                <Label>Student Information</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input name="studentName" placeholder="Name" required />
                  <Input name="rollNumber" placeholder="Roll Number" required />
                  <Input name="studentEmail" placeholder="Email" type="email" required />
                  <Input name="batch" placeholder="Batch" required />
                  <Input name="degree" placeholder="Degree" required />
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
              </div>
              <div>
                <Label>Research Area</Label>
                <Input name="researchArea" required />
              </div>
              <div>
                <Label>Keywords</Label>
                <Input name="keywords" placeholder="Deep Learning, Medical Imaging" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search thesis..." />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Defended">Defended</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="MS">MS</SelectItem>
                  <SelectItem value="MPhil">MPhil</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Batch</Label>
              <Input value={batchFilter} onChange={e => setBatchFilter(e.target.value)} placeholder="e.g., 2023" />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); setBatchFilter(''); setPage(1); }}>Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thesis Supervisions</CardTitle>
          <CardDescription>{thesisData?.data.pagination.totalItems || 0} total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading thesis...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {thesisData?.data.thesisSupervisions.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>{t.student.name} ({t.student.rollNumber})</TableCell>
                    <TableCell>
                      <div className="flex items-center"><GraduationCap className="h-4 w-4 mr-1" /> {t.thesisType}</div>
                    </TableCell>
                    <TableCell><Badge variant={statusVariant(t.status)}>{t.status || 'In Progress'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {new Date(t.startDate).toLocaleDateString()} - {new Date(t.expectedCompletionDate).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelected(t); setIsViewDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(t._id)}><Trash2 className="h-4 w-4" /></Button>
                        {user?.role === 'admin' && t.status === "Proposed" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-success" 
                              title="Approve"
                              onClick={() => approveThesisMutation.mutate(t._id)}
                              disabled={approveThesisMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive" 
                              title="Reject"
                              onClick={() => rejectThesisMutation.mutate(t._id)}
                              disabled={rejectThesisMutation.isPending}
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

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>Thesis details</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="text-sm font-medium">{selected.thesisType}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={statusVariant(selected.status)}>{selected.status || 'In Progress'}</Badge>
                </div>
              </div>
              <div>
                <Label>Student</Label>
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Name:</strong> {selected.student.name}</div>
                    <div><strong>Roll No:</strong> {selected.student.rollNumber}</div>
                    <div><strong>Email:</strong> {selected.student.email}</div>
                    <div><strong>Batch:</strong> {selected.student.batch}</div>
                    <div><strong>Degree:</strong> {selected.student.degree}</div>
                    <div><strong>Department:</strong> {selected.student.department}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {new Date(selected.startDate).toLocaleDateString()}</div>
                <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {new Date(selected.expectedCompletionDate).toLocaleDateString()}</div>
              </div>
              {selected.researchArea && (
                <div>
                  <Label>Research Area</Label>
                  <p className="text-sm">{selected.researchArea}</p>
                </div>
              )}
              {selected.keywords && selected.keywords.length > 0 && (
                <div>
                  <Label>Keywords</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.keywords.map((k, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Thesis;

