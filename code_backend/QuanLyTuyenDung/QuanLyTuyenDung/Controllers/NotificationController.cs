using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;
using QuanLyTuyenDung.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(
            ApplicationDbContext context,
            INotificationService notificationService,
            ILogger<NotificationController> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        /// <summary>
        /// Lấy danh sách thông báo của user hiện tại
        /// </summary>
        /// <param name="page">Trang hiện tại</param>
        /// <param name="pageSize">Số lượng thông báo mỗi trang</param>
        /// <param name="unreadOnly">Chỉ lấy thông báo chưa đọc</param>
        /// <returns>Danh sách thông báo</returns>
        [HttpGet]
        public async Task<ActionResult<object>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] bool unreadOnly = false)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                var query = _context.Notifications
                    .Where(n => n.UserID == userId.Value);

                if (unreadOnly)
                {
                    query = query.Where(n => !n.IsRead);
                }

                var totalCount = await query.CountAsync();
                var unreadCount = await _context.Notifications
                    .CountAsync(n => n.UserID == userId.Value && !n.IsRead);

                var notifications = await query
                    .OrderByDescending(n => n.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(n => new
                    {
                        id = n.NotificationID,
                        title = n.Title,
                        message = n.Message,
                        type = n.Type,
                        priority = n.Priority,
                        isRead = n.IsRead,
                        actionUrl = n.ActionUrl,
                        createdAt = n.CreatedAt,
                        readAt = n.ReadAt,
                        expiresAt = n.ExpiresAt,
                        relatedJobID = n.RelatedJobID,
                        relatedApplicationID = n.RelatedApplicationID,
                        relatedInterviewID = n.RelatedInterviewID
                    })
                    .ToListAsync();

                return Ok(new
                {
                    data = notifications,
                    pagination = new
                    {
                        page,
                        pageSize,
                        totalCount,
                        totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                    },
                    unreadCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching notifications for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tải thông báo" });
            }
        }

        /// <summary>
        /// Lấy số lượng thông báo chưa đọc
        /// </summary>
        /// <returns>Số lượng thông báo chưa đọc</returns>
        [HttpGet("unread-count")]
        public async Task<ActionResult<object>> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                var unreadCount = await _context.Notifications
                    .CountAsync(n => n.UserID == userId.Value && !n.IsRead);

                return Ok(new { unreadCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching unread count for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Có lỗi xảy ra khi đếm thông báo" });
            }
        }

        /// <summary>
        /// Đánh dấu một thông báo đã đọc
        /// </summary>
        /// <param name="id">ID thông báo</param>
        /// <returns>Kết quả cập nhật</returns>
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.NotificationID == id && n.UserID == userId.Value);

                if (notification == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông báo" });
                }

                if (!notification.IsRead)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Notification {NotificationId} marked as read by user {UserId}", id, userId.Value);
                }

                return Ok(new { message = "Đã đánh dấu thông báo đã đọc" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while marking notification {NotificationId} as read", id);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật thông báo" });
            }
        }

        /// <summary>
        /// Đánh dấu tất cả thông báo đã đọc
        /// </summary>
        /// <returns>Kết quả cập nhật</returns>
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                var unreadNotifications = await _context.Notifications
                    .Where(n => n.UserID == userId.Value && !n.IsRead)
                    .ToListAsync();

                if (unreadNotifications.Any())
                {
                    var readTime = DateTime.UtcNow;
                    foreach (var notification in unreadNotifications)
                    {
                        notification.IsRead = true;
                        notification.ReadAt = readTime;
                    }

                    await _context.SaveChangesAsync();

                    _logger.LogInformation("All {Count} unread notifications marked as read by user {UserId}",
                        unreadNotifications.Count, userId.Value);
                }

                return Ok(new
                {
                    message = "Đã đánh dấu tất cả thông báo đã đọc",
                    markedCount = unreadNotifications.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while marking all notifications as read for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Có lỗi xảy ra khi cập nhật thông báo" });
            }
        }

        /// <summary>
        /// Xóa một thông báo
        /// </summary>
        /// <param name="id">ID thông báo</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.NotificationID == id && n.UserID == userId.Value);

                if (notification == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông báo" });
                }

                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Notification {NotificationId} deleted by user {UserId}", id, userId.Value);

                return Ok(new { message = "Đã xóa thông báo" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting notification {NotificationId}", id);
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa thông báo" });
            }
        }

        /// <summary>
        /// Xóa tất cả thông báo đã đọc
        /// </summary>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("read-notifications")]
        public async Task<IActionResult> DeleteReadNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Không xác định được người dùng" });
                }

                var readNotifications = await _context.Notifications
                    .Where(n => n.UserID == userId.Value && n.IsRead)
                    .ToListAsync();

                if (readNotifications.Any())
                {
                    _context.Notifications.RemoveRange(readNotifications);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Deleted {Count} read notifications for user {UserId}",
                        readNotifications.Count, userId.Value);
                }

                return Ok(new
                {
                    message = "Đã xóa tất cả thông báo đã đọc",
                    deletedCount = readNotifications.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting read notifications for user {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Có lỗi xảy ra khi xóa thông báo" });
            }
        }

        /// <summary>
        /// Tạo thông báo mới (chỉ dành cho Admin/HR)
        /// </summary>
        /// <param name="request">Thông tin thông báo</param>
        /// <returns>Thông báo đã tạo</returns>
        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult<object>> CreateNotification(CreateNotificationRequest request)
        {
            try
            {
                // Validate user exists
                if (request.UserID.HasValue)
                {
                    var userExists = await _context.Users.AnyAsync(u => u.UserID == request.UserID.Value);
                    if (!userExists)
                    {
                        return BadRequest(new { message = "Người dùng không tồn tại" });
                    }
                }

                if (request.UserID.HasValue)
                {
                    // Send to specific user
                    await _notificationService.CreateNotificationAsync(
                        request.UserID.Value,
                        request.Title,
                        request.Message,
                        request.Type,
                        request.ActionUrl
                    );
                }
                else if (request.UserIDs?.Any() == true)
                {
                    // Send to multiple users
                    await _notificationService.SendBulkNotificationAsync(
                        request.UserIDs,
                        request.Title,
                        request.Message,
                        request.Type
                    );
                }
                else
                {
                    return BadRequest(new { message = "Phải chỉ định người nhận thông báo" });
                }

                _logger.LogInformation("Notification created by admin: {Title}", request.Title);

                return Ok(new { message = "Đã tạo thông báo thành công" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating notification");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tạo thông báo" });
            }
        }

        /// <summary>
        /// Lấy thống kê thông báo (chỉ dành cho Admin/HR)
        /// </summary>
        /// <returns>Thống kê thông báo</returns>
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult<object>> GetNotificationStatistics()
        {
            try
            {
                var totalNotifications = await _context.Notifications.CountAsync();
                var unreadNotifications = await _context.Notifications.CountAsync(n => !n.IsRead);
                var todayNotifications = await _context.Notifications
                    .CountAsync(n => n.CreatedAt.Date == DateTime.UtcNow.Date);

                var notificationsByType = await _context.Notifications
                    .GroupBy(n => n.Type)
                    .Select(g => new
                    {
                        type = g.Key,
                        count = g.Count()
                    })
                    .ToListAsync();

                var recentActivity = await _context.Notifications
                    .Where(n => n.CreatedAt >= DateTime.UtcNow.AddDays(-7))
                    .GroupBy(n => n.CreatedAt.Date)
                    .Select(g => new
                    {
                        date = g.Key,
                        count = g.Count()
                    })
                    .OrderBy(x => x.date)
                    .ToListAsync();

                return Ok(new
                {
                    totalNotifications,
                    unreadNotifications,
                    todayNotifications,
                    notificationsByType,
                    recentActivity
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching notification statistics");
                return StatusCode(500, new { message = "Có lỗi xảy ra khi tải thống kê" });
            }
        }

        // Helper method để lấy user ID hiện tại
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        // REQUEST DTOs
        public class CreateNotificationRequest
        {
            public int? UserID { get; set; }
            public List<int>? UserIDs { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public string Type { get; set; } = "Info"; 
            public string? ActionUrl { get; set; }
            public string Priority { get; set; } = "Normal"; 
            public DateTime? ExpiresAt { get; set; }
        }

        // THÊM: Định nghĩa constants cho notification types và priorities
        public static class NotificationConstants
        {
            public static class Types
            {
                public const string Info = "Info";
                public const string Success = "Success";
                public const string Warning = "Warning";
                public const string Error = "Error";
            }

            public static class Priorities
            {
                public const string Low = "Low";
                public const string Normal = "Normal";
                public const string High = "High";
                public const string Urgent = "Urgent";
            }
        }
    }
}