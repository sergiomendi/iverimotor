import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { EngineService } from '../../services/iverimotor-engine.service';
import { vec3 } from 'gl-matrix';

@Component({
  selector: 'mapa-component',
  standalone: true,
  templateUrl: './mapa.component.html',
})
export class MapaComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) {}

  public async ngOnInit(): Promise<void> {
    this.engServ.crearEscena(this.rendererCanvas);
    await this.dibujarMapa();
    console.log(
      'Hijos creados a la escena:',
      this.engServ.nodoRaiz.hijos.length
    );
  }

  public async dibujarMapa(): Promise<void> {
    // Crear entidades cámara, luz y malla
    const camara = this.engServ.crearCamara();
    const luz = this.engServ.crearLuz();
    const mapa = await this.engServ.crearMalla(
      'mapa',
      'assets/FinalBaseMesh.obj'
    );

    // Crear nodos y añadir la malla, cámara y luz a la escena
    this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      mapa,
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );

    this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      camara,
      vec3.fromValues(0, 0, 5), // Posición de la cámara
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );

    this.engServ.crearNodo(
      this.engServ.nodoRaiz,
      luz,
      vec3.fromValues(0, 5, 0), // Posición de la luz
      vec3.fromValues(1, 1, 1),
      vec3.fromValues(0, 0, 0)
    );
  }
}
