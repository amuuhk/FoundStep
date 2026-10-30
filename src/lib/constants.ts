export const APP_NAME = 'FoundStep';

export const GATE_NAMES: Record<number, string> = {
  0: 'Idea',
  1: 'Hustle',
  2: 'Stable',
  3: 'Growth',
  4: 'Scale',
  5: 'Funded or Exit',
};

export const GATE_ORDER = [0, 1, 2, 3, 4, 5];

export const STAGES = [
  { value: 'idea', label: 'Idea — I have not started selling yet' },
  { value: 'selling', label: 'Selling — I am selling but not earning regularly' },
  { value: 'earning', label: 'Earning — I have regular paying customers' },
] as const;

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ha', label: 'Hausa' },
  { value: 'yo', label: 'Yoruba' },
] as const;

export const NIGERIA_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export const SECTORS = [
  'Agriculture', 'Food & Restaurant', 'Retail', 'Fashion', 'Technology',
  'Health', 'Education', 'Transport', 'Real Estate', 'Manufacturing',
  'Services', 'Entertainment', 'Finance', 'Beauty & Personal Care',
  'Construction', 'Other',
];

export const TASK_OWNER_LABELS: Record<string, string> = {
  FOUNDER: 'You do this',
  AI_DRAFT: 'AI suggests, you approve',
  AUTO: 'Automatic',
  HUMAN: 'Staff or mentor',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  suggested: 'Suggested',
  approved: 'Approved',
  sent: 'Sent',
  done: 'Done',
};

export const DISCIPLINE_SKIP_THRESHOLD = 3;
export const DISCIPLINE_FOCUS_DURATION_HOURS = 2;
export const PLAN_B_NO_PROGRESS_DAYS = 30;
