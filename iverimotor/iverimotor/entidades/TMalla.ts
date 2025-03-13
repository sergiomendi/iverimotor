import TEntidad from './TEntidad';
import { mat4 } from 'gl-matrix';

export default class TMalla extends TEntidad {
  private vertexBuffer: WebGLBuffer | null = null; // Buffer para los vértices
  private indexBuffer: WebGLBuffer | null = null; // Buffer para los índices (si es necesario)
  private shaderProgram: WebGLProgram | null = null; // Shader program

  constructor() {
    super();
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

    this.shaderProgram = this.crearShaderProgram(gl);
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

  private crearShaderProgram(gl: WebGLRenderingContext): WebGLProgram | null {
    const vertexShaderSource = `
    attribute vec3 aPosition;
    uniform mat4 uModelMatrix;
    void main() {
      gl_Position = uModelMatrix * vec4(aPosition, 1.0);
    }
  `;

    const fragmentShaderSource = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Color blanco
    }
  `;

    const vertexShader = this.compilarShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.compilarShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) {
      return null;
    }

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(
        'No se pudo enlazar el shader program: ' +
          gl.getProgramInfoLog(shaderProgram)
      );
      return null;
    }

    return shaderProgram;
  }

  // Método para compilar un shader
  private compilarShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        'Error al compilar el shader: ' + gl.getShaderInfoLog(shader)
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
}
