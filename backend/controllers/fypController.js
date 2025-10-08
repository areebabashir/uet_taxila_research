import { body, validationResult } from 'express-validator';
import FinalYearProject from '../models/FinalYearProject.js';
import User from '../models/User.js';

// @desc    Get all FYP projects
// @route   GET /api/fyp
// @access  Private
export const getFYPProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, type, search, supervisorId, batch } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.projectType = type;
    if (batch) filter['student.batch'] = batch;
    if (supervisorId) {
      filter.$or = [
        { supervisor: supervisorId },
        { coSupervisor: supervisorId }
      ];
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'student.name': { $regex: search, $options: 'i' } },
        { 'student.rollNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Public access - show all FYP projects for demonstration
    // filter.status = 'Completed';

    // Get FYP projects with pagination
    const fypProjects = await FinalYearProject.find(filter)
      .populate('supervisor', 'firstName lastName email department')
      .populate('coSupervisor', 'firstName lastName email department')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await FinalYearProject.countDocuments(filter);

    res.json({
      success: true,
      data: {
        fypProjects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalFYPProjects: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get FYP projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FYP projects'
    });
  }
};

// @desc    Get single FYP project by ID
// @route   GET /api/fyp/:id
// @access  Private
export const getFYPProjectById = async (req, res) => {
  try {
    const fypProject = await FinalYearProject.findById(req.params.id)
      .populate('supervisor', 'firstName lastName email department')
      .populate('coSupervisor', 'firstName lastName email department')
      .populate('publications', 'title publicationDate');

    if (!fypProject) {
      return res.status(404).json({
        success: false,
        message: 'FYP project not found'
      });
    }

    res.json({
      success: true,
      data: {
        fypProject
      }
    });
  } catch (error) {
    console.error('Get FYP project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FYP project'
    });
  }
};

// @desc    Create new FYP project
// @route   POST /api/fyp
// @access  Private
export const createFYPProject = async (req, res) => {
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

    const fypData = {
      ...req.body,
      supervisor: req.user._id
    };

    // Create FYP project
    const fypProject = await FinalYearProject.create(fypData);

    // Populate the created FYP project
    await fypProject.populate([
      { path: 'supervisor', select: 'firstName lastName email department' },
      { path: 'coSupervisor', select: 'firstName lastName email department' }
    ]);

    res.status(201).json({
      success: true,
      message: 'FYP project created successfully',
      data: {
        fypProject
      }
    });
  } catch (error) {
    console.error('Create FYP project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating FYP project'
    });
  }
};

// @desc    Update FYP project
// @route   PUT /api/fyp/:id
// @access  Private
export const updateFYPProject = async (req, res) => {
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

    const fypProject = await FinalYearProject.findById(req.params.id);
    if (!fypProject) {
      return res.status(404).json({
        success: false,
        message: 'FYP project not found'
      });
    }

    // Check if user can update this FYP project
    const canUpdate = req.user.role === 'admin' || 
                     fypProject.isFacultySupervisor(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update FYP projects you supervise'
      });
    }

    // Update FYP project
    const updatedFYPProject = await FinalYearProject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'supervisor', select: 'firstName lastName email department' },
      { path: 'coSupervisor', select: 'firstName lastName email department' }
    ]);

    res.json({
      success: true,
      message: 'FYP project updated successfully',
      data: {
        fypProject: updatedFYPProject
      }
    });
  } catch (error) {
    console.error('Update FYP project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating FYP project'
    });
  }
};

// @desc    Delete FYP project
// @route   DELETE /api/fyp/:id
// @access  Private
export const deleteFYPProject = async (req, res) => {
  try {
    const fypProject = await FinalYearProject.findById(req.params.id);
    if (!fypProject) {
      return res.status(404).json({
        success: false,
        message: 'FYP project not found'
      });
    }

    // Check if user can delete this FYP project
    const canDelete = req.user.role === 'admin' || 
                     fypProject.supervisor.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete FYP projects you supervise'
      });
    }

    await FinalYearProject.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'FYP project deleted successfully'
    });
  } catch (error) {
    console.error('Delete FYP project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting FYP project'
    });
  }
};

// @desc    Grade FYP project
// @route   PUT /api/fyp/:id/grade
// @access  Private
export const gradeFYPProject = async (req, res) => {
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

    const { supervisorMarks, externalMarks, defenseMarks, grade, evaluators } = req.body;

    const fypProject = await FinalYearProject.findById(req.params.id);
    if (!fypProject) {
      return res.status(404).json({
        success: false,
        message: 'FYP project not found'
      });
    }

    // Check if user can grade this FYP project
    const canGrade = req.user.role === 'admin' || 
                    fypProject.isFacultySupervisor(req.user._id);

    if (!canGrade) {
      return res.status(403).json({
        success: false,
        message: 'You can only grade FYP projects you supervise'
      });
    }

    // Calculate total marks
    const totalMarks = (supervisorMarks || 0) + (externalMarks || 0) + (defenseMarks || 0);

    // Update FYP project evaluation
    const updatedFYPProject = await FinalYearProject.findByIdAndUpdate(
      req.params.id,
      {
        'evaluation.supervisorMarks': supervisorMarks,
        'evaluation.externalMarks': externalMarks,
        'evaluation.defenseMarks': defenseMarks,
        'evaluation.totalMarks': totalMarks,
        'evaluation.grade': grade,
        'evaluation.evaluators': evaluators,
        status: 'Graded'
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'supervisor', select: 'firstName lastName email department' },
      { path: 'coSupervisor', select: 'firstName lastName email department' }
    ]);

    res.json({
      success: true,
      message: 'FYP project graded successfully',
      data: {
        fypProject: updatedFYPProject
      }
    });
  } catch (error) {
    console.error('Grade FYP project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while grading FYP project'
    });
  }
};

// @desc    Get FYP project statistics
// @route   GET /api/fyp/stats
// @access  Private
export const getFYPStats = async (req, res) => {
  try {
    const totalFYPProjects = await FinalYearProject.countDocuments();
    const completedFYPProjects = await FinalYearProject.countDocuments({ status: 'Completed' });
    const ongoingFYPProjects = await FinalYearProject.countDocuments({ status: 'In Progress' });
    const gradedFYPProjects = await FinalYearProject.countDocuments({ status: 'Graded' });
    
    // Get FYP projects by type
    const fypProjectsByType = await FinalYearProject.aggregate([
      { $group: { _id: '$projectType', count: { $sum: 1 } } }
    ]);

    // Get FYP projects by batch
    const fypProjectsByBatch = await FinalYearProject.aggregate([
      { $group: { _id: '$student.batch', count: { $sum: 1 } } }
    ]);

    // Get recent FYP projects (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFYPProjects = await FinalYearProject.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalFYPProjects,
        completedFYPProjects,
        ongoingFYPProjects,
        gradedFYPProjects,
        fypProjectsByType,
        fypProjectsByBatch,
        recentFYPProjects
      }
    });
  } catch (error) {
    console.error('Get FYP stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FYP statistics'
    });
  }
};

// @desc    Approve FYP project
// @route   PUT /api/fyp/:id/approve
// @access  Private (Admin only)
export const approveFYPProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const fypProject = await FinalYearProject.findById(id);
    if (!fypProject) {
      return res.status(404).json({
        success: false,
        message: 'FYP project not found'
      });
    }

    fypProject.status = 'Approved';
    fypProject.reviewedBy = req.user._id;
    fypProject.reviewComments = comments;
    fypProject.approvedDate = new Date();

    await fypProject.save();

    res.json({
      success: true,
      message: 'FYP project approved successfully',
      data: { fypProject }
    });
  } catch (error) {
    console.error('Approve FYP project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving FYP project'
    });
  }
};

// @desc    Reject FYP project
// @route   PUT /api/fyp/:id/reject
// @access  Private (Admin only)
export const rejectFYPProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const fypProject = await FinalYearProject.findById(id);
    if (!fypProject) {
      return res.status(404).json({
        success: false,
        message: 'FYP project not found'
      });
    }

    fypProject.status = 'Rejected';
    fypProject.reviewedBy = req.user._id;
    fypProject.reviewComments = comments;
    fypProject.rejectedDate = new Date();

    await fypProject.save();

    res.json({
      success: true,
      message: 'FYP project rejected',
      data: { fypProject }
    });
  } catch (error) {
    console.error('Reject FYP project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting FYP project'
    });
  }
};
