import Status from '../models/Status.js';

export const createStatus = async (req, res, next) => {
  try {
    const { title, color, includeInActive, autoClose, autoCloseAfterDays, order } = req.body;

    const status = await Status.create({
      title,
      color,
      includeInActive,
      autoClose,
      autoCloseAfterDays,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatuses = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;

    const query = {};
    if (activeOnly === 'true') {
      query.includeInActive = true;
    }

    const statuses = await Status.find(query).sort({ order: 1, title: 1 });

    res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const status = await Status.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const status = await Status.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    if (status.isSystem) {
      return res.status(400).json({ message: 'Cannot modify system status' });
    }

    const { title, color, includeInActive, autoClose, autoCloseAfterDays, order } = req.body;

    const updatedStatus = await Status.findByIdAndUpdate(
      req.params.id,
      { title, color, includeInActive, autoClose, autoCloseAfterDays, order },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStatus = async (req, res, next) => {
  try {
    const status = await Status.findById(req.params.id);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    if (status.isSystem) {
      return res.status(400).json({ message: 'Cannot delete system status' });
    }

    await Status.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Status deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
