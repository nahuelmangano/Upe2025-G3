using System;
using System.Collections.Generic;

namespace BE;

public partial class Campo
{
    public int Id { get; set; }

    public string? Etiqueta { get; set; }

    public bool? Obligatorio { get; set; }

    public string? Opciones { get; set; }

    public int? Orden { get; set; }

    public int? TipoCampoId { get; set; }

    public int PlantillaId { get; set; }

    public virtual ICollection<CampoValor> CampoValors { get; set; } = new List<CampoValor>();

    public virtual Plantilla Plantilla { get; set; } = null!;

    public virtual TipoCampo? TipoCampo { get; set; }
}
