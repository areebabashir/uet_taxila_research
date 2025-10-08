import Publication from '../models/Publication.js';
import FundedProject from '../models/FundedProject.js';
import FinalYearProject from '../models/FinalYearProject.js';
import ThesisSupervision from '../models/ThesisSupervision.js';
import Event from '../models/Event.js';
import TravelGrant from '../models/TravelGrant.js';
import User from '../models/User.js';

// Get comprehensive statistics for all modules
export const getComprehensiveStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01`);
    const endOfYear = new Date(`${currentYear}-12-31`);

    // Get all statistics in parallel
    const [
      publicationStats,
      projectStats,
      fypStats,
      userStats,
      eventStats,
      travelStats
    ] = await Promise.all([
      getPublicationStats(),
      getProjectStats(),
      getFYPStats(),
      getUserStats(),
      getEventStats(),
      getTravelStats()
    ]);

    res.json({
      success: true,
      data: {
        publications: publicationStats,
        projects: projectStats,
        fyp: fypStats,
        users: userStats,
        events: eventStats,
        travel: travelStats,
        summary: {
          totalPublications: publicationStats.total,
          totalProjects: projectStats.total,
          totalFYP: fypStats.total,
          totalUsers: userStats.total,
          totalEvents: eventStats.total,
          totalTravelGrants: travelStats.total,
          totalFunding: (projectStats.totalAmount || 0) + (travelStats.totalAmount || 0)
        }
      }
    });
  } catch (error) {
    console.error('Get comprehensive stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching comprehensive statistics' });
  }
};

// Generate detailed report
export const generateReport = async (req, res) => {
  try {
    const { module, dateRange, startDate, endDate, reportType } = req.body;

    let query = {};
    let dateFilter = {};

    // Apply date filters
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      switch (dateRange) {
        case 'thisYear':
          dateFilter = {
            $gte: new Date(`${now.getFullYear()}-01-01`),
            $lt: new Date(`${now.getFullYear() + 1}-01-01`)
          };
          break;
        case 'lastYear':
          dateFilter = {
            $gte: new Date(`${now.getFullYear() - 1}-01-01`),
            $lt: new Date(`${now.getFullYear()}-01-01`)
          };
          break;
        case 'last6Months':
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          dateFilter = { $gte: sixMonthsAgo };
          break;
        case 'last3Months':
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          dateFilter = { $gte: threeMonthsAgo };
          break;
        case 'custom':
          if (startDate && endDate) {
            dateFilter = {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            };
          }
          break;
      }
    }

    let reportData = {};

    if (module === 'all' || module === 'publications') {
      const pubQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        pubQuery.publicationDate = dateFilter;
      }
      
      const publications = await Publication.find(pubQuery)
        .populate('submittedBy', 'firstName lastName email')
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ publicationDate: -1 });

      reportData.publications = publications;
    }

    if (module === 'all' || module === 'projects') {
      const projQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        projQuery.startDate = dateFilter;
      }
      
      const projects = await FundedProject.find(projQuery)
        .populate('principalInvestigator', 'firstName lastName email')
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ startDate: -1 });

      reportData.projects = projects;
    }

    if (module === 'all' || module === 'fyp') {
      const fypQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        fypQuery.startDate = dateFilter;
      }
      
      const fyps = await FinalYearProject.find(fypQuery)
        .populate('supervisor', 'firstName lastName email')
        .populate('coSupervisor', 'firstName lastName email')
        .sort({ startDate: -1 });

      reportData.fyp = fyps;
    }

    if (module === 'all' || module === 'thesis') {
      const thesisQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        thesisQuery.startDate = dateFilter;
      }
      
      const theses = await ThesisSupervision.find(thesisQuery)
        .populate('supervisor', 'firstName lastName email')
        .populate('coSupervisor', 'firstName lastName email')
        .sort({ startDate: -1 });

      reportData.thesis = theses;
    }

    if (module === 'all' || module === 'events') {
      const eventQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        eventQuery.startDate = dateFilter;
      }
      
      const events = await Event.find(eventQuery)
        .populate('organizer', 'firstName lastName email')
        .sort({ startDate: -1 });

      reportData.events = events;
    }

    if (module === 'all' || module === 'travel') {
      const travelQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        travelQuery.submittedDate = dateFilter;
      }
      
      const travelGrants = await TravelGrant.find(travelQuery)
        .populate('applicant', 'firstName lastName email')
        .populate('reviewedBy', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .sort({ submittedDate: -1 });

      reportData.travel = travelGrants;
    }

    if (module === 'all' || module === 'users') {
      const users = await User.find(query)
        .sort({ createdAt: -1 });

      reportData.users = users;
    }

    // Add summary statistics
    const summary = await generateSummaryStats(reportData);

    res.json({
      success: true,
      data: {
        reportData,
        summary,
        filters: {
          module,
          dateRange,
          startDate,
          endDate,
          reportType
        },
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, message: 'Server error while generating report' });
  }
};

// Export data in different formats
export const exportData = async (req, res) => {
  try {
    const { module, format, dateRange, startDate, endDate } = req.body;

    let query = {};
    let dateFilter = {};

    // Apply date filters
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      switch (dateRange) {
        case 'thisYear':
          dateFilter = {
            $gte: new Date(`${now.getFullYear()}-01-01`),
            $lt: new Date(`${now.getFullYear() + 1}-01-01`)
          };
          break;
        case 'lastYear':
          dateFilter = {
            $gte: new Date(`${now.getFullYear() - 1}-01-01`),
            $lt: new Date(`${now.getFullYear()}-01-01`)
          };
          break;
        case 'last6Months':
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          dateFilter = { $gte: sixMonthsAgo };
          break;
        case 'last3Months':
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          dateFilter = { $gte: threeMonthsAgo };
          break;
        case 'custom':
          if (startDate && endDate) {
            dateFilter = {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            };
          }
          break;
      }
    }

    let reportData = {};

    if (module === 'all' || module === 'publications') {
      const pubQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        pubQuery.publicationDate = dateFilter;
      }
      
      const publications = await Publication.find(pubQuery)
        .populate('submittedBy', 'firstName lastName email')
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ publicationDate: -1 });

      reportData.publications = publications;
    }

    if (module === 'all' || module === 'projects') {
      const projQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        projQuery.startDate = dateFilter;
      }
      
      const projects = await FundedProject.find(projQuery)
        .populate('principalInvestigator', 'firstName lastName email')
        .populate('reviewedBy', 'firstName lastName email')
        .sort({ startDate: -1 });

      reportData.projects = projects;
    }

    if (module === 'all' || module === 'fyp') {
      const fypQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        fypQuery.startDate = dateFilter;
      }
      
      const fyps = await FinalYearProject.find(fypQuery)
        .populate('supervisor', 'firstName lastName email')
        .populate('coSupervisor', 'firstName lastName email')
        .sort({ startDate: -1 });

      reportData.fyp = fyps;
    }

    if (module === 'all' || module === 'thesis') {
      const thesisQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        thesisQuery.startDate = dateFilter;
      }
      
      const theses = await ThesisSupervision.find(thesisQuery)
        .populate('supervisor', 'firstName lastName email')
        .populate('coSupervisor', 'firstName lastName email')
        .sort({ startDate: -1 });

      reportData.thesis = theses;
    }

    if (module === 'all' || module === 'events') {
      const eventQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        eventQuery.startDate = dateFilter;
      }
      
      const events = await Event.find(eventQuery)
        .populate('organizer', 'firstName lastName email')
        .sort({ startDate: -1 });

      reportData.events = events;
    }

    if (module === 'all' || module === 'travel') {
      const travelQuery = { ...query };
      if (Object.keys(dateFilter).length > 0) {
        travelQuery.submittedDate = dateFilter;
      }
      
      const travelGrants = await TravelGrant.find(travelQuery)
        .populate('applicant', 'firstName lastName email')
        .populate('reviewedBy', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .sort({ submittedDate: -1 });

      reportData.travel = travelGrants;
    }

    if (module === 'all' || module === 'users') {
      const users = await User.find(query)
        .sort({ createdAt: -1 });

      reportData.users = users;
    }

    // Add summary statistics
    const summary = await generateSummaryStats(reportData);
    
    if (format === 'csv') {
      const csvData = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${module}-report-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvData);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${module}-report-${new Date().toISOString().split('T')[0]}.json`);
      res.json({
        success: true,
        data: {
          reportData,
          summary,
          filters: {
            module,
            dateRange,
            startDate,
            endDate
          },
          generatedAt: new Date()
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ success: false, message: 'Server error while exporting data' });
  }
};

// Helper functions
const getPublicationStats = async () => {
  const total = await Publication.countDocuments();
  const publishedCount = await Publication.countDocuments({ status: 'Published' });
  const pendingCount = await Publication.countDocuments({ status: 'Under Review' });
  const draftCount = await Publication.countDocuments({ status: 'Draft' });
  const q1Count = await Publication.countDocuments({ quartile: 'Q1' });
  
  const currentYear = new Date().getFullYear();
  const currentYearCount = await Publication.countDocuments({
    publicationDate: {
      $gte: new Date(`${currentYear}-01-01`),
      $lt: new Date(`${currentYear + 1}-01-01`)
    }
  });

  return { total, publishedCount, pendingCount, draftCount, q1Count, currentYearCount };
};

const getProjectStats = async () => {
  const total = await FundedProject.countDocuments();
  const approvedCount = await FundedProject.countDocuments({ status: 'Approved' });
  const pendingCount = await FundedProject.countDocuments({ status: 'Under Review' });
  const activeCount = await FundedProject.countDocuments({ status: 'Active' });
  
  const totalAmountResult = await FundedProject.aggregate([
    { $group: { _id: null, total: { $sum: '$totalBudget' } } }
  ]);
  const totalAmount = totalAmountResult[0]?.total || 0;

  return { total, approvedCount, pendingCount, activeCount, totalAmount };
};

const getFYPStats = async () => {
  const total = await FinalYearProject.countDocuments();
  const completedCount = await FinalYearProject.countDocuments({ status: 'Completed' });
  const ongoingCount = await FinalYearProject.countDocuments({ status: 'In Progress' });
  
  const totalStudentsResult = await FinalYearProject.aggregate([
    { $group: { _id: null, total: { $sum: '$numberOfStudents' } } }
  ]);
  const totalStudents = totalStudentsResult[0]?.total || 0;

  return { total, completedCount, ongoingCount, totalStudents };
};

const getUserStats = async () => {
  const total = await User.countDocuments();
  const facultyCount = await User.countDocuments({ role: 'faculty' });
  const adminCount = await User.countDocuments({ role: 'admin' });
  const activeCount = await User.countDocuments({ isActive: true });

  return { total, facultyCount, adminCount, activeCount };
};

const getEventStats = async () => {
  const total = await Event.countDocuments();
  const completedCount = await Event.countDocuments({ status: 'Completed' });
  const upcomingCount = await Event.countDocuments({ status: 'Upcoming' });
  
  const totalParticipantsResult = await Event.aggregate([
    { $group: { _id: null, total: { $sum: '$numberOfParticipants' } } }
  ]);
  const totalParticipants = totalParticipantsResult[0]?.total || 0;

  return { total, completedCount, upcomingCount, totalParticipants };
};

const getTravelStats = async () => {
  const total = await TravelGrant.countDocuments();
  const approvedCount = await TravelGrant.countDocuments({ status: 'Approved' });
  const pendingCount = await TravelGrant.countDocuments({ status: 'Under Review' });
  
  const totalAmountResult = await TravelGrant.aggregate([
    { $group: { _id: null, total: { $sum: '$funding.totalAmount' } } }
  ]);
  const totalAmount = totalAmountResult[0]?.total || 0;

  return { total, approvedCount, pendingCount, totalAmount };
};

const generateSummaryStats = async (reportData) => {
  const summary = {
    totalRecords: 0,
    modules: {}
  };

  Object.keys(reportData).forEach(module => {
    const data = reportData[module];
    if (Array.isArray(data)) {
      summary.modules[module] = data.length;
      summary.totalRecords += data.length;
    }
  });

  return summary;
};

const convertToCSV = (data) => {
  // Simple CSV conversion - in a real application, you'd want a more robust solution
  const csvRows = [];
  
  Object.keys(data).forEach(module => {
    const moduleData = data[module];
    if (Array.isArray(moduleData) && moduleData.length > 0) {
      csvRows.push(`\n=== ${module.toUpperCase()} ===\n`);
      
      // Get headers from first object
      const headers = Object.keys(moduleData[0]);
      csvRows.push(headers.join(','));
      
      // Add data rows
      moduleData.forEach(item => {
        const values = headers.map(header => {
          const value = item[header];
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return value || '';
        });
        csvRows.push(values.join(','));
      });
    }
  });
  
  return csvRows.join('\n');
};
