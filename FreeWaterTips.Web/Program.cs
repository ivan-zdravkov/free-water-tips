using FreeWaterTips.Shared.Services;
using FreeWaterTips.Web.Services;
using FreeWaterTips.Web.Components;
using Environment = FreeWaterTips.Utils.Environment;

if (Environment.IsDevelopment)
{
    DotNetEnv.LoadOptions.DEFAULT.Load("../.env.development");
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents();

// Add device-specific services used by the FreeWaterTips.Shared project
builder.Services.AddSingleton<IFormFactor, FormFactor>();
builder.Services.AddSingleton<IAzureFunctionsApiService, AzureFunctionsApiService>();
builder.Services.AddSingleton<HttpClient>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddAdditionalAssemblies(typeof(FreeWaterTips.Shared._Imports).Assembly);

app.Run();
