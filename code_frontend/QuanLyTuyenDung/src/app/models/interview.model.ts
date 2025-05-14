export interface Interview {
  id?: number;
  jobId: number;
  jobTitle: string;
  candidateId: number;
  candidateName: string;
  
  // Thông tin phỏng vấn
  type: 'Phone' | 'Online' | 'On-site' | 'Technical' | 'HR' | 'Final';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  stage: 'First Round' | 'Second Round' | 'Final Round' | 'Technical' | 'HR';
  
  // Thời gian
  scheduledDate: Date;
  duration: number; // Thời lượng (phút)
  startTime?: Date;
  endTime?: Date;
  
  // Người phỏng vấn
  interviewers: {
    id: number;
    name: string;
    role: string;
    department: string;
    isPrimary: boolean;
  }[];
  
  // Địa điểm/Platform
  location: {
    type: 'Physical' | 'Online';
    address?: string;
    room?: string;
    platform?: string;
    meetingLink?: string;
    meetingId?: string;
    password?: string;
  };
  
  // Chuẩn bị
  preparationNotes?: string;
  requiredDocuments?: string[];
  technicalRequirements?: string[];
  
  // Kết quả
  result?: {
    status: 'Passed' | 'Failed' | 'Pending' | 'On Hold';
    score?: number;
    feedback?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string;
    nextSteps?: string;
  };
  
  // Đánh giá
  evaluations: {
    interviewerId: number;
    interviewerName: string;
    technicalScore?: number;
    communicationScore?: number;
    experienceScore?: number;
    cultureFitScore?: number;
    overallScore?: number;
    comments: string;
    submittedAt: Date;
  }[];
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  notes?: string;
  attachments?: {
    name: string;
    type: string;
    url: string;
    uploadDate: Date;
  }[];
} 