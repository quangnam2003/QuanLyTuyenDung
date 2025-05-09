export interface Job {
  id?: number;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  company: string;
  type: string; // Full-time, Part-time, Contract, etc.
  postedDate?: Date;
  deadline?: Date;
  status: string; // Active, Closed, etc.
} 