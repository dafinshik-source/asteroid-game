import * as THREE from 'three';

export class Ship {
    constructor() {
        this.mesh = null;
        this.position = new THREE.Vector3(0, 0, 0);
    }
    
    init() {
        const group = new THREE.Group();
        const bodyGeo = new THREE.ConeGeometry(0.8, 1.5, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x33aaff, metalness: 0.8 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = Math.PI / 2;
        group.add(body);
        
        const wingGeo = new THREE.BoxGeometry(1.5, 0.1, 0.8);
        const wings = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({ color: 0x2288cc }));
        wings.position.y = -0.3;
        group.add(wings);
        
        const noseGeo = new THREE.ConeGeometry(0.4, 0.8, 6);
        const nose = new THREE.Mesh(noseGeo, new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0x441100 }));
        nose.position.z = 0.8;
        nose.position.y = 0.1;
        group.add(nose);
        
        this.mesh = group;
        this.mesh.castShadow = true;
    }
    
    updatePosition(newPosition) {
        if (this.mesh) this.mesh.position.copy(newPosition);
        this.position.copy(newPosition);
    }
    
    getPosition() {
        return this.mesh ? this.mesh.position : this.position;
    }
} 
