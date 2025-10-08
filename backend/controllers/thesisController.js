import { body, validationResult } from 'express-validator';
import ThesisSupervision from '../models/ThesisSupervision.js';
import User from '../models/User.js';

// @desc    Get all thesis supervisions
// @route   GET /api/thesis
// @access  Private
export const getThesisSupervisions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, type, search, supervisorId, batch } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.thesisType = type;
    if (batch) filter['student.batch'] = batch;
    if (supervisorId) {
      filter.$or = [
        { supervisor: supervisorId },
        { coSupervisor: supervisorId },
        { 'supervisoryCommittee.member': supervisorId }
      ];
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { 'student.name': { $regex: search, $options: 'i' } },
        { 'student.rollNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Public access - show all theses for demonstration
    // filter.status = 'Completed';

    // Get thesis supervisions with pagination
    const thesisSupervisions = await ThesisSupervision.find(filter)
      .populate('supervisor', 'firstName lastName email department')
      .populate('coSupervisor', 'firstName lastName email department')
      .populate('supervisoryCommittee.member', 'firstName lastName email department')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await ThesisSupervision.countDocuments(filter);

    res.json({
      success: true,
      data: {
        thesisSupervisions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalThesisSupervisions: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get thesis supervisions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching thesis supervisions'
    });
  }
};

// @desc    Get single thesis supervision by ID
// @route   GET /api/thesis/:id
// @access  Private
export const getThesisSupervisionById = async (req, res) => {
  try {
    const thesisSupervision = await ThesisSupervision.findById(req.params.id)
      .populate('supervisor', 'firstName lastName email department')
      .populate('coSupervisor', 'firstName lastName email department')
      .populate('supervisoryCommittee.member', 'firstName lastName email department')
      .populate('publications', 'title publicationDate');

    if (!thesisSupervision) {
      return res.status(404).json({
        success: false,
        message: 'Thesis supervision not found'
      });
    }

    res.json({
      success: true,
      data: {
        thesisSupervision
      }
    });
  } catch (error) {
    console.error('Get thesis supervision by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching thesis supervision'
    });
  }
};

// @desc    Create new thesis supervision
// @route   POST /api/thesis
// @access  Private
export const createThesisSupervision = async (req, res) => {
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

    const {
      title,
      thesisType,
      degree,
      startDate,
      expectedCompletionDate,
      student,
      researchArea,
      keywords
    } = req.body;

    const thesisData = {
      title,
      thesisType,
      degree,
      startDate: startDate ? new Date(startDate) : undefined,
      expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
      student,
      researchArea,
      keywords,
      supervisor: req.user._id
    };

    // Create thesis supervision
    const thesisSupervision = await ThesisSupervision.create(thesisData);

    // Populate the created thesis supervision
    await thesisSupervision.populate([
      { path: 'supervisor', select: 'firstName lastName email department' },
      { path: 'coSupervisor', select: 'firstName lastName email department' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Thesis supervision created successfully',
      data: {
        thesisSupervision
      }
    });
  } catch (error) {
    console.error('Create thesis supervision error:', error?.message || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((e) => ({ msg: e.message }))
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating thesis supervision'
    });
  }
};

// @desc    Update thesis supervision
// @route   PUT /api/thesis/:id
// @access  Private
export const updateThesisSupervision = async (req, res) => {
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

    const thesisSupervision = await ThesisSupervision.findById(req.params.id);
    if (!thesisSupervision) {
      return res.status(404).json({
        success: false,
        message: 'Thesis supervision not found'
      });
    }

    // Check if user can update this thesis supervision
    const canUpdate = req.user.role === 'admin' || 
                     thesisSupervision.isFacultySupervisor(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update thesis supervisions you are involved in'
      });
    }

    // Update thesis supervision
    const updatedThesisSupervision = await ThesisSupervision.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'supervisor', select: 'firstName lastName email department' },
      { path: 'coSupervisor', select: 'firstName lastName email department' },
      { path: 'supervisoryCommittee.member', select: 'firstName lastName email department' }
    ]);

    res.json({
      success: true,
      message: 'Thesis supervision updated successfully',
      data: {
        thesisSupervision: updatedThesisSupervision
      }
    });
  } catch (error) {
    console.error('Update thesis supervision error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating thesis supervision'
    });
  }
};

// @desc    Delete thesis supervision
// @route   DELETE /api/thesis/:id
// @access  Private
export const deleteThesisSupervision = async (req, res) => {
  try {
    const thesisSupervision = await ThesisSupervision.findById(req.params.id);
    if (!thesisSupervision) {
      return res.status(404).json({
        success: false,
        message: 'Thesis supervision not found'
      });
    }

    // Check if user can delete this thesis supervision
    const canDelete = req.user.role === 'admin' || 
                     thesisSupervision.supervisor.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete thesis supervisions you supervise'
      });
    }

    await ThesisSupervision.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Thesis supervision deleted successfully'
    });
  } catch (error) {
    console.error('Delete thesis supervision error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting thesis supervision'
    });
  }
};

// @desc    Update thesis defense
// @route   PUT /api/thesis/:id/defense
// @access  Private
export const updateThesisDefense = async (req, res) => {
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

    const { date, time, venue, examiners, result, comments, recommendations } = req.body;

    const thesisSupervision = await ThesisSupervision.findById(req.params.id);
    if (!thesisSupervision) {
      return res.status(404).json({
        success: false,
        message: 'Thesis supervision not found'
      });
    }

    // Check if user can update defense
    const canUpdate = req.user.role === 'admin' || 
                     thesisSupervision.isFacultySupervisor(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update defense for thesis you supervise'
      });
    }

    // Update thesis defense
    const updatedThesisSupervision = await ThesisSupervision.findByIdAndUpdate(
      req.params.id,
      {
        'defense.date': date,
        'defense.time': time,
        'defense.venue': venue,
        'defense.examiners': examiners,
        'defense.result': result,
        'defense.comments': comments,
        'defense.recommendations': recommendations,
        status: result === 'Pass' ? 'Completed' : thesisSupervision.status
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'supervisor', select: 'firstName lastName email department' },
      { path: 'coSupervisor', select: 'firstName lastName email department' },
      { path: 'supervisoryCommittee.member', select: 'firstName lastName email department' }
    ]);

    res.json({
      success: true,
      message: 'Thesis defense updated successfully',
      data: {
        thesisSupervision: updatedThesisSupervision
      }
    });
  } catch (error) {
    console.error('Update thesis defense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating thesis defense'
    });
  }
};

// @desc    Get thesis supervision statistics
// @route   GET /api/thesis/stats
// @access  Private
export const getThesisStats = async (req, res) => {
  try {
    const totalThesisSupervisions = await ThesisSupervision.countDocuments();
    const completedThesis = await ThesisSupervision.countDocuments({ status: 'Completed' });
    const ongoingThesis = await ThesisSupervision.countDocuments({ 
      status: { $in: ['In Progress', 'Data Collection', 'Analysis', 'Writing'] }
    });
    const defendedThesis = await ThesisSupervision.countDocuments({ status: 'Defended' });
    
    // Get thesis by type
    const thesisByType = await ThesisSupervision.aggregate([
      { $group: { _id: '$thesisType', count: { $sum: 1 } } }
    ]);

    // Get thesis by batch
    const thesisByBatch = await ThesisSupervision.aggregate([
      { $group: { _id: '$student.batch', count: { $sum: 1 } } }
    ]);

    // Get recent thesis (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentThesis = await ThesisSupervision.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalThesisSupervisions,
        completedThesis,
        ongoingThesis,
        defendedThesis,
        thesisByType,
        thesisByBatch,
        recentThesis
      }
    });
  } catch (error) {
    console.error('Get thesis stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching thesis statistics'
    });
  }
};

// @desc    Approve thesis supervision
// @route   PUT /api/thesis/:id/approve
// @access  Private (Admin only)
export const approveThesisSupervision = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const thesisSupervision = await ThesisSupervision.findById(id);
    if (!thesisSupervision) {
      return res.status(404).json({
        success: false,
        message: 'Thesis supervision not found'
      });
    }

    thesisSupervision.status = 'Approved';
    thesisSupervision.reviewedBy = req.user._id;
    thesisSupervision.reviewComments = comments;
    thesisSupervision.approvedDate = new Date();

    await thesisSupervision.save();

    res.json({
      success: true,
      message: 'Thesis supervision approved successfully',
      data: { thesisSupervision }
    });
  } catch (error) {
    console.error('Approve thesis supervision error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving thesis supervision'
    });
  }
};

// @desc    Reject thesis supervision
// @route   PUT /api/thesis/:id/reject
// @access  Private (Admin only)
export const rejectThesisSupervision = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const thesisSupervision = await ThesisSupervision.findById(id);
    if (!thesisSupervision) {
      return res.status(404).json({
        success: false,
        message: 'Thesis supervision not found'
      });
    }

    thesisSupervision.status = 'Rejected';
    thesisSupervision.reviewedBy = req.user._id;
    thesisSupervision.reviewComments = comments;
    thesisSupervision.rejectedDate = new Date();

    await thesisSupervision.save();

    res.json({
      success: true,
      message: 'Thesis supervision rejected',
      data: { thesisSupervision }
    });
  } catch (error) {
    console.error('Reject thesis supervision error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting thesis supervision'
    });
  }
};
