import * as XLSX from 'xlsx';

// Helper function to download blob
const downloadBlob = (blob: Blob, filename: string) => {
  try {
    // Try modern download approach first
    if (navigator.msSaveBlob) {
      // IE/Edge
      navigator.msSaveBlob(blob, filename);
    } else {
      // Modern browsers
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: Open in new window
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
};

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  autoWidth?: boolean;
}

export interface ExcelData {
  [key: string]: any;
}

/**
 * Export data to Excel with proper formatting
 */
export const exportToExcel = (
  data: ExcelData[],
  options: ExcelExportOptions = {}
) => {
  const {
    filename = 'export.xlsx',
    sheetName = 'Sheet1',
    includeHeaders = true,
    autoWidth = true
  } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns if requested
  if (autoWidth) {
    const columnWidths = Object.keys(data[0]).map(key => {
      const maxLength = Math.max(
        key.length, // Header length
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
    });
    worksheet['!cols'] = columnWidths;
  }

  // Add headers styling
  if (includeHeaders) {
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      // Make headers bold
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "F0F0F0" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
  }

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download the file
  try {
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    // Fallback: Create blob and download manually
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, filename);
  }
};

/**
 * Export multiple sheets to Excel
 */
export const exportMultipleSheetsToExcel = (
  sheets: { name: string; data: ExcelData[] }[],
  filename: string = 'export.xlsx'
) => {
  if (!sheets || sheets.length === 0) {
    throw new Error('No sheets to export');
  }

  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, data }) => {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const columnWidths = Object.keys(data[0]).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;

    // Style headers
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "F0F0F0" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  try {
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    // Fallback: Create blob and download manually
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, filename);
  }
};

/**
 * Format data for specific report types
 */
export const formatReportData = {
  publications: (data: any[]) => {
    return data.map(item => ({
      'Title': item.title || '',
      'Publication Type': item.publicationType || '',
      'Journal/Conference': item.journalName || item.conferenceName || '',
      'Publication Date': item.publicationDate ? new Date(item.publicationDate).toLocaleDateString() : '',
      'DOI': item.doi || '',
      'Status': item.status || '',
      'Authors': Array.isArray(item.authors) ? item.authors.map((a: any) => a.name).join(', ') : '',
      'Keywords': Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      'Abstract': item.abstract || '',
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
    }));
  },

  projects: (data: any[]) => {
    return data.map(item => ({
      'Title': item.title || '',
      'Project Type': item.projectType || '',
      'Status': item.status || '',
      'Start Date': item.startDate ? new Date(item.startDate).toLocaleDateString() : '',
      'End Date': item.endDate ? new Date(item.endDate).toLocaleDateString() : '',
      'Total Budget': item.totalBudget ? `PKR ${item.totalBudget.toLocaleString()}` : '',
      'Funding Agency': item.fundingAgency?.name || '',
      'Principal Investigator': item.principalInvestigator?.name || '',
      'Department': item.principalInvestigator?.department || '',
      'Keywords': Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      'Description': item.description || '',
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
    }));
  },

  fyp: (data: any[]) => {
    return data.map(item => ({
      'Title': item.title || '',
      'Project Type': item.projectType || '',
      'Status': item.status || '',
      'Student Name': item.student?.name || '',
      'Roll Number': item.student?.rollNumber || '',
      'Student Email': item.student?.email || '',
      'Batch': item.student?.batch || '',
      'Department': item.student?.department || '',
      'Supervisor': item.supervisor?.firstName ? `${item.supervisor.firstName} ${item.supervisor.lastName}` : '',
      'Start Date': item.startDate ? new Date(item.startDate).toLocaleDateString() : '',
      'End Date': item.endDate ? new Date(item.endDate).toLocaleDateString() : '',
      'Keywords': Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      'Description': item.description || '',
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
    }));
  },

  travel: (data: any[]) => {
    return data.map(item => ({
      'Title': item.title || '',
      'Purpose': item.purpose || '',
      'Event Name': item.event?.name || '',
      'Event Type': item.event?.type || '',
      'Status': item.status || '',
      'Applicant': item.applicant?.firstName ? `${item.applicant.firstName} ${item.applicant.lastName}` : '',
      'Department': item.applicant?.department || '',
      'Destination': item.travelDetails?.destinationCity || '',
      'Departure Date': item.travelDetails?.departureDate ? new Date(item.travelDetails.departureDate).toLocaleDateString() : '',
      'Return Date': item.travelDetails?.returnDate ? new Date(item.travelDetails.returnDate).toLocaleDateString() : '',
      'Total Amount': item.funding?.totalAmount ? `PKR ${item.funding.totalAmount.toLocaleString()}` : '',
      'Funding Agency': item.funding?.fundingAgency?.name || '',
      'Keywords': Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
    }));
  },

  events: (data: any[]) => {
    return data.map(item => ({
      'Title': item.title || '',
      'Event Type': item.eventType || '',
      'Status': item.status || '',
      'Start Date': item.startDate ? new Date(item.startDate).toLocaleDateString() : '',
      'End Date': item.endDate ? new Date(item.endDate).toLocaleDateString() : '',
      'Location': item.location || '',
      'Organizer': item.organizer?.name || '',
      'Description': item.description || '',
      'Keywords': Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
    }));
  },

  theses: (data: any[]) => {
    return data.map(item => ({
      'Title': item.title || '',
      'Thesis Type': item.thesisType || '',
      'Degree': item.degree || '',
      'Student Name': item.student?.name || '',
      'Roll Number': item.student?.rollNumber || '',
      'Student Email': item.student?.email || '',
      'Batch': item.student?.batch || '',
      'Department': item.student?.department || '',
      'Research Area': item.researchArea || '',
      'Start Date': item.startDate ? new Date(item.startDate).toLocaleDateString() : '',
      'Expected Completion': item.expectedCompletionDate ? new Date(item.expectedCompletionDate).toLocaleDateString() : '',
      'Status': item.status || '',
      'Keywords': Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''
    }));
  },

  users: (data: any[]) => {
    return data.map(item => ({
      'Name': item.firstName ? `${item.firstName} ${item.lastName}` : '',
      'Email': item.email || '',
      'Role': item.role || '',
      'Department': item.department || '',
      'Status': item.status || '',
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
      'Last Login': item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : ''
    }));
  }
};

/**
 * Generate comprehensive report with multiple sheets
 */
export const generateComprehensiveReport = async (
  data: {
    publications?: any[];
    projects?: any[];
    fyp?: any[];
    travel?: any[];
    events?: any[];
    users?: any[];
  },
  filename: string = 'comprehensive_report.xlsx'
) => {
  const sheets = [];

  if (data.publications && data.publications.length > 0) {
    sheets.push({
      name: 'Publications',
      data: formatReportData.publications(data.publications)
    });
  }

  if (data.projects && data.projects.length > 0) {
    sheets.push({
      name: 'Projects',
      data: formatReportData.projects(data.projects)
    });
  }

  if (data.fyp && data.fyp.length > 0) {
    sheets.push({
      name: 'FYP Projects',
      data: formatReportData.fyp(data.fyp)
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

  exportMultipleSheetsToExcel(sheets, filename);
};

/**
 * Export complete report with enhanced formatting
 */
export const exportCompleteReport = async (
  sheets: { name: string; data: ExcelData[] }[],
  filename: string = 'complete_report.xlsx'
) => {
  if (!sheets || sheets.length === 0) {
    throw new Error('No sheets to export');
  }

  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, data }, index) => {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const columnWidths = Object.keys(data[0]).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;

    // Enhanced header styling
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: index === 0 ? "2E7D32" : "1976D2" } }, // Green for summary, blue for others
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }

    // Add data borders
    for (let row = 1; row <= data.length; row++) {
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) continue;
        
        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  try {
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    // Fallback: Create blob and download manually
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, filename);
  }
};

/**
 * Test function to verify Excel export works
 */
export const testExcelExport = () => {
  const testData = [
    { Name: 'Test User', Email: 'test@example.com', Department: 'Computer Science' },
    { Name: 'Another User', Email: 'another@example.com', Department: 'Engineering' }
  ];
  
  exportToExcel(testData, {
    filename: 'test_export.xlsx',
    sheetName: 'Test Sheet',
    includeHeaders: true,
    autoWidth: true
  });
};
