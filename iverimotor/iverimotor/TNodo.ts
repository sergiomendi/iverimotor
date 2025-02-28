export default class TNodo {
  hijos: TNodo[] = [];
  padre: TNodo | null = null;
  pos: [number, number, number] = [0, 0, 0];

  addChild(nodo: TNodo) {
    nodo.padre = this;
    this.hijos.push(nodo);
  }

  public update() {
    console.log('Updating node at position', this.pos);
    this.hijos.forEach((hijo) => hijo.update());
  }

  public render(gl: WebGLRenderingContext) {
    console.log('Rendering node at position', this.pos);
    gl.drawArrays(gl.TRIANGLES, 0, 3); // Dibujar triángulo
    this.hijos.forEach((hijo) => hijo.render(gl));
  }
}
