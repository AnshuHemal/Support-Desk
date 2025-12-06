import Attachment from '../models/Attachment.js';
import Ticket from '../models/Ticket.js';
import { deleteFile, getFilePath, fileExists } from '../config/upload.js';
import fs from 'fs';
import path from 'path';

export const uploadAttachments = async (req, res, next) => {
  try {
    const { ticketId, replyId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      req.files.forEach(file => deleteFile(file.filename));
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      req.files.forEach(file => deleteFile(file.filename));
      return res.status(403).json({ message: 'Not authorized to upload to this ticket' });
    }
    const attachments = await Promise.all(
      req.files.map(file =>
        Attachment.create({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          ticket: ticketId,
          uploadedBy: req.user._id,
          ...(replyId && { reply: replyId }),
        })
      )
    );
    const populatedAttachments = await Attachment.find({
      _id: { $in: attachments.map(a => a._id) }
    }).populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedAttachments,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFile(file.filename));
    }
    next(error);
  }
};

export const getTicketAttachments = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    const attachments = await Attachment.find({ ticket: ticketId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findById(id).populate('ticket');
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    const ticket = attachment.ticket;
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to download this file' });
    }
    if (!fileExists(attachment.filename)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const filePath = getFilePath(attachment.filename);
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
    res.setHeader('Content-Length', attachment.size);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const viewAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findById(id).populate('ticket');
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    const ticket = attachment.ticket;
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this file' });
    }
    if (!fileExists(attachment.filename)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const filePath = getFilePath(attachment.filename);
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);
    res.setHeader('Content-Length', attachment.size);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findById(id).populate('ticket');
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    if (
      req.user.role !== 'admin' &&
      attachment.uploadedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }
    deleteFile(attachment.filename);
    await Attachment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getThumbnail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findById(id).populate('ticket');
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }
    if (!attachment.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Thumbnails only available for images' });
    }
    const ticket = attachment.ticket;
    if (req.user.role === 'user' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this file' });
    }
    if (!fileExists(attachment.filename)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    const filePath = getFilePath(attachment.filename);

    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
