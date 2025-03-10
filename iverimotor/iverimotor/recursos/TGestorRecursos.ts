import TRecursoMalla from './TRecursoMalla';

export default class TGestorRecursos {
  recursos: TRecursoMalla[];
  constructor() {
    this.recursos = [];
  }

  getRecurso(nombre: string): TRecursoMalla | undefined {
    var rec: TRecursoMalla | undefined = this.recursos.find(
      (recurso) => recurso.getNombre() === nombre
    );
    if (rec === undefined) {
      rec = new TRecursoMalla(nombre, 0, 0, 0);
      rec.cargarFichero(nombre);
      this.recursos.push(rec);
    }
    return rec;
  }
}
