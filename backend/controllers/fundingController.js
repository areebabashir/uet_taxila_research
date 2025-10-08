import Project from '../models/FundedProject.js';
import TravelGrant from '../models/TravelGrant.js';

// Get comprehensive funding statistics
export const getFundingStats = async (req, res) => {
  try {
    // Get all projects and travel grants
    const [projects, travelGrants] = await Promise.all([
      Project.find({}),
      TravelGrant.find({})
    ]);

    // Calculate project funding statistics
    const projectFunding = {
      totalAmount: 0,
      totalProjects: projects.length,
      byAgency: {},
      byDepartment: {},
      byStatus: {},
      byYear: {},
      averageAmount: 0,
      minAmount: 0,
      maxAmount: 0
    };

    // Calculate travel grant funding statistics
    const travelFunding = {
      totalAmount: 0,
      totalGrants: travelGrants.length,
      byAgency: {},
      byDepartment: {},
      byStatus: {},
      byYear: {},
      averageAmount: 0,
      minAmount: 0,
      maxAmount: 0
    };

    // Process projects
    if (projects.length > 0) {
      const projectAmounts = [];
      
      projects.forEach(project => {
        const amount = project.funding?.totalAmount || 0;
        projectAmounts.push(amount);
        projectFunding.totalAmount += amount;

        // By agency
        const agency = project.funding?.fundingAgency?.name || 'Unknown';
        projectFunding.byAgency[agency] = (projectFunding.byAgency[agency] || 0) + amount;

        // By department
        const department = project.principalInvestigator?.department || 'Unknown';
        projectFunding.byDepartment[department] = (projectFunding.byDepartment[department] || 0) + amount;

        // By status
        const status = project.status || 'Unknown';
        projectFunding.byStatus[status] = (projectFunding.byStatus[status] || 0) + amount;

        // By year
        const year = new Date(project.startDate).getFullYear();
        projectFunding.byYear[year] = (projectFunding.byYear[year] || 0) + amount;
      });

      // Calculate project statistics
      projectFunding.averageAmount = projectFunding.totalAmount / projects.length;
      projectFunding.minAmount = Math.min(...projectAmounts);
      projectFunding.maxAmount = Math.max(...projectAmounts);
    }

    // Process travel grants
    if (travelGrants.length > 0) {
      const travelAmounts = [];
      
      travelGrants.forEach(grant => {
        const amount = grant.funding?.totalAmount || 0;
        travelAmounts.push(amount);
        travelFunding.totalAmount += amount;

        // By agency
        const agency = grant.funding?.fundingAgency?.name || 'Unknown';
        travelFunding.byAgency[agency] = (travelFunding.byAgency[agency] || 0) + amount;

        // By department (from applicant)
        const department = grant.applicant?.department || 'Unknown';
        travelFunding.byDepartment[department] = (travelFunding.byDepartment[department] || 0) + amount;

        // By status
        const status = grant.status || 'Unknown';
        travelFunding.byStatus[status] = (travelFunding.byStatus[status] || 0) + amount;

        // By year
        const year = new Date(grant.createdAt).getFullYear();
        travelFunding.byYear[year] = (travelFunding.byYear[year] || 0) + amount;
      });

      // Calculate travel grant statistics
      travelFunding.averageAmount = travelFunding.totalAmount / travelGrants.length;
      travelFunding.minAmount = Math.min(...travelAmounts);
      travelFunding.maxAmount = Math.max(...travelAmounts);
    }

    // Calculate overall funding statistics
    const totalFunding = projectFunding.totalAmount + travelFunding.totalAmount;
    const totalFundingSources = projectFunding.totalProjects + travelFunding.totalGrants;

    // Combine agency data
    const combinedByAgency = {};
    Object.keys(projectFunding.byAgency).forEach(agency => {
      combinedByAgency[agency] = (combinedByAgency[agency] || 0) + projectFunding.byAgency[agency];
    });
    Object.keys(travelFunding.byAgency).forEach(agency => {
      combinedByAgency[agency] = (combinedByAgency[agency] || 0) + travelFunding.byAgency[agency];
    });

    // Combine department data
    const combinedByDepartment = {};
    Object.keys(projectFunding.byDepartment).forEach(dept => {
      combinedByDepartment[dept] = (combinedByDepartment[dept] || 0) + projectFunding.byDepartment[dept];
    });
    Object.keys(travelFunding.byDepartment).forEach(dept => {
      combinedByDepartment[dept] = (combinedByDepartment[dept] || 0) + travelFunding.byDepartment[dept];
    });

    // Combine year data
    const combinedByYear = {};
    Object.keys(projectFunding.byYear).forEach(year => {
      combinedByYear[year] = (combinedByYear[year] || 0) + projectFunding.byYear[year];
    });
    Object.keys(travelFunding.byYear).forEach(year => {
      combinedByYear[year] = (combinedByYear[year] || 0) + travelFunding.byYear[year];
    });

    // Sort agencies by amount (descending)
    const sortedAgencies = Object.entries(combinedByAgency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 agencies

    // Sort departments by amount (descending)
    const sortedDepartments = Object.entries(combinedByDepartment)
      .sort(([,a], [,b]) => b - a);

    // Sort years by year (ascending)
    const sortedYears = Object.entries(combinedByYear)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    const fundingStats = {
      overview: {
        totalFunding,
        totalFundingSources,
        averageFunding: totalFundingSources > 0 ? totalFunding / totalFundingSources : 0,
        projectFunding: projectFunding.totalAmount,
        travelFunding: travelFunding.totalAmount,
        projectCount: projectFunding.totalProjects,
        travelGrantCount: travelFunding.totalGrants
      },
      projects: projectFunding,
      travelGrants: travelFunding,
      combined: {
        byAgency: Object.fromEntries(sortedAgencies),
        byDepartment: Object.fromEntries(sortedDepartments),
        byYear: Object.fromEntries(sortedYears),
        topAgencies: sortedAgencies.slice(0, 5),
        topDepartments: sortedDepartments.slice(0, 5)
      },
      trends: {
        yearlyGrowth: calculateYearlyGrowth(sortedYears),
        agencyDistribution: sortedAgencies,
        departmentDistribution: sortedDepartments
      }
    };

    res.status(200).json({
      success: true,
      data: fundingStats
    });

  } catch (error) {
    console.error('Error fetching funding statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching funding statistics',
      error: error.message
    });
  }
};

// Helper function to calculate yearly growth
function calculateYearlyGrowth(yearlyData) {
  if (yearlyData.length < 2) return 0;
  
  const currentYear = yearlyData[yearlyData.length - 1][1];
  const previousYear = yearlyData[yearlyData.length - 2][1];
  
  if (previousYear === 0) return 100;
  
  return Math.round(((currentYear - previousYear) / previousYear) * 100);
}

// Get funding statistics by department
export const getFundingByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    const [projects, travelGrants] = await Promise.all([
      Project.find({ 'principalInvestigator.department': department }),
      TravelGrant.find({ 'applicant.department': department })
    ]);

    let totalFunding = 0;
    let projectCount = 0;
    let travelCount = 0;

    projects.forEach(project => {
      totalFunding += project.funding?.totalAmount || 0;
      projectCount++;
    });

    travelGrants.forEach(grant => {
      totalFunding += grant.funding?.totalAmount || 0;
      travelCount++;
    });

    res.status(200).json({
      success: true,
      data: {
        department,
        totalFunding,
        projectCount,
        travelCount,
        totalSources: projectCount + travelCount,
        averageFunding: (projectCount + travelCount) > 0 ? totalFunding / (projectCount + travelCount) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching department funding:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department funding',
      error: error.message
    });
  }
};

// Get funding statistics by agency
export const getFundingByAgency = async (req, res) => {
  try {
    const { agency } = req.params;
    
    const [projects, travelGrants] = await Promise.all([
      Project.find({ 'funding.fundingAgency.name': agency }),
      TravelGrant.find({ 'funding.fundingAgency.name': agency })
    ]);

    let totalFunding = 0;
    let projectCount = 0;
    let travelCount = 0;

    projects.forEach(project => {
      totalFunding += project.funding?.totalAmount || 0;
      projectCount++;
    });

    travelGrants.forEach(grant => {
      totalFunding += grant.funding?.totalAmount || 0;
      travelCount++;
    });

    res.status(200).json({
      success: true,
      data: {
        agency,
        totalFunding,
        projectCount,
        travelCount,
        totalSources: projectCount + travelCount,
        averageFunding: (projectCount + travelCount) > 0 ? totalFunding / (projectCount + travelCount) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching agency funding:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching agency funding',
      error: error.message
    });
  }
};

// Get current funding opportunities
export const getFundingOpportunities = async (req, res) => {
  try {
    // Get all projects and travel grants to extract funding opportunities
    const [projects, travelGrants] = await Promise.all([
      Project.find({}).populate('principalInvestigator', 'firstName lastName department'),
      TravelGrant.find({}).populate('applicant', 'firstName lastName department')
    ]);

    // Extract unique funding agencies and create opportunities based on existing data
    const agencyMap = new Map();
    
    // Process projects
    projects.forEach(project => {
      const agency = project.funding?.fundingAgency?.name;
      if (agency && !agencyMap.has(agency)) {
        agencyMap.set(agency, {
          name: agency,
          type: 'Research Grant',
          totalAmount: 0,
          count: 0,
          projects: []
        });
      }
      
      if (agency) {
        const agencyData = agencyMap.get(agency);
        agencyData.totalAmount += project.funding?.totalAmount || 0;
        agencyData.count += 1;
        agencyData.projects.push(project);
      }
    });

    // Process travel grants
    travelGrants.forEach(grant => {
      const agency = grant.funding?.fundingAgency?.name;
      if (agency && !agencyMap.has(agency)) {
        agencyMap.set(agency, {
          name: agency,
          type: 'Travel Grant',
          totalAmount: 0,
          count: 0,
          projects: []
        });
      }
      
      if (agency) {
        const agencyData = agencyMap.get(agency);
        agencyData.totalAmount += grant.funding?.totalAmount || 0;
        agencyData.count += 1;
        agencyData.projects.push(grant);
      }
    });

    // Convert to opportunities format
    const opportunities = Array.from(agencyMap.values()).map((agency, index) => {
      const averageAmount = agency.count > 0 ? Math.round(agency.totalAmount / agency.count) : 0;
      const maxAmount = Math.max(...agency.projects.map(p => p.funding?.totalAmount || 0));
      
      return {
        id: index + 1,
        title: `${agency.name} ${agency.type}`,
        agency: agency.name,
        amount: averageAmount,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        category: agency.type === 'Research Grant' ? 'Research' : 'Travel',
        description: `Funding opportunities from ${agency.name} based on historical data. Average funding amount: $${averageAmount.toLocaleString()}`,
        requirements: ["Valid research proposal", "University affiliation", "PI/Applicant credentials"],
        status: "Open",
        type: agency.type,
        focusAreas: ["Research", "Academic Development", "Innovation"],
        eligibility: "Faculty members and researchers",
        applicationProcess: "Submit proposal through university research office",
        maxAmount: maxAmount,
        totalAwarded: agency.totalAmount,
        totalProjects: agency.count
      };
    });

    // If no data available, return empty array
    if (opportunities.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          opportunities: [],
          totalOpportunities: 0,
          totalFunding: 0,
          categories: [],
          agencies: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        opportunities,
        totalOpportunities: opportunities.length,
        totalFunding: opportunities.reduce((sum, opp) => sum + opp.amount, 0),
        categories: [...new Set(opportunities.map(opp => opp.category))],
        agencies: [...new Set(opportunities.map(opp => opp.agency))]
      }
    });

  } catch (error) {
    console.error('Error fetching funding opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching funding opportunities',
      error: error.message
    });
  }
};

// Get all funding sources
export const getFundingSources = async (req, res) => {
  try {
    // Get all projects and travel grants to extract funding sources
    const [projects, travelGrants] = await Promise.all([
      Project.find({}).populate('principalInvestigator', 'firstName lastName department'),
      TravelGrant.find({}).populate('applicant', 'firstName lastName department')
    ]);

    // Extract unique funding agencies and create sources based on existing data
    const agencyMap = new Map();
    
    // Process projects
    projects.forEach(project => {
      const agency = project.funding?.fundingAgency?.name;
      if (agency && !agencyMap.has(agency)) {
        agencyMap.set(agency, {
          name: agency,
          totalAmount: 0,
          count: 0,
          projects: [],
          travelGrants: []
        });
      }
      
      if (agency) {
        const agencyData = agencyMap.get(agency);
        agencyData.totalAmount += project.funding?.totalAmount || 0;
        agencyData.count += 1;
        agencyData.projects.push(project);
      }
    });

    // Process travel grants
    travelGrants.forEach(grant => {
      const agency = grant.funding?.fundingAgency?.name;
      if (agency && !agencyMap.has(agency)) {
        agencyMap.set(agency, {
          name: agency,
          totalAmount: 0,
          count: 0,
          projects: [],
          travelGrants: []
        });
      }
      
      if (agency) {
        const agencyData = agencyMap.get(agency);
        agencyData.totalAmount += grant.funding?.totalAmount || 0;
        agencyData.count += 1;
        agencyData.travelGrants.push(grant);
      }
    });

    // Convert to funding sources format
    const fundingSources = Array.from(agencyMap.values()).map(agency => {
      const averageAmount = agency.count > 0 ? Math.round(agency.totalAmount / agency.count) : 0;
      const projectCount = agency.projects.length;
      const travelCount = agency.travelGrants.length;
      
      // Determine type based on agency name patterns
      let type = "Government";
      let country = "Pakistan";
      let logo = "🏛️";
      
      if (agency.name.toLowerCase().includes('nsf') || agency.name.toLowerCase().includes('national science foundation')) {
        type = "International";
        country = "USA";
        logo = "🇺🇸";
      } else if (agency.name.toLowerCase().includes('eu') || agency.name.toLowerCase().includes('european')) {
        type = "International";
        country = "Europe";
        logo = "🇪🇺";
      } else if (agency.name.toLowerCase().includes('usaid')) {
        type = "International";
        country = "USA";
        logo = "🤝";
      } else if (agency.name.toLowerCase().includes('world bank')) {
        type = "International";
        country = "Global";
        logo = "🌍";
      } else if (agency.name.toLowerCase().includes('gates')) {
        type = "Private";
        country = "Global";
        logo = "🏥";
      } else if (agency.name.toLowerCase().includes('google')) {
        type = "Corporate";
        country = "Global";
        logo = "🔍";
      } else if (agency.name.toLowerCase().includes('psf') || agency.name.toLowerCase().includes('science foundation')) {
        type = "Government";
        country = "Pakistan";
        logo = "🔬";
      }
      
      return {
        name: agency.name,
        type: type,
        country: country,
        website: `https://${agency.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.org`,
        description: `Funding agency that has provided ${projectCount} research grants and ${travelCount} travel grants. Total funding awarded: $${agency.totalAmount.toLocaleString()}`,
        focusAreas: ["Research", "Academic Development", "Innovation"],
        averageAmount: averageAmount,
        logo: logo,
        contactEmail: `info@${agency.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.org`,
        establishedYear: 2000, // Default year
        totalAwarded: agency.totalAmount,
        totalProjects: projectCount,
        totalTravelGrants: travelCount
      };
    });

    // If no data available, return empty array
    if (fundingSources.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          sources: [],
          totalSources: 0,
          byType: {},
          byCountry: {}
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sources: fundingSources,
        totalSources: fundingSources.length,
        byType: fundingSources.reduce((acc, source) => {
          acc[source.type] = (acc[source.type] || 0) + 1;
          return acc;
        }, {}),
        byCountry: fundingSources.reduce((acc, source) => {
          acc[source.country] = (acc[source.country] || 0) + 1;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching funding sources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching funding sources',
      error: error.message
    });
  }
};
