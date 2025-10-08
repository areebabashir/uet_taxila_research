import { body, validationResult } from 'express-validator';
import Publication from '../models/Publication.js';
import User from '../models/User.js';

// @desc    Get all publications
// @route   GET /api/publications
// @access  Private
export const getPublications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, type, search, facultyId } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.publicationType = type;
    if (facultyId) filter['authors.faculty'] = facultyId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ];
    }

    // Public access - show only published publications
    filter.status = 'Published';

    // Get publications with pagination
    const publications = await Publication.find(filter)
      .populate('authors.faculty', 'firstName lastName email department')
      .populate('submittedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ publicationDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Publication.countDocuments(filter);

    res.json({
      success: true,
      data: {
        publications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPublications: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching publications'
    });
  }
};

// @desc    Get single publication by ID
// @route   GET /api/publications/:id
// @access  Private
export const getPublicationById = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate('authors.faculty', 'firstName lastName email department')
      .populate('submittedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email');

    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    res.json({
      success: true,
      data: {
        publication
      }
    });
  } catch (error) {
    console.error('Get publication by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching publication'
    });
  }
};

// @desc    Create new publication
// @route   POST /api/publications
// @access  Private
export const createPublication = async (req, res) => {
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

    const publicationData = {
      ...req.body,
      submittedBy: req.user._id
    };

    // Create publication
    const publication = await Publication.create(publicationData);

    // Populate the created publication
    await publication.populate([
      { path: 'authors.faculty', select: 'firstName lastName email department' },
      { path: 'submittedBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Publication created successfully',
      data: {
        publication
      }
    });
  } catch (error) {
    console.error('Create publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating publication'
    });
  }
};

// @desc    Update publication
// @route   PUT /api/publications/:id
// @access  Private
export const updatePublication = async (req, res) => {
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

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    // Check if user can update this publication
    const canUpdate = req.user.role === 'admin' || 
                     publication.submittedBy.toString() === req.user._id.toString() ||
                     publication.isFacultyAuthor(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own publications'
      });
    }

    // Update publication
    const updatedPublication = await Publication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'authors.faculty', select: 'firstName lastName email department' },
      { path: 'submittedBy', select: 'firstName lastName email' },
      { path: 'reviewedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Publication updated successfully',
      data: {
        publication: updatedPublication
      }
    });
  } catch (error) {
    console.error('Update publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating publication'
    });
  }
};

// @desc    Delete publication
// @route   DELETE /api/publications/:id
// @access  Private
export const deletePublication = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    // Check if user can delete this publication
    const canDelete = req.user.role === 'admin' || 
                     publication.submittedBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own publications'
      });
    }

    await Publication.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Publication deleted successfully'
    });
  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting publication'
    });
  }
};

// @desc    Review publication (Admin only)
// @route   PUT /api/publications/:id/review
// @access  Private/Admin
export const reviewPublication = async (req, res) => {
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

    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    // Update publication review
    const updatedPublication = await Publication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewComments,
        reviewedBy: req.user._id,
        reviewDate: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'authors.faculty', select: 'firstName lastName email department' },
      { path: 'submittedBy', select: 'firstName lastName email' },
      { path: 'reviewedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Publication review updated successfully',
      data: {
        publication: updatedPublication
      }
    });
  } catch (error) {
    console.error('Review publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing publication'
    });
  }
};

// @desc    Get publication statistics
// @route   GET /api/publications/stats
// @access  Private
export const getPublicationStats = async (req, res) => {
  try {
    const totalPublications = await Publication.countDocuments();
    const publishedCount = await Publication.countDocuments({ status: 'Published' });
    const pendingCount = await Publication.countDocuments({ status: 'Under Review' });
    const draftCount = await Publication.countDocuments({ status: 'Draft' });
    
    // Get publications by type
    const publicationsByType = await Publication.aggregate([
      { $group: { _id: '$publicationType', count: { $sum: 1 } } }
    ]);

    // Get recent publications (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPublications = await Publication.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalPublications,
        publishedCount,
        pendingCount,
        draftCount,
        publicationsByType,
        recentPublications
      }
    });
  } catch (error) {
    console.error('Get publication stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching publication statistics'
    });
  }
};

// @desc    Approve a publication (Admin only)
// @route   PUT /api/publications/:id/approve
// @access  Private/Admin
export const approvePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const publication = await Publication.findById(id);
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    publication.status = 'Approved';
    publication.reviewedBy = req.user._id;
    publication.reviewComments = comments || '';
    publication.reviewedAt = new Date();

    await publication.save();

    res.json({
      success: true,
      message: 'Publication approved successfully',
      data: publication
    });
  } catch (error) {
    console.error('Approve publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving publication'
    });
  }
};

// @desc    Reject a publication (Admin only)
// @route   PUT /api/publications/:id/reject
// @access  Private/Admin
export const rejectPublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const publication = await Publication.findById(id);
    if (!publication) {
      return res.status(404).json({
        success: false,
        message: 'Publication not found'
      });
    }

    publication.status = 'Rejected';
    publication.reviewedBy = req.user._id;
    publication.reviewComments = comments || '';
    publication.reviewedAt = new Date();

    await publication.save();

    res.json({
      success: true,
      message: 'Publication rejected successfully',
      data: publication
    });
  } catch (error) {
    console.error('Reject publication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting publication'
    });
  }
};
