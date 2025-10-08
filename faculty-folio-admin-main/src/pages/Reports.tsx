import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  BookOpen,
  Briefcase,
  GraduationCap,
  Plane,
  Presentation,
  Users,
  FileText as FileSpreadsheet,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { exportToExcel, generateComprehensiveReport, formatReportData, testExcelExport, exportCompleteReport } from "@/utils/excelExport";

export default function Reports() {
  const [selectedModule, setSelectedModule] = useState("all");
  const [exportFormat, setExportFormat] = useState("excel");

  // Generate comprehensive report
  const generateReport = async () => {
    try {
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  // Export all data with proper headings and separation
  const exportAllData = async () => {
    try {
      const loadingToast = toast.loading('Preparing comprehensive Excel report...');
      
      // Fetch all module data
      const allData = await fetchAllModuleData();
      
      // Check if we have any data
      const hasData = Object.values(allData).some((data: any) => Array.isArray(data) && data.length > 0);
      if (!hasData) {
        toast.dismiss(loadingToast);
        toast.warning('No data available to export');
        return;
      }
      
      // Create comprehensive report with proper headings
      const filename = `UET_Taxila_Complete_Data_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      await generateCompleteReport(allData, filename);
      
      toast.dismiss(loadingToast);
      toast.success('Complete data export downloaded successfully!');
    } catch (error) {
      console.error('Complete export error:', error);
      toast.error('Failed to export complete data. Please try again.');
    }
  };

  // Export data
  const exportData = async (format: string, module?: string) => {
    try {
      if (format === 'excel') {
        await exportExcelData(module);
      } else if (format === 'csv') {
        await exportCsvData(module);
      } else if (format === 'pdf') {
        // PDF export would need a different library
        toast.info('PDF export feature coming soon!');
        return;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Export Excel data
  const exportExcelData = async (module?: string) => {
    try {
      const targetModule = module || selectedModule;
      
      // Show loading toast
      const loadingToast = toast.loading('Preparing Excel file...');
      
      if (targetModule === 'all') {
        // Export comprehensive report with all modules
        const allData = await fetchAllModuleData();
        const filename = `UET_Taxila_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Check if we have any data
        const hasData = Object.values(allData).some((data: any) => Array.isArray(data) && data.length > 0);
        if (!hasData) {
          toast.dismiss(loadingToast);
          toast.warning('No data available to export');
          return;
        }
        
        generateComprehensiveReport(allData, filename);
        toast.dismiss(loadingToast);
        toast.success('Comprehensive Excel report downloaded successfully!');
      } else {
        // Export specific module
        const moduleData = await fetchModuleData(targetModule);
        if (!moduleData || moduleData.length === 0) {
          toast.dismiss(loadingToast);
          toast.warning(`No data available for ${targetModule}`);
          return;
        }

        const formattedData = formatModuleData(targetModule, moduleData);
        const filename = `UET_Taxila_${targetModule}_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        exportToExcel(formattedData, {
          filename,
          sheetName: targetModule.charAt(0).toUpperCase() + targetModule.slice(1),
          includeHeaders: true,
          autoWidth: true
        });
        
        toast.dismiss(loadingToast);
        toast.success(`${targetModule.charAt(0).toUpperCase() + targetModule.slice(1)} Excel report downloaded successfully!`);
      }
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export Excel file. Please try again.');
    }
  };

  // Export CSV data
  const exportCsvData = async (module?: string) => {
    try {
      const targetModule = module || selectedModule;
      const moduleData = await fetchModuleData(targetModule);
      
      if (!moduleData || moduleData.length === 0) {
        toast.warning(`No data available for ${targetModule}`);
        return;
      }

      const formattedData = formatModuleData(targetModule, moduleData);
      const csvContent = convertToCSV(formattedData);
      const filename = `UET_Taxila_${targetModule}_${new Date().toISOString().split('T')[0]}.csv`;
      
      downloadCSV(csvContent, filename);
      toast.success(`${targetModule.charAt(0).toUpperCase() + targetModule.slice(1)} CSV exported successfully!`);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV file');
    }
  };

  // Fetch all module data
  const fetchAllModuleData = async () => {
    try {
      const [publications, projects, fyp, theses, travel, events, users] = await Promise.all([
        apiClient.getPublications({ page: 1, limit: 1000 }).catch(() => ({ data: { publications: [] } })),
        apiClient.getProjects({ page: 1, limit: 1000 }).catch(() => ({ data: { projects: [] } })),
        apiClient.getFYPProjects({ page: 1, limit: 1000 }).catch(() => ({ data: { fypProjects: [] } })),
        apiClient.getThesisSupervisions({ page: 1, limit: 1000 }).catch(() => ({ data: { thesisSupervisions: [] } })),
        apiClient.getTravelGrants({ page: 1, limit: 1000 }).catch(() => ({ data: { travelGrants: [] } })),
        apiClient.getEvents({ page: 1, limit: 1000 }).catch(() => ({ data: { events: [] } })),
        apiClient.getUsers({ page: 1, limit: 1000 }).catch(() => ({ data: { users: [] } }))
      ]);

      return {
        publications: publications.data?.publications || [],
        projects: projects.data?.projects || [],
        fyp: fyp.data?.fypProjects || [],
        theses: theses.data?.thesisSupervisions || [],
        travel: travel.data?.travelGrants || [],
        events: events.data?.events || [],
        users: users.data?.users || []
      };
    } catch (error) {
      console.error('Error fetching all module data:', error);
      return {};
    }
  };

  // Fetch specific module data
  const fetchModuleData = async (module: string) => {
    try {
    switch (module) {
        case 'publications':
          const pubResponse = await apiClient.getPublications({ page: 1, limit: 1000 });
          return pubResponse.data?.publications || [];
        case 'projects':
          const projResponse = await apiClient.getProjects({ page: 1, limit: 1000 });
          return projResponse.data?.projects || [];
        case 'fyp':
          const fypResponse = await apiClient.getFYPProjects({ page: 1, limit: 1000 });
          return fypResponse.data?.fypProjects || [];
        case 'theses':
          const thesisResponse = await apiClient.getThesisSupervisions({ page: 1, limit: 1000 });
          return thesisResponse.data?.thesisSupervisions || [];
        case 'travel':
          const travelResponse = await apiClient.getTravelGrants({ page: 1, limit: 1000 });
          return travelResponse.data?.travelGrants || [];
        case 'events':
          const eventResponse = await apiClient.getEvents({ page: 1, limit: 1000 });
          return eventResponse.data?.events || [];
        case 'users':
          const userResponse = await apiClient.getUsers({ page: 1, limit: 1000 });
          return userResponse.data?.users || [];
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching ${module} data:`, error);
      return [];
    }
  };

  // Format module data
  const formatModuleData = (module: string, data: any[]) => {
    switch (module) {
      case 'publications':
        return formatReportData.publications(data);
      case 'projects':
        return formatReportData.projects(data);
      case 'fyp':
        return formatReportData.fyp(data);
      case 'travel':
        return formatReportData.travel(data);
      case 'events':
        return formatReportData.events(data);
      case 'users':
        return formatReportData.users(data);
      default:
        return data;
    }
  };

  // Convert data to CSV
  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  // Download CSV file
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate complete report with proper headings and separation
  const generateCompleteReport = async (data: any, filename: string) => {
    const sheets = [];

    // Add summary sheet first
    const summaryData = [
      { 'Module': 'Publications', 'Total Records': data.publications?.length || 0, 'Status': 'Active' },
      { 'Module': 'Research Projects', 'Total Records': data.projects?.length || 0, 'Status': 'Active' },
      { 'Module': 'FYP Projects', 'Total Records': data.fyp?.length || 0, 'Status': 'Active' },
      { 'Module': 'Thesis', 'Total Records': data.theses?.length || 0, 'Status': 'Active' },
      { 'Module': 'Travel Grants', 'Total Records': data.travel?.length || 0, 'Status': 'Active' },
      { 'Module': 'Events', 'Total Records': data.events?.length || 0, 'Status': 'Active' },
      { 'Module': 'Users', 'Total Records': data.users?.length || 0, 'Status': 'Active' },
    ];

    sheets.push({
      name: 'Summary',
      data: summaryData
    });

    // Add individual module sheets with proper formatting
    if (data.publications && data.publications.length > 0) {
      sheets.push({
        name: 'Publications',
        data: formatReportData.publications(data.publications)
      });
    }

    if (data.projects && data.projects.length > 0) {
      sheets.push({
        name: 'Research Projects',
        data: formatReportData.projects(data.projects)
      });
    }

    if (data.fyp && data.fyp.length > 0) {
      sheets.push({
        name: 'FYP Projects',
        data: formatReportData.fyp(data.fyp)
      });
    }

    if (data.theses && data.theses.length > 0) {
      sheets.push({
        name: 'Thesis',
        data: formatReportData.theses(data.theses)
      });
    }

    if (data.travel && data.travel.length > 0) {
      sheets.push({
        name: 'Travel Grants',
        data: formatReportData.travel(data.travel)
      });
    }

    if (data.events && data.events.length > 0) {
      sheets.push({
        name: 'Events',
        data: formatReportData.events(data.events)
      });
    }

    if (data.users && data.users.length > 0) {
      sheets.push({
        name: 'Users',
        data: formatReportData.users(data.users)
      });
    }

    if (sheets.length === 0) {
      throw new Error('No data available to export');
    }

    // Use the enhanced export function
    await exportCompleteReport(sheets, filename);
  };


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Reports & Export</h1>
          <p className="text-muted-foreground mt-1">
            Export data from all modules in Excel format.
          </p>
        </div>
          <Button 
            size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => exportAllData()}
          >
            <Download className="h-4 w-4 mr-2" />
          Export All Data
          </Button>
      </div>

      {/* Export Options */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Choose what data to export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="publications">Publications</SelectItem>
                  <SelectItem value="projects">Funded Projects</SelectItem>
                  <SelectItem value="fyp">Final Year Projects</SelectItem>
                  <SelectItem value="theses">Thesis Supervision</SelectItem>
                  <SelectItem value="events">Events & Workshops</SelectItem>
                  <SelectItem value="travel">Travel Grants</SelectItem>
                  <SelectItem value="users">Users & Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Export Buttons */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
          <CardDescription>
            Export data from specific modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => exportData('excel', 'publications')}
            >
              <BookOpen className="h-6 w-6" />
              <span className="text-sm">Publications</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => exportData('excel', 'projects')}
            >
              <Briefcase className="h-6 w-6" />
              <span className="text-sm">Projects</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => exportData('excel', 'fyp')}
            >
              <GraduationCap className="h-6 w-6" />
              <span className="text-sm">FYP Projects</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => exportData('excel', 'theses')}
            >
              <Presentation className="h-6 w-6" />
              <span className="text-sm">Thesis</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => exportData('excel', 'events')}
            >
              <Presentation className="h-6 w-6" />
              <span className="text-sm">Events</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => exportData('excel', 'travel')}
            >
              <Plane className="h-6 w-6" />
              <span className="text-sm">Travel Grants</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => exportData('excel', 'users')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => exportData('excel', 'all')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">All Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
