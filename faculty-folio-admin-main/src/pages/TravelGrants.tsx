import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Download,
  Calendar,
  DollarSign,
} from "lucide-react";
import { apiClient, TravelGrant } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { UET_DEPARTMENTS } from "@/lib/constants";

// Travel Grant Form Component
function TravelGrantForm({ grant, onSuccess }: { grant?: TravelGrant | null; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch users for applicant selection
  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => apiClient.getUsers({ page: 1, limit: 1000 }),
  });

  const users = usersData?.data?.users || [];
  
  const [formData, setFormData] = useState({
    title: grant?.title || '',
    purpose: grant?.purpose || '',
    applicant: (grant?.applicant as any)?._id || grant?.applicant || user?._id || '',
    department: grant?.department || user?.department || '',
    event: {
      name: grant?.event?.name || '',
      type: grant?.event?.type || 'Conference',
      startDate: grant?.event?.startDate || '',
      endDate: grant?.event?.endDate || '',
    },
    travelDetails: {
      departureDate: grant?.travelDetails?.departureDate || '',
      returnDate: grant?.travelDetails?.returnDate || '',
      departureCity: grant?.travelDetails?.departureCity || '',
      destinationCountry: grant?.travelDetails?.destinationCountry || '',
      destinationCity: grant?.travelDetails?.destinationCity || '',
      transportMode: grant?.travelDetails?.transportMode || 'Air',
    },
    funding: {
      totalAmount: grant?.funding?.totalAmount || 0,
      requestedAmount: grant?.funding?.requestedAmount || 0,
      approvedAmount: grant?.funding?.approvedAmount || 0,
      fundingAgency: {
        name: grant?.funding?.fundingAgency?.name || '',
        type: grant?.funding?.fundingAgency?.type || 'Internal',
      },
    },
    status: grant?.status || 'Draft',
    keywords: grant?.keywords?.join(', ') || '',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createTravelGrant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelGrants'] });
      queryClient.invalidateQueries({ queryKey: ['travelStats'] });
      toast.success('Travel grant created successfully');
      onSuccess();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.updateTravelGrant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelGrants'] });
      queryClient.invalidateQueries({ queryKey: ['travelStats'] });
      toast.success('Travel grant updated successfully');
      onSuccess();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
    };

    if (grant?._id) {
      updateMutation.mutate({ id: grant._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Travel Grant Title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicant">Applicant *</Label>
            <Select 
              value={formData.applicant || user?._id} 
              onValueChange={(value) => setFormData({ ...formData, applicant: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Applicant" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u._id} value={u._id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
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

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose *</Label>
          <Textarea
            id="purpose"
            required
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="Purpose of travel..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Event Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventName">Event Name *</Label>
            <Input
              id="eventName"
              required
              value={formData.event.name}
              onChange={(e) => setFormData({ ...formData, event: { ...formData.event, name: e.target.value } })}
              placeholder="Conference/Event Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type *</Label>
            <Select value={formData.event.type} onValueChange={(value) => setFormData({ ...formData, event: { ...formData.event, type: value } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conference">Conference</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Seminar">Seminar</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Research Visit">Research Visit</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventStart">Event Start Date *</Label>
            <Input
              id="eventStart"
              type="date"
              required
              value={formData.event.startDate}
              onChange={(e) => setFormData({ ...formData, event: { ...formData.event, startDate: e.target.value } })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventEnd">Event End Date *</Label>
            <Input
              id="eventEnd"
              type="date"
              required
              value={formData.event.endDate}
              onChange={(e) => setFormData({ ...formData, event: { ...formData.event, endDate: e.target.value } })}
            />
          </div>
        </div>
      </div>

      {/* Travel Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Travel Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departureCity">Departure City *</Label>
            <Input
              id="departureCity"
              required
              value={formData.travelDetails.departureCity}
              onChange={(e) => setFormData({ ...formData, travelDetails: { ...formData.travelDetails, departureCity: e.target.value } })}
              placeholder="Departure City"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationCity">Destination City *</Label>
            <Input
              id="destinationCity"
              required
              value={formData.travelDetails.destinationCity}
              onChange={(e) => setFormData({ ...formData, travelDetails: { ...formData.travelDetails, destinationCity: e.target.value } })}
              placeholder="Destination City"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationCountry">Destination Country *</Label>
            <Input
              id="destinationCountry"
              required
              value={formData.travelDetails.destinationCountry}
              onChange={(e) => setFormData({ ...formData, travelDetails: { ...formData.travelDetails, destinationCountry: e.target.value } })}
              placeholder="Country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transportMode">Transport Mode</Label>
            <Select value={formData.travelDetails.transportMode} onValueChange={(value) => setFormData({ ...formData, travelDetails: { ...formData.travelDetails, transportMode: value } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Air">Air</SelectItem>
                <SelectItem value="Rail">Rail</SelectItem>
                <SelectItem value="Road">Road</SelectItem>
                <SelectItem value="Sea">Sea</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departureDate">Departure Date *</Label>
            <Input
              id="departureDate"
              type="date"
              required
              value={formData.travelDetails.departureDate}
              onChange={(e) => setFormData({ ...formData, travelDetails: { ...formData.travelDetails, departureDate: e.target.value } })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="returnDate">Return Date *</Label>
            <Input
              id="returnDate"
              type="date"
              required
              value={formData.travelDetails.returnDate}
              onChange={(e) => setFormData({ ...formData, travelDetails: { ...formData.travelDetails, returnDate: e.target.value } })}
            />
          </div>
        </div>
      </div>

      {/* Funding Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Funding Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount (PKR)</Label>
            <Input
              id="totalAmount"
              type="number"
              value={formData.funding.totalAmount}
              onChange={(e) => setFormData({ ...formData, funding: { ...formData.funding, totalAmount: Number(e.target.value) } })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestedAmount">Requested Amount (PKR)</Label>
            <Input
              id="requestedAmount"
              type="number"
              value={formData.funding.requestedAmount}
              onChange={(e) => setFormData({ ...formData, funding: { ...formData.funding, requestedAmount: Number(e.target.value) } })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="approvedAmount">Approved Amount (PKR)</Label>
            <Input
              id="approvedAmount"
              type="number"
              value={formData.funding.approvedAmount}
              onChange={(e) => setFormData({ ...formData, funding: { ...formData.funding, approvedAmount: Number(e.target.value) } })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fundingAgency">Funding Agency</Label>
            <Input
              id="fundingAgency"
              value={formData.funding.fundingAgency.name}
              onChange={(e) => setFormData({ ...formData, funding: { ...formData.funding, fundingAgency: { ...formData.funding.fundingAgency, name: e.target.value } } })}
              placeholder="Agency Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fundingType">Funding Type</Label>
            <Select value={formData.funding.fundingAgency.type} onValueChange={(value) => setFormData({ ...formData, funding: { ...formData.funding, fundingAgency: { ...formData.funding.fundingAgency, type: value } } })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="External">External</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
        <Input
          id="keywords"
          value={formData.keywords}
          onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? 'Saving...' : grant ? 'Update Travel Grant' : 'Create Travel Grant'}
        </Button>
      </div>
    </form>
  );
}

export default function TravelGrants() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<TravelGrant | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch travel grants
  const { data: grantsData, isLoading } = useQuery({
    queryKey: ['travelGrants', search, statusFilter],
    queryFn: () => apiClient.getTravelGrants({
      page: 1,
      limit: 100,
      search,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  });

  const grants = grantsData?.data?.travelGrants || [];

  // Fetch travel grant stats
  const { data: statsData } = useQuery({
    queryKey: ['travelStats'],
    queryFn: () => apiClient.getTravelStats(),
  });

  const stats = statsData?.data || {};

  // Approval mutations
  const approveTravelMutation = useMutation({
    mutationFn: (id: string) => apiClient.approveTravelGrant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelGrants'] });
      queryClient.invalidateQueries({ queryKey: ['travelStats'] });
      toast.success('Travel grant approved successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rejectTravelMutation = useMutation({
    mutationFn: (id: string) => apiClient.rejectTravelGrant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelGrants'] });
      queryClient.invalidateQueries({ queryKey: ['travelStats'] });
      toast.success('Travel grant rejected');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteTravelMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTravelGrant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelGrants'] });
      queryClient.invalidateQueries({ queryKey: ['travelStats'] });
      toast.success('Travel grant deleted successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleEdit = (grant: TravelGrant) => {
    setSelectedGrant(grant);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this travel grant?')) {
      deleteTravelMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Travel Grants Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all faculty travel grant applications and approvals.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Travel Grant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Travel Grant</DialogTitle>
                <DialogDescription>
                  Create a new travel grant application.
                </DialogDescription>
              </DialogHeader>
              <TravelGrantForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Grants</p>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
              </div>
              <Plane className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approvedCount || 0}</p>
              </div>
              <Badge className="bg-success text-success-foreground">Approved</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pendingCount || 0}</p>
              </div>
              <Badge className="bg-warning text-warning-foreground">Review</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">PKR {stats.totalAmount?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search travel grants, events, destinations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Travel Grants Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Travel Grants List</CardTitle>
          <CardDescription>
            {grants.length} travel grants found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Event</TableHead>
                  <TableHead>Travel Details</TableHead>
                  <TableHead>Funding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grants.map((grant) => (
                  <TableRow key={grant._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{grant.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{grant.event?.name}</p>
                        <p className="text-xs text-muted-foreground">{grant.event?.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{grant.travelDetails?.departureCity} → {grant.travelDetails?.destinationCity}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(grant.travelDetails?.departureDate).toLocaleDateString()} - {new Date(grant.travelDetails?.returnDate).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">PKR {grant.funding?.totalAmount?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{grant.funding?.fundingAgency?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{grant.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedGrant(grant); setIsViewDialogOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(grant)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(grant._id)} disabled={deleteTravelMutation.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {user?.role === 'admin' && (grant.status === "Submitted" || grant.status === "Under Review") && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-success" 
                              title="Approve"
                              onClick={() => approveTravelMutation.mutate(grant._id)}
                              disabled={approveTravelMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive" 
                              title="Reject"
                              onClick={() => rejectTravelMutation.mutate(grant._id)}
                              disabled={rejectTravelMutation.isPending}
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
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Travel Grant</DialogTitle>
            <DialogDescription>
              Update the travel grant information.
            </DialogDescription>
          </DialogHeader>
          <TravelGrantForm 
            grant={selectedGrant} 
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setSelectedGrant(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedGrant && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedGrant.title}</DialogTitle>
              <DialogDescription>Travel Grant Details</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Applicant</Label>
                  <p className="font-medium">
                    {typeof selectedGrant.applicant === 'string' 
                      ? selectedGrant.applicant 
                      : `${(selectedGrant.applicant as any)?.firstName} ${(selectedGrant.applicant as any)?.lastName}`}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">{selectedGrant.department || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div><Badge variant="outline">{selectedGrant.status}</Badge></div>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Purpose</Label>
                <p className="mt-1">{selectedGrant.purpose}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Event Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Event Name</Label>
                    <p>{selectedGrant.event?.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Type</Label>
                    <p>{selectedGrant.event?.type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Dates</Label>
                    <p className="text-sm">
                      {new Date(selectedGrant.event?.startDate).toLocaleDateString()} - {new Date(selectedGrant.event?.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Travel Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">From</Label>
                    <p className="font-medium">{selectedGrant.travelDetails?.departureCity || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">To</Label>
                    <p className="font-medium">{selectedGrant.travelDetails?.destinationCity}, {selectedGrant.travelDetails?.destinationCountry}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Transport Mode</Label>
                    <p>{selectedGrant.travelDetails?.transportMode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Travel Dates</Label>
                    <p className="text-sm">
                      {new Date(selectedGrant.travelDetails?.departureDate).toLocaleDateString()} - {new Date(selectedGrant.travelDetails?.returnDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Funding Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-medium">PKR {selectedGrant.funding?.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Requested</Label>
                    <p>PKR {selectedGrant.funding?.requestedAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Approved</Label>
                    <p>PKR {selectedGrant.funding?.approvedAmount?.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Funding Agency</Label>
                  <p>{selectedGrant.funding?.fundingAgency?.name} ({selectedGrant.funding?.fundingAgency?.type})</p>
                </div>
              </div>

              {selectedGrant.keywords && selectedGrant.keywords.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Keywords</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedGrant.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}