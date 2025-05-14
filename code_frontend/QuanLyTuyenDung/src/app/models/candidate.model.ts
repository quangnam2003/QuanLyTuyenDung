export interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  
  // Thông tin học vấn
  education: {
    degree: string;
    major: string;
    school: string;
    graduationYear: number;
    gpa?: number;
  }[];
  
  // Kinh nghiệm làm việc
  experience: {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
    isCurrentJob: boolean;
  }[];
  
  // Kỹ năng
  skills: string[];
  
  // Ngôn ngữ
  languages: {
    language: string;
    proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native';
  }[];
  
  // Thông tin ứng tuyển
  applications: {
    jobId: number;
    jobTitle: string;
    appliedDate: Date;
    status: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
    currentStage: string;
    notes?: string;
  }[];
  
  // Tài liệu
  documents: {
    type: 'Resume' | 'Cover Letter' | 'Certificate' | 'Other';
    name: string;
    url: string;
    uploadDate: Date;
  }[];
  
  // Thông tin bổ sung
  expectedSalary?: string;
  noticePeriod?: string;
  availability?: Date;
  source: 'Website' | 'Job Board' | 'Referral' | 'Social Media' | 'Other';
  sourceDetails?: string;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  status: 'Active' | 'Inactive' | 'Blacklisted';
  lastContactDate?: Date;
  notes?: string;
} 