using System;
using System.Collections.Generic;

namespace BE;

public partial class Paciente
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Dni { get; set; } = null!;

    public string? Email { get; set; }

    public DateTime FechaNac { get; set; }

    public string? GrupoSanguineo { get; set; }

    public string? Nacionalidad { get; set; }

    public string? Ocupacion { get; set; }

    public string Telefono1 { get; set; } = null!;

    public string? Telefono2 { get; set; }

    public int? DomicilioId { get; set; }

    public int? SexoId { get; set; }

    public bool Activo { get; set; }

    public virtual Domicilio? Domicilio { get; set; }

    public virtual ICollection<Evolucion> Evolucions { get; set; } = new List<Evolucion>();

    public virtual ICollection<PacienteObraSocial> PacienteObraSocials { get; set; } = new List<PacienteObraSocial>();

    public virtual Sexo? Sexo { get; set; }
}
