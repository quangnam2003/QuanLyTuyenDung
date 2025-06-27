using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.DBContext;
using QuanLyTuyenDung.Services;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

// Đăng ký ApplicationDbContext với connection string từ appsettings.json
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// THÊM: Đăng ký Services
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IJobService, JobService>();

// Cấu hình JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? 
            throw new InvalidOperationException("JWT Key is not configured"))),
        ClockSkew = TimeSpan.Zero // Removes the default 5 minutes clock skew
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILogger<Program>>();

            logger.LogError("Authentication failed: {Error}", context.Exception.Message);

            if (context.Exception is SecurityTokenExpiredException)
            {
                context.Response.Headers.Add("Token-Expired", "true");
                logger.LogWarning("Token has expired");
            }

            return Task.CompletedTask;
        },

        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILogger<Program>>();

            var token = context.SecurityToken as JwtSecurityToken;
            if (token != null)
            {
                logger.LogInformation(
                    "Token validated successfully. User: {User}, Expires: {Expires}",
                    token.Claims.FirstOrDefault(c => c.Type == "email")?.Value,
                    token.ValidTo
                );
            }

            return Task.CompletedTask;
        },

        OnChallenge = context =>
        {
            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILogger<Program>>();

            logger.LogWarning(
                "Authentication challenge issued: {Error}",
                context.Error ?? "No specific error provided"
            );

            return Task.CompletedTask;
        }
    };
});

// Cấu hình CORS cho phép frontend truy cập
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder
            .WithOrigins(
                "http://localhost:4200",  // Angular development server
                "https://localhost:4200",
                "http://localhost:7029",  // Backend development server
                "https://localhost:7029"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition"); // Cho phép frontend đọc header khi download file
    });

    // Policy cho phép tất cả (chỉ dùng trong development)
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Cấu hình Authorization policies (simple without JWT for now)
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireAssertion(context => true)); // Allow all for now
    options.AddPolicy("RequireHRRole", policy =>
        policy.RequireAssertion(context => true)); // Allow all for now
    options.AddPolicy("RequireRecruiterRole", policy =>
        policy.RequireAssertion(context => true)); // Allow all for now
    options.AddPolicy("RequireUserRole", policy =>
        policy.RequireAssertion(context => true)); // Allow all for now
});

// Đăng ký Controllers với JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Giữ PascalCase
        options.JsonSerializerOptions.WriteIndented = true; // Format JSON đẹp
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; // Không phân biệt hoa thường
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
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
        Description = "API cho hệ thống quản lý tuyển dụng",
        Contact = new OpenApiContact
        {
            Name = "Developer",
            Email = "developer@example.com"
        }
    });

    // Add Bearer token authentication (optional)
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

    // Configure Swagger to handle enum values properly
    c.UseInlineDefinitionsForEnums();

    // Handle polymorphism
    c.UseAllOfToExtendReferenceSchemas();
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

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
});

// Build application
var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    // Swagger trong Development
    app.UseSwagger(c =>
    {
        c.SerializeAsV2 = false;
    });
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Quản Lý Tuyển Dụng API v1");
        c.RoutePrefix = "swagger";
        c.DisplayRequestDuration();
        c.EnableTryItOutByDefault();
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

// Thêm Authentication middleware TRƯỚC Authorization
app.UseAuthentication();

// Authorization middleware
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

        // Log error but don't stop the application
        logger.LogWarning("Continuing application startup despite database initialization error.");
    }
}

// Start the application
var port = Environment.GetEnvironmentVariable("PORT") ?? "7029";
var host = Environment.GetEnvironmentVariable("HOST") ?? "localhost";

app.Logger.LogInformation($"Starting application on https://{host}:{port}");
app.Logger.LogInformation($"Swagger UI available at: https://{host}:{port}/swagger");

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

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}