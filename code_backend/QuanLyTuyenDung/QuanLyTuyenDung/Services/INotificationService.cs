namespace QuanLyTuyenDung.Services
{
    public interface INotificationService
    {
        Task SendJobApplicationNotificationAsync(int jobId, int candidateId, int applicationId);
        Task SendInterviewScheduledNotificationAsync(int candidateId, int interviewId);
        Task SendJobOfferNotificationAsync(int candidateId, int offerId);
        Task SendApplicationStatusUpdateNotificationAsync(int candidateId, int applicationId, string newStatus);
        Task SendJobPostedNotificationAsync(int jobId);
        Task SendBulkNotificationAsync(List<int> userIds, string title, string message, string type = "Info");
        Task CreateNotificationAsync(int userId, string title, string message, string type = "Info", string actionUrl = null);
        Task SendInterviewCompletedNotificationAsync(int candidateId, int interviewId, string result);
        Task SendInterviewReminderNotificationAsync(int candidateId, int interviewId, int hoursBeforeInterview = 24);
    }
}