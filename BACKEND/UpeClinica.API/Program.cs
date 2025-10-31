using DotNetEnv;
using IOC;
using DAL.DBContext;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var loaded = false;

foreach (var path in new[]
{
    Path.Combine(AppContext.BaseDirectory, ".env"),
    Path.Combine(Directory.GetCurrentDirectory(), ".env")
})
{
    if (File.Exists(path))
    {
        Env.Load(path);
        loaded = true;
        break;
    }
}

var desdeEnv = Environment.GetEnvironmentVariable("CADENA_SQL");
if (!string.IsNullOrWhiteSpace(desdeEnv))
{
    builder.Configuration["ConnectionStrings:cadenaSQL"] = desdeEnv;
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.InyectarDependencias(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("NuevaPolitica", app =>
        app.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Ajustar columna PlantillaId para permitir valores nulos (opción "Vacío")
using (var scope = app.Services.CreateScope())
{
    try
    {
        var contexto = scope.ServiceProvider.GetRequiredService<DbUpeclinicaContext>();
        const string script = @"
IF EXISTS (
    SELECT 1
    FROM sys.columns c
    INNER JOIN sys.tables t ON c.object_id = t.object_id
    WHERE t.name = 'Evolucion' AND c.name = 'PlantillaId' AND c.is_nullable = 0
)
BEGIN
    ALTER TABLE Evolucion ALTER COLUMN PlantillaId INT NULL;
END";
        contexto.Database.ExecuteSqlRaw(script);
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "No se pudo modificar Evolucion.PlantillaId a nullable. Se asume que ya estaba configurada.");
    }
}

// cadena
var cs = app.Configuration.GetConnectionString("cadenaSQL");
if (string.IsNullOrWhiteSpace(cs))
{
    app.Logger.LogError("ConnectionStrings:cadenaSQL está vacía. Verificá .env o appsettings.json.");
}


    app.UseSwagger();
    app.UseSwaggerUI();


app.UseCors("NuevaPolitica");
app.UseAuthorization();
app.MapControllers();
app.Run();
