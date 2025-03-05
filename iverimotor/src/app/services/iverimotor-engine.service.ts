import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import TCamara from '../../../iverimotor/entidades/TCamara';
import TLuz from '../../../iverimotor/entidades/TLuz';
import TNodo from '../../../iverimotor/nodos/TNodo';
import TMalla from '../../../iverimotor/entidades/TMalla';
import { mat4 } from 'gl-matrix';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private gl!: WebGLRenderingContext;
  private frameId!: number;
  private nodoRaiz = new TNodo();

  constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.gl = canvas.nativeElement.getContext('webgl')!;
    if (!this.gl) return console.error('WebGL no soportado');

    this.gl.clearColor(0, 0, 0, 1);
    this.setupScene();
    this.animate();
  }

  private setupScene() {
    const nCamara = new TNodo();
    const nLuz = new TNodo();
    const nAnimal = new TNodo();

    nCamara.setEntidad(new TCamara());
    nLuz.setEntidad(new TLuz());
    nAnimal.setEntidad(new TMalla());

    this.nodoRaiz.addChild(nCamara);
    this.nodoRaiz.addChild(nLuz);
    this.nodoRaiz.addChild(nAnimal);
  }

  private animate() {
    this.frameId = requestAnimationFrame(() => this.animate());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    const matrizInicial = mat4.create();
    this.nodoRaiz.render(matrizInicial);
  }
}
