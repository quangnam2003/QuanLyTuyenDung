export interface Job {
  id?: number;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  company: string;
  type: string;
  postedDate?: Date;
  deadline?: Date;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
} 