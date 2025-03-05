import TRecurso from './TRecurso';

export default class TRecursoMalla extends TRecurso {
  vertices: number = 0;
  normales: number = 0;
  coordTexturas: number = 0;

  constructor(
    nombre: string,
    vertices: number,
    normales: number,
    coordTexturas: number
  ) {
    super(nombre);
    this.vertices = vertices;
    this.normales = normales;
    this.coordTexturas = coordTexturas;
  }

  dibujar(): void {
    // TODO
  }
}
