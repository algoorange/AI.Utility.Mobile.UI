export type BillStatus = 'Paid' | 'Due' | 'Overdue';

export interface Bill {
  id: string;
  account: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  type: 'Electricity' | 'Water';
  pdfUrl?: string;
}

export const bills: Bill[] = [
  {
    id: 'BIL-2024-0001',
    account: 'Electricity',
    amount: 128.4,
    dueDate: '2024-07-15',
    status: 'Due',
    type: 'Electricity',
    pdfUrl: 'https://example.com/bills/2024-07-electricity.pdf'
  },
  {
    id: 'BIL-2024-0002',
    account: 'Water',
    amount: 54.2,
    dueDate: '2024-07-12',
    status: 'Paid',
    type: 'Water',
    pdfUrl: 'https://example.com/bills/2024-07-water.pdf'
  },
  {
    id: 'BIL-2024-0003',
    account: 'Electricity',
    amount: 143.88,
    dueDate: '2024-06-13',
    status: 'Paid',
    type: 'Electricity'
  },
  {
    id: 'BIL-2024-0004',
    account: 'Water',
    amount: 61.35,
    dueDate: '2024-06-10',
    status: 'Paid',
    type: 'Water'
  },
  {
    id: 'BIL-2024-0005',
    account: 'Electricity',
    amount: 152.12,
    dueDate: '2024-05-15',
    status: 'Overdue',
    type: 'Electricity'
  }
];

export interface PaymentMethod {
  id: string;
  label: string;
  type: 'CreditCard' | 'PayNow' | 'PayPal' | 'AutoDebit';
  last4?: string;
  isDefault?: boolean;
}

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm-visa', label: 'Visa •••• 4242', type: 'CreditCard', last4: '4242', isDefault: true },
  { id: 'pm-paynow', label: 'PayNow UEN 12345678A', type: 'PayNow' },
  { id: 'pm-paypal', label: 'PayPal john.doe@email.com', type: 'PayPal' },
  { id: 'pm-autodebit', label: 'Auto-debit - City Bank', type: 'AutoDebit' }
];

export interface UsageRecord {
  month: string;
  electricity: number;
  water: number;
}

export const consumption: UsageRecord[] = [
  { month: 'Jan', electricity: 320, water: 14 },
  { month: 'Feb', electricity: 305, water: 13.5 },
  { month: 'Mar', electricity: 332, water: 12.8 },
  { month: 'Apr', electricity: 298, water: 11.9 },
  { month: 'May', electricity: 355, water: 13.1 },
  { month: 'Jun', electricity: 342, water: 14.6 }
];

export interface Complaint {
  id: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  description: string;
}

export const complaints: Complaint[] = [
  {
    id: 'CMP-001',
    subject: 'Billing discrepancy for May',
    status: 'Resolved',
    createdAt: '2024-06-02',
    description: 'Difference between meter reading and billed amount.'
  },
  {
    id: 'CMP-002',
    subject: 'Water pressure issue',
    status: 'In Progress',
    createdAt: '2024-06-20',
    description: 'Low water pressure reported in block 12 apartment.'
  },
  {
    id: 'CMP-003',
    subject: 'Mobile app login issue',
    status: 'Open',
    createdAt: '2024-07-01',
    description: 'Unable to log in with FaceID on iPhone 14.'
  }
];

export type DisputeStatus = 'Submitted' | 'Under Review' | 'Resolved' | 'Rejected';

export interface Dispute {
  id: string;
  billId: string;
  status: DisputeStatus;
  submittedAt: string;
  comments: string;
  attachment?: string | null;
  voiceNote?: string | null;
}

export const disputes: Dispute[] = [
  {
    id: 'DSP-001',
    billId: 'BIL-2024-0005',
    status: 'Under Review',
    submittedAt: '2024-06-25T08:45:00Z',
    comments: 'Meter reading does not match the billed usage for May.',
    attachment: null,
    voiceNote: null
  },
  {
    id: 'DSP-002',
    billId: 'BIL-2024-0002',
    status: 'Resolved',
    submittedAt: '2024-05-14T10:12:00Z',
    comments: 'Late fee applied despite on-time payment.',
    attachment: null,
    voiceNote: null
  },
  {
    id: 'DSP-003',
    billId: 'BIL-2024-0001',
    status: 'Submitted',
    submittedAt: '2024-07-02T13:30:00Z',
    comments: 'Incorrect tariff rate detected in the latest bill.',
    attachment: null,
    voiceNote: null
  }
];

