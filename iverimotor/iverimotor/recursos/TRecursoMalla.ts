import { mat4 } from 'gl-matrix';
import TRecurso from './TRecurso';

export default class TRecursoMalla extends TRecurso {
  vertices: number[] = []; // Array de vértices (x, y, z)
  normales: number[] = []; // Array de normales (x, y, z)
  coordTexturas: number[] = []; // Array de coordenadas de textura (u, v)
  indices: number[] = []; // Array de índices para renderizar la malla

  // Buffers de WebGL
  private vertexBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private textureCoordBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  // Shader program
  private shaderProgram: WebGLProgram | null = null;

  constructor(nombre: string) {
    super(nombre);
  }

  // Método para cargar un archivo .obj
  async cargarFichero(fichero: string): Promise<void> {
    try {
      const response = await fetch(fichero);
      const data = await response.text();
      console.log('Datos del archivo .obj:', data); // Depuración
      this.procesarDatosOBJ(data); // Procesar el archivo .obj
      console.log('Malla cargada correctamente:', this.nombre);
    } catch (error) {
      console.error('Error al cargar el archivo .obj:', error);
    }
  }

  // Método para procesar los datos de un archivo .obj
  private procesarDatosOBJ(data: string): void {
    const lines = data.split('\n');
    const tempVertices: number[] = [];
    const tempNormales: number[] = [];
    const tempTexturas: number[] = [];
    const tempIndices: number[] = [];

    lines.forEach((line) => {
      if (line.startsWith('v ')) {
        // Procesar vértices (v x y z)
        const parts = line.split(' ').map(parseFloat);
        tempVertices.push(parts[1], parts[2], parts[3]);
      } else if (line.startsWith('vn ')) {
        // Procesar normales (vn x y z)
        const parts = line.split(' ').map(parseFloat);
        tempNormales.push(parts[1], parts[2], parts[3]);
      } else if (line.startsWith('vt ')) {
        // Procesar coordenadas de textura (vt u v)
        const parts = line.split(' ').map(parseFloat);
        tempTexturas.push(parts[1], parts[2]);
      } else if (line.startsWith('f ')) {
        // Procesar caras (f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3)
        const parts = line.split(' ');
        for (let i = 1; i < parts.length; i++) {
          const vertexIndices = parts[i].split('/');
          const vertexIndex = parseInt(vertexIndices[0]) - 1; // Índice de vértice
          const textureIndex = parseInt(vertexIndices[1]) - 1; // Índice de textura
          const normalIndex = parseInt(vertexIndices[2]) - 1; // Índice de normal

          // Agregar índices
          tempIndices.push(vertexIndex);

          // Agregar vértices, normales y coordenadas de textura en el orden correcto
          this.vertices.push(
            tempVertices[vertexIndex * 3],
            tempVertices[vertexIndex * 3 + 1],
            tempVertices[vertexIndex * 3 + 2]
          );
          this.normales.push(
            tempNormales[normalIndex * 3],
            tempNormales[normalIndex * 3 + 1],
            tempNormales[normalIndex * 3 + 2]
          );
          this.coordTexturas.push(
            tempTexturas[textureIndex * 2],
            tempTexturas[textureIndex * 2 + 1]
          );
        }
      }
    });

    this.indices = tempIndices;
    console.log('Datos de la malla procesados:', {
      vertices: this.vertices,
      normales: this.normales,
      coordTexturas: this.coordTexturas,
      indices: this.indices,
    }); // Depuración
  }

  // Método para inicializar los buffers de WebGL
  inicializarBuffers(gl: WebGLRenderingContext): void {
    // Crear y configurar el buffer de vértices
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      gl.STATIC_DRAW
    );
    console.log('Buffer de vértices inicializado:', this.vertexBuffer); // Depuración

    // Crear y configurar el buffer de normales
    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.normales),
      gl.STATIC_DRAW
    );
    console.log('Buffer de normales inicializado:', this.normalBuffer); // Depuración

    // Crear y configurar el buffer de coordenadas de textura
    this.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.coordTexturas),
      gl.STATIC_DRAW
    );
    console.log(
      'Buffer de coordenadas de textura inicializado:',
      this.textureCoordBuffer
    ); // Depuración

    // Crear y configurar el buffer de índices
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indices),
      gl.STATIC_DRAW
    );
    console.log('Buffer de índices inicializado:', this.indexBuffer); // Depuración

    console.log('Buffers de WebGL inicializados');
  }
  private initShaders(gl: WebGLRenderingContext): void {
    const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTextureCoord;
    uniform mat4 uModelMatrix;
    void main(void) {
      gl_Position = uModelMatrix * vec4(aPosition, 1.0);
    }
  `;

    const fragmentShaderSource = `
    precision mediump float;
    void main(void) {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Color rojo
    }
  `;

    const vertexShader = this.createShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this.shaderProgram = this.createProgram(gl, vertexShader, fragmentShader);
  }

  private createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compilando shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Shader compilation failed');
    }
    return shader;
  }

  private createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linkeando programa:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      throw new Error('Program linking failed');
    }
    return program;
  }
  // Método para dibujar la malla
  dibujar(gl: WebGLRenderingContext, matrizModelo: mat4): void {
    console.log(this.vertexBuffer);
    if (
      !this.shaderProgram ||
      !this.vertexBuffer ||
      !this.normalBuffer ||
      !this.textureCoordBuffer ||
      !this.indexBuffer
    ) {
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
    gl.uniformMatrix4fv(uModelMatrix, false, matrizModelo);

    // Configurar el buffer de vértices
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    const aPosition = gl.getAttribLocation(this.shaderProgram, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    // Configurar el buffer de normales
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    const aNormal = gl.getAttribLocation(this.shaderProgram, 'aNormal');
    gl.enableVertexAttribArray(aNormal);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    // Configurar el buffer de coordenadas de textura
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    const aTextureCoord = gl.getAttribLocation(
      this.shaderProgram,
      'aTextureCoord'
    );
    gl.enableVertexAttribArray(aTextureCoord);
    gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);

    // Configurar el buffer de índices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    // Dibujar la malla
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
