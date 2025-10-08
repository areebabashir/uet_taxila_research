import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Event } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Clock, MapPin, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UET_DEPARTMENTS } from '@/lib/constants';

const Events: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [eventTypeSel, setEventTypeSel] = useState('');
  const [eventFormatSel, setEventFormatSel] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTypeSel, setEditTypeSel] = useState('');
  const [editFormatSel, setEditFormatSel] = useState('');

  const queryClient = useQueryClient();

  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events', page, search, statusFilter, typeFilter, formatFilter],
    queryFn: () => apiClient.getEvents({
      page,
      limit: 10,
      search: search || undefined,
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      format: formatFilter || undefined,
    }),
  });

  const createEventMutation = useMutation({
    mutationFn: (eventData: Partial<Event>) => apiClient.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsCreateDialogOpen(false);
      toast.success('Event created successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) => apiClient.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsEditDialogOpen(false);
      toast.success('Event updated successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Approval mutations
  const approveEventMutation = useMutation({
    mutationFn: (id: string) => apiClient.approveEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event approved successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rejectEventMutation = useMutation({
    mutationFn: (id: string) => apiClient.rejectEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event rejected');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleCreateEvent = (formData: FormData) => {
    const title = (formData.get('title') as string || '').trim();
    const department = (formData.get('department') as string || '').trim();
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const startTime = (formData.get('startTime') as string || '').trim();
    const endTime = (formData.get('endTime') as string || '').trim();
    if (!title) return toast.error('Title is required');
    if (!department) return toast.error('Department is required');
    if (!eventTypeSel) return toast.error('Event Type is required');
    if (!eventFormatSel) return toast.error('Event Format is required');
    if (!startDate) return toast.error('Start date is required');
    if (!endDate) return toast.error('End date is required');
    if (new Date(startDate) > new Date(endDate)) return toast.error('End date must be after start date');
    if (!startTime) return toast.error('Start time is required');
    if (!endTime) return toast.error('End time is required');

    const eventData: Partial<Event> = {
      title: formData.get('title') as string,
      department: formData.get('department') as string,
      eventType: eventTypeSel,
      eventFormat: eventFormatSel,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      description: formData.get('description') as string,
      keywords: (formData.get('keywords') as string)?.split(',').map(k => k.trim()).filter(Boolean) || [],
    };
    createEventMutation.mutate(eventData);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Delete this event?')) deleteEventMutation.mutate(id);
  };

  const handleOpenEdit = (ev: Event) => {
    setSelectedEvent(ev);
    setEditTypeSel(ev.eventType || '');
    setEditFormatSel(ev.eventFormat || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = (formData: FormData) => {
    if (!selectedEvent) return;
    const data: Partial<Event> = {
      title: (formData.get('title') as string) || selectedEvent.title,
      description: (formData.get('description') as string) || selectedEvent.description,
      eventType: editTypeSel || selectedEvent.eventType,
      eventFormat: editFormatSel || selectedEvent.eventFormat,
      startDate: (formData.get('startDate') as string) || selectedEvent.startDate,
      endDate: (formData.get('endDate') as string) || selectedEvent.endDate,
      startTime: (formData.get('startTime') as string) || selectedEvent.startTime,
      endTime: (formData.get('endTime') as string) || selectedEvent.endTime,
      keywords: ((formData.get('keywords') as string) || (selectedEvent.keywords || []).join(',')).split(',').map(k => k.trim()).filter(Boolean),
    };
    updateEventMutation.mutate({ id: selectedEvent._id, data });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'planned':
      case 'scheduled':
        return 'secondary';
      case 'ongoing':
        return 'default';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (error) {
    return <div className="p-8 text-center text-red-500">{(error as Error).message}</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events & Workshops</h1>
          <p className="text-muted-foreground">Manage seminars, workshops and conferences</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
              <DialogDescription>Provide event details</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateEvent(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="eventType">Type</Label>
                  <Select value={eventTypeSel || ''} onValueChange={setEventTypeSel} required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventFormat">Format</Label>
                  <Select value={eventFormatSel || ''} onValueChange={setEventFormatSel} required>
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physical">Physical</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" required />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input id="keywords" name="keywords" placeholder="AI, Workshop" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createEventMutation.isPending}>{createEventMutation.isPending ? 'Creating...' : 'Create'}</Button>
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
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="search" className="pl-8" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
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
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={formatFilter || 'all'} onValueChange={(v) => setFormatFilter(v === 'all' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Physical">Physical</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); setFormatFilter(''); setPage(1); }}>Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>{eventsData?.data.pagination.totalItems || 0} total events</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsData?.data.events.map((ev) => (
                  <TableRow key={ev._id}>
                    <TableCell className="font-medium">{ev.title}</TableCell>
                    <TableCell>{ev.eventType}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(ev.status || '')}>{ev.status || 'Planned'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedEvent(ev); setIsViewDialogOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(ev)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(ev._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {user?.role === 'admin' && ev.status === "Proposed" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-success" 
                              title="Approve"
                              onClick={() => approveEventMutation.mutate(ev._id)}
                              disabled={approveEventMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive" 
                              title="Reject"
                              onClick={() => rejectEventMutation.mutate(ev._id)}
                              disabled={rejectEventMutation.isPending}
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
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Event details</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="text-sm font-medium">{selectedEvent.eventType}</p>
                </div>
                <div>
                  <Label>Format</Label>
                  <p className="text-sm font-medium">{selectedEvent.eventFormat}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}</div>
                <div className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {selectedEvent.startTime} - {selectedEvent.endTime}</div>
              </div>
              {selectedEvent.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.keywords && selectedEvent.keywords.length > 0 && (
                <div>
                  <Label>Keywords</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEvent.keywords.map((k, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateEvent(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={selectedEvent.title} />
                </div>
                <div>
                  <Label htmlFor="eventType">Type</Label>
                  <Select value={editTypeSel} onValueChange={setEditTypeSel}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventFormat">Format</Label>
                  <Select value={editFormatSel} onValueChange={setEditFormatSel}>
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physical">Physical</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" defaultValue={selectedEvent.startDate?.slice(0,10)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" defaultValue={selectedEvent.endDate?.slice(0,10)} />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" name="startTime" defaultValue={selectedEvent.startTime} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" name="endTime" defaultValue={selectedEvent.endTime} />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input id="keywords" name="keywords" defaultValue={(selectedEvent.keywords || []).join(', ')} />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} defaultValue={selectedEvent.description || ''} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateEventMutation.isPending}>{updateEventMutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;

