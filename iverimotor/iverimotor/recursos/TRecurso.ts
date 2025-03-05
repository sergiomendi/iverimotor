export default class TRecurso {
  nombre: string;
  constructor(nombre: string) {
    this.nombre = nombre;
  }
  getNombre(): string {
    return this.nombre;
  }
  setNombre(nombre: string): void {
    this.nombre = nombre;
  }
  cargarFichero(fichero: string): void {}
}
