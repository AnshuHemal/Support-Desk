import Ticket from '../models/Ticket.js';
import Reply from '../models/Reply.js';
import Status from '../models/Status.js';
import AuditLog from '../models/AuditLog.js';
import { generateTicketNumber } from '../utils/ticketNumber.js';
import { logAudit } from '../utils/auditLogger.js';
import { notifyUser, notifyRole } from '../config/socket.js';

export const createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, department, tags } = req.body;

    const defaultStatus = await Status.findOne({ title: 'Open' });
    if (!defaultStatus) {
      return res.status(400).json({
        success: false,
        message: 'Default status not found. Please run the seed script first: node backend/src/scripts/seed.js'
      });
    }

    const ticketNumber = await generateTicketNumber();

    const ticket = await Ticket.create({
      ticketNumber,
      title,
      description,
      priority,
      department,
      status: defaultStatus._id,
      createdBy: req.user._id,
      tags: tags || [],
    });

    await logAudit({
      ticket: ticket._id,
      user: req.user._id,
      action: 'created',
      metadata: { ticketNumber, title },
      req,
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('status')
      .populate('department')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    try {
      notifyRole('admin', 'ticket:created', populatedTicket);
      notifyRole('agent', 'ticket:created', populatedTicket);
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    res.status(201).json({
      success: true,
      data: populatedTicket,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      department,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { isMerged: false };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('status')
        .populate('department')
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(query),
    ]);

    const response = {
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('status')
      .populate('department')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('dependencies.ticket', 'ticketNumber title status');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    const replies = await Reply.find({ ticket: ticket._id })
      .populate('user', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: { ticket, replies },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }

    const oldVersion = ticket.version;
    if (req.body.version && req.body.version !== oldVersion) {
      return res.status(409).json({ message: 'Ticket has been modified by another user. Please refresh.' });
    }

    const changes = {};
    const allowedFields = ['title', 'description', 'priority', 'department', 'tags'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== ticket[field]) {
        changes[field] = { from: ticket[field], to: req.body[field] };
        ticket[field] = req.body[field];
      }
    });

    ticket.lastActivityAt = new Date();
    await ticket.save();

    if (Object.keys(changes).length > 0) {
      await logAudit({
        ticket: ticket._id,
        user: req.user._id,
        action: 'updated',
        changes,
        req,
      });
    }

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('status')
      .populate('department')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (updatedTicket.createdBy._id.toString() !== req.user._id.toString()) {
      notifyUser(updatedTicket.createdBy._id.toString(), 'ticket:updated', updatedTicket);
    }
    if (updatedTicket.assignedTo) {
      notifyUser(updatedTicket.assignedTo._id.toString(), 'ticket:updated', updatedTicket);
    }

    res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const assignTicket = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const oldAssignee = ticket.assignedTo;
    ticket.assignedTo = assignedTo || null;
    ticket.lastActivityAt = new Date();
    await ticket.save();

    await logAudit({
      ticket: ticket._id,
      user: req.user._id,
      action: 'assigned',
      changes: { assignedTo: { from: oldAssignee, to: assignedTo } },
      req,
    });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('status')
      .populate('department')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (assignedTo) {
      notifyUser(assignedTo, 'ticket:assigned', updatedTicket);
    }
    notifyUser(updatedTicket.createdBy._id.toString(), 'ticket:assigned', updatedTicket);

    res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const changeStatus = async (req, res, next) => {
  try {
    const { statusId } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const newStatus = await Status.findById(statusId);
    if (!newStatus) {
      return res.status(404).json({ message: 'Status not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = statusId;
    ticket.lastActivityAt = new Date();

    if (newStatus.title === 'Closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    await logAudit({
      ticket: ticket._id,
      user: req.user._id,
      action: 'status_changed',
      changes: { status: { from: oldStatus, to: statusId } },
      req,
    });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('status')
      .populate('department')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    notifyUser(updatedTicket.createdBy._id.toString(), 'ticket:status_changed', updatedTicket);
    if (updatedTicket.assignedTo) {
      notifyUser(updatedTicket.assignedTo._id.toString(), 'ticket:status_changed', updatedTicket);
    }

    res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const addReply = async (req, res, next) => {
  try {
    const { message, isInternal } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
    }

    const reply = await Reply.create({
      ticket: ticket._id,
      user: req.user._id,
      message,
      isInternal: req.user.role !== 'user' ? isInternal : false,
    });

    ticket.lastActivityAt = new Date();
    await ticket.save();

    await logAudit({
      ticket: ticket._id,
      user: req.user._id,
      action: 'replied',
      metadata: { replyId: reply._id },
      req,
    });

    const populatedReply = await Reply.findById(reply._id)
      .populate('user', 'name email role');

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('createdBy', '_id')
      .populate('assignedTo', '_id');
    if (populatedTicket.createdBy._id.toString() !== req.user._id.toString()) {
      notifyUser(populatedTicket.createdBy._id.toString(), 'ticket:reply', {
        ticket: ticket._id,
        reply: populatedReply,
      });
    }
    if (populatedTicket.assignedTo && populatedTicket.assignedTo._id.toString() !== req.user._id.toString()) {
      notifyUser(populatedTicket.assignedTo._id.toString(), 'ticket:reply', {
        ticket: ticket._id,
        reply: populatedReply,
      });
    }

    res.status(201).json({
      success: true,
      data: populatedReply,
    });
  } catch (error) {
    next(error);
  }
};

export const mergeTickets = async (req, res, next) => {
  try {
    const { targetTicketId } = req.body;
    const sourceTicket = await Ticket.findById(req.params.id);
    const targetTicket = await Ticket.findById(targetTicketId);

    if (!sourceTicket || !targetTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (sourceTicket._id.toString() === targetTicket._id.toString()) {
      return res.status(400).json({ message: 'Cannot merge ticket into itself' });
    }

    sourceTicket.isMerged = true;
    sourceTicket.mergedInto = targetTicket._id;
    await sourceTicket.save();
    await Reply.updateMany(
      { ticket: sourceTicket._id },
      { ticket: targetTicket._id }
    );

    await logAudit({
      ticket: sourceTicket._id,
      user: req.user._id,
      action: 'merged',
      metadata: { mergedInto: targetTicket._id, targetTicketNumber: targetTicket.ticketNumber },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Ticket ${sourceTicket.ticketNumber} merged into ${targetTicket.ticketNumber}`,
    });
  } catch (error) {
    next(error);
  }
};

export const addDependency = async (req, res, next) => {
  try {
    const { dependentTicketId, type } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    const dependentTicket = await Ticket.findById(dependentTicketId);

    if (!ticket || !dependentTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const exists = ticket.dependencies.some(
      dep => dep.ticket.toString() === dependentTicketId
    );

    if (exists) {
      return res.status(400).json({ message: 'Dependency already exists' });
    }

    ticket.dependencies.push({ ticket: dependentTicketId, type });
    await ticket.save();

    await logAudit({
      ticket: ticket._id,
      user: req.user._id,
      action: 'dependency_added',
      metadata: { dependentTicket: dependentTicketId, type },
      req,
    });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('status')
      .populate('department')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('dependencies.ticket', 'ticketNumber title status');

    res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const removeDependency = async (req, res, next) => {
  try {
    const { dependentTicketId } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.dependencies = ticket.dependencies.filter(
      dep => dep.ticket.toString() !== dependentTicketId
    );
    await ticket.save();

    await logAudit({
      ticket: ticket._id,
      user: req.user._id,
      action: 'dependency_removed',
      metadata: { dependentTicket: dependentTicketId },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Dependency removed',
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketHistory = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const history = await AuditLog.find({ ticket: ticket._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
