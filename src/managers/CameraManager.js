import * as THREE from 'three';

export class CameraManager {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.moveSpeed = 20;
        this.lookSpeed = 0.002;
        this.shakeIntensity = 0;
        this.originalPosition = camera.position.clone();
        this.keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, Space: false, ShiftLeft: false };
    }
    
    initFlyControls() {
        window.addEventListener('keydown', (e) => { if (this.keys.hasOwnProperty(e.code)) this.keys[e.code] = true; });
        window.addEventListener('keyup', (e) => { if (this.keys.hasOwnProperty(e.code)) this.keys[e.code] = false; });
        
        let mouseDown = false;
        this.domElement.addEventListener('mousedown', () => { mouseDown = true; this.domElement.style.cursor = 'grabbing'; });
        window.addEventListener('mouseup', () => { mouseDown = false; this.domElement.style.cursor = 'default'; });
        window.addEventListener('mousemove', (e) => {
            if (mouseDown) {
                this.camera.rotation.order = 'YXZ';
                this.camera.rotation.y -= (e.movementX || 0) * this.lookSpeed;
                this.camera.rotation.x -= (e.movementY || 0) * this.lookSpeed;
                this.camera.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.camera.rotation.x));
            }
        });
    }
    
    update(delta) {
        const speed = this.moveSpeed * delta;
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        right.crossVectors(new THREE.Vector3(0, 1, 0), forward);
        right.normalize();
        
        let moveDelta = new THREE.Vector3(0, 0, 0);
        if (this.keys.KeyW) moveDelta.addScaledVector(forward, speed);
        if (this.keys.KeyS) moveDelta.addScaledVector(forward, -speed);
        if (this.keys.KeyD) moveDelta.addScaledVector(right, speed);
        if (this.keys.KeyA) moveDelta.addScaledVector(right, -speed);
        if (this.keys.Space) moveDelta.y += speed;
        if (this.keys.ShiftLeft) moveDelta.y -= speed;
        this.camera.position.add(moveDelta);
        
        if (this.shakeIntensity > 0) {
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= 0.95;
            if (this.shakeIntensity < 0.01) this.shakeIntensity = 0;
        }
    }
    
    shake(intensity = 0.5) { this.shakeIntensity = intensity; }
    resetCamera() { this.camera.position.copy(this.originalPosition); this.camera.rotation.set(0, 0, 0); }
} 
