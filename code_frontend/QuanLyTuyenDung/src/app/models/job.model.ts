export interface Job {
  id?: number;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  company: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status: 'Active' | 'Closed' | 'Draft';
  isSaved?: boolean;
  
  // Thêm các trường mới
  department: string;           // Phòng ban/bộ phận
  numberOfPositions: number;    // Số lượng cần tuyển
  applicationDeadline: Date;    // Thời hạn ứng tuyển
  experienceRequired: string;   // Yêu cầu kinh nghiệm
  benefits: string;            // Quyền lợi
  detailedLocation: string;    // Địa điểm làm việc chi tiết
  skills: string[];           // Kỹ năng yêu cầu
  education: string;          // Yêu cầu học vấn
  createdAt?: Date;           // Ngày tạo
  updatedAt?: Date;           // Ngày cập nhật
  createdBy?: string;         // Người tạo
  updatedBy?: string;         // Người cập nhật
  viewCount?: number;         // Số lượt xem
  applicationCount?: number;  // Số lượng đơn ứng tuyển
} 