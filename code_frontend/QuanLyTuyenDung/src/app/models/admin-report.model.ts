export interface AdminReportStats {
  totalJobs: number;
  totalUsers: number;
  totalApplicants: number;
  totalInterviews: number;
  jobsByStatus: { status: string; count: number }[];
  applicantsByStatus: { status: string; count: number }[];
}
