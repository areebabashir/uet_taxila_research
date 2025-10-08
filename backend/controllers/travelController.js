import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import TravelGrant from '../models/TravelGrant.js';
import User from '../models/User.js';

// @desc    Get all travel grants
// @route   GET /api/travel
// @access  Private
export const getTravelGrants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, search, applicantId } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (applicantId) filter.applicant = applicantId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { 'event.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Public access - show all travel grants for demonstration
    // filter.status = 'Approved';

    // Get travel grants with pagination
    const travelGrants = await TravelGrant.find(filter)
      .populate('applicant', 'firstName lastName email department')
      .populate('reviewedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ 'event.startDate': -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await TravelGrant.countDocuments(filter);

    res.json({
      success: true,
      data: {
        travelGrants,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTravelGrants: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get travel grants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching travel grants'
    });
  }
};

// @desc    Get single travel grant by ID
// @route   GET /api/travel/:id
// @access  Private
export const getTravelGrantById = async (req, res) => {
  try {
    const travelGrant = await TravelGrant.findById(req.params.id)
      .populate('applicant', 'firstName lastName email department')
      .populate('reviewedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('publications', 'title publicationDate');

    if (!travelGrant) {
      return res.status(404).json({
        success: false,
        message: 'Travel grant not found'
      });
    }

    res.json({
      success: true,
      data: {
        travelGrant
      }
    });
  } catch (error) {
    console.error('Get travel grant by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching travel grant'
    });
  }
};

// @desc    Create new travel grant
// @route   POST /api/travel
// @access  Private
export const createTravelGrant = async (req, res) => {
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

    // If applicant is a string name, try to find the user by name
    let applicantId = req.user._id; // Default to current user
    
    if (req.body.applicant && typeof req.body.applicant === 'string') {
      // Try to find user by name
      const applicantName = req.body.applicant.trim();
      const nameParts = applicantName.split(' ');
      
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        
        const user = await User.findOne({
          $or: [
            { firstName: new RegExp(firstName, 'i'), lastName: new RegExp(lastName, 'i') },
            { email: new RegExp(applicantName, 'i') }
          ]
        });
        
        if (user) {
          applicantId = user._id;
        }
      }
    } else if (req.body.applicant && mongoose.Types.ObjectId.isValid(req.body.applicant)) {
      applicantId = req.body.applicant;
    }

    const travelData = {
      ...req.body,
      applicant: applicantId
    };

    // Create travel grant
    const travelGrant = await TravelGrant.create(travelData);

    // Populate the created travel grant
    await travelGrant.populate('applicant', 'firstName lastName email department');

    res.status(201).json({
      success: true,
      message: 'Travel grant created successfully',
      data: {
        travelGrant
      }
    });
  } catch (error) {
    console.error('Create travel grant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating travel grant',
      error: error.message
    });
  }
};

// @desc    Update travel grant
// @route   PUT /api/travel/:id
// @access  Private
export const updateTravelGrant = async (req, res) => {
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

    const travelGrant = await TravelGrant.findById(req.params.id);
    if (!travelGrant) {
      return res.status(404).json({
        success: false,
        message: 'Travel grant not found'
      });
    }

    // Check if user can update this travel grant
    const canUpdate = req.user.role === 'admin' || 
                     travelGrant.isFacultyApplicant(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own travel grants'
      });
    }

    // Update travel grant
    const updatedTravelGrant = await TravelGrant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'applicant', select: 'firstName lastName email department' },
      { path: 'reviewedBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Travel grant updated successfully',
      data: {
        travelGrant: updatedTravelGrant
      }
    });
  } catch (error) {
    console.error('Update travel grant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating travel grant'
    });
  }
};

// @desc    Delete travel grant
// @route   DELETE /api/travel/:id
// @access  Private
export const deleteTravelGrant = async (req, res) => {
  try {
    const travelGrant = await TravelGrant.findById(req.params.id);
    if (!travelGrant) {
      return res.status(404).json({
        success: false,
        message: 'Travel grant not found'
      });
    }

    // Check if user can delete this travel grant
    const canDelete = req.user.role === 'admin' || 
                     travelGrant.applicant.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own travel grants'
      });
    }

    await TravelGrant.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Travel grant deleted successfully'
    });
  } catch (error) {
    console.error('Delete travel grant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting travel grant'
    });
  }
};

// @desc    Review travel grant (Admin only)
// @route   PUT /api/travel/:id/review
// @access  Private/Admin
export const reviewTravelGrant = async (req, res) => {
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

    const travelGrant = await TravelGrant.findById(req.params.id);
    if (!travelGrant) {
      return res.status(404).json({
        success: false,
        message: 'Travel grant not found'
      });
    }

    // Update travel grant review
    const updatedTravelGrant = await TravelGrant.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewComments,
        reviewedBy: req.user._id,
        reviewDate: new Date(),
        approvedDate: status === 'Approved' ? new Date() : null,
        approvedBy: status === 'Approved' ? req.user._id : null
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'applicant', select: 'firstName lastName email department' },
      { path: 'reviewedBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Travel grant review updated successfully',
      data: {
        travelGrant: updatedTravelGrant
      }
    });
  } catch (error) {
    console.error('Review travel grant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing travel grant'
    });
  }
};

// @desc    Submit post-travel report
// @route   PUT /api/travel/:id/post-travel
// @access  Private
export const submitPostTravelReport = async (req, res) => {
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

    const { outcomes, publications, collaborations, feedback } = req.body;

    const travelGrant = await TravelGrant.findById(req.params.id);
    if (!travelGrant) {
      return res.status(404).json({
        success: false,
        message: 'Travel grant not found'
      });
    }

    // Check if user can submit post-travel report
    const canSubmit = req.user.role === 'admin' || 
                     travelGrant.isFacultyApplicant(req.user._id);

    if (!canSubmit) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit post-travel reports for your own travel grants'
      });
    }

    // Update post-travel information
    const updatedTravelGrant = await TravelGrant.findByIdAndUpdate(
      req.params.id,
      {
        'postTravel.completionDate': new Date(),
        'postTravel.reportSubmitted': true,
        'postTravel.outcomes': outcomes,
        'postTravel.publications': publications,
        'postTravel.collaborations': collaborations,
        'postTravel.feedback': feedback,
        status: 'Completed'
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'applicant', select: 'firstName lastName email department' },
      { path: 'reviewedBy', select: 'firstName lastName email' },
      { path: 'approvedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Post-travel report submitted successfully',
      data: {
        travelGrant: updatedTravelGrant
      }
    });
  } catch (error) {
    console.error('Submit post-travel report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting post-travel report'
    });
  }
};

// @desc    Get travel grant statistics
// @route   GET /api/travel/stats
// @access  Private
export const getTravelStats = async (req, res) => {
  try {
    const totalTravelGrants = await TravelGrant.countDocuments();
    const approvedTravelGrants = await TravelGrant.countDocuments({ status: 'Approved' });
    const completedTravelGrants = await TravelGrant.countDocuments({ status: 'Completed' });
    const pendingTravelGrants = await TravelGrant.countDocuments({ status: 'Under Review' });
    
    // Get travel grants by event type
    const travelGrantsByEventType = await TravelGrant.aggregate([
      { $group: { _id: '$event.type', count: { $sum: 1 } } }
    ]);

    // Get total funding amount
    const totalFunding = await TravelGrant.aggregate([
      { $group: { _id: null, total: { $sum: '$funding.totalAmount' } } }
    ]);

    // Get recent travel grants (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTravelGrants = await TravelGrant.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalTravelGrants,
        approvedTravelGrants,
        completedTravelGrants,
        pendingTravelGrants,
        travelGrantsByEventType,
        totalFunding: totalFunding[0]?.total || 0,
        recentTravelGrants
      }
    });
  } catch (error) {
    console.error('Get travel stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching travel grant statistics'
    });
  }
};

// @desc    Approve travel grant
// @route   PUT /api/travel/:id/approve
// @access  Private (Admin only)
export const approveTravelGrant = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const travelGrant = await TravelGrant.findById(id);
    if (!travelGrant) {
      return res.status(404).json({
        success: false,
        message: 'Travel grant not found'
      });
    }

    travelGrant.status = 'Approved';
    travelGrant.reviewedBy = req.user._id;
    travelGrant.reviewComments = comments;
    travelGrant.approvedDate = new Date();

    await travelGrant.save();

    res.json({
      success: true,
      message: 'Travel grant approved successfully',
      data: { travelGrant }
    });
  } catch (error) {
    console.error('Approve travel grant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving travel grant'
    });
  }
};

// @desc    Reject travel grant
// @route   PUT /api/travel/:id/reject
// @access  Private (Admin only)
export const rejectTravelGrant = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const travelGrant = await TravelGrant.findById(id);
    if (!travelGrant) {
      return res.status(404).json({
        success: false,
        message: 'Travel grant not found'
      });
    }

    travelGrant.status = 'Rejected';
    travelGrant.reviewedBy = req.user._id;
    travelGrant.reviewComments = comments;
    travelGrant.rejectedDate = new Date();

    await travelGrant.save();

    res.json({
      success: true,
      message: 'Travel grant rejected',
      data: { travelGrant }
    });
  } catch (error) {
    console.error('Reject travel grant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting travel grant'
    });
  }
};
