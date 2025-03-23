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
    const posiciones: number[][] = []; // Almacena los vértices (v)
    const normales: number[][] = []; // Almacena las normales (vn)
    const texCoords: number[][] = []; // Almacena las coordenadas de textura (vt)
    const indexMap = new Map<string, number>(); // Evita duplicados de vértices
    let indexCount = 0; // Contador de índices únicos

    const lineas = objTexto.split('\n'); // Divide el archivo en líneas

    for (const linea of lineas) {
      const partes = linea.trim().split(/\s+/); // Divide la línea en partes
      if (partes.length === 0 || partes[0] === '#') continue; // Ignora líneas vacías o comentarios

      switch (partes[0]) {
        case 'v': // Vértices
          if (partes.length >= 4) {
            // Asegura que hay al menos 3 coordenadas (x, y, z)
            posiciones.push([
              parseFloat(partes[1]),
              parseFloat(partes[2]),
              parseFloat(partes[3]),
            ]);
          }
          break;

        case 'vt': // Coordenadas de textura
          if (partes.length >= 3) {
            // Asegura que hay al menos 2 coordenadas (u, v)
            texCoords.push([parseFloat(partes[1]), parseFloat(partes[2])]);
          }
          break;

        case 'vn': // Normales
          if (partes.length >= 4) {
            // Asegura que hay al menos 3 coordenadas (x, y, z)
            normales.push([
              parseFloat(partes[1]),
              parseFloat(partes[2]),
              parseFloat(partes[3]),
            ]);
          }
          break;

        case 'f': // Caras (triángulos o quads)
          if (partes.length < 4) continue; // Ignora caras con menos de 3 vértices

          // Procesa cada vértice de la cara
          const indicesCara = partes.slice(1).map((vertice) => {
            const indices = vertice.split('/').map((idx) => {
              const valor = parseInt(idx, 10);
              return isNaN(valor) ? -1 : valor - 1; // Convierte a índice base 0
            });

            // Verifica si el vértice ya fue procesado
            const key = vertice;
            if (!indexMap.has(key)) {
              const [posIdx, texIdx, normIdx] = indices;

              // Añade vértice, normal y coordenadas de textura (si existen)
              this.vertices.push(...posiciones[posIdx]);
              if (texIdx >= 0 && texIdx < texCoords.length) {
                this.texCoords.push(...texCoords[texIdx]);
              }
              if (normIdx >= 0 && normIdx < normales.length) {
                this.normales.push(...normales[normIdx]);
              }

              indexMap.set(key, indexCount);
              indexCount++;
            }

            return indexMap.get(key)!;
          });

          // Divide la cara en triángulos (si es un quad o polígono)
          for (let i = 1; i < indicesCara.length - 1; i++) {
            this.indices.push(
              indicesCara[0],
              indicesCara[i],
              indicesCara[i + 1]
            );
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
