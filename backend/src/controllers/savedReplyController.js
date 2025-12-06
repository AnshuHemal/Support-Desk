import SavedReply from '../models/SavedReply.js';
import { logAudit } from '../utils/auditLogger.js';
export const getSavedReplies = async (req, res) => {
  try {
    const { category, search } = req.query;
    const userId = req.user.id;
    const userDepartment = req.user.department;
    let query = {
      isActive: true,
      $or: [
        { createdBy: userId, visibility: 'private' },
        { visibility: 'global' },
        { visibility: 'department', department: userDepartment }
      ]
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { shortcut: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }

    const savedReplies = await SavedReply.find(query)
      .populate('createdBy', 'name email')
      .populate('department', 'name')
      .sort({ usageCount: -1, createdAt: -1 })
      .lean();

    res.json(savedReplies);
  } catch (error) {
    console.error('Error fetching saved replies:', error);
    res.status(500).json({ message: 'Error fetching saved replies' });
  }
};
export const getSavedReply = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userDepartment = req.user.department;

    const savedReply = await SavedReply.findOne({
      _id: id,
      isActive: true,
      $or: [
        { createdBy: userId },
        { visibility: 'global' },
        { visibility: 'department', department: userDepartment }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('department', 'name');

    if (!savedReply) {
      return res.status(404).json({ message: 'Saved reply not found' });
    }

    res.json(savedReply);
  } catch (error) {
    console.error('Error fetching saved reply:', error);
    res.status(500).json({ message: 'Error fetching saved reply' });
  }
};
export const createSavedReply = async (req, res) => {
  try {
    const { title, content, shortcut, category, visibility, department } = req.body;
    const userId = req.user.id;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    if (shortcut) {
      const existingShortcut = await SavedReply.findOne({
        shortcut,
        isActive: true
      });
      if (existingShortcut) {
        return res.status(400).json({ message: 'Shortcut already exists' });
      }
    }
    if (visibility === 'department' && !department) {
      return res.status(400).json({ message: 'Department is required for department visibility' });
    }
    if (visibility === 'global' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create global saved replies' });
    }

    const savedReply = new SavedReply({
      title,
      content,
      shortcut: shortcut || undefined,
      category: category || 'general',
      visibility: visibility || 'private',
      department: visibility === 'department' ? department : undefined,
      createdBy: userId
    });

    await savedReply.save();
    await savedReply.populate('createdBy', 'name email');
    if (savedReply.department) {
      await savedReply.populate('department', 'name');
    }

    await logAudit(userId, 'CREATE', 'SavedReply', savedReply._id, null, {
      title: savedReply.title,
      visibility: savedReply.visibility
    });

    res.status(201).json(savedReply);
  } catch (error) {
    console.error('Error creating saved reply:', error);
    res.status(500).json({ message: 'Error creating saved reply' });
  }
};
export const updateSavedReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, shortcut, category, visibility, department } = req.body;
    const userId = req.user.id;

    const savedReply = await SavedReply.findOne({ _id: id, isActive: true });

    if (!savedReply) {
      return res.status(404).json({ message: 'Saved reply not found' });
    }
    const isOwner = savedReply.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this saved reply' });
    }
    if (shortcut && shortcut !== savedReply.shortcut) {
      const existingShortcut = await SavedReply.findOne({
        shortcut,
        isActive: true,
        _id: { $ne: id }
      });
      if (existingShortcut) {
        return res.status(400).json({ message: 'Shortcut already exists' });
      }
    }
    if (visibility === 'global' && !isAdmin) {
      return res.status(403).json({ message: 'Only admins can create global saved replies' });
    }

    const oldData = savedReply.toObject();
    if (title) savedReply.title = title;
    if (content) savedReply.content = content;
    if (shortcut !== undefined) savedReply.shortcut = shortcut || undefined;
    if (category) savedReply.category = category;
    if (visibility) savedReply.visibility = visibility;
    if (visibility === 'department' && department) {
      savedReply.department = department;
    } else if (visibility !== 'department') {
      savedReply.department = undefined;
    }

    await savedReply.save();
    await savedReply.populate('createdBy', 'name email');
    if (savedReply.department) {
      await savedReply.populate('department', 'name');
    }

    await logAudit(userId, 'UPDATE', 'SavedReply', savedReply._id, oldData, savedReply.toObject());

    res.json(savedReply);
  } catch (error) {
    console.error('Error updating saved reply:', error);
    res.status(500).json({ message: 'Error updating saved reply' });
  }
};
export const deleteSavedReply = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const savedReply = await SavedReply.findOne({ _id: id, isActive: true });

    if (!savedReply) {
      return res.status(404).json({ message: 'Saved reply not found' });
    }
    const isOwner = savedReply.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this saved reply' });
    }
    savedReply.isActive = false;
    await savedReply.save();

    await logAudit(userId, 'DELETE', 'SavedReply', savedReply._id, savedReply.toObject(), null);

    res.json({ message: 'Saved reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting saved reply:', error);
    res.status(500).json({ message: 'Error deleting saved reply' });
  }
};
export const recordUsage = async (req, res) => {
  try {
    const { id } = req.params;

    const savedReply = await SavedReply.findOne({ _id: id, isActive: true });

    if (!savedReply) {
      return res.status(404).json({ message: 'Saved reply not found' });
    }

    await savedReply.recordUsage();

    res.json({ message: 'Usage recorded' });
  } catch (error) {
    console.error('Error recording usage:', error);
    res.status(500).json({ message: 'Error recording usage' });
  }
};
export const getSavedReplyByShortcut = async (req, res) => {
  try {
    const { shortcut } = req.params;
    const userId = req.user.id;
    const userDepartment = req.user.department;

    const savedReply = await SavedReply.findOne({
      shortcut,
      isActive: true,
      $or: [
        { createdBy: userId },
        { visibility: 'global' },
        { visibility: 'department', department: userDepartment }
      ]
    })
      .populate('createdBy', 'name email')
      .populate('department', 'name');

    if (!savedReply) {
      return res.status(404).json({ message: 'Saved reply not found' });
    }

    res.json(savedReply);
  } catch (error) {
    console.error('Error fetching saved reply by shortcut:', error);
    res.status(500).json({ message: 'Error fetching saved reply' });
  }
};
