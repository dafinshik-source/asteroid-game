import * as THREE from 'three';

// КЛАСС КОРАБЛЯ
class Ship {
    constructor() {
        this.mesh = null;
    }
    
    init() {
        const group = new THREE.Group();
        
        const bodyGeo = new THREE.ConeGeometry(0.8, 1.5, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x33aaff, metalness: 0.8 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = Math.PI / 2;
        group.add(body);
        
        const wingGeo = new THREE.BoxGeometry(1.5, 0.1, 0.8);
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x2288cc });
        const wings = new THREE.Mesh(wingGeo, wingMat);
        wings.position.y = -0.3;
        group.add(wings);
        
        const noseGeo = new THREE.ConeGeometry(0.4, 0.8, 6);
        const noseMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.z = 0.8;
        nose.position.y = 0.1;
        group.add(nose);
        
        this.mesh = group;
        this.mesh.castShadow = true;
    }
    
    updatePosition(pos) {
        if (this.mesh) this.mesh.position.copy(pos);
    }
    
    getPosition() {
        return this.mesh ? this.mesh.position : new THREE.Vector3(0, 0, 0);
    }
}

// КЛАСС АСТЕРОИДА
class Asteroid {
    constructor(size = 0.7, position = null) {
        this.size = size;
        this.mesh = null;
        this.speed = new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 3
        );
        
        const pos = position || new THREE.Vector3(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 40 - 20
        );
        
        const geometry = new THREE.DodecahedronGeometry(this.size, 0);
        const material = new THREE.MeshStandardMaterial({ color: 0xaa8866, roughness: 0.7 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(pos);
        const scale = 0.8 + Math.random() * 0.7;
        this.mesh.scale.set(scale, scale, scale);
    }
    
    update(delta) {
        this.mesh.position.x += this.speed.x * delta;
        this.mesh.position.y += this.speed.y * delta;
        this.mesh.position.z += this.speed.z * delta;
        this.mesh.rotation.x += 0.02;
        this.mesh.rotation.y += 0.03;
        
        if (this.mesh.position.x > 70) this.mesh.position.x = -70;
        if (this.mesh.position.x < -70) this.mesh.position.x = 70;
        if (this.mesh.position.z > 50) this.mesh.position.z = -50;
        if (this.mesh.position.z < -50) this.mesh.position.z = 50;
        if (this.mesh.position.y > 35) this.mesh.position.y = -35;
        if (this.mesh.position.y < -35) this.mesh.position.y = 35;
    }
}

// МЕНЕДЖЕР АСТЕРОИДОВ
class AsteroidManager {
    constructor(scene, ship) {
        this.scene = scene;
        this.ship = ship;
        this.asteroids = [];
        this.spawnInterval = null;
    }
    
    startSpawning() {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => this.spawnAsteroid(), i * 200);
        }
        this.spawnInterval = setInterval(() => this.spawnAsteroid(), 1800);
    }
    
    spawnAsteroid() {
        const playerPos = this.ship.getPosition();
        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * 30;
        const spawnPos = new THREE.Vector3(
            playerPos.x + Math.cos(angle) * radius,
            playerPos.y + (Math.random() - 0.5) * 15,
            playerPos.z + Math.sin(angle) * radius
        );
        const asteroid = new Asteroid(0.6, spawnPos);
        this.scene.add(asteroid.mesh);
        this.asteroids.push(asteroid);
    }
    
    checkCollisions() {
        const shipPos = this.ship.getPosition();
        let hitCount = 0;
        
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            const distance = shipPos.distanceTo(asteroid.mesh.position);
            if (distance < 1.2) {
                const explosion = new THREE.Mesh(
                    new THREE.SphereGeometry(0.4, 6, 6),
                    new THREE.MeshBasicMaterial({ color: 0xff6600 })
                );
                explosion.position.copy(asteroid.mesh.position);
                this.scene.add(explosion);
                setTimeout(() => this.scene.remove(explosion), 200);
                
                this.scene.remove(asteroid.mesh);
                this.asteroids.splice(i, 1);
                hitCount++;
            }
        }
        return hitCount;
    }
    
    updateAll(delta) {
        for (const asteroid of this.asteroids) {
            asteroid.update(delta);
        }
    }
}

// МЕНЕДЖЕР КАМЕРЫ
class CameraManager {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
        this.moveSpeed = 18;
        this.mouseSensitivity = 0.003;
        this.mouseDown = false;
        
        this.yaw = -Math.PI / 4;
        this.pitch = 0;
        
        this.keys = {
            KeyW: false,
            KeyA: false,
            KeyS: false,
            KeyD: false,
            Space: false,
            ShiftLeft: false
        };
        
        this.setupEventListeners();
        this.updateCameraRotation();
    }
    
    updateCameraRotation() {
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
            }
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouseDown = true;
                this.canvas.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });
        
        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouseDown = false;
                this.canvas.style.cursor = 'default';
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (this.mouseDown) {
                this.yaw -= e.movementX * this.mouseSensitivity;
                this.pitch -= e.movementY * this.mouseSensitivity;
                this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
                this.updateCameraRotation();
            }
        });
        
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
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
        if (this.keys.KeyA) moveDelta.addScaledVector(right, -speed);
        if (this.keys.KeyD) moveDelta.addScaledVector(right, speed);
        if (this.keys.Space) moveDelta.y += speed;
        if (this.keys.ShiftLeft) moveDelta.y -= speed;
        
        this.camera.position.add(moveDelta);
    }
}

// ОСНОВНАЯ ИГРА
let scene, camera, renderer, cameraManager, asteroidManager, ship, clock;
let score = 0;
let scoreElement;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b1a);
    scene.fog = new THREE.FogExp2(0x050b1a, 0.0008);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 12);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    clock = new THREE.Clock();
    scoreElement = document.getElementById('scoreValue');
    
    cameraManager = new CameraManager(camera, renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);
    
    const stars = new THREE.Points(
        new THREE.BufferGeometry(),
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 })
    );
    const starPositions = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
        starPositions[i*3] = (Math.random() - 0.5) * 500;
        starPositions[i*3+1] = (Math.random() - 0.5) * 300;
        starPositions[i*3+2] = (Math.random() - 0.5) * 150 - 50;
    }
    stars.geometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(stars);
    
    ship = new Ship();
    ship.init();
    scene.add(ship.mesh);
    
    asteroidManager = new AsteroidManager(scene, ship);
    asteroidManager.startSpawning();
    
    const gridHelper = new THREE.GridHelper(120, 20, 0x4488aa, 0x224466);
    gridHelper.position.y = -4;
    scene.add(gridHelper);
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
}

function animate() {
    const delta = Math.min(clock.getDelta(), 0.033);
    
    cameraManager.update(delta);
    ship.updatePosition(camera.position);
    asteroidManager.updateAll(delta);
    
    const hitCount = asteroidManager.checkCollisions();
    if (hitCount > 0) {
        score += hitCount;
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();