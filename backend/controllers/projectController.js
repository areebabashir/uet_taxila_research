import { body, validationResult } from 'express-validator';
import FundedProject from '../models/FundedProject.js';
import User from '../models/User.js';

// @desc    Get all funded projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, type, search, facultyId } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.projectType = type;
    if (facultyId) {
      filter.$or = [
        { principalInvestigator: facultyId },
        { 'coPrincipalInvestigators.faculty': facultyId },
        { 'teamMembers.faculty': facultyId }
      ];
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } }
      ];
    }

    // Public access - show all projects for demonstration
    // filter.status = { $in: ['Approved', 'Active', 'Completed'] };

    // Get projects with pagination
    const projects = await FundedProject.find(filter)
      .populate('principalInvestigator', 'firstName lastName email department')
      .populate('coPrincipalInvestigators.faculty', 'firstName lastName email department')
      .populate('teamMembers.faculty', 'firstName lastName email department')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await FundedProject.countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProjects: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await FundedProject.findById(req.params.id)
      .populate('principalInvestigator', 'firstName lastName email department')
      .populate('coPrincipalInvestigators.faculty', 'firstName lastName email department')
      .populate('teamMembers.faculty', 'firstName lastName email department')
      .populate('reviewedBy', 'firstName lastName email')
      .populate('publications', 'title publicationDate');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project'
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const projectData = {
      ...req.body,
      principalInvestigator: req.user._id
    };

    // Create project
    const project = await FundedProject.create(projectData);

    // Populate the created project
    await project.populate([
      { path: 'principalInvestigator', select: 'firstName lastName email department' },
      { path: 'coPrincipalInvestigators.faculty', select: 'firstName lastName email department' },
      { path: 'teamMembers.faculty', select: 'firstName lastName email department' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating project'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const project = await FundedProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user can update this project
    const canUpdate = req.user.role === 'admin' || 
                     project.isFacultyInvolved(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update projects you are involved in'
      });
    }

    // Update project
    const updatedProject = await FundedProject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'principalInvestigator', select: 'firstName lastName email department' },
      { path: 'coPrincipalInvestigators.faculty', select: 'firstName lastName email department' },
      { path: 'teamMembers.faculty', select: 'firstName lastName email department' },
      { path: 'reviewedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating project'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await FundedProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user can delete this project
    const canDelete = req.user.role === 'admin' || 
                     project.principalInvestigator.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete projects you are the PI of'
      });
    }

    await FundedProject.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project'
    });
  }
};

// @desc    Review project (Admin only)
// @route   PUT /api/projects/:id/review
// @access  Private/Admin
export const reviewProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, reviewComments } = req.body;

    const project = await FundedProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update project review
    const updatedProject = await FundedProject.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewComments,
        reviewedBy: req.user._id,
        approvedDate: status === 'Approved' ? new Date() : null
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'principalInvestigator', select: 'firstName lastName email department' },
      { path: 'coPrincipalInvestigators.faculty', select: 'firstName lastName email department' },
      { path: 'teamMembers.faculty', select: 'firstName lastName email department' },
      { path: 'reviewedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Project review updated successfully',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    console.error('Review project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing project'
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
export const getProjectStats = async (req, res) => {
  try {
    const totalProjects = await FundedProject.countDocuments();
    const activeProjects = await FundedProject.countDocuments({ status: 'Active' });
    const completedProjects = await FundedProject.countDocuments({ status: 'Completed' });
    const pendingProjects = await FundedProject.countDocuments({ status: 'Under Review' });
    
    // Get projects by type
    const projectsByType = await FundedProject.aggregate([
      { $group: { _id: '$projectType', count: { $sum: 1 } } }
    ]);

    // Get total funding amount
    const totalFunding = await FundedProject.aggregate([
      { $group: { _id: null, total: { $sum: '$totalBudget' } } }
    ]);

    // Get recent projects (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentProjects = await FundedProject.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        pendingProjects,
        projectsByType,
        totalFunding: totalFunding[0]?.total || 0,
        recentProjects
      }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project statistics'
    });
  }
};

// @desc    Approve a project (Admin only)
// @route   PUT /api/projects/:id/approve
// @access  Private/Admin
export const approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const project = await FundedProject.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.status = 'Approved';
    project.reviewedBy = req.user._id;
    project.reviewComments = comments || '';
    project.approvedDate = new Date();

    await project.save();

    res.json({
      success: true,
      message: 'Project approved successfully',
      data: project
    });
  } catch (error) {
    console.error('Approve project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving project'
    });
  }
};

// @desc    Reject a project (Admin only)
// @route   PUT /api/projects/:id/reject
// @access  Private/Admin
export const rejectProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const project = await FundedProject.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.status = 'Rejected';
    project.reviewedBy = req.user._id;
    project.reviewComments = comments || '';

    await project.save();

    res.json({
      success: true,
      message: 'Project rejected successfully',
      data: project
    });
  } catch (error) {
    console.error('Reject project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting project'
    });
  }
};
