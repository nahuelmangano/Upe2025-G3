using System;
using System.Collections.Generic;

namespace BE;

public partial class Estudio
{
    public int Id { get; set; }

    public DateTime Fecha { get; set; }

    public string RealizadoPor { get; set; } = null!;

    public string? Resultado { get; set; }

    public string Observaciones { get; set; } = null!;

    public int TipoEstudioId { get; set; }

    public int EvolucionId { get; set; }

    public virtual ICollection<ArchivoAdjunto> ArchivoAdjuntos { get; set; } = new List<ArchivoAdjunto>();

    public virtual Evolucion Evolucion { get; set; } = null!;

    public virtual TipoEstudio TipoEstudio { get; set; } = null!;
}
