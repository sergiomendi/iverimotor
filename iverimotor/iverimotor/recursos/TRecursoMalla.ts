import TRecurso from './TRecurso';

export default class TRecursoMalla extends TRecurso {
  public vertexBuffer: WebGLBuffer | null = null;
  public normalBuffer: WebGLBuffer | null = null;
  public textureCoordBuffer: WebGLBuffer | null = null;
  public indexBuffer: WebGLBuffer | null = null;
  public vertices: number[] = [];
  public normales: number[] = [];
  public texCoords: number[] = [];
  public indices: number[] = [];
  private fichero: string;

  constructor(nombre: string, fichero: string) {
    super(nombre);
    this.fichero = fichero;
  }

  // Método para cargar el archivo OBJ
  public async cargarFichero(): Promise<void> {
    try {
      console.log(`Cargando archivo ${this.fichero}...`);
      const respuesta = await fetch(this.fichero);
      const texto = await respuesta.text();
      this.procesarOBJ(texto);
    } catch (error) {
      console.error(`Error al cargar el archivo ${this.fichero}:`, error);
    }
  }

  // Procesa el contenido de un archivo OBJ
  private procesarOBJ(objTexto: string): void {
    const posiciones: number[][] = [];
    const normales: number[][] = [];
    const texCoords: number[][] = [];
    const indexMap = new Map<string, number>();
    let indexCount = 0;

    const lineas = objTexto.split('\n');

    for (const linea of lineas) {
      const partes = linea.trim().split(/\s+/);
      if (partes.length === 0) continue;

      switch (partes[0]) {
        case 'v': // Vértices
          posiciones.push([
            parseFloat(partes[1]),
            parseFloat(partes[2]),
            parseFloat(partes[3]),
          ]);
          break;
        case 'vt': // Coordenadas de textura
          texCoords.push([parseFloat(partes[1]), parseFloat(partes[2])]);
          break;
        case 'vn': // Normales
          normales.push([
            parseFloat(partes[1]),
            parseFloat(partes[2]),
            parseFloat(partes[3]),
          ]);
          break;
        case 'f': // Caras (triángulos o quads)
          for (let i = 1; i <= 3; i++) {
            const key = partes[i];
            if (!indexMap.has(key)) {
              const indices = key.split('/').map((x) => parseInt(x, 10) - 1);
              const [posIdx, texIdx, normIdx] = indices;

              this.vertices.push(...posiciones[posIdx]);
              if (texIdx >= 0) this.texCoords.push(...texCoords[texIdx]);
              if (normIdx >= 0) this.normales.push(...normales[normIdx]);

              indexMap.set(key, indexCount);
              this.indices.push(indexCount);
              indexCount++;
            } else {
              this.indices.push(indexMap.get(key)!);
            }
          }
          break;
      }
    }
  }

  // Inicializa buffers en WebGL
  public inicializarBuffers(gl: WebGLRenderingContext): void {
    // Buffer de vértices
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      gl.STATIC_DRAW
    );

    // Buffer de normales
    if (this.normales.length > 0) {
      this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.normales),
        gl.STATIC_DRAW
      );
    }

    // Buffer de coordenadas de textura
    if (this.texCoords.length > 0) {
      this.textureCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.texCoords),
        gl.STATIC_DRAW
      );
    }

    // Buffer de índices
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indices),
      gl.STATIC_DRAW
    );
  }
}
