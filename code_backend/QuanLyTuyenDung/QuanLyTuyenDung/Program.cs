using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.DBContext;
using QuanLyTuyenDung.Services;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Đăng ký ApplicationDbContext với connection string từ appsettings.json
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// THÊM: Đăng ký NotificationService
builder.Services.AddScoped<INotificationService, NotificationService>();

// Cấu hình CORS cho phép frontend truy cập
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",  // Angular dev server
                "https://localhost:4200", // Angular dev server SSL
                "http://localhost:3000",  // Alternative frontend port
                "https://localhost:3000"  // Alternative frontend port SSL
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });

    // Policy cho phép tất cả (chỉ dùng trong development)
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Cấu hình Authentication (JWT) - CÓ THỂ BỎ COMMENT NẾU MUỐN DÙNG JWT
/*
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "QuanLyTuyenDung",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "QuanLyTuyenDung",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "your-secret-key-here"))
        };
    });
*/

// Cấu hình Authorization policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));
    options.AddPolicy("RequireHRRole", policy =>
        policy.RequireRole("Admin", "HR"));
    options.AddPolicy("RequireRecruiterRole", policy =>
        policy.RequireRole("Admin", "HR", "Recruiter"));
    options.AddPolicy("RequireUserRole", policy =>
        policy.RequireRole("Admin", "HR", "Recruiter", "User"));
});

// Đăng ký Controllers với JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Giữ PascalCase
        options.JsonSerializerOptions.WriteIndented = true; // Format JSON đẹp
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; // Không phân biệt hoa thường
    });

// Đăng ký API Explorer cho Swagger
builder.Services.AddEndpointsApiExplorer();

// Cấu hình Swagger/OpenAPI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Quản Lý Tuyển Dụng API",
        Version = "v1",
        Description = "API cho hệ thống quản lý tuyển dụng"
    });

    // Add JWT Authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });

    // Tự động tạo document từ XML comments
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
});

// Cấu hình file upload limits
builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
});

// Cấu hình Logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();

    if (builder.Environment.IsDevelopment())
    {
        logging.SetMinimumLevel(LogLevel.Debug);
    }
    else
    {
        logging.SetMinimumLevel(LogLevel.Information);
    }
});

// Build application
var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    // Swagger chỉ trong Development
    app.UseSwagger(c =>
    {
        c.SerializeAsV2 = false;
    });
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Quản Lý Tuyển Dụng API v1");
        c.RoutePrefix = "swagger";
    });
}
else
{
    // Production error handling
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

// Security headers middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    await next();
});

// HTTPS Redirection
app.UseHttpsRedirection();

// CORS - ĐẶT TRƯỚC Authentication
app.UseCors("AllowFrontend");

// Static files cho uploaded documents
app.UseStaticFiles();

// Authentication & Authorization middleware
//app.UseAuthentication(); // Uncomment nếu dùng JWT
app.UseAuthorization();

// Custom logging middleware
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    var startTime = DateTime.UtcNow;

    logger.LogInformation($"[{startTime:HH:mm:ss}] {context.Request.Method} {context.Request.Path} - Started");

    await next();

    var endTime = DateTime.UtcNow;
    var duration = endTime - startTime;

    logger.LogInformation($"[{endTime:HH:mm:ss}] {context.Request.Method} {context.Request.Path} - {context.Response.StatusCode} ({duration.TotalMilliseconds:F1}ms)");
});

// Global error handling middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

// API Controllers
app.MapControllers();

// Health check endpoints
app.MapGet("/health", () => new {
    status = "healthy",
    timestamp = DateTime.UtcNow,
    version = "1.0.0",
    environment = app.Environment.EnvironmentName
});

app.MapGet("/health/db", async (ApplicationDbContext context) =>
{
    try
    {
        await context.Database.CanConnectAsync();
        return Results.Ok(new
        {
            status = "healthy",
            database = "connected",
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(new ProblemDetails
        {
            Status = 503,
            Title = "Database connection failed",
            Detail = ex.Message
        });
    }
});

// Preflight CORS middleware cho OPTIONS requests
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        await context.Response.CompleteAsync();
        return;
    }
    await next();
});

// Database initialization và seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Ensuring database is created...");
        await context.Database.EnsureCreatedAsync();

        // Có thể thêm logic seeding data ở đây
        logger.LogInformation("Database initialization completed successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing the database.");

        // Trong production, có thể muốn throw exception để stop app
        // throw;
    }
}

// Start the application
var port = Environment.GetEnvironmentVariable("PORT") ?? "7029";
var host = Environment.GetEnvironmentVariable("HOST") ?? "localhost";

app.Logger.LogInformation($"Starting application on https://{host}:{port}");
app.Run($"https://{host}:{port}");

// Global Error Handling Middleware
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request processing");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.StatusCode = exception switch
        {
            ArgumentException => 400,
            UnauthorizedAccessException => 401,
            FileNotFoundException => 404,
            TimeoutException => 408,
            InvalidOperationException => 409,
            NotImplementedException => 501,
            _ => 500
        };

        context.Response.ContentType = "application/json";

        var response = new
        {
            error = new
            {
                message = context.Response.StatusCode == 500
                    ? "An internal server error occurred."
                    : exception.Message,
                statusCode = context.Response.StatusCode,
                timestamp = DateTime.UtcNow,
                path = context.Request.Path.Value,
                method = context.Request.Method
            }
        };

        var jsonResponse = System.Text.Json.JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase,
            WriteIndented = true
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}