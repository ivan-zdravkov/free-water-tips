using System.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using FreeWaterTips.Api.Models;
using Microsoft.Azure.Functions.Worker.Http;

namespace FreeWaterTips.Api.Utils;

public static class HttpResponseHelper
{
    private static readonly JsonSerializerSettings JsonSettings = new()
    {
        ContractResolver = new CamelCasePropertyNamesContractResolver(),
        Formatting = Formatting.None
    };

    public static async Task<HttpResponseData> CreateSuccessResponseAsync<T>(
        HttpRequestData req, 
        T data, 
        HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        var response = req.CreateResponse(statusCode);
        var apiResponse = new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Timestamp = DateTime.UtcNow
        };

        response.Headers.Add("Content-Type", "application/json");
        await response.WriteStringAsync(JsonConvert.SerializeObject(apiResponse, JsonSettings));
        return response;
    }

    public static async Task<HttpResponseData> CreateErrorResponseAsync(
        HttpRequestData req, 
        string message, 
        HttpStatusCode statusCode = HttpStatusCode.InternalServerError,
        string? details = null)
    {
        var response = req.CreateResponse(statusCode);
        var apiResponse = new ApiResponse<object>
        {
            Success = false,
            Error = new ApiError
            {
                Message = message,
                Details = details,
                Code = (int)statusCode
            },
            Timestamp = DateTime.UtcNow
        };

        response.Headers.Add("Content-Type", "application/json");
        await response.WriteStringAsync(JsonConvert.SerializeObject(apiResponse, JsonSettings));
        return response;
    }

    public static async Task<HttpResponseData> CreateBadRequestAsync(
        HttpRequestData req, 
        string message, 
        string? details = null)
    {
        return await CreateErrorResponseAsync(req, message, HttpStatusCode.BadRequest, details);
    }

    public static async Task<HttpResponseData> CreateNotFoundAsync(
        HttpRequestData req, 
        string resource = "Resource")
    {
        return await CreateErrorResponseAsync(req, $"{resource} not found", HttpStatusCode.NotFound);
    }

    public static async Task<HttpResponseData> CreateMethodNotAllowedAsync(HttpRequestData req)
    {
        return await CreateErrorResponseAsync(req, "Method not allowed", HttpStatusCode.MethodNotAllowed);
    }
}
