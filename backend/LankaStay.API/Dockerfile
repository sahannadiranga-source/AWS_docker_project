# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY nuget.config .
COPY ["LankaStay.API.csproj", "."]

# Cache NuGet packages across builds using BuildKit cache mount
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore --configfile nuget.config

COPY . .

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "LankaStay.API.dll"]
