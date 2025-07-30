# API Development Guide

This guide covers setting up and developing the .NET Azure Functions API for Free Water Tips.

## Overview

The API is built with .NET 8 Azure Functions and provides REST endpoints for managing water location data. It features strong typing, dependency injection, comprehensive error handling, and currently uses mock data but is designed to be easily extended with Entity Framework and a real database.

## Quick Setup

1. **Install Prerequisites:**
   - [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
   - [Azure Functions Core Tools v4](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
   - [Node.js](https://nodejs.org/) (for build scripts)

2. **Setup the project:**
   ```bash
   npm run setup
   ```

3. **Start development servers:**
   ```bash
   # Start both web and API servers
   npm run dev:full
   
   # Or start individually:
   npm run dev         # Web server (port 3000)
   npm run api:dev     # API server (port 7071)
   
   # .NET specific commands:
   npm run api:restore # Restore .NET packages
   npm run api:build   # Build .NET project
   npm run api:start   # Start API without CORS (production mode)
   ```

## API Endpoints

### Base URL
- **Local Development:** `http://localhost:7071/api`
- **Production:** `https://your-function-app.azurewebsites.net/api`

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |
| GET | `/stats` | Platform statistics |
| GET | `/locations` | Get all locations (with filtering) |
| POST | `/locations` | Create new location |
| GET | `/locations/nearby` | Find nearby locations |
| GET | `/locations/search` | Search locations by text |

### Example Requests

```bash
# Health check
curl http://localhost:7071/api/health

# Get all locations
curl http://localhost:7071/api/locations

# Get nearby locations
curl "http://localhost:7071/api/locations/nearby?lat=40.7580&lng=-73.9855&radius=1000"

# Search locations
curl "http://localhost:7071/api/locations/search?q=starbucks"

# Create location (POST with JSON body)
curl -X POST http://localhost:7071/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Water Fountain",
    "address": "123 Main St, City, State",
    "type": "public-fountain",
    "coordinates": {"lat": 40.7580, "lng": -73.9855},
    "description": "Public water fountain",
    "accessible": true,
    "alwaysAvailable": true
  }'
```

## Configuration

### Local Development Settings

Edit `src/api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FUNCTIONS_EXTENSION_VERSION": "~4",
    "DATABASE_CONNECTION_STRING": "YOUR_DATABASE_CONNECTION_STRING",
    "DATABASE_NAME": "free-water-tips",
    "API_VERSION": "v1",
    "MAX_LOCATIONS_PER_REQUEST": "100",
    "DEFAULT_SEARCH_RADIUS": "5000",
    "CORS_ORIGINS": "http://localhost:3000,https://free-water-tips.pages.dev"
  }
}
```

### Web Application Settings

Update `src/web/js/config/config.json`:

```json
{
  "GOOGLE_MAPS_API_KEY": "your_google_maps_api_key",
  "API_BASE_URL": "http://localhost:7071/api",
  "ENVIRONMENT": "development"
}
```

## Project Structure

```
src/api/
├── Models/                    # Data models and DTOs
│   ├── Location.cs           # Core location model
│   ├── ApiResponse.cs        # API response wrapper
│   ├── CreateLocationRequest.cs
│   ├── LocationFilters.cs
│   ├── NearbyLocationsQuery.cs
│   └── SearchQuery.cs
├── Services/                  # Business logic layer
│   ├── LocationService.cs    # Location operations with mock data
│   └── StatsService.cs       # Statistics operations
├── Utils/                     # Shared utilities
│   ├── HttpResponseHelper.cs # Consistent HTTP responses
│   └── ValidationHelper.cs   # Input validation utilities
├── Functions/                 # Azure Function endpoints
│   ├── HealthFunction.cs     # Health check endpoint
│   ├── StatsFunction.cs      # Statistics endpoint
│   ├── LocationsFunction.cs  # Main locations endpoint (GET/POST)
│   ├── LocationsNearbyFunction.cs  # Nearby locations search
│   └── LocationsSearchFunction.cs  # Text-based search
├── Program.cs                # Dependency injection configuration
├── host.json                # Azure Functions host configuration
├── FreeWaterTips.Api.csproj # .NET project file
├── local.settings.example.json # Configuration template
└── README.md                # API documentation
```

## Architecture

### Dependency Injection
The API uses .NET's built-in dependency injection container configured in `Program.cs`:
```csharp
var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.AddSingleton<ILocationService, LocationService>();
        services.AddSingleton<IStatsService, StatsService>();
    })
    .Build();
```

### Service Layer
Business logic is separated into service classes:
- **LocationService**: Handles all location-related operations
- **StatsService**: Provides platform statistics

### Models and DTOs
Strong typing throughout with dedicated models for:
- Core data models (Location)
- Request/response DTOs (CreateLocationRequest, ApiResponse)
- Query parameters (LocationFilters, NearbyLocationsQuery, SearchQuery)

## Development Workflow

### Adding New Endpoints

1. **Create a new Function class:**
   ```csharp
   using Microsoft.Azure.Functions.Worker;
   using Microsoft.Azure.Functions.Worker.Http;
   using FreeWaterTips.Api.Utils;
   
   namespace FreeWaterTips.Api.Functions
   {
       public class NewEndpointFunction
       {
           [Function("NewEndpoint")]
           public async Task<HttpResponseData> Run(
               [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "new-endpoint")] 
               HttpRequestData req)
           {
               try
               {
                   // Your logic here
                   return await HttpResponseHelper.CreateSuccessResponseAsync(
                       req, new { message = "Hello World" });
               }
               catch (Exception ex)
               {
                   return await HttpResponseHelper.CreateErrorResponseAsync(
                       req, "Something went wrong", ex);
               }
           }
       }
   }
   ```

2. **Register service dependencies** (if needed) in `Program.cs`:
   ```csharp
   services.AddSingleton<INewService, NewService>();
   ```

### Working with Mock Data

Current implementation uses mock data in `Services/LocationService.cs`. This allows development without a database.

**Mock Data Features:**
- 10 sample water locations in NYC area
- Complete location objects with all required fields
- Statistics calculated from mock data
- Easy to modify for testing different scenarios
- Ready for Entity Framework migration

**Location from mock data:**
```csharp
new Location
{
    Id = 1,
    Name = "Central Park Bethesda Fountain",
    Latitude = 40.7764m,
    Longitude = -73.9713m,
    Address = "Central Park, New York, NY 10024",
    City = "New York",
    State = "NY",
    Country = "United States",
    PostalCode = "10024",
    Description = "Beautiful fountain area with accessible water fountains",
    WaterType = "Fountain",
    IsVerified = true,
    Rating = 4.8m,
    ReviewCount = 24,
    Accessibility = "Wheelchair accessible",
    OperatingHours = "24/7",
    ContactInfo = "NYC Parks Department",
    CreatedAt = DateTime.UtcNow.AddMonths(-6),
    UpdatedAt = DateTime.UtcNow.AddDays(-30)
}
```

### Testing API Endpoints

1. **Start the API:**
   ```bash
   npm run api:dev
   ```

2. **Use curl, Postman, or browser to test endpoints**

3. **Check logs in terminal for debugging**

## Data Structure

### Location Model (C#)

```csharp
public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string WaterType { get; set; } = string.Empty; // "Fountain", "Tap", "Dispenser", etc.
    public bool IsVerified { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }
    public string Accessibility { get; set; } = string.Empty;
    public string OperatingHours { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

### API Response Wrapper

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
    public int? Count { get; set; }
}
```

### Request Models

```csharp
// For creating new locations
public class CreateLocationRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    public string? Description { get; set; }
    public string WaterType { get; set; } = "Fountain";
    public string? Accessibility { get; set; }
    public string? OperatingHours { get; set; }
    public string? ContactInfo { get; set; }
}

// For nearby search
public class NearbyLocationsQuery
{
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public double RadiusKm { get; set; } = 5.0;
    public int MaxResults { get; set; } = 20;
}

// For text search
public class SearchQuery
{
    public string Query { get; set; } = string.Empty;
    public int MaxResults { get; set; } = 20;
}
```
  status: 'active' | 'pending' | 'inactive';
  verified: boolean;
  reports: number;
}
```

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": "...",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": "Additional details",
    "code": 400
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Utility Classes

### HttpResponseHelper
Provides consistent HTTP responses across all endpoints:
```csharp
// Success responses
await HttpResponseHelper.CreateSuccessResponseAsync(req, data)
await HttpResponseHelper.CreateSuccessResponseAsync(req, data, message)

// Error responses  
await HttpResponseHelper.CreateErrorResponseAsync(req, message)
await HttpResponseHelper.CreateErrorResponseAsync(req, message, exception)
await HttpResponseHelper.CreateValidationErrorResponseAsync(req, errors)
```

### ValidationHelper
Input validation utilities:
```csharp
// Coordinate validation
ValidationHelper.IsValidLatitude(latitude)
ValidationHelper.IsValidLongitude(longitude)

// Location validation
var errors = ValidationHelper.ValidateCreateLocationRequest(request)
var errors = ValidationHelper.ValidateNearbyQuery(query)
var errors = ValidationHelper.ValidateSearchQuery(query)
```

### Geographic Calculations
Built into LocationService:
```csharp
// Calculate distance between coordinates (in kilometers)
private static double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)

// Filter locations by distance
var nearbyLocations = locationService.GetNearbyLocations(query)
```

## Database Integration (Future)

When ready to implement the database layer:

1. **Choose database** (recommended: Azure CosmosDB or PostgreSQL)
2. **Add connection logic** in `shared/database.js`
3. **Replace mock data calls** with database queries
4. **Update configuration** with connection strings
5. **Add database initialization** scripts

**Example database integration:**
```javascript
// In locations/index.js
const db = require('../shared/database');

// Replace this:
const locations = mockLocations;

// With this:
const locations = await db.getLocations(filters);
```

## Deployment

### Azure Deployment

1. **Create Function App in Azure** (.NET 8 runtime)
2. **Configure application settings**
3. **Deploy using Azure Functions Core Tools:**
   ```bash
   # Build and deploy
   npm run api:build
   func azure functionapp publish your-function-app-name
   ```

4. **Or deploy using GitHub Actions** (see `.github/workflows/`)

### Environment Variables

Set these in Azure Function App configuration:
- `ConnectionStrings__DefaultConnection` (for Entity Framework)
- `CORS_ORIGINS` 
- `APPINSIGHTS_INSTRUMENTATIONKEY`
- `AzureWebJobsStorage` (required for Azure Functions)

## Troubleshooting

### Common Issues

**CORS Errors:**
- Check `local.settings.json` CORS configuration  
- Ensure web app origin is in allowed origins list
- Use `npm run api:dev` for development with CORS enabled

**Function Not Starting:**
- Verify .NET 8 SDK installation: `dotnet --version`
- Verify Azure Functions Core Tools v4: `func --version`
- Check `host.json` configuration
- Ensure all NuGet packages restored: `npm run api:restore`

**API Not Accessible:**
- Confirm functions are running on port 7071
- Check firewall settings  
- Verify Function attributes in C# code
- Check for compilation errors: `npm run api:build`

**Build Errors:**
- Ensure .NET 8 SDK is installed
- Run `dotnet restore` in src/api folder
- Check for missing using statements
- Verify all required NuGet packages are installed

### Debugging Tips

1. **Enable verbose logging** in `local.settings.json`:
   ```json
   {
     "Values": {
       "Logging__LogLevel__Default": "Debug"
     }
   }
   ```

2. **Use structured logging** in Functions:
   ```csharp
   logger.LogInformation("Processing request for {endpoint}", req.Url);
   ```

3. **Test individual functions** with curl:
   ```bash
   curl http://localhost:7071/api/health
   ```

4. **Use Visual Studio Code debugger** with C# extension for breakpoints

5. **Check Azure Functions logs** in development and production

## Next Steps

1. **Implement database layer**
2. **Add authentication/authorization**
3. **Add comprehensive testing**
4. **Add rate limiting**
5. **Add API documentation (OpenAPI/Swagger)**
6. **Add monitoring and alerting**

For more details, see `src/api/README.md`.
