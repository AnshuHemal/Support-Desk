import Department from '../models/Department.js';

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, email, assignedAdmins, isHidden } = req.body;

    const department = await Department.create({
      name,
      description,
      email,
      assignedAdmins: assignedAdmins || [],
      isHidden: isHidden || false,
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const { includeHidden } = req.query;

    const query = { isActive: true };
    if (!includeHidden && req.user.role !== 'admin') {
      query.isHidden = false;
    }

    const departments = await Department.find(query)
      .populate('assignedAdmins', 'name email')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('assignedAdmins', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, email, assignedAdmins, isHidden, isActive } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, email, assignedAdmins, isHidden, isActive },
      { new: true, runValidators: true }
    ).populate('assignedAdmins', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};
