import TEntidad from '../entidades/TEntidad';

export default class TNodo {
  hijos: TNodo[] = [];
  padre: TNodo | null = null;
  entidad: TEntidad | undefined;
  pos: [number, number, number] = [0, 0, 0];
  traslacion: [number, number, number] = [0, 0, 0];
  rotacion: [number, number, number] = [0, 0, 0];
  escalado: [number, number, number] = [1, 1, 1];
  matriz: number[] = [];

  addChild(nodo: TNodo) {
    nodo.padre = this;
    this.hijos.push(nodo);
  }

  removeChild(nodo: TNodo) {
    const index = this.hijos.indexOf(nodo);
    if (index > -1) {
      this.hijos.splice(index, 1);
    }
  }

  setEntidad(entidad: TEntidad) {
    this.entidad = entidad;
  }

  getEntidad(): TEntidad | undefined {
    return this.entidad;
  }

  getPadre(): TNodo | null {
    return this.padre;
  }

  setTraslacion(traslacion: [number, number, number]) {
    this.traslacion = traslacion;
  }

  setRotacion(rotacion: [number, number, number]) {
    this.rotacion = rotacion;
  }

  setEscalado(escalado: [number, number, number]) {
    this.escalado = escalado;
  }

  trasladar(traslacion: [number, number, number]) {
    this.traslacion[0] += traslacion[0];
    this.traslacion[1] += traslacion[1];
    this.traslacion[2] += traslacion[2];
  }

  rotar(rotacion: [number, number, number]) {
    this.rotacion[0] += rotacion[0];
    this.rotacion[1] += rotacion[1];
    this.rotacion[2] += rotacion[2];
  }

  escalar(escalado: [number, number, number]) {
    this.escalado[0] *= escalado[0];
    this.escalado[1] *= escalado[1];
    this.escalado[2] *= escalado[2];
  }

  getTraslacion(): [number, number, number] {
    return this.traslacion;
  }

  getRotacion(): [number, number, number] {
    return this.rotacion;
  }

  getEscalado(): [number, number, number] {
    return this.escalado;
  }

  setMatrizTransformacion(matriz: number[]) {
    this.matriz = matriz;
  }

  getMatrizTransformacion(): number[] {
    return this.matriz;
  }

  public update() {
    console.log('Updating node at position', this.pos);
    this.hijos.forEach((hijo) => hijo.update());
  }

  public render(gl: WebGLRenderingContext) {
    console.log('Rendering node at position', this.pos);
    // this.entidad?.dibujar(gl);
    this.hijos.forEach((hijo) => hijo.render(gl));
  }
}
