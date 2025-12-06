import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  ticket,
  user,
  action,
  changes = {},
  metadata = {},
  req = null,
}) => {
  try {
    await AuditLog.create({
      ticket,
      user,
      action,
      changes,
      metadata,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('user-agent'),
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
