using IOC;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// 1) Cargar .env desde ubicaciones típicas
//    (deja el .env al lado del Program.cs; si lo tenés en la carpeta BACKEND, movelo aquí)
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
// 2) Si existe CADENA_SQL en el entorno, usamos eso; si no, NO pisamos appsettings.json
var desdeEnv = Environment.GetEnvironmentVariable("CADENA_SQL");
if (!string.IsNullOrWhiteSpace(desdeEnv))
{
    builder.Configuration["ConnectionStrings:cadenaSQL"] = desdeEnv;
}

// servicios base
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// IoC (usa configuration.GetConnectionString("cadenaSQL"))
builder.Services.InyectarDependencias(builder.Configuration);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("NuevaPolitica", app =>
        app.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// (opcional) Smoke test: validar que hay cadena antes de arrancar
var cs = app.Configuration.GetConnectionString("cadenaSQL");
if (string.IsNullOrWhiteSpace(cs))
{
    app.Logger.LogError("ConnectionStrings:cadenaSQL está vacía. Verificá .env o appsettings.json.");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("NuevaPolitica");
app.UseAuthorization();
app.MapControllers();
app.Run();
