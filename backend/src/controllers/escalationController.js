import EscalationRule from '../models/EscalationRule.js';

export const createEscalationRule = async (req, res, next) => {
  try {
    const { name, description, conditions, actions, priority } = req.body;

    const rule = await EscalationRule.create({
      name,
      description,
      conditions,
      actions,
      priority: priority || 0,
    });

    res.status(201).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

export const getEscalationRules = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;

    const query = {};
    if (activeOnly === 'true') {
      query.isActive = true;
    }

    const rules = await EscalationRule.find(query).sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

export const getEscalationRule = async (req, res, next) => {
  try {
    const rule = await EscalationRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Escalation rule not found' });
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEscalationRule = async (req, res, next) => {
  try {
    const { name, description, conditions, actions, priority, isActive } = req.body;

    const rule = await EscalationRule.findByIdAndUpdate(
      req.params.id,
      { name, description, conditions, actions, priority, isActive },
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({ message: 'Escalation rule not found' });
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEscalationRule = async (req, res, next) => {
  try {
    const rule = await EscalationRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Escalation rule not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Escalation rule deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleEscalationRule = async (req, res, next) => {
  try {
    const rule = await EscalationRule.findById(req.params.id);

    if (!rule) {
      return res.status(404).json({ message: 'Escalation rule not found' });
    }

    rule.isActive = !rule.isActive;
    await rule.save();

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};
