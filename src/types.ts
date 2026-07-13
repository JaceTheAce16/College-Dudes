export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  services: string[];
  drivewaySqFt?: number;
  totalEstimate: number;
  status: 'pending' | 'contacted' | 'scheduled' | 'completed';
  paymentOption?: 'pay_later' | 'pre_pay_save_10';
  paymentStatus: 'unpaid' | 'paid';
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  syncedToCalendar?: boolean;
  timestamp: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  date: string;
  author: string;
  summary: string;
  readTime: string;
}

export interface Review {
  id?: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

export interface ServiceOption {
  id: string;
  title: string;
  price: number | 'variable';
  unit?: string;
  description: string;
  iconName: string;
  features: string[];
}
