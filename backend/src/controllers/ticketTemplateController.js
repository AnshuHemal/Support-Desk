import TicketTemplate from '../models/TicketTemplate.js';
import { logAudit } from '../utils/auditLogger.js';
export const getTicketTemplates = async (req, res) => {
  try {
    const { category, search, isPublic } = req.query;
    const userId = req.user.id;
    const userDepartment = req.user.department;
    let query = {
      isActive: true,
    };
    if (isPublic === 'true') {
      query.isPublic = true;
    } else {
      query.$or = [
        { createdBy: userId, visibility: 'private' },
        { visibility: 'global' },
        { visibility: 'department', department: userDepartment },
        { isPublic: true },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
          ],
        },
      ];
      delete query.$or;
    }

    const templates = await TicketTemplate.find(query)
      .populate('createdBy', 'name email')
      .populate('department', 'name')
      .sort({ usageCount: -1, createdAt: -1 })
      .lean();

    res.json(templates);
  } catch (error) {
    console.error('Error fetching ticket templates:', error);
    res.status(500).json({ message: 'Error fetching ticket templates' });
  }
};
export const getTicketTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userDepartment = req.user.department;

    const template = await TicketTemplate.findOne({
      _id: id,
      isActive: true,
      $or: [
        { createdBy: userId },
        { visibility: 'global' },
        { visibility: 'department', department: userDepartment },
        { isPublic: true },
      ],
    })
      .populate('createdBy', 'name email')
      .populate('department', 'name');

    if (!template) {
      return res.status(404).json({ message: 'Ticket template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching ticket template:', error);
    res.status(500).json({ message: 'Error fetching ticket template' });
  }
};
export const createTicketTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      title,
      content,
      category,
      priority,
      department,
      tags,
      visibility,
      isPublic,
      icon,
      color,
    } = req.body;
    const userId = req.user.id;
    if (!name || !title || !content) {
      return res
        .status(400)
        .json({ message: 'Name, title, and content are required' });
    }
    if (visibility === 'department' && !department) {
      return res
        .status(400)
        .json({ message: 'Department is required for department visibility' });
    }
    if (
      (visibility === 'global' || isPublic) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        message: 'Only admins can create global or public ticket templates',
      });
    }

    const template = new TicketTemplate({
      name,
      description,
      title,
      content,
      category: category || 'general',
      priority: priority || 'medium',
      department: visibility === 'department' ? department : undefined,
      tags: tags || [],
      visibility: visibility || 'private',
      isPublic: isPublic || false,
      icon: icon || '📋',
      color: color || '#3B82F6',
      createdBy: userId,
    });

    await template.save();
    await template.populate('createdBy', 'name email');
    if (template.department) {
      await template.populate('department', 'name');
    }

    await logAudit(userId, 'CREATE', 'TicketTemplate', template._id, null, {
      name: template.name,
      visibility: template.visibility,
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating ticket template:', error);
    res.status(500).json({ message: 'Error creating ticket template' });
  }
};
export const updateTicketTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      title,
      content,
      category,
      priority,
      department,
      tags,
      visibility,
      isPublic,
      icon,
      color,
    } = req.body;
    const userId = req.user.id;

    const template = await TicketTemplate.findOne({ _id: id, isActive: true });

    if (!template) {
      return res.status(404).json({ message: 'Ticket template not found' });
    }
    const isOwner = template.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this ticket template' });
    }
    if ((visibility === 'global' || isPublic) && !isAdmin) {
      return res.status(403).json({
        message: 'Only admins can create global or public ticket templates',
      });
    }

    const oldData = template.toObject();
    if (name) template.name = name;
    if (description !== undefined) template.description = description;
    if (title) template.title = title;
    if (content) template.content = content;
    if (category) template.category = category;
    if (priority) template.priority = priority;
    if (tags !== undefined) template.tags = tags;
    if (visibility) template.visibility = visibility;
    if (isPublic !== undefined) template.isPublic = isPublic;
    if (icon) template.icon = icon;
    if (color) template.color = color;

    if (visibility === 'department' && department) {
      template.department = department;
    } else if (visibility !== 'department') {
      template.department = undefined;
    }

    await template.save();
    await template.populate('createdBy', 'name email');
    if (template.department) {
      await template.populate('department', 'name');
    }

    await logAudit(
      userId,
      'UPDATE',
      'TicketTemplate',
      template._id,
      oldData,
      template.toObject()
    );

    res.json(template);
  } catch (error) {
    console.error('Error updating ticket template:', error);
    res.status(500).json({ message: 'Error updating ticket template' });
  }
};
export const deleteTicketTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const template = await TicketTemplate.findOne({ _id: id, isActive: true });

    if (!template) {
      return res.status(404).json({ message: 'Ticket template not found' });
    }
    const isOwner = template.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this ticket template' });
    }
    template.isActive = false;
    await template.save();

    await logAudit(
      userId,
      'DELETE',
      'TicketTemplate',
      template._id,
      template.toObject(),
      null
    );

    res.json({ message: 'Ticket template deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket template:', error);
    res.status(500).json({ message: 'Error deleting ticket template' });
  }
};
export const recordUsage = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await TicketTemplate.findOne({ _id: id, isActive: true });

    if (!template) {
      return res.status(404).json({ message: 'Ticket template not found' });
    }

    await template.recordUsage();

    res.json({ message: 'Usage recorded' });
  } catch (error) {
    console.error('Error recording usage:', error);
    res.status(500).json({ message: 'Error recording usage' });
  }
};
export const duplicateTicketTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const originalTemplate = await TicketTemplate.findOne({
      _id: id,
      isActive: true,
    });

    if (!originalTemplate) {
      return res.status(404).json({ message: 'Ticket template not found' });
    }
    const duplicate = new TicketTemplate({
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      title: originalTemplate.title,
      content: originalTemplate.content,
      category: originalTemplate.category,
      priority: originalTemplate.priority,
      tags: originalTemplate.tags,
      visibility: 'private', // Always create as private
      isPublic: false,
      icon: originalTemplate.icon,
      color: originalTemplate.color,
      createdBy: userId,
    });

    await duplicate.save();
    await duplicate.populate('createdBy', 'name email');

    await logAudit(userId, 'CREATE', 'TicketTemplate', duplicate._id, null, {
      name: duplicate.name,
      duplicatedFrom: originalTemplate._id,
    });

    res.status(201).json(duplicate);
  } catch (error) {
    console.error('Error duplicating ticket template:', error);
    res.status(500).json({ message: 'Error duplicating ticket template' });
  }
};
