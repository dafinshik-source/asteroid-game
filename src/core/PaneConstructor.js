import * as THREE from 'three';

export class PaneConstructor {
    constructor() {
        this.pane = null;
        this.settings = { cameraSpeed: 20, asteroidSpeed: 3, fogDensity: 0.0005, backgroundColor: '#050b1a' };
        this.initPane();
    }
    
    async initPane() {
        const Tweakpane = await import('https://unpkg.com/tweakpane@4.0.0/dist/tweakpane.min.js');
        this.pane = new Tweakpane.Pane({ title: 'Настройки игры', expanded: true });
        this.folders = {};
    }
    
    createFolder(name) {
        if (!this.folders[name] && this.pane) {
            this.folders[name] = this.pane.addFolder({ title: name, expanded: false });
        }
        return this.folders[name];
    }
    
    addCameraControls(camera) {
        if (!this.pane) return;
        const folder = this.createFolder('Камера');
        folder.addBinding(this.settings, 'cameraSpeed', { min: 5, max: 50, step: 1, label: 'Скорость' }).on('change', (ev) => {
            if (window.cameraManager) window.cameraManager.moveSpeed = ev.value;
        });
        const posFolder = folder.addFolder({ title: 'Позиция' });
        posFolder.addBinding(camera.position, 'x', { min: -50, max: 50, step: 0.1, label: 'X' });
        posFolder.addBinding(camera.position, 'y', { min: -20, max: 30, step: 0.1, label: 'Y' });
        posFolder.addBinding(camera.position, 'z', { min: -50, max: 50, step: 0.1, label: 'Z' });
        folder.addButton({ title: 'Сбросить' }).on('click', () => { if (window.cameraManager) window.cameraManager.resetCamera(); });
    }
    
    addSceneControls(scene) {
        if (!this.pane) return;
        const folder = this.createFolder('Сцена');
        folder.addBinding(this.settings, 'backgroundColor').on('change', (ev) => { scene.background = new THREE.Color(ev.value); });
        folder.addBinding(this.settings, 'fogDensity', { min: 0, max: 0.01, step: 0.0001 }).on('change', (ev) => { if (scene.fog) scene.fog.density = ev.value; });
        const asteroidFolder = folder.addFolder({ title: 'Астероиды' });
        asteroidFolder.addBinding(this.settings, 'asteroidSpeed', { min: 1, max: 10, step: 0.5 }).on('change', (ev) => {
            if (window.asteroidManager) window.asteroidManager.setSpeed(ev.value);
        });
    }
    
    update() {}
} 
