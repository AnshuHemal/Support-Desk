import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TicketTemplate from '../models/TicketTemplate.js';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const predefinedTemplates = [
  {
    name: 'Password Reset Request',
    description: 'User needs help resetting their password',
    title: 'Password Reset Required',
    content: `I am unable to access my account and need to reset my password.

Account Details:
- Email: [Your email address]
- Username: [Your username]

Issue Description:
I have tried the "Forgot Password" link but [describe the issue - not receiving email, link expired, etc.]

Please assist me in resetting my password so I can regain access to my account.`,
    category: 'account',
    priority: 'high',
    tags: ['password', 'reset', 'account-access', 'login'],
    visibility: 'global',
    isPublic: true,
    icon: 'Key',
    color: '#EF4444',
  },
  {
    name: 'Bug Report',
    description: 'Report a software bug or technical issue',
    title: 'Bug Report: [Brief Description]',
    content: `**Bug Description:**
[Provide a clear and concise description of the bug]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Third step]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: [e.g., Chrome 120]
- Operating System: [e.g., Windows 11]
- Device: [e.g., Desktop, Mobile]

**Screenshots/Error Messages:**
[Attach any relevant screenshots or error messages]

**Additional Context:**
[Any other information that might be helpful]`,
    category: 'bug_report',
    priority: 'medium',
    tags: ['bug', 'technical', 'error'],
    visibility: 'global',
    isPublic: true,
    icon: 'Bug',
    color: '#DC2626',
  },
  {
    name: 'Feature Request',
    description: 'Suggest a new feature or enhancement',
    title: 'Feature Request: [Feature Name]',
    content: `**Feature Description:**
[Describe the feature you'd like to see]

**Problem it Solves:**
[Explain what problem this feature would solve]

**Proposed Solution:**
[Describe how you envision this feature working]

**Use Case:**
[Provide specific examples of how you would use this feature]

**Benefits:**
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

**Alternative Solutions:**
[Have you considered any alternative solutions?]

**Additional Context:**
[Any other information, mockups, or examples]`,
    category: 'feature_request',
    priority: 'low',
    tags: ['feature', 'enhancement', 'suggestion'],
    visibility: 'global',
    isPublic: true,
    icon: 'Lightbulb',
    color: '#F59E0B',
  },
  {
    name: 'Billing Issue',
    description: 'Report payment or billing problems',
    title: 'Billing Issue: [Brief Description]',
    content: `**Issue Type:**
[ ] Payment Failed
[ ] Incorrect Charge
[ ] Refund Request
[ ] Invoice Not Received
[ ] Subscription Issue
[ ] Other

**Account Information:**
- Account Email: [Your email]
- Invoice/Transaction ID: [If applicable]
- Date of Transaction: [Date]

**Issue Description:**
[Provide detailed information about the billing issue]

**Amount in Question:**
[Specify the amount if applicable]

**Expected Resolution:**
[What would you like us to do?]

**Supporting Documents:**
[Attach any relevant receipts, screenshots, or invoices]`,
    category: 'billing',
    priority: 'high',
    tags: ['billing', 'payment', 'invoice', 'refund'],
    visibility: 'global',
    isPublic: true,
    icon: 'CreditCard',
    color: '#10B981',
  },
  {
    name: 'Account Locked',
    description: 'User account has been locked or suspended',
    title: 'Account Locked - Access Required',
    content: `My account has been locked and I am unable to log in.

**Account Details:**
- Email: [Your email address]
- Username: [Your username]
- Last successful login: [Date/Time if known]

**What Happened:**
[Describe what you were doing when the account was locked]

**Error Message:**
[Copy any error message you received]

**Urgency:**
I need access to my account urgently because [explain why]

Please help me regain access to my account as soon as possible.`,
    category: 'account',
    priority: 'urgent',
    tags: ['account', 'locked', 'suspended', 'access'],
    visibility: 'global',
    isPublic: true,
    icon: 'Lock',
    color: '#DC2626',
  },
  {
    name: 'Technical Support',
    description: 'General technical support request',
    title: 'Technical Support: [Issue Summary]',
    content: `**Issue Summary:**
[Brief description of the technical issue]

**Detailed Description:**
[Provide detailed information about the problem]

**When Did This Start:**
[Date/Time when you first noticed the issue]

**Frequency:**
[ ] Happens every time
[ ] Happens occasionally
[ ] Happened once

**What I've Tried:**
- [Action 1]
- [Action 2]
- [Action 3]

**System Information:**
- Device: [Desktop/Laptop/Mobile/Tablet]
- Operating System: [Windows/Mac/Linux/iOS/Android]
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [If known]

**Impact:**
[How is this affecting your work/usage?]`,
    category: 'technical',
    priority: 'medium',
    tags: ['technical', 'support', 'help'],
    visibility: 'global',
    isPublic: true,
    icon: 'Wrench',
    color: '#3B82F6',
  },
  {
    name: 'Data Export Request',
    description: 'Request to export account data',
    title: 'Data Export Request',
    content: `I would like to request an export of my account data.

**Account Information:**
- Email: [Your email address]
- Account ID: [If known]

**Data Requested:**
[ ] All account data
[ ] Specific data: [Specify what data you need]

**Format Preference:**
[ ] CSV
[ ] JSON
[ ] PDF
[ ] Other: [Specify]

**Reason for Request:**
[Optional: Explain why you need this data]

**Delivery Method:**
[ ] Email
[ ] Download link
[ ] Other: [Specify]

Please process this request in accordance with data protection regulations.`,
    category: 'account',
    priority: 'low',
    tags: ['data', 'export', 'privacy', 'gdpr'],
    visibility: 'global',
    isPublic: true,
    icon: 'Download',
    color: '#8B5CF6',
  },
  {
    name: 'Integration Issue',
    description: 'Problems with third-party integrations',
    title: 'Integration Issue: [Integration Name]',
    content: `**Integration Name:**
[Name of the third-party service]

**Issue Description:**
[Describe the integration problem]

**Integration Setup:**
- When was it set up: [Date]
- Was it working before: [Yes/No]
- Last successful sync: [Date/Time if known]

**Error Messages:**
[Copy any error messages or codes]

**What I've Tried:**
- [Action 1]
- [Action 2]

**Expected Behavior:**
[What should the integration do?]

**Actual Behavior:**
[What is actually happening?]

**Impact:**
[How is this affecting your workflow?]

**API Keys/Credentials:**
[Do NOT share actual credentials - just confirm if they're configured]`,
    category: 'technical',
    priority: 'high',
    tags: ['integration', 'api', 'third-party', 'sync'],
    visibility: 'global',
    isPublic: false,
    icon: 'Plug',
    color: '#06B6D4',
  },
  {
    name: 'Performance Issue',
    description: 'Report slow performance or loading issues',
    title: 'Performance Issue: Slow Loading',
    content: `**Performance Issue:**
[Describe what is slow or not performing well]

**Affected Areas:**
[ ] Page loading
[ ] Data processing
[ ] File uploads/downloads
[ ] Search functionality
[ ] Other: [Specify]

**When Does This Occur:**
[All the time / Specific times / Specific actions]

**Performance Details:**
- Average load time: [Seconds]
- Expected load time: [Seconds]
- Started happening: [Date]

**System Information:**
- Internet Speed: [If known]
- Device: [Desktop/Mobile]
- Browser: [Name and version]
- Location: [Country/Region]

**Impact:**
[How is this affecting your productivity?]

**Screenshots/Recordings:**
[Attach any performance metrics or recordings if available]`,
    category: 'technical',
    priority: 'medium',
    tags: ['performance', 'slow', 'loading', 'optimization'],
    visibility: 'global',
    isPublic: true,
    icon: 'Gauge',
    color: '#F59E0B',
  },
  {
    name: 'Security Concern',
    description: 'Report security issues or concerns',
    title: 'Security Concern: [Brief Description]',
    content: `**IMPORTANT: If this is a critical security vulnerability, please contact security@company.com immediately**

**Type of Security Concern:**
[ ] Suspicious activity on account
[ ] Potential vulnerability
[ ] Phishing attempt
[ ] Data breach concern
[ ] Other: [Specify]

**Description:**
[Provide detailed information about the security concern]

**When Did You Notice This:**
[Date and time]

**Affected Resources:**
[What accounts, systems, or data might be affected?]

**Evidence:**
[Describe any evidence you have - DO NOT include sensitive data]

**Actions Taken:**
[What have you done so far?]

**Urgency Level:**
[ ] Critical - Immediate action required
[ ] High - Action needed soon
[ ] Medium - Should be reviewed
[ ] Low - General concern

This will be treated with appropriate confidentiality and urgency.`,
    category: 'technical',
    priority: 'urgent',
    tags: ['security', 'vulnerability', 'breach', 'urgent'],
    visibility: 'global',
    isPublic: false,
    icon: 'Shield',
    color: '#DC2626',
  },
  {
    name: 'Account Deletion Request',
    description: 'Request to delete account and data',
    title: 'Account Deletion Request',
    content: `I would like to request the deletion of my account and associated data.

**Account Information:**
- Email: [Your email address]
- Username: [Your username]
- Account ID: [If known]

**Confirmation:**
I understand that:
- This action is permanent and cannot be undone
- All my data will be deleted
- I will lose access to all services
- Any active subscriptions will be cancelled

**Reason for Deletion:**
[Optional: Let us know why you're leaving]

**Data Retention:**
[ ] Delete all data immediately
[ ] Keep data for legal retention period only

**Final Confirmation:**
I confirm that I want to permanently delete my account.

Signature: [Your name]
Date: [Today's date]`,
    category: 'account',
    priority: 'medium',
    tags: ['account', 'deletion', 'gdpr', 'privacy'],
    visibility: 'global',
    isPublic: true,
    icon: 'UserX',
    color: '#DC2626',
  },
  {
    name: 'General Inquiry',
    description: 'General questions or information requests',
    title: 'General Inquiry: [Topic]',
    content: `**Topic:**
[What is your inquiry about?]

**Question/Request:**
[Provide detailed information about what you need to know]

**Context:**
[Any background information that might be helpful]

**Preferred Response:**
[ ] Detailed explanation
[ ] Quick answer
[ ] Documentation link
[ ] Schedule a call

**Urgency:**
[ ] Not urgent
[ ] Would like response within a few days
[ ] Need response soon

**Additional Information:**
[Any other details that might be relevant]`,
    category: 'general',
    priority: 'low',
    tags: ['inquiry', 'question', 'information'],
    visibility: 'global',
    isPublic: true,
    icon: 'HelpCircle',
    color: '#6366F1',
  },
];

async function seedTicketTemplates() {
  try {
    await connectDB();
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.email}`);
    const existingCount = await TicketTemplate.countDocuments({
      name: { $in: predefinedTemplates.map((t) => t.name) },
    });

    if (existingCount > 0) {
      console.log(
        `Found ${existingCount} existing templates. Do you want to replace them? (y/n)`
      );
      console.log('Run with --force flag to skip this prompt and replace all');

      if (!process.argv.includes('--force')) {
        process.exit(0);
      }
      await TicketTemplate.deleteMany({
        name: { $in: predefinedTemplates.map((t) => t.name) },
      });
      console.log('Deleted existing templates');
    }
    const templates = predefinedTemplates.map((template) => ({
      ...template,
      createdBy: adminUser._id,
    }));

    const result = await TicketTemplate.insertMany(templates);

    console.log(`✅ Successfully created ${result.length} ticket templates:`);
    result.forEach((template) => {
      console.log(`   - ${template.name} (${template.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding ticket templates:', error);
    process.exit(1);
  }
}
seedTicketTemplates();

export default seedTicketTemplates;
