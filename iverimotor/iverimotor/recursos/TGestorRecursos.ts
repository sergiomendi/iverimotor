import TRecurso from './TRecurso';

export default class TGestorRecursos {
  recursos: TRecurso[];
  constructor() {
    this.recursos = [];
  }

  getRecurso(nombre: string): TRecurso | undefined {
    var rec: TRecurso | undefined = this.recursos.find(
      (recurso) => recurso.getNombre() === nombre
    );
    if (rec === undefined) {
      rec = new TRecurso(nombre);
      rec.cargarFichero(nombre);
      this.recursos.push(rec);
    }
    return rec;
  }
}
