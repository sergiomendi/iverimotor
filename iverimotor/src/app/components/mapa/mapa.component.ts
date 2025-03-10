import { Component, ElementRef, ViewChild } from '@angular/core';
import { EngineService } from '../../services/iverimotor-engine.service';
import * as Iverimotor from '../../../../iverimotor/iverimotor';
import { vec3 } from 'gl-matrix';

@Component({
  selector: 'mapa-component',
  standalone: true,
  templateUrl: './mapa.component.html',
})
export class MapaComponent {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) {}

  public ngOnInit(): void {
    this.engServ.crearEscena(this.rendererCanvas);
  }

  public dibujarMapa(): void {
    const camara: Iverimotor.TCamara = this.engServ.crearCamara();
    const luz: Iverimotor.TLuz = this.engServ.crearLuz();
    const mapa: Iverimotor.TMalla = this.engServ.crearMalla(
      'peninsula_iberica_europa.glb'
    );

    const nMalla: Iverimotor.TNodo = this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      mapa,
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );

    const nCamara: Iverimotor.TNodo = this.engServ.crearNodo(
      nMalla,
      camara,
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );

    const nLuz: Iverimotor.TNodo = this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      luz,
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );
  }
}
