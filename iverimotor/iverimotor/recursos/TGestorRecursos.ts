import TRecursoMalla from './TRecursoMalla';

export default class TGestorRecursos {
  recursos: TRecursoMalla[] = [];

  constructor() {}

  // Método para obtener un recurso de malla
  async getRecurso(
    nombre: string,
    gl: WebGLRenderingContext
  ): Promise<TRecursoMalla> {
    // Buscar si el recurso ya está cargado
    let rec = this.recursos.find((recurso) => recurso.getNombre() === nombre);

    // Si el recurso no existe, crearlo y cargarlo
    if (!rec) {
      rec = new TRecursoMalla(nombre);

      // Cargar el archivo .obj
      await rec.cargarFichero(nombre);

      // Inicializar los buffers de WebGL
      rec.inicializarBuffers(gl);

      // Agregar el recurso a la lista
      this.recursos.push(rec);
    }

    return rec;
  }
}
