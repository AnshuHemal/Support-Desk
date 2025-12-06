import Ticket from '../models/Ticket.js';
import EscalationRule from '../models/EscalationRule.js';
import Reply from '../models/Reply.js';
import Status from '../models/Status.js';
import { logAudit } from '../utils/auditLogger.js';

const evaluateCondition = (ticket, condition) => {
  const { field, operator, value } = condition;

  let ticketValue;
  switch (field) {
    case 'department':
      ticketValue = ticket.department?._id?.toString() || ticket.department?.toString();
      break;
    case 'status':
      ticketValue = ticket.status?._id?.toString() || ticket.status?.toString();
      break;
    case 'priority':
      ticketValue = ticket.priority;
      break;
    case 'assignedTo':
      ticketValue = ticket.assignedTo?._id?.toString() || ticket.assignedTo?.toString();
      break;
    case 'timeElapsed':
      const now = new Date();
      const lastActivity = new Date(ticket.lastActivityAt);
      ticketValue = Math.floor((now - lastActivity) / (1000 * 60 * 60)); // hours
      break;
    default:
      return false;
  }

  switch (operator) {
    case 'equals':
      return ticketValue === value;
    case 'notEquals':
      return ticketValue !== value;
    case 'in':
      return Array.isArray(value) && value.includes(ticketValue);
    case 'notIn':
      return Array.isArray(value) && !value.includes(ticketValue);
    case 'greaterThan':
      return ticketValue > value;
    case 'lessThan':
      return ticketValue < value;
    default:
      return false;
  }
};

const evaluateRule = (ticket, rule) => {
  const { logicOperator, rules } = rule.conditions;

  if (!rules || rules.length === 0) return false;

  if (logicOperator === 'AND') {
    return rules.every(condition => evaluateCondition(ticket, condition));
  } else {
    return rules.some(condition => evaluateCondition(ticket, condition));
  }
};

const executeAction = async (ticket, action) => {
  const { type, value } = action;

  switch (type) {
    case 'assignDepartment':
      ticket.department = value;
      break;
    case 'changeStatus':
      ticket.status = value;
      const status = await Status.findById(value);
      if (status?.title === 'Closed') {
        ticket.closedAt = new Date();
      }
      break;
    case 'updatePriority':
      ticket.priority = value;
      break;
    case 'assignUser':
      ticket.assignedTo = value || null;
      break;
    case 'addReply':
      await Reply.create({
        ticket: ticket._id,
        user: ticket.assignedTo || ticket.createdBy,
        message: value.message || 'This ticket has been escalated automatically.',
        isInternal: true,
      });
      break;
    case 'sendNotification':
      console.log(`Notification sent for ticket ${ticket.ticketNumber}`);
      break;
    default:
      console.log(`Unknown action type: ${type}`);
  }
};

export const processEscalations = async () => {
  try {
    console.log('Running escalation check...');

    const rules = await EscalationRule.find({ isActive: true }).sort({ priority: -1 });

    if (rules.length === 0) {
      console.log('No active escalation rules found');
      return;
    }

    const activeStatuses = await Status.find({ includeInActive: true }).select('_id');
    const activeStatusIds = activeStatuses.map(s => s._id);

    const tickets = await Ticket.find({
      status: { $in: activeStatusIds },
      isMerged: false,
    })
      .populate('status')
      .populate('department')
      .populate('assignedTo')
      .populate('createdBy');

    console.log(`Found ${tickets.length} active tickets to check`);

    let escalatedCount = 0;

    for (const ticket of tickets) {
      for (const rule of rules) {
        if (evaluateRule(ticket, rule)) {
          console.log(`Applying rule "${rule.name}" to ticket ${ticket.ticketNumber}`);

          for (const action of rule.actions) {
            await executeAction(ticket, action);
          }

          ticket.lastActivityAt = new Date();
          await ticket.save();

          await logAudit({
            ticket: ticket._id,
            action: 'escalated',
            metadata: {
              ruleName: rule.name,
              ruleId: rule._id,
            },
          });

          rule.lastExecuted = new Date();
          rule.executionCount += 1;
          await rule.save();

          escalatedCount++;
          break; // Only apply first matching rule
        }
      }
    }

    console.log(`Escalation check complete. ${escalatedCount} tickets escalated.`);
  } catch (error) {
    console.error('Escalation service error:', error);
  }
};

export const processAutoClose = async () => {
  try {
    console.log('Running auto-close check...');

    const autoCloseStatuses = await Status.find({ autoClose: true });

    for (const status of autoCloseStatuses) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - status.autoCloseAfterDays);

      const tickets = await Ticket.find({
        status: status._id,
        lastActivityAt: { $lt: cutoffDate },
        isMerged: false,
      });

      const closedStatus = await Status.findOne({ title: 'Closed' });

      if (!closedStatus) {
        console.log('Closed status not found, skipping auto-close');
        continue;
      }

      for (const ticket of tickets) {
        ticket.status = closedStatus._id;
        ticket.closedAt = new Date();
        await ticket.save();

        await logAudit({
          ticket: ticket._id,
          action: 'closed',
          metadata: {
            reason: 'auto-closed',
            previousStatus: status.title,
          },
        });

        console.log(`Auto-closed ticket ${ticket.ticketNumber}`);
      }
    }

    console.log('Auto-close check complete');
  } catch (error) {
    console.error('Auto-close service error:', error);
  }
};
