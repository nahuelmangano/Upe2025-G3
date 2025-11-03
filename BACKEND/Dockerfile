## Stage 1 - Restore, build and publish the ASP.NET Core API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy solution and project files first to leverage Docker layer caching
COPY BACKEND.sln .
COPY UpeClinica.API/UpeClinica.API.csproj UpeClinica.API/
COPY BLL/BLL.csproj BLL/
COPY DAL/DAL.csproj DAL/
COPY DTOs/DTOs.csproj DTOs/
COPY IOC/IOC.csproj IOC/
COPY BE/BE.csproj BE/
COPY Utility/Utility.csproj Utility/

RUN dotnet restore UpeClinica.API/UpeClinica.API.csproj

# Copy the remaining source code and publish
COPY . .
RUN dotnet publish UpeClinica.API/UpeClinica.API.csproj -c Release -o /app/publish --no-restore

## Stage 2 - Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

COPY --from=build /app/publish .

# Listen on port 8080 inside the container by default
ENV ASPNETCORE_URLS=http://+:5259

EXPOSE 5259

ENTRYPOINT ["dotnet", "UpeClinica.API.dll"]
