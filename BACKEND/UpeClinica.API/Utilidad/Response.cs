namespace UpeClinica.API.Utilidad
{
    public class Response<T>
    {
        // Respuestas a todas las solicitudes de las apis
        public bool Estado { get; set; }

        public T Valor { get; set; }

        public string Mensaje { get; set; }
    }
}