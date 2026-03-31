export const ROUTE_PATHS = {
  HOME: '/',
  ADMIN: '/admin'
} as const;

export interface Plan {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  description: string;
  recommended?: boolean;
  color: string;
}

export interface ApplicationData {
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: number;
  japaneseLevel: string;
  planId: string;
  squarePaymentId?: string;
}

export const JAPANESE_LEVELS = [
  { value: 'beginner', label: 'Beginner (Hiragana & Katakana)' },
  { value: 'elementary', label: 'Elementary (Basic Conversation)' },
  { value: 'intermediate', label: 'Intermediate (Daily Conversation)' },
  { value: 'advanced', label: 'Advanced (JLPT N3-N2)' },
  { value: 'native', label: 'Native Level (JLPT N1)' }
] as const;

export const PLANS: Plan[] = [
  {
    id: 'starter',
name: 'Starter Program',
    nameEn: 'Starter Program',
    price: 742,
    currency: 'AUD',
    duration: 'Monthly',
    description: 'Perfect foundation program for children beginning their Japanese learning journey',
    features: [
      'Online lessons (2x per week, 45 minutes each)',
      'Digital materials (PDF) unlimited access',
      'Homework support (email response)',
      'Progress reports (monthly)'
    ],
    color: 'from-primary/20 to-primary/10'
  },
  {
    id: 'standard',
name: 'Standard Program',
    nameEn: 'Standard Program',
    price: 1107,
    currency: 'AUD',
    duration: 'Monthly',
    description: 'Comprehensive Japanese learning program to develop well-rounded language skills',
    features: [
      'Online lessons (3x per week, 60 minutes each)',
      'Digital materials + video lessons',
      'JLPT exam preparation (N5-N3)',
      'Homework support (24-hour response)',
      'Progress reports (bi-monthly)',
      'Parent consultations (monthly)'
    ],
    recommended: true,
    color: 'from-accent/20 to-accent/10'
  },
  {
    id: 'premium',
name: 'Premium Japan Immersion',
    nameEn: 'Premium Japan Immersion',
    price: 3255,
    currency: 'AUD',
    duration: 'Monthly',
    description: 'Ultimate immersion program with full Japanese language environment',
    features: [
      'Online lessons (5x per week, 90 minutes each)',
      'Native teacher individual tutoring',
      'Digital materials + videos + interactive content',
      'JLPT exam preparation (all levels)',
      '24-hour homework support',
      'Progress reports (weekly)',
      'Parent consultations (weekly)',
      'Japanese culture experience online events (bi-monthly)'
    ],
    color: 'from-primary/30 to-accent/20'
  },
  {
    id: 'study-tour-2weeks',
name: 'Japan Study Tour (2 Weeks)',
    nameEn: 'Japan Study Tour (2 Weeks)',
    price: 4631,
    currency: 'AUD',
    duration: 'One-time payment',
    description: 'Intensive short-term learning program in Japan',
    features: [
      'In-person classes in Japan (weekdays)',
      'Japanese culture experience activities',
      'Accommodation arrangement support',
      'Local staff support',
      'Certificate of completion'
    ],
    color: 'from-primary/15 to-accent/15'
  },
  {
    id: 'study-tour-1month',
name: 'Japan Study Tour (1 Month)',
    nameEn: 'Japan Study Tour (1 Month)',
    price: 8351,
    currency: 'AUD',
    duration: 'One-time payment',
    description: 'Medium-term intensive learning program in Japan',
    features: [
      'In-person classes in Japan (weekdays)',
      'Japanese culture experience activities (2x per week)',
      'Accommodation arrangement support',
      '24-hour local staff support',
      'JLPT mock exam (1 session)',
      'Certificate of completion'
    ],
    color: 'from-primary/15 to-accent/15'
  },
  {
    id: 'jlpt-japan',
name: 'JLPT + Japan Program',
    nameEn: 'JLPT + Japan Program',
    price: 16275,
    currency: 'AUD',
    duration: 'One-time payment',
    description: 'Special program in Japan focused on JLPT certification success',
    features: [
      'In-person classes in Japan (3 months, weekdays)',
      'JLPT exam preparation specialized course',
      'JLPT mock exams (bi-monthly)',
      'Japanese culture experience activities (weekly)',
      'Accommodation arrangement support',
      '24-hour local staff support',
      'JLPT exam registration support',
      'Certificate of completion'
    ],
    color: 'from-primary/20 to-accent/20'
  }
];

export function formatPrice(price: number, currency: string): string {
  return `${currency} $${price.toLocaleString()}`;
}

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find(plan => plan.id === planId);
}
