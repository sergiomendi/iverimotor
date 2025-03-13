import TRecursoMalla from './TRecursoMalla';

export default class TGestorRecursos {
  recursosMalla: TRecursoMalla[] = [];

  constructor() {
    console.log('Me creo');
  }

  // Método para obtener un recurso de malla
  async getRecurso(
    nombre: string,
    fichero: string,
    gl: WebGLRenderingContext
  ): Promise<TRecursoMalla> {
    // Buscar si el recurso ya está cargado
    let rec = this.recursosMalla.find(
      (recursosMalla) => recursosMalla.getNombre() === nombre
    );

    // Si el recurso no existe, crearlo y cargarlo
    if (!rec) {
      rec = new TRecursoMalla(nombre, fichero);

      // Cargar el archivo .obj
      await rec.cargarFichero();

      // Inicializar los buffers de WebGL
      rec.inicializarBuffers(gl);

      // Agregar el recurso a la lista
      this.recursosMalla.push(rec);
    }
    console.log('Recurso cargado:', rec.getNombre());
    return rec;
  }
}
