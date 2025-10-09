using System;
using System.Collections.Generic;

namespace BE;

public partial class ArchivoAdjunto
{
    public int Id { get; set; }

    public DateTime FechaSubida { get; set; }

    public string NombreArchivo { get; set; } = null!;

    public int? Tamano { get; set; }

    public string? Url { get; set; }

    public int EstudioId { get; set; }

    public bool Activo { get; set; }

    public virtual Estudio Estudio { get; set; } = null!;
}
