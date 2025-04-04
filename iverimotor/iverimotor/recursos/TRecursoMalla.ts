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
  public textures: WebGLTexture[] = [];
  private fichero: string;

  constructor(nombre: string, fichero: string) {
    super(nombre);
    this.fichero = fichero;
  }
  public async cargarFichero(
    gl: WebGLRenderingContext,
    shaderProgram: WebGLProgram
  ): Promise<void> {
    try {
      console.log(`Cargando archivo GLTF ${this.fichero}...`);
      const respuesta = await fetch(this.fichero);
      const gltfData = await respuesta.json();

      // Cargar el buffer binario
      const buffer = gltfData.buffers[0];
      console.log('Buffer:', buffer.uri);
      const bufferResponse = await fetch(`assets/${this.nombre}/${buffer.uri}`);
      const bufferData = await bufferResponse.arrayBuffer();

      // Cargar texturas
      const textures = await this.cargarTexturas(gl, gltfData);

      // Procesar el archivo GLTF
      await this.procesarGLTF(gltfData, bufferData);

      // Configurar materiales
      if (gltfData.materials) {
        for (const materialDef of gltfData.materials) {
          this.configurarMaterial(gl, shaderProgram, materialDef, textures);
        }
      }
    } catch (error) {
      console.error(`Error al cargar el archivo GLTF ${this.fichero}:`, error);
    }
  }

  private async procesarGLTF(
    gltfData: any,
    bufferData: ArrayBuffer
  ): Promise<void> {
    const bufferViews = gltfData.bufferViews;
    const accessors = gltfData.accessors;

    // Limpiar datos existentes
    this.vertices = [];
    this.normales = [];
    this.texCoords = [];
    this.indices = [];

    // Procesar todas las mallas
    for (const mesh of gltfData.meshes || []) {
      for (const primitive of mesh.primitives) {
        // Procesar vértices (POSITION)
        if (primitive.attributes.POSITION !== undefined) {
          const { buffer, byteOffset, count } = this.obtenerDatosBuffer(
            accessors[primitive.attributes.POSITION],
            bufferViews,
            bufferData
          );
          this.vertices = Array.from(
            new Float32Array(buffer, byteOffset, count * 3)
          );
        }

        // Procesar normales (NORMAL)
        if (primitive.attributes.NORMAL !== undefined) {
          const { buffer, byteOffset, count } = this.obtenerDatosBuffer(
            accessors[primitive.attributes.NORMAL],
            bufferViews,
            bufferData
          );
          this.normales = Array.from(
            new Float32Array(buffer, byteOffset, count * 3)
          );
        }

        // Procesar coordenadas de textura (usar TEXCOORD_0 como principal)
        const texCoordKey = Object.keys(primitive.attributes).find((k) =>
          k.startsWith('TEXCOORD_')
        );
        if (texCoordKey) {
          const { buffer, byteOffset, count } = this.obtenerDatosBuffer(
            accessors[primitive.attributes[texCoordKey]],
            bufferViews,
            bufferData
          );
          this.texCoords = Array.from(
            new Float32Array(buffer, byteOffset, count * 2)
          );
        }

        // Procesar índices
        if (primitive.indices !== undefined) {
          const indicesAccessor = accessors[primitive.indices];
          const { buffer, byteOffset, count } = this.obtenerDatosBuffer(
            indicesAccessor,
            bufferViews,
            bufferData
          );

          switch (indicesAccessor.componentType) {
            case 5121:
              this.indices = Array.from(
                new Uint8Array(buffer, byteOffset, count)
              );
              break;
            case 5123:
              this.indices = Array.from(
                new Uint16Array(buffer, byteOffset, count)
              );
              break;
            case 5125:
              this.indices = Array.from(
                new Uint32Array(buffer, byteOffset, count)
              );
              break;
            default:
              console.error('Tipo de índice no soportado');
          }
        }
      }
    }
  }

  // Método auxiliar para obtener datos del buffer
  private obtenerDatosBuffer(
    accessor: any,
    bufferViews: any[],
    bufferData: ArrayBuffer
  ) {
    const bufferView = bufferViews[accessor.bufferView];
    const byteOffset =
      (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    return {
      buffer: bufferData,
      byteOffset,
      count: accessor.count,
    };
  }

  public inicializarBuffers(gl: WebGLRenderingContext): void {
    // Buffer de vértices
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.vertices),
      gl.STATIC_DRAW
    );

    // Buffer de coordenadas de textura (si existen)
    if (this.texCoords.length > 0) {
      this.textureCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.texCoords),
        gl.STATIC_DRAW
      );
    }

    // Buffer de normales (si existen)
    if (this.normales.length > 0) {
      this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(this.normales),
        gl.STATIC_DRAW
      );
    }

    // Buffer de índices (si existen)
    if (this.indices.length > 0) {
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(this.indices),
        gl.STATIC_DRAW
      );
    }
  }

  private async cargarTexturas(
    gl: WebGLRenderingContext,
    gltfData: any
  ): Promise<WebGLTexture[]> {
    const textures: WebGLTexture[] = [];

    if (!gltfData.images || !gltfData.textures) {
      console.warn('El archivo GLTF no contiene imágenes o texturas.');
      return textures;
    }

    for (const textureDef of gltfData.textures) {
      const imageDef = gltfData.images[textureDef.source];

      // Cargar la imagen
      const image = await this.cargarImagen(
        `assets/${this.nombre}/${imageDef.uri}`
      );

      // Crear la textura en WebGL
      const texture = gl.createTexture();
      if (!texture) {
        console.error('No se pudo crear la textura en WebGL.');
        continue;
      }

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
      gl.generateMipmap(gl.TEXTURE_2D);

      // Configurar parámetros de la textura
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

      textures.push(texture);
    }

    return textures;
  }

  private cargarImagen(uri: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = uri;
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
    });
  }

  private configurarMaterial(
    gl: WebGLRenderingContext,
    shaderProgram: WebGLProgram,
    materialDef: any,
    textures: WebGLTexture[]
  ): void {
    if (materialDef.pbrMetallicRoughness) {
      const pbr = materialDef.pbrMetallicRoughness;

      // Configurar la textura de color base
      if (pbr.baseColorTexture !== undefined) {
        const textureIndex = pbr.baseColorTexture.index;
        const texture = textures[textureIndex];

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const uBaseColorTexture = gl.getUniformLocation(
          shaderProgram,
          'uBaseColorTexture'
        );
        if (uBaseColorTexture) {
          gl.uniform1i(uBaseColorTexture, 0); // TEXTURE0
        }
      }

      // Configurar la textura de metalicidad y rugosidad
      if (pbr.metallicRoughnessTexture !== undefined) {
        const textureIndex = pbr.metallicRoughnessTexture.index;
        const texture = textures[textureIndex];

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const uMetallicRoughnessTexture = gl.getUniformLocation(
          shaderProgram,
          'uMetallicRoughnessTexture'
        );
        if (uMetallicRoughnessTexture) {
          gl.uniform1i(uMetallicRoughnessTexture, 1); // TEXTURE1
        }
      }
    }
  }
}
