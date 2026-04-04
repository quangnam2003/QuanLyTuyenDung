# Sử dụng đúng SDK 8.0 cho project .NET 8 của bạn
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Bước 1: Copy tệp csproj và restore (Phải đúng hoa thường)
# Dựa theo nội dung tệp: QuanLyTuyenDung.csproj
COPY ["QuanLyTuyenDung.csproj", "./"]
RUN dotnet restore "QuanLyTuyenDung.csproj"

# Bước 2: Copy toàn bộ code và build
COPY . .
RUN dotnet publish "QuanLyTuyenDung.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Bước 3: Cấu hình Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Cấu hình cổng chạy (Mặc định .NET 8 dùng 8080)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "QuanLyTuyenDung.dll"]