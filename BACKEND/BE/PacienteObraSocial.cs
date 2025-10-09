using System;
using System.Collections.Generic;

namespace BE;

public partial class PacienteObraSocial
{
    public int Id { get; set; }

    public DateTime? VigenteDesde { get; set; }

    public bool Activo { get; set; }

    public int PacienteId { get; set; }

    public int ObraSocialId { get; set; }

    public string? NumeroAfiliado { get; set; }

    public virtual ObraSocial ObraSocial { get; set; } = null!;

    public virtual Paciente Paciente { get; set; } = null!;
}
