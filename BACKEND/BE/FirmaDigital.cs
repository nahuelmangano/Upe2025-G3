using System;
using System.Collections.Generic;

namespace BE;

public partial class FirmaDigital
{
    public int Id { get; set; }

    public string? Algoritmo { get; set; }

    public byte[]? CertificadoPublico { get; set; }

    public DateTime FechaFirma { get; set; }

    public byte[]? Firma { get; set; }

    public string? HashDocumento { get; set; }

    public bool? Valido { get; set; }

    public virtual ICollection<Medico> Medicos { get; set; } = new List<Medico>();
}
