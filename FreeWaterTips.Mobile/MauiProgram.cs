using FreeWaterTips.Services;
using FreeWaterTips.Shared.Services;
using Microsoft.Extensions.Logging;
using Environment = FreeWaterTips.Utils.Environment;


namespace FreeWaterTips
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            if (Environment.IsDevelopment)
            {
                DotNetEnv.LoadOptions.DEFAULT.Load("../.env.development");
            }

            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                });

            // Add device-specific services used by the FreeWaterTips.Shared project
            builder.Services.AddSingleton<IFormFactor, FormFactor>();
            builder.Services.AddSingleton<IAzureFunctionsApiService, AzureFunctionsApiService>();
            builder.Services.AddSingleton<HttpClient>();

            builder.Services.AddMauiBlazorWebView();

#if DEBUG
            builder.Services.AddBlazorWebViewDeveloperTools();
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }
    }
}
