using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;
using Microsoft.EntityFrameworkCore;

namespace QuanLyTuyenDung.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(ApplicationDbContext context, ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SendJobApplicationNotificationAsync(int jobId, int candidateId, int applicationId)
        {
            try
            {
                var job = await _context.Jobs.FindAsync(jobId);
                var candidate = await _context.Candidates.FindAsync(candidateId);

                if (job == null || candidate == null)
                {
                    _logger.LogWarning($"Job {jobId} or Candidate {candidateId} not found for application {applicationId}");
                    return;
                }

                var notifications = new List<UserNotification>();

                // Thông báo cho người đăng tin tuyển dụng
                var posterNotification = new UserNotification
                {
                    UserID = job.PostedBy,
                    Title = "🔔 Ứng viên mới ứng tuyển",
                    Message = $"{candidate.FirstName} {candidate.LastName} đã ứng tuyển vào vị trí {job.Title} tại {job.Company}",
                    Type = "Info",
                    ActionUrl = $"/admin/applications/{applicationId}",
                    RelatedJobID = jobId,
                    RelatedApplicationID = applicationId
                };
                notifications.Add(posterNotification);

                // Thông báo cho ứng viên
                if (int.TryParse(candidate.UserId, out int candidateUserId))
                {
                    var candidateNotification = new UserNotification
                    {
                        UserID = candidateUserId,
                        Title = "✅ Ứng tuyển thành công",
                        Message = $"Bạn đã ứng tuyển thành công vào vị trí {job.Title} tại {job.Company}. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
                        Type = "Success",
                        ActionUrl = $"/user/applications",
                        RelatedJobID = jobId,
                        RelatedApplicationID = applicationId
                    };
                    notifications.Add(candidateNotification);
                }

                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Job application notifications sent successfully for application {applicationId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending job application notification for application {applicationId}");
            }
        }

        public async Task SendInterviewScheduledNotificationAsync(int candidateId, int interviewId)
        {
            try
            {
                var interview = await _context.Interviews
                    .Include(i => i.Application)
                    .ThenInclude(a => a.Job)
                    .Include(i => i.Application)
                    .ThenInclude(a => a.Candidate)
                    .FirstOrDefaultAsync(i => i.InterviewID == interviewId);

                if (interview == null)
                {
                    _logger.LogWarning($"Interview {interviewId} not found");
                    return;
                }

                var candidate = interview.Application.Candidate;
                if (int.TryParse(candidate.UserId, out int candidateUserId))
                {
                    var notification = new UserNotification
                    {
                        UserID = candidateUserId,
                        Title = "📅 Lịch phỏng vấn mới",
                        Message = $"Bạn có lịch phỏng vấn cho vị trí {interview.Application.Job.Title} vào lúc {interview.ScheduledAt:dd/MM/yyyy HH:mm}. Vui lòng chuẩn bị kỹ lưỡng!",
                        Type = "Warning",
                        ActionUrl = $"/user/interviews/{interviewId}",
                        RelatedApplicationID = interview.ApplicationID
                    };

                    _context.Notifications.Add(notification);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Interview notification sent for interview {interviewId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending interview notification for interview {interviewId}");
            }
        }

        public async Task SendJobOfferNotificationAsync(int candidateId, int offerId)
        {
            try
            {
                var jobOffer = await _context.JobOffers
                    .Include(o => o.Application)
                    .ThenInclude(a => a.Job)
                    .Include(o => o.Application)
                    .ThenInclude(a => a.Candidate)
                    .FirstOrDefaultAsync(o => o.OfferID == offerId);

                if (jobOffer == null)
                {
                    _logger.LogWarning($"Job offer {offerId} not found");
                    return;
                }

                var candidate = jobOffer.Application.Candidate;
                if (int.TryParse(candidate.UserId, out int candidateUserId))
                {
                    var notification = new UserNotification
                    {
                        UserID = candidateUserId,
                        Title = "🎉 Thư mời làm việc",
                        Message = $"Chúc mừng! Bạn đã nhận được thư mời làm việc cho vị trí {jobOffer.Application.Job.Title} với mức lương {jobOffer.Salary:N0} VND/tháng. Hạn phản hồi: {jobOffer.StartDate:dd/MM/yyyy}",
                        Type = "Success",
                        ActionUrl = $"/user/offers/{offerId}",
                        RelatedApplicationID = jobOffer.ApplicationID
                    };

                    _context.Notifications.Add(notification);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Job offer notification sent for offer {offerId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending job offer notification for offer {offerId}");
            }
        }

        public async Task SendApplicationStatusUpdateNotificationAsync(int candidateId, int applicationId, string newStatus)
        {
            try
            {
                var application = await _context.Applications
                    .Include(a => a.Job)
                    .Include(a => a.Candidate)
                    .FirstOrDefaultAsync(a => a.ApplicationID == applicationId);

                if (application == null)
                {
                    _logger.LogWarning($"Application {applicationId} not found");
                    return;
                }

                var candidate = application.Candidate;
                if (int.TryParse(candidate.UserId, out int candidateUserId))
                {
                    var (statusMessage, notificationType, icon) = GetStatusDetails(newStatus);

                    var notification = new UserNotification
                    {
                        UserID = candidateUserId,
                        Title = $"{icon} Cập nhật trạng thái ứng tuyển",
                        Message = $"Đơn ứng tuyển của bạn cho vị trí {application.Job.Title} tại {application.Job.Company} {statusMessage}",
                        Type = notificationType,
                        ActionUrl = $"/user/applications",
                        RelatedApplicationID = applicationId
                    };

                    _context.Notifications.Add(notification);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Status update notification sent for application {applicationId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending status update notification for application {applicationId}");
            }
        }

        public async Task SendJobPostedNotificationAsync(int jobId)
        {
            try
            {
                var job = await _context.Jobs.FindAsync(jobId);
                if (job == null)
                {
                    _logger.LogWarning($"Job {jobId} not found");
                    return;
                }

                // Lấy danh sách người dùng quan tâm (có thể filter theo preferences sau)
                var interestedUsers = await _context.Users
                    .Where(u => u.Role == "User" && u.IsActive)
                    .Take(100) // Giới hạn để tránh quá tải
                    .Select(u => u.UserID)
                    .ToListAsync();

                if (interestedUsers.Any())
                {
                    var notifications = interestedUsers.Select(userId => new UserNotification
                    {
                        UserID = userId,
                        Title = "🆕 Việc làm mới",
                        Message = $"Có việc làm mới phù hợp: {job.Title} tại {job.Company} - Mức lương: {job.SalaryRange}",
                        Type = "Info",
                        ActionUrl = $"/jobs/{jobId}",
                        RelatedJobID = jobId
                    }).ToList();

                    _context.Notifications.AddRange(notifications);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Job posted notifications sent for job {jobId} to {notifications.Count} users");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending job posted notification for job {jobId}");
            }
        }

        public async Task SendBulkNotificationAsync(List<int> userIds, string title, string message, string type = "Info")
        {
            try
            {
                if (!userIds.Any())
                {
                    _logger.LogWarning("No user IDs provided for bulk notification");
                    return;
                }

                var notifications = userIds.Select(userId => new UserNotification
                {
                    UserID = userId,
                    Title = title,
                    Message = message,
                    Type = type
                }).ToList();

                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Bulk notification sent to {userIds.Count} users with title: {title}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending bulk notification to {userIds.Count} users");
            }
        }

        public async Task CreateNotificationAsync(int userId, string title, string message, string type = "Info", string actionUrl = null)
        {
            try
            {
                var notification = new UserNotification
                {
                    UserID = userId,
                    Title = title,
                    Message = message,
                    Type = type,
                    ActionUrl = actionUrl
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Notification created for user {userId}: {title}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating notification for user {userId}");
            }
        }

        public async Task SendInterviewCompletedNotificationAsync(int candidateId, int interviewId, string result)
        {
            try
            {
                var interview = await _context.Interviews
                    .Include(i => i.Application)
                    .ThenInclude(a => a.Job)
                    .Include(i => i.Application)
                    .ThenInclude(a => a.Candidate)
                    .FirstOrDefaultAsync(i => i.InterviewID == interviewId);

                if (interview == null)
                {
                    _logger.LogWarning($"Interview {interviewId} not found");
                    return;
                }

                var candidate = interview.Application.Candidate;
                if (int.TryParse(candidate.UserId, out int candidateUserId))
                {
                    var (resultMessage, notificationType, icon) = result.ToLower() switch
                    {
                        "passed" => ("đã hoàn thành tốt", "Success", "✅"),
                        "failed" => ("chưa đạt yêu cầu", "Error", "❌"),
                        _ => ("đã hoàn thành", "Info", "ℹ️")
                    };

                    var notification = new UserNotification
                    {
                        UserID = candidateUserId,
                        Title = $"{icon} Kết quả phỏng vấn",
                        Message = $"Buổi phỏng vấn cho vị trí {interview.Application.Job.Title} {resultMessage}. Chúng tôi sẽ thông báo kết quả cuối cùng sớm nhất.",
                        Type = notificationType,
                        ActionUrl = $"/user/interviews/{interviewId}",
                        RelatedApplicationID = interview.ApplicationID
                    };

                    _context.Notifications.Add(notification);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Interview completed notification sent for interview {interviewId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending interview completed notification for interview {interviewId}");
            }
        }

        public async Task SendInterviewReminderNotificationAsync(int candidateId, int interviewId, int hoursBeforeInterview = 24)
        {
            try
            {
                var interview = await _context.Interviews
                    .Include(i => i.Application)
                    .ThenInclude(a => a.Job)
                    .Include(i => i.Application)
                    .ThenInclude(a => a.Candidate)
                    .FirstOrDefaultAsync(i => i.InterviewID == interviewId);

                if (interview == null)
                {
                    _logger.LogWarning($"Interview {interviewId} not found");
                    return;
                }

                var candidate = interview.Application.Candidate;
                if (int.TryParse(candidate.UserId, out int candidateUserId))
                {
                    var notification = new UserNotification
                    {
                        UserID = candidateUserId,
                        Title = $"⏰ Nhắc nhở phỏng vấn",
                        Message = $"Bạn có lịch phỏng vấn cho vị trí {interview.Application.Job.Title} vào {interview.ScheduledAt:dd/MM/yyyy HH:mm} (còn {hoursBeforeInterview} giờ). Vui lòng chuẩn bị đầy đủ!",
                        Type = "Warning",
                        ActionUrl = $"/user/interviews/{interviewId}",
                        RelatedApplicationID = interview.ApplicationID
                    };

                    _context.Notifications.Add(notification);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Interview reminder notification sent for interview {interviewId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending interview reminder notification for interview {interviewId}");
            }
        }

        // Helper method để lấy thông tin chi tiết về trạng thái
        private static (string message, string type, string icon) GetStatusDetails(string status)
        {
            return status?.ToLower() switch
            {
                "pending" => ("đang được xem xét", "Info", "⏳"),
                "interview" => ("đã được chọn phỏng vấn", "Warning", "📋"),
                "accepted" => ("đã được chấp nhận", "Success", "🎉"),
                "rejected" => ("đã bị từ chối", "Error", "❌"),
                "on-hold" => ("đang được tạm hoãn", "Warning", "⏸️"),
                _ => ($"đã được cập nhật thành {status}", "Info", "ℹ️")
            };
        }
    }
}