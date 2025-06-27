import { Injectable } from '@angular/core';

export interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  company: string;
  type: string;
  createdAt: Date;
  viewCount: number;
  experience?: string;
  benefits?: string[];
}

export interface Company {
  id: number;
  name: string;
  logo?: string;
  industry: string;
  location: string;
  size: string;
  description: string;
  jobCount: number;
  website?: string;
  benefits?: string[];
  workingDays?: string;
  workingHours?: string;
  overtimePolicy?: string;
}

export interface MockApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  appliedDate: Date;
  status: 'New' | 'Reviewing' | 'Shortlisted' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
  currentStage: string;
  source: 'Website' | 'Job Board' | 'Referral' | 'Social Media' | 'Other';
  documents: any[];
  tags: string[];
  timeline: {
    stage: string;
    status: string;
    date: Date;
    note?: string;
    updatedBy: string;
  }[];
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  lastUpdated: Date;
  matchPercentage?: number;
  keySkillsMatch: string[];
  expectedSalary?: string;
}

export interface MockInterview {
  id: number;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  priority: 'Normal' | 'Urgent' | 'High' | 'Low';
  type: 'Phone' | 'Online' | 'On-site' | 'Technical' | 'HR' | 'Final';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  stage: 'First Round' | 'Second Round' | 'Final Round' | 'Technical' | 'HR';
  scheduledDate: Date;
  duration: number; // in minutes
  location: {
    type: 'Physical' | 'Online';
    address?: string;
    room?: string;
    platform?: string;
    meetingLink?: string;
    meetingId?: string;
    password?: string;
  };
  interviewers: {
    id: number;
    name: string;
    role: string;
    department: string;
    isPrimary: boolean;
  }[];
  notes?: string;
  evaluations: any[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private jobs: Job[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      description: 'Chúng tôi đang tìm kiếm một Senior Frontend Developer có kinh nghiệm với Angular và TypeScript để tham gia vào dự án phát triển ứng dụng web quy mô lớn.',
      requirements: 'Có ít nhất 5 năm kinh nghiệm với Angular\nThành thạo TypeScript và JavaScript\nKinh nghiệm với RxJS và NgRx\nKỹ năng tối ưu hiệu suất ứng dụng',
      salary: '30-50 triệu',
      location: 'Hà Nội',
      company: 'Tech Solutions Vietnam',
      type: 'Full-time',
      createdAt: new Date('2024-03-15'),
      viewCount: 150,
      experience: '5 năm',
      benefits: ['Lương tháng 13', 'Bảo hiểm sức khỏe', 'Du lịch hàng năm', 'Đào tạo chuyên sâu']
    },
    {
      id: 2,
      title: 'Product Manager',
      description: 'Chúng tôi cần một Product Manager có kinh nghiệm để dẫn dắt đội ngũ phát triển sản phẩm fintech.',
      requirements: 'Kinh nghiệm quản lý sản phẩm fintech\nKỹ năng phân tích dữ liệu tốt\nKhả năng lãnh đạo và giao tiếp xuất sắc',
      salary: '40-60 triệu',
      location: 'Hồ Chí Minh',
      company: 'FinTech Solutions',
      type: 'Full-time',
      createdAt: new Date('2024-03-10'),
      viewCount: 200,
      experience: '3 năm',
      benefits: ['Cổ phần công ty', 'Bảo hiểm cao cấp', 'Làm việc từ xa']
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      description: 'Tìm kiếm DevOps Engineer có kinh nghiệm để xây dựng và duy trì hệ thống cloud.',
      requirements: 'Kinh nghiệm với AWS, Docker, Kubernetes\nThành thạo CI/CD\nKiến thức về bảo mật cloud',
      salary: '35-45 triệu',
      location: 'Đà Nẵng',
      company: 'Cloud Tech',
      type: 'Full-time',
      createdAt: new Date('2024-03-12'),
      viewCount: 120,
      experience: '2 năm',
      benefits: ['Môi trường startup', 'Đào tạo AWS', 'Chế độ nghỉ phép linh hoạt']
    },
    {
      id: 4,
      title: 'UI/UX Designer',
      description: 'Tìm kiếm UI/UX Designer tài năng để thiết kế giao diện người dùng cho các ứng dụng di động.',
      requirements: 'Thành thạo Figma và Adobe XD\nKinh nghiệm thiết kế mobile app\nHiểu biết về Material Design và iOS Guidelines',
      salary: '20-35 triệu',
      location: 'Hà Nội',
      company: 'Design Studio',
      type: 'Part-time',
      createdAt: new Date('2024-03-14'),
      viewCount: 180,
      experience: '2 năm',
      benefits: ['Lịch làm việc linh hoạt', 'Trang thiết bị hiện đại', 'Đào tạo design system']
    },
    {
      id: 5,
      title: 'Data Scientist',
      description: 'Cần tuyển Data Scientist có kinh nghiệm phân tích dữ liệu lớn và xây dựng mô hình ML.',
      requirements: 'Thành thạo Python, R\nKinh nghiệm với các thư viện ML\nKiến thức về Big Data',
      salary: '35-50 triệu',
      location: 'Hồ Chí Minh',
      company: 'Data Analytics Corp',
      type: 'Contract',
      createdAt: new Date('2024-03-13'),
      viewCount: 160,
      experience: '3 năm',
      benefits: ['Dự án đa quốc gia', 'Chế độ thưởng hấp dẫn', 'Đào tạo chuyên sâu về AI/ML']
    },
    {
      id: 6,
      title: 'Backend Developer',
      description: 'Tuyển Backend Developer có kinh nghiệm với Node.js và MongoDB để phát triển API và microservices.',
      requirements: 'Thành thạo Node.js và Express\nKinh nghiệm với MongoDB và Redis\nHiểu biết về microservices architecture',
      salary: '25-40 triệu',
      location: 'Hà Nội',
      company: 'Tech Solutions Vietnam',
      type: 'Full-time',
      createdAt: new Date('2024-03-16'),
      viewCount: 90,
      experience: '2 năm',
      benefits: ['Môi trường chuyên nghiệp', 'Cơ hội thăng tiến', 'Chế độ phúc lợi tốt']
    }
  ];

  private companies: Company[] = [
    {
      id: 1,
      name: 'Tech Solutions Vietnam',
      logo: '/assets/images/companies/tech-solutions.png',
      industry: 'Công nghệ thông tin',
      location: 'Hà Nội',
      size: '100-500 nhân viên',
      description: 'Công ty hàng đầu về giải pháp phần mềm và chuyển đổi số tại Việt Nam',
      jobCount: 15,
      website: 'https://techsolutions.vn',
      benefits: ['Lương thưởng cạnh tranh', 'Chế độ bảo hiểm tốt', 'Môi trường làm việc quốc tế'],
      workingDays: 'Thứ 2 - Thứ 6',
      workingHours: '8:30 - 17:30',
      overtimePolicy: 'Có phụ cấp làm thêm giờ'
    },
    {
      id: 2,
      name: 'FinTech Solutions',
      logo: '/assets/images/companies/fintech.png',
      industry: 'Tài chính - Công nghệ',
      location: 'Hồ Chí Minh',
      size: '50-200 nhân viên',
      description: 'Startup fintech phát triển các giải pháp thanh toán và tài chính số',
      jobCount: 8,
      website: 'https://fintech.vn',
      benefits: ['Cổ phần cho nhân viên', 'Bảo hiểm sức khỏe cao cấp', 'Làm việc từ xa'],
      workingDays: 'Linh hoạt',
      workingHours: 'Linh hoạt',
      overtimePolicy: 'Không yêu cầu OT'
    },
    {
      id: 3,
      name: 'Cloud Tech',
      logo: '/assets/images/companies/cloud-tech.png',
      industry: 'Cloud Computing',
      location: 'Đà Nẵng',
      size: '20-50 nhân viên',
      description: 'Chuyên cung cấp giải pháp điện toán đám mây cho doanh nghiệp',
      jobCount: 5,
      website: 'https://cloudtech.vn',
      benefits: ['Đào tạo AWS/Azure', 'Chế độ nghỉ phép linh hoạt', 'Team building hàng quý'],
      workingDays: 'Thứ 2 - Thứ 6',
      workingHours: '9:00 - 18:00',
      overtimePolicy: 'Có thể làm thêm giờ theo dự án'
    },
    {
      id: 4,
      name: 'Design Studio',
      logo: '/assets/images/companies/design-studio.png',
      industry: 'Thiết kế và Sáng tạo',
      location: 'Hà Nội',
      size: '10-50 nhân viên',
      description: 'Studio thiết kế UI/UX chuyên nghiệp cho các dự án lớn',
      jobCount: 3,
      website: 'https://designstudio.vn',
      benefits: ['Môi trường sáng tạo', 'Trang thiết bị hiện đại', 'Lịch làm việc linh hoạt'],
      workingDays: 'Linh hoạt',
      workingHours: 'Linh hoạt',
      overtimePolicy: 'Theo dự án'
    },
    {
      id: 5,
      name: 'Data Analytics Corp',
      logo: '/assets/images/companies/data-analytics.png',
      industry: 'Phân tích dữ liệu',
      location: 'Hồ Chí Minh',
      size: '50-100 nhân viên',
      description: 'Công ty hàng đầu về phân tích dữ liệu và AI/ML',
      jobCount: 6,
      website: 'https://dataanalytics.vn',
      benefits: ['Dự án quốc tế', 'Đào tạo AI/ML', 'Chế độ thưởng hấp dẫn'],
      workingDays: 'Thứ 2 - Thứ 6',
      workingHours: '9:00 - 18:00',
      overtimePolicy: 'Linh hoạt theo dự án'
    }
  ];

  private applications: MockApplication[] = [
    {
      id: 1,
      jobId: 1,
      jobTitle: 'Senior Frontend Developer',
      candidateId: 1,
      candidateName: 'Nguyễn Văn An',
      candidateEmail: 'nguyen.van.an@email.com',
      candidatePhone: '0901234567',
      appliedDate: new Date('2025-05-15'),
      status: 'New',
      currentStage: 'Application Review',
      source: 'Website',
      documents: [],
      tags: ['ReactJS', 'TypeScript', 'Frontend'],
      timeline: [{
        stage: 'Applied',
        status: 'New',
        date: new Date('2025-05-15'),
        updatedBy: 'System'
      }],
      priority: 'Medium',
      lastUpdated: new Date('2025-05-15'),
      matchPercentage: 85,
      keySkillsMatch: ['ReactJS', 'JavaScript'],
      expectedSalary: '15-20 triệu'
    },
    {
      id: 2,
      jobId: 2,
      jobTitle: 'Product Manager',
      candidateId: 2,
      candidateName: 'Trần Thị Bình',
      candidateEmail: 'tran.thi.binh@email.com',
      candidatePhone: '0901234568',
      appliedDate: new Date('2025-05-20'),
      status: 'Reviewing',
      currentStage: 'Technical Review',
      source: 'Job Board',
      documents: [],
      tags: ['Product Management', 'Fintech', 'Analytics'],
      timeline: [
        {
          stage: 'Applied',
          status: 'New',
          date: new Date('2025-05-20'),
          updatedBy: 'System'
        },
        {
          stage: 'Review',
          status: 'Reviewing',
          date: new Date('2025-05-22'),
          updatedBy: 'HR Team'
        }
      ],
      priority: 'High',
      lastUpdated: new Date('2025-05-22'),
      matchPercentage: 92,
      keySkillsMatch: ['Product Management', 'Data Analysis'],
      expectedSalary: '18-25 triệu'
    },
    {
      id: 3,
      jobId: 3,
      jobTitle: 'DevOps Engineer',
      candidateId: 3,
      candidateName: 'Lê Minh Cường',
      candidateEmail: 'le.minh.cuong@email.com',
      candidatePhone: '0901234569',
      appliedDate: new Date('2025-05-25'),
      status: 'Shortlisted',
      currentStage: 'Initial Interview',
      source: 'Referral',
      documents: [],
      tags: ['AWS', 'Docker', 'Kubernetes'],
      timeline: [
        {
          stage: 'Applied',
          status: 'New',
          date: new Date('2025-05-25'),
          updatedBy: 'System'
        },
        {
          stage: 'Review',
          status: 'Reviewing',
          date: new Date('2025-05-26'),
          updatedBy: 'HR Team'
        },
        {
          stage: 'Shortlist',
          status: 'Shortlisted',
          date: new Date('2025-05-28'),
          updatedBy: 'HR Manager'
        }
      ],
      priority: 'High',
      lastUpdated: new Date('2025-05-28'),
      matchPercentage: 88,
      keySkillsMatch: ['AWS', 'Docker', 'CI/CD'],
      expectedSalary: '20-30 triệu'
    },
    {
      id: 4,
      jobId: 4,
      jobTitle: 'UI/UX Designer',
      candidateId: 4,
      candidateName: 'Phạm Thị Dung',
      candidateEmail: 'pham.thi.dung@email.com',
      candidatePhone: '0901234570',
      appliedDate: new Date('2025-06-02'),
      status: 'Interview',
      currentStage: 'Design Portfolio Review',
      source: 'Social Media',
      documents: [],
      tags: ['Figma', 'Adobe XD', 'UI Design'],
      timeline: [
        {
          stage: 'Applied',
          status: 'New',
          date: new Date('2025-06-02'),
          updatedBy: 'System'
        },
        {
          stage: 'Review',
          status: 'Reviewing',
          date: new Date('2025-06-03'),
          updatedBy: 'HR Team'
        },
        {
          stage: 'Interview',
          status: 'Interview',
          date: new Date('2025-06-05'),
          updatedBy: 'HR Manager'
        }
      ],
      priority: 'Medium',
      lastUpdated: new Date('2025-06-05'),
      matchPercentage: 78,
      keySkillsMatch: ['Figma', 'Adobe Creative Suite'],
      expectedSalary: '12-18 triệu'
    },
    {
      id: 5,
      jobId: 5,
      jobTitle: 'Data Scientist',
      candidateId: 5,
      candidateName: 'Hoàng Văn Em',
      candidateEmail: 'hoang.van.em@email.com',
      candidatePhone: '0901234571',
      appliedDate: new Date('2025-06-08'),
      status: 'Offered',
      currentStage: 'Job Offer',
      source: 'Website',
      documents: [],
      tags: ['Python', 'Machine Learning', 'Big Data'],
      timeline: [
        {
          stage: 'Applied',
          status: 'New',
          date: new Date('2025-06-08'),
          updatedBy: 'System'
        },
        {
          stage: 'Review',
          status: 'Reviewing',
          date: new Date('2025-06-09'),
          updatedBy: 'HR Team'
        },
        {
          stage: 'Interview',
          status: 'Interview',
          date: new Date('2025-06-12'),
          updatedBy: 'HR Manager'
        },
        {
          stage: 'Offer',
          status: 'Offered',
          date: new Date('2025-06-15'),
          updatedBy: 'HR Director'
        }
      ],
      priority: 'Urgent',
      lastUpdated: new Date('2025-06-15'),
      matchPercentage: 95,
      keySkillsMatch: ['Python', 'ML', 'Data Analysis'],
      expectedSalary: '25-35 triệu'
    },
    {
      id: 6,
      jobId: 6,
      jobTitle: 'Backend Developer',
      candidateId: 6,
      candidateName: 'Vũ Thị Phương',
      candidateEmail: 'vu.thi.phuong@email.com',
      candidatePhone: '0901234572',
      appliedDate: new Date('2025-06-12'),
      status: 'Rejected',
      currentStage: 'Application Rejected',
      source: 'Job Board',
      documents: [],
      tags: ['Node.js', 'MongoDB', 'Backend'],
      timeline: [
        {
          stage: 'Applied',
          status: 'New',
          date: new Date('2025-06-12'),
          updatedBy: 'System'
        },
        {
          stage: 'Review',
          status: 'Reviewing',
          date: new Date('2025-06-13'),
          updatedBy: 'HR Team'
        },
        {
          stage: 'Rejected',
          status: 'Rejected',
          date: new Date('2025-06-14'),
          note: 'Không đủ kinh nghiệm yêu cầu',
          updatedBy: 'HR Manager'
        }
      ],
      priority: 'Low',
      lastUpdated: new Date('2025-06-14'),
      matchPercentage: 45,
      keySkillsMatch: ['Node.js'],
      expectedSalary: '10-15 triệu'
    },
    {
      id: 7,
      jobId: 1,
      jobTitle: 'Senior Frontend Developer',
      candidateId: 7,
      candidateName: 'Đặng Minh Quang',
      candidateEmail: 'dang.minh.quang@email.com',
      candidatePhone: '0901234573',
      appliedDate: new Date('2025-06-18'),
      status: 'New',
      currentStage: 'Application Review',
      source: 'Website',
      documents: [],
      tags: ['Angular', 'TypeScript', 'Frontend'],
      timeline: [{
        stage: 'Applied',
        status: 'New',
        date: new Date('2025-06-18'),
        updatedBy: 'System'
      }],
      priority: 'Medium',
      lastUpdated: new Date('2025-06-18'),
      matchPercentage: 82,
      keySkillsMatch: ['Angular', 'TypeScript'],
      expectedSalary: '15-22 triệu'
    },
    {
      id: 8,
      jobId: 5,
      jobTitle: 'Data Scientist',
      candidateId: 8,
      candidateName: 'Ngô Thị Hương',
      candidateEmail: 'ngo.thi.huong@email.com',
      candidatePhone: '0901234574',
      appliedDate: new Date('2025-06-22'),
      status: 'Reviewing',
      currentStage: 'Skills Assessment',
      source: 'Referral',
      documents: [],
      tags: ['Python', 'R', 'Machine Learning'],
      timeline: [
        {
          stage: 'Applied',
          status: 'New',
          date: new Date('2025-06-22'),
          updatedBy: 'System'
        },
        {
          stage: 'Review',
          status: 'Reviewing',
          date: new Date('2025-06-23'),
          updatedBy: 'HR Team'
        }
      ],
      priority: 'High',
      lastUpdated: new Date('2025-06-23'),
      matchPercentage: 90,
      keySkillsMatch: ['Python', 'Machine Learning', 'Statistics'],
      expectedSalary: '22-28 triệu'
    }
  ];

  private interviews: MockInterview[] = [
    {
      id: 1,
      candidateId: 3,
      candidateName: 'Lê Minh Cường',
      jobId: 3,
      jobTitle: 'DevOps Engineer',
      priority: 'High',
      type: 'HR',
      status: 'Scheduled',
      stage: 'First Round',
      scheduledDate: new Date('2025-05-30T09:00:00'),
      duration: 60,
      location: {
        type: 'Physical',
        address: '123 Tech Street, Hà Nội',
        room: 'Phòng họp A1'
      },
      interviewers: [
        { id: 1, name: 'Nguyễn Thị Mai', role: 'HR Manager', department: 'Human Resources', isPrimary: true },
        { id: 2, name: 'Trần Văn Đức', role: 'Team Lead', department: 'Engineering', isPrimary: false }
      ],
      evaluations: [],
      createdAt: new Date('2025-05-28'),
      updatedAt: new Date('2025-05-28')
    },
    {
      id: 2,
      candidateId: 4,
      candidateName: 'Phạm Thị Dung',
      jobId: 4,
      jobTitle: 'UI/UX Designer',
      priority: 'Normal',
      type: 'Technical',
      status: 'Scheduled',
      stage: 'Technical',
      scheduledDate: new Date('2025-06-06T14:00:00'),
      duration: 90,
      location: {
        type: 'Online',
        platform: 'Google Meet',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        meetingId: 'abc-defg-hij'
      },
      interviewers: [
        { id: 3, name: 'Lê Thanh Hương', role: 'Senior Designer', department: 'Design', isPrimary: true },
        { id: 4, name: 'Phạm Minh Tuấn', role: 'Design Manager', department: 'Design', isPrimary: false }
      ],
      evaluations: [],
      createdAt: new Date('2025-06-04'),
      updatedAt: new Date('2025-06-04')
    },
    {
      id: 3,
      candidateId: 5,
      candidateName: 'Hoàng Văn Em',
      jobId: 5,
      jobTitle: 'Data Scientist',
      priority: 'Urgent',
      type: 'Final',
      status: 'Completed',
      stage: 'Final Round',
      scheduledDate: new Date('2025-06-14T10:30:00'),
      duration: 120,
      location: {
        type: 'Physical',
        address: '123 Tech Street, Hà Nội',
        room: 'Phòng họp B2'
      },
      interviewers: [
        { id: 5, name: 'Vũ Thị Lan', role: 'CTO', department: 'Engineering', isPrimary: true },
        { id: 6, name: 'Đỗ Văn Hùng', role: 'Data Science Lead', department: 'Data Science', isPrimary: false }
      ],
      notes: 'Ứng viên có kiến thức sâu về ML và kinh nghiệm thực tế tốt',
      evaluations: [],
      createdAt: new Date('2025-06-10'),
      updatedAt: new Date('2025-06-14')
    },
    {
      id: 4,
      candidateId: 1,
      candidateName: 'Nguyễn Văn An',
      jobId: 1,
      jobTitle: 'Senior Frontend Developer',
      priority: 'Normal',
      type: 'Phone',
      status: 'Scheduled',
      stage: 'HR',
      scheduledDate: new Date('2025-06-25T15:30:00'),
      duration: 45,
      location: {
        type: 'Online',
        platform: 'Phone Call'
      },
      interviewers: [
        { id: 1, name: 'Nguyễn Thị Mai', role: 'HR Manager', department: 'Human Resources', isPrimary: true }
      ],
      evaluations: [],
      createdAt: new Date('2025-06-20'),
      updatedAt: new Date('2025-06-20')
    },
    {
      id: 5,
      candidateId: 8,
      candidateName: 'Ngô Thị Hương',
      jobId: 5,
      jobTitle: 'Data Scientist',
      priority: 'High',
      type: 'Online',
      status: 'Scheduled',
      stage: 'Technical',
      scheduledDate: new Date('2025-06-26T09:00:00'),
      duration: 75,
      location: {
        type: 'Online',
        platform: 'Zoom',
        meetingLink: 'https://zoom.us/j/123456789',
        meetingId: '123456789',
        password: 'interview2025'
      },
      interviewers: [
        { id: 6, name: 'Đỗ Văn Hùng', role: 'Data Science Lead', department: 'Data Science', isPrimary: true },
        { id: 7, name: 'Bùi Thị Nga', role: 'Senior Data Scientist', department: 'Data Science', isPrimary: false }
      ],
      evaluations: [],
      createdAt: new Date('2025-06-24'),
      updatedAt: new Date('2025-06-24')
    },
    {
      id: 6,
      candidateId: 7,
      candidateName: 'Đặng Minh Quang',
      jobId: 1,
      jobTitle: 'Senior Frontend Developer',
      priority: 'Normal',
      type: 'Technical',
      status: 'Scheduled',
      stage: 'Second Round',
      scheduledDate: new Date('2025-06-27T10:00:00'),
      duration: 90,
      location: {
        type: 'Physical',
        address: '123 Tech Street, Hà Nội',
        room: 'Lab Kỹ thuật'
      },
      interviewers: [
        { id: 8, name: 'Cao Văn Minh', role: 'Senior Frontend Developer', department: 'Engineering', isPrimary: true },
        { id: 9, name: 'Hoàng Thị Thu', role: 'Technical Lead', department: 'Engineering', isPrimary: false }
      ],
      evaluations: [],
      createdAt: new Date('2025-06-22'),
      updatedAt: new Date('2025-06-22')
    },
    {
      id: 7,
      candidateId: 2,
      candidateName: 'Trần Thị Bình',
      jobId: 2,
      jobTitle: 'Product Manager',
      priority: 'High',
      type: 'On-site',
      status: 'Rescheduled',
      stage: 'Second Round',
      scheduledDate: new Date('2025-06-28T13:00:00'),
      duration: 60,
      location: {
        type: 'Physical',
        address: '123 Tech Street, Hà Nội',
        room: 'Phòng họp C1'
      },
      interviewers: [
        { id: 10, name: 'Nguyễn Văn Thành', role: 'Product Director', department: 'Product', isPrimary: true },
        { id: 11, name: 'Lý Thị Hồng', role: 'Senior Product Manager', department: 'Product', isPrimary: false }
      ],
      notes: 'Đã hoãn từ ngày 25/06 do lịch trình của ứng viên',
      evaluations: [],
      createdAt: new Date('2025-05-25'),
      updatedAt: new Date('2025-06-26')
    }
  ];

  constructor() { }

  getAllJobs(): Job[] {
    return this.jobs;
  }

  getAllCompanies(): Company[] {
    return this.companies;
  }

  getAllApplications(): MockApplication[] {
    return this.applications;
  }

  getJobsByCompany(companyId: number): Job[] {
    return this.jobs.filter(job => job.company === this.companies.find(c => c.id === companyId)?.name);
  }

  getFeaturedJobs(): Job[] {
    return this.jobs
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 3);
  }

  getLatestJobs(): Job[] {
    return this.jobs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);
  }

  getFeaturedCompanies(): Company[] {
    return this.companies
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, 3);
  }

  searchJobs(query: string): Job[] {
    query = query.toLowerCase();
    return this.jobs.filter(job =>
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  }

  searchCompanies(query: string): Company[] {
    query = query.toLowerCase();
    return this.companies.filter(company =>
      company.name.toLowerCase().includes(query) ||
      company.industry.toLowerCase().includes(query) ||
      company.location.toLowerCase().includes(query) ||
      company.description.toLowerCase().includes(query)
    );
  }

  getAllInterviews(): MockInterview[] {
    return this.interviews;
  }

  getInterviewsByStatus(status: string): MockInterview[] {
    return this.interviews.filter(interview => interview.status === status);
  }

  getInterviewsByDate(date: Date): MockInterview[] {
    const dateStr = date.toDateString();
    return this.interviews.filter(interview => 
      interview.scheduledDate.toDateString() === dateStr
    );
  }
}