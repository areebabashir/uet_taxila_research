import Contact from '../models/Contact.js';
import User from '../models/User.js';

// Get all contacts (admin only)
export const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      contactType,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (contactType) {
      filter.contactType = contactType;
    }
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const contacts = await Contact.find(filter)
      .populate('response.respondedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalContacts: total,
          hasNext: skip + contacts.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts',
      error: error.message
    });
  }
};

// Get contact by ID
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id)
      .populate('response.respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { contact }
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact',
      error: error.message
    });
  }
};

// Create new contact (public endpoint)
export const createContact = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      contactType = 'general',
      organization,
      position,
      department,
      source = 'website',
      tags = []
    } = req.body;

    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const contactData = {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      contactType,
      organization,
      position,
      department,
      source,
      tags,
      ipAddress,
      userAgent
    };

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      data: { contact }
    });

  } catch (error) {
    console.error('Error creating contact:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating contact',
      error: error.message
    });
  }
};

// Update contact (admin only)
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.ipAddress;
    delete updateData.userAgent;

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('response.respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: { contact }
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating contact',
      error: error.message
    });
  }
};

// Respond to contact (admin only)
export const respondToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const respondedBy = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        status: 'responded',
        response: {
          message: message.trim(),
          respondedBy,
          respondedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).populate('response.respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      data: { contact }
    });

  } catch (error) {
    console.error('Error responding to contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to contact',
      error: error.message
    });
  }
};

// Delete contact (admin only)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact',
      error: error.message
    });
  }
};

// Get contact statistics (admin only)
export const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.getContactStats();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact statistics',
      error: error.message
    });
  }
};

// Bulk update contacts (admin only)
export const bulkUpdateContacts = async (req, res) => {
  try {
    const { contactIds, updateData } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Contact IDs array is required'
      });
    }

    // Remove fields that shouldn't be updated in bulk
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.ipAddress;
    delete updateData.userAgent;

    const result = await Contact.updateMany(
      { _id: { $in: contactIds } },
      updateData,
      { runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} contacts updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Error bulk updating contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while bulk updating contacts',
      error: error.message
    });
  }
};

// Mark contact as resolved (admin only)
export const markAsResolved = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status: 'resolved' },
      { new: true }
    ).populate('response.respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact marked as resolved',
      data: { contact }
    });

  } catch (error) {
    console.error('Error marking contact as resolved:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking contact as resolved',
      error: error.message
    });
  }
};

// Close contact (admin only)
export const closeContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status: 'closed' },
      { new: true }
    ).populate('response.respondedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact closed',
      data: { contact }
    });

  } catch (error) {
    console.error('Error closing contact:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while closing contact',
      error: error.message
    });
  }
};
