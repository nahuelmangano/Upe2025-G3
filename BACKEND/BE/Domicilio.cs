using System;
using System.Collections.Generic;

namespace BE;

public partial class Domicilio
{
    public int Id { get; set; }

    public string? Altura { get; set; }

    public string? Calle { get; set; }

    public string? Ciudad { get; set; }

    public string? CodigoPostal { get; set; }

    public string? Departamento { get; set; }

    public string? Pais { get; set; }

    public string? Piso { get; set; }

    public string? Provincia { get; set; }

    public virtual ICollection<Paciente> Pacientes { get; set; } = new List<Paciente>();
}
