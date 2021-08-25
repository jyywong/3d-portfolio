import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

import {
	moveCameraToNextPosition,
	cameraPositions,
	displayShelf,
	moveBoxesOut,
	moveBoxesIn,
	rotateGlobe,
	scaleTextbookOut,
	scaleTextbookIn
} from './helperFunctions';
import { Vector2, Vector3 } from 'three';

const canvas = document.querySelector('.webgl');

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

// Raycaster
const raycaster = new THREE.Raycaster();
let currentIntersect = null;

const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

// Loaders
const textureLoader = new THREE.TextureLoader();

const gltfLoader = new GLTFLoader();

// Textures
const bakedTexture = textureLoader.load('blender/baked2.jpg');
bakedTexture.flipY = false;

// Materials
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });

// Camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.set(1, 1, 0.1);

// camera.lookAt(new THREE.Vector3());

scene.add(camera);

// Lights
// const light = new THREE.AmbientLight(0x404040);
// light.intensity = 5;
// scene.add(light);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// const helper = new THREE.DirectionalLightHelper(directionalLight, 5);

// scene.add(directionalLight.target);
// scene.add(helper);
// scene.add(directionalLight);

// Pointlight

// const pointLight = new THREE.PointLight(0xfdfbd3, 1, 100);
// pointLight.position.set(2, 2, 2);
// // pointLight.decay = 2;
// pointLight.castShadow = true;

// const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
// scene.add(pointLightHelper);
// scene.add(pointLight);

// Model
let displayBenchBoxes = null;
let displayBenchBoxesAnimating = false;

let globe = null;

let textbooks = null;
let textbooksAnimating = false;

gltfLoader.load('blender/portfolioOptimized2.glb', (gltf) => {
	gltf.scene.traverse((child) => {
		// console.log(child);
		if (![ 'reactLogo', 'reduxLogo', 'djangoLogo', 'jestLogo' ].includes(child.name)) {
			child.material = bakedMaterial;
		}
	});
	const hMonitor = gltf.scene.children.find((child) => child.name === 'hMonitor');
	const shelf = gltf.scene.children.find((child) => child.name === 'shelf');
	const tv = gltf.scene.children.find((child) => child.name === 'tv');
	displayBenchBoxes = gltf.scene.children.find((child) => child.name === 'displayBenchBoxes');
	globe = gltf.scene.children.find((child) => child.name === 'globe').children;
	textbooks = gltf.scene.children.find((child) => child.name === 'textbooks');
	console.log(textbooks);
	// pointLight.position.set(lamp.position);

	// Position to look at hMonitor
	// x: -1.5427103804282107
	// y: 1.2007012737959566
	// z: -0.28940390033229746

	// camera.position.x = -1.5427103804282107;
	// camera.position.y = 1.2007012737959566 - 0.05;
	// camera.position.z = -0.28940390033229746 - 0.008;

	// // camera.position.x = 1;
	// // camera.position.y = 1;
	// // camera.position.z = 0.1;

	// camera.lookAt(hMonitor.position);

	console.log(camera.rotation);

	// camera.lookAt(shelfBooks.position);
	// control.target = hMonitor.position;

	scene.add(gltf.scene);
});

const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#000133');
// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.shadowMap.enabled = true;

const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;
// control.enabled = false;

// Handle resize
window.addEventListener('resize', () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// // Handle user input
let nextPosition = 0;
window.addEventListener('dblclick', () => {
	// moveCameraToNextPosition(camera, cameraPositions[nextPosition]);
	// camera.lookAt(shelfV.position);
	// camera.rotation.y = Math.PI / 2;

	if (nextPosition === cameraPositions.length) {
		control.enabled = true;
	}
	nextPosition += 1;
	console.log(displayBenchBoxes.position.z);
});

// Handle mouse
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
	mouse.x = (event.clientX / sizes.width - 0.5) * 2;
	mouse.y = -(event.clientY / sizes.height - 0.5) * 2;
});

const clock = new THREE.Clock();
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	if (displayBenchBoxes !== null) {
		// Raycaster
		raycaster.setFromCamera(mouse, camera);
		const objectsToTest = [ displayBenchBoxes, ...globe, ...textbooks.children ];
		const intersects = raycaster.intersectObjects(objectsToTest);

		if (intersects.length && intersects[0].object === displayBenchBoxes) {
			if (currentIntersect === null && displayBenchBoxesAnimating === false) {
				moveBoxesOut(displayBenchBoxes);
			}

			currentIntersect = intersects[0];
		} else if (intersects.length && globe.includes(intersects[0].object)) {
			rotateGlobe(globe, elapsedTime);
		} else if (intersects.length && textbooks.children.includes(intersects[0].object)) {
			if (currentIntersect === null) {
				scaleTextbookOut(textbooks);
			}
			currentIntersect = intersects[0];
		} else {
			if (currentIntersect) {
				moveBoxesIn(displayBenchBoxes);
				scaleTextbookIn(textbooks);
			}

			currentIntersect = null;
		}
		// console.log(intersects);
	}
	TWEEN.update();

	// console.log(currentIntersect);

	if ((control.enabled = true)) {
		control.update();
	}
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();
