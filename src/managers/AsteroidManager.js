import * as THREE from 'three';
import { Asteroid } from '../entities/Asteroid.js';

export class AsteroidManager {
    constructor(scene, ship) {
        this.scene = scene;
        this.ship = ship;
        this.asteroids = [];
        this.spawnInterval = null;
        this.spawnDelay = 2000;
        this.active = true;
    }
    
    startSpawning(intervalMs = 2000) {
        this.spawnDelay = intervalMs;
        for (let i = 0; i < 5; i++) setTimeout(() => this.spawnAsteroid(), i * 300);
        this.spawnInterval = setInterval(() => { if (this.active) this.spawnAsteroid(); }, this.spawnDelay);
    }
    
    spawnAsteroid() {
        const playerPos = this.ship ? this.ship.getPosition() : new THREE.Vector3(0, 0, 0);
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI * 2;
        const distance = 35 + Math.random() * 40;
        const spawnPos = new THREE.Vector3(
            playerPos.x + Math.sin(angle1) * Math.cos(angle2) * distance,
            playerPos.y + (Math.random() - 0.5) * 20,
            playerPos.z + Math.cos(angle1) * Math.cos(angle2) * distance
        );
        const asteroid = new Asteroid(0.5 + Math.random() * 0.8, spawnPos);
        this.scene.add(asteroid.mesh);
        this.asteroids.push(asteroid);
    }
    
    updateCollisions() {
        if (!this.ship || !this.ship.mesh) return;
        const shipPos = this.ship.getPosition();
        const shipRadius = 1.2;
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            const distance = shipPos.distanceTo(asteroid.mesh.position);
            if (distance < shipRadius + this.asteroids[i].size * 0.7) {
                this.onCollision(asteroid);
                this.removeAsteroid(i);
            }
        }
    }
    
    onCollision(asteroid) {
        const explosionGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const explosionMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        const explosion = new THREE.Mesh(explosionGeo, explosionMat);
        explosion.position.copy(asteroid.mesh.position);
        this.scene.add(explosion);
        let scale = 1;
        const animate = () => {
            scale += 0.2;
            explosion.scale.set(scale, scale, scale);
            if (scale < 2.5) requestAnimationFrame(animate);
            else this.scene.remove(explosion);
        };
        requestAnimationFrame(animate);
    }
    
    removeAsteroid(index) {
        const asteroid = this.asteroids[index];
        if (asteroid && asteroid.mesh) {
            this.scene.remove(asteroid.mesh);
            if (asteroid.mesh.geometry) asteroid.mesh.geometry.dispose();
            if (asteroid.mesh.material) asteroid.mesh.material.dispose();
        }
        this.asteroids.splice(index, 1);
    }
    
    updatePositions(delta) {
        for (const asteroid of this.asteroids) asteroid.update(delta);
    }
    
    setSpeed(speed) {
        for (const asteroid of this.asteroids) {
            const dir = asteroid.speed.clone().normalize();
            asteroid.speed = dir.multiplyScalar(speed);
        }
    }
} 
