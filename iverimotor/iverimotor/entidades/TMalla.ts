import TEntidad from './TEntidad';
import { mat4 } from 'gl-matrix';

export default class TMalla extends TEntidad {
  private vertexBuffer: WebGLBuffer | null = null; // Buffer para los vértices
  private indexBuffer: WebGLBuffer | null = null; // Buffer para los índices (si es necesario)
  private shaderProgram: WebGLProgram; // Shader program

  constructor(shaderProgram: WebGLProgram) {
    super();
    this.shaderProgram = shaderProgram;
  }

  // Método para inicializar la malla (en este caso, un triángulo)
  public inicializar(gl: WebGLRenderingContext): void {
    // Definir los vértices del triángulo (coordenadas x, y, z)
    const vertices = new Float32Array([
      0.0,
      1.0,
      0.0, // Vértice superior
      -1.0,
      -1.0,
      0.0, // Vértice inferior izquierdo
      1.0,
      -1.0,
      0.0, // Vértice inferior derecho
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  public dibujar(gl: WebGLRenderingContext, matrizTransformacion: mat4): void {
    if (!this.vertexBuffer || !this.shaderProgram) {
      console.error('La malla no está inicializada correctamente.');
      return;
    }

    // Usar el shader program
    gl.useProgram(this.shaderProgram);

    // Configurar la matriz de modelo
    const uModelMatrix = gl.getUniformLocation(
      this.shaderProgram,
      'uModelMatrix'
    );
    if (uModelMatrix === null) {
      console.error(
        'No se pudo encontrar el uniform uModelMatrix en el shader.'
      );
      return;
    }
    gl.uniformMatrix4fv(uModelMatrix, false, matrizTransformacion);

    // Configurar el buffer de vértices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    // Obtener la ubicación del atributo de posición en el shader
    const aPosition = gl.getAttribLocation(this.shaderProgram, 'aPosition');
    if (aPosition === -1) {
      console.error('No se pudo encontrar el atributo aPosition en el shader.');
      return;
    }

    // Habilitar y configurar el atributo de posición
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    // Dibujar el triángulo
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
