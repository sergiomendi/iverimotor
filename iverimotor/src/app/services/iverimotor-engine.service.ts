import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import TCamara from '../../../iverimotor/entidades/TCamara';
import TLuz from '../../../iverimotor/entidades/TLuz';
import TNodo from '../../../iverimotor/nodos/TNodo';
import TMalla from '../../../iverimotor/entidades/TMalla';
import TEntidad from '../../../iverimotor/entidades/TEntidad';
import TGestorRecursos from '../../../iverimotor/recursos/TGestorRecursos';
import { mat4, vec3 } from 'gl-matrix';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private gl!: WebGLRenderingContext;
  private frameId!: number;
  public nodoRaiz = new TNodo();
  private gestorRecursos = new TGestorRecursos();

  constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }

  public crearNodo(
    padre: TNodo,
    entidad: TEntidad,
    traslacion: vec3,
    escalado: vec3,
    rotacion: vec3
  ): TNodo {
    const nodo = new TNodo(entidad);
    padre.addChild(nodo);
    nodo.traslacion = traslacion;
    nodo.escalado = escalado;
    nodo.rotacion = rotacion;
    nodo.actualizarMatriz = true;
    return nodo;
  }

  public crearCamara(): TCamara {
    const tCamara = new TCamara();
    return tCamara;
  }

  public crearLuz(): TLuz {
    const tLuz = new TLuz();
    return tLuz;
  }

  public crearMalla(fichero: string): TMalla {
    const tMalla = new TMalla();
    tMalla.cargarMalla(this.gestorRecursos.getRecurso(fichero));
    return tMalla;
  }

  public crearEscena(canvas: ElementRef<HTMLCanvasElement>): void {
    // Contexto WebGL al Canvas
    this.gl = canvas.nativeElement.getContext('webgl')!;
    if (!this.gl) return console.error('WebGL no soportado');

    this.gl.clearColor(0, 0, 0, 1);

    // Animar
    this.animate();
  }

  private animate() {
    this.frameId = requestAnimationFrame(() => this.animate());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    const matrizInicial = mat4.create();
    this.nodoRaiz.render(matrizInicial);
  }
}
