import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

const canvas = document.querySelector('.webgl');

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

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

scene.add(camera);

// Model

gltfLoader.load('blender/portfolioOptimized2.glb', (gltf) => {
	gltf.scene.traverse((child) => {
		// console.log(child);
		child.material = bakedMaterial;
	});
	const hMonitor = gltf.scene.children.find((child) => child.name === 'hMonitor');
	const shelf = gltf.scene.children.find((child) => child.name === 'shelf');
	// Position to look at hMonitor
	// x: -1.5427103804282107
	// y: 1.2007012737959566
	// z: -0.28940390033229746

	camera.position.x = -1.5427103804282107;
	camera.position.y = 1.2007012737959566;
	camera.position.z = -0.28940390033229746;
	camera.lookAt(shelf.position);

	console.log(shelf);

	// camera.lookAt(shelfBooks.position);
	// control.target = hMonitor.position;

	scene.add(gltf.scene);
});

const renderer = new THREE.WebGLRenderer({
	canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
// window.addEventListener('click', () => {
// 	console.log('hello');
// 	const { x, y, z } = camera.position;
// 	const { x: rX, y: rY, z: rZ } = camera.rotation;
// 	const coords = { x, y, z, rX, rY, rZ };
// 	const tween = new TWEEN.Tween(coords)
// 		.to(
// 			{
// 				x: 3,
// 				y: 3,
// 				z: 3,
// 				rX: -0.7853981571068328,
// 				rY: 0.6154797114558709,
// 				rZ: 0.5235987718562193
// 			},
// 			2000
// 		)
// 		.onUpdate(() => {
// 			camera.position.set(coords.x, coords.y, coords.z);
// 			camera.rotation.set(coords.rX, coords.rY, coords.rZ);
// 			// camera.updateProjectionMatrix();
// 		})
// 		.onStop(() => {
// 			camera.lookAt(new THREE.Vector3());
// 		});
// 	tween.start();
// });

const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;

const clock = new THREE.Clock();
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	// console.log(camera.rotation);
	TWEEN.update();
	control.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();
