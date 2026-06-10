import * as THREE from 'three';

export class Asteroid {
    constructor(size = 1, position = null) {
        this.size = size;
        this.speed = new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 4);
        this.rotationSpeed = new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
        this.position = position || new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 80 - 40);
        this.createMesh();
    }
    
    createMesh() {
        const geometry = new THREE.DodecahedronGeometry(this.size, 0);
        const material = new THREE.MeshStandardMaterial({ color: 0xaa8866, roughness: 0.7, metalness: 0.1 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        const scale = 0.7 + Math.random() * 0.8;
        this.mesh.scale.set(scale, scale, scale);
    }
    
    update(delta) {
        if (!this.mesh) return;
        this.mesh.position.x += this.speed.x * delta;
        this.mesh.position.y += this.speed.y * delta;
        this.mesh.position.z += this.speed.z * delta;
        this.mesh.rotation.x += this.rotationSpeed.x;
        this.mesh.rotation.y += this.rotationSpeed.y;
        this.mesh.rotation.z += this.rotationSpeed.z;
        this.position.copy(this.mesh.position);
        
        // Телепортация
        if (this.mesh.position.x > 80) this.mesh.position.x = -80;
        if (this.mesh.position.x < -80) this.mesh.position.x = 80;
        if (this.mesh.position.z > 60) this.mesh.position.z = -60;
        if (this.mesh.position.z < -60) this.mesh.position.z = 60;
        if (this.mesh.position.y > 40) this.mesh.position.y = -40;
        if (this.mesh.position.y < -40) this.mesh.position.y = 40;
    }
} 
