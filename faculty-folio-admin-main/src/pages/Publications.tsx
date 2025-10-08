import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Publication } from "@/lib/api";
import { UET_DEPARTMENTS } from "@/lib/constants";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Download,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Published":
      return <Badge className="bg-green-500 text-white">Published</Badge>;
    case "Submitted":
      return <Badge variant="secondary">Submitted</Badge>;
    case "Under Review":
      return <Badge className="bg-yellow-500 text-white">Under Review</Badge>;
    case "Rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "Draft":
      return <Badge variant="outline">Draft</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface PublicationFormData {
  title: string;
  publicationType: string;
  publicationDate: string;
  journalName?: string;
  conferenceName?: string;
  doi?: string;
  department: string;
  authors: Array<{
    name: string;
    email?: string;
    authorOrder: number;
    isCorrespondingAuthor: boolean;
  }>;
  status: string;
  keywords: string[];
  abstract?: string;
}

export default function Publications() {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [formData, setFormData] = useState<PublicationFormData>({
    title: "",
    publicationType: "",
    publicationDate: "",
    department: user?.department || "",
    journalName: "",
    conferenceName: "",
    doi: "",
    authors: [{ name: "", email: "", authorOrder: 1, isCorrespondingAuthor: true }],
    status: "Draft",
    keywords: [],
    abstract: "",
  });

  // Fetch publications
  const fetchPublications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPublications({
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      
      if (response.success) {
        setPublications(response.data.publications || []);
      }
    } catch (error) {
      console.error("Error fetching publications:", error);
      toast.error("Failed to fetch publications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [searchQuery, statusFilter]);

  // Create publication
  const handleCreatePublication = async () => {
    try {
      const response = await apiClient.createPublication(formData);
      if (response.success) {
        toast.success("Publication created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchPublications();
      }
    } catch (error) {
      console.error("Error creating publication:", error);
      toast.error("Failed to create publication");
    }
  };

  // Update publication
  const handleUpdatePublication = async () => {
    if (!selectedPublication) return;
    
    try {
      const response = await apiClient.updatePublication(selectedPublication._id, formData);
      if (response.success) {
        toast.success("Publication updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        fetchPublications();
      }
    } catch (error) {
      console.error("Error updating publication:", error);
      toast.error("Failed to update publication");
    }
  };

  // Delete publication
  const handleDeletePublication = async (id: string) => {
    try {
      const response = await apiClient.deletePublication(id);
      if (response.success) {
        toast.success("Publication deleted successfully");
        fetchPublications();
      }
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast.error("Failed to delete publication");
    }
  };

  // Approve publication
  const handleApprovePublication = async (id: string) => {
    try {
      const response = await apiClient.approvePublication(id);
      if (response.success) {
        toast.success("Publication approved successfully");
        fetchPublications();
      }
    } catch (error) {
      console.error("Error approving publication:", error);
      toast.error("Failed to approve publication");
    }
  };

  // Reject publication
  const handleRejectPublication = async (id: string) => {
    try {
      const response = await apiClient.rejectPublication(id);
      if (response.success) {
        toast.success("Publication rejected successfully");
        fetchPublications();
      }
    } catch (error) {
      console.error("Error rejecting publication:", error);
      toast.error("Failed to reject publication");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      publicationType: "",
      publicationDate: "",
      department: user?.department || "",
      journalName: "",
      conferenceName: "",
      doi: "",
      authors: [{ name: "", email: "", authorOrder: 1, isCorrespondingAuthor: true }],
      status: "Draft",
      keywords: [],
      abstract: "",
    });
  };

  const openEditDialog = (publication: Publication) => {
    setSelectedPublication(publication);
    setFormData({
      title: publication.title,
      publicationType: publication.publicationType,
      publicationDate: publication.publicationDate,
      department: publication.department || user?.department || "",
      journalName: publication.journalName || "",
      conferenceName: publication.conferenceName || "",
      doi: publication.doi || "",
      authors: publication.authors,
      status: publication.status,
      keywords: publication.keywords,
      abstract: publication.abstract || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsViewDialogOpen(true);
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, { 
        name: "", 
        email: "", 
        authorOrder: prev.authors.length + 1, 
        isCorrespondingAuthor: false 
      }]
    }));
  };

  const removeAuthor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
  };

  const updateAuthor = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.map((author, i) => 
        i === index ? { ...author, [field]: value } : author
      )
    }));
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const filteredPublications = publications.filter(pub => {
    const matchesYear = yearFilter === "all" || 
      new Date(pub.publicationDate).getFullYear().toString() === yearFilter;
    return matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Publications Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all faculty publications and research outputs.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-primary" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Publication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Publication</DialogTitle>
                <DialogDescription>
                  Add a new publication to the system.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Publication title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="publicationType">Publication Type *</Label>
                    <Select value={formData.publicationType} onValueChange={(value) => setFormData(prev => ({ ...prev, publicationType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Journal Article">Journal Article</SelectItem>
                        <SelectItem value="Conference Paper">Conference Paper</SelectItem>
                        <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                        <SelectItem value="Book">Book</SelectItem>
                        <SelectItem value="Patent">Patent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="publicationDate">Publication Date *</Label>
                    <Input
                      id="publicationDate"
                      type="date"
                      value={formData.publicationDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, publicationDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
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

                {formData.publicationType === "Journal Article" && (
                  <div>
                    <Label htmlFor="journalName">Journal Name</Label>
                    <Input
                      id="journalName"
                      value={formData.journalName}
                      onChange={(e) => setFormData(prev => ({ ...prev, journalName: e.target.value }))}
                      placeholder="Journal name"
                    />
                  </div>
                )}

                {formData.publicationType === "Conference Paper" && (
                  <div>
                    <Label htmlFor="conferenceName">Conference Name</Label>
                    <Input
                      id="conferenceName"
                      value={formData.conferenceName}
                      onChange={(e) => setFormData(prev => ({ ...prev, conferenceName: e.target.value }))}
                      placeholder="Conference name"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="doi">DOI</Label>
                  <Input
                    id="doi"
                    value={formData.doi}
                    onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                    placeholder="Digital Object Identifier"
                  />
                </div>

                <div>
                  <Label>Authors *</Label>
                  {formData.authors.map((author, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Author name"
                        value={author.name}
                        onChange={(e) => updateAuthor(index, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        value={author.email}
                        onChange={(e) => updateAuthor(index, "email", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAuthor(index)}
                        disabled={formData.authors.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addAuthor}>
                    Add Author
                  </Button>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="abstract">Abstract</Label>
                  <Textarea
                    id="abstract"
                    value={formData.abstract}
                    onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                    placeholder="Publication abstract"
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePublication}>
                  Create Publication
                </Button>
              </DialogFooter>
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
                <p className="text-sm font-medium text-muted-foreground">Total Publications</p>
                <p className="text-2xl font-bold">{publications.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{publications.filter(p => p.status === "Published").length}</p>
              </div>
              <Badge className="bg-green-500 text-white">Published</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">{publications.filter(p => p.status === "Under Review").length}</p>
              </div>
              <Badge className="bg-yellow-500 text-white">Review</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Year</p>
                <p className="text-2xl font-bold">{publications.filter(p => new Date(p.publicationDate).getFullYear() === new Date().getFullYear()).length}</p>
              </div>
              <Badge className="bg-blue-500 text-white">{new Date().getFullYear()}</Badge>
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
                  placeholder="Search publications, authors, journals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Publications Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Publications List</CardTitle>
          <CardDescription>
            {filteredPublications.length} publications found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading publications...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title & Authors</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPublications.map((pub) => (
                    <TableRow key={pub._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{pub.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pub.authors.map(a => a.name).join(", ")}
                          </p>
                          {pub.doi && (
                            <p className="text-xs text-muted-foreground">DOI: {pub.doi}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{pub.publicationType}</p>
                        {pub.journalName && (
                          <p className="text-xs text-muted-foreground">{pub.journalName}</p>
                        )}
                        {pub.conferenceName && (
                          <p className="text-xs text-muted-foreground">{pub.conferenceName}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {new Date(pub.publicationDate).getFullYear()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(pub.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openViewDialog(pub)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(pub)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Publication</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this publication? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePublication(pub._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          {user?.role === 'admin' && (pub.status === "Submitted" || pub.status === "Under Review") && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-600" 
                                title="Approve"
                                onClick={() => handleApprovePublication(pub._id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600" 
                                title="Reject"
                                onClick={() => handleRejectPublication(pub._id)}
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
          )}
        </CardContent>
      </Card>

      {/* View Publication Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publication Details</DialogTitle>
          </DialogHeader>
          {selectedPublication && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Title</Label>
                <p className="text-sm">{selectedPublication.title}</p>
              </div>
              <div>
                <Label className="font-semibold">Authors</Label>
                <p className="text-sm">{selectedPublication.authors.map(a => a.name).join(", ")}</p>
              </div>
              <div>
                <Label className="font-semibold">Type</Label>
                <p className="text-sm">{selectedPublication.publicationType}</p>
              </div>
              <div>
                <Label className="font-semibold">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedPublication.status)}</div>
              </div>
              {selectedPublication.abstract && (
                <div>
                  <Label className="font-semibold">Abstract</Label>
                  <p className="text-sm">{selectedPublication.abstract}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Publication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Publication</DialogTitle>
            <DialogDescription>
              Update the publication information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Publication title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-publicationType">Publication Type *</Label>
                <Select value={formData.publicationType} onValueChange={(value) => setFormData(prev => ({ ...prev, publicationType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Journal Article">Journal Article</SelectItem>
                    <SelectItem value="Conference Paper">Conference Paper</SelectItem>
                    <SelectItem value="Book Chapter">Book Chapter</SelectItem>
                    <SelectItem value="Book">Book</SelectItem>
                    <SelectItem value="Patent">Patent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-publicationDate">Publication Date *</Label>
                <Input
                  id="edit-publicationDate"
                  type="date"
                  value={formData.publicationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publicationDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
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
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-abstract">Abstract</Label>
              <Textarea
                id="edit-abstract"
                value={formData.abstract}
                onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                placeholder="Publication abstract"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePublication}>
              Update Publication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}