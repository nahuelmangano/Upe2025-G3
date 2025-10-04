    using IOC;
    using DotNetEnv;

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

    // cadena
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
