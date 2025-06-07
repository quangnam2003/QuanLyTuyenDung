export interface Application {
    id?: number;
    jobId: number;
    jobTitle: string;
    candidateId: number;
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    
    // Thông tin ứng tuyển
    appliedDate: Date;
    status: 'New' | 'Reviewing' | 'Shortlisted' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
    currentStage: string;
    source: 'Website' | 'Job Board' | 'Referral' | 'Social Media' | 'Other';
    
    // CV và tài liệu
    resumeUrl?: string;
    coverLetterUrl?: string;
    portfolioUrl?: string;
    documents: {
      type: string;
      name: string;
      url: string;
      uploadDate: Date;
    }[];
    
    // Đánh giá
    hrNotes?: string;
    rating?: number; // 1-5 stars
    tags: string[];
    
    // Matching
    matchPercentage?: number;
    keySkillsMatch: string[];
    experienceMatch?: boolean;
    educationMatch?: boolean;
    locationMatch?: boolean;
    salaryExpectation?: string;
    
    // Timeline
    timeline: {
      stage: string;
      status: string;
      date: Date;
      note?: string;
      updatedBy: string;
    }[];
    
    // Interview scheduling
    interviews?: {
      id: number;
      type: string;
      scheduledDate: Date;
      status: string;
      interviewers: string[];
    }[];
    
    // Thông tin bổ sung
    expectedSalary?: string;
    noticePeriod?: string;
    availability?: Date;
    relocation?: boolean;
    
    // Metadata
    createdAt?: Date;
    updatedAt?: Date;
    assignedTo?: string; // HR assigned
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    
    // New fields from the code block
    lastUpdated: Date;
    coverLetter?: string;
    evaluation?: {
      score?: number;
      feedback?: string;
      tags?: string[];
    };
  }