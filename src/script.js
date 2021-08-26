import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';
import * as MATTER from 'matter-js';

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
const bakedTexture = textureLoader.load('blender/baked2roomba.jpg');
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

let roomba = null;

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
	roomba = gltf.scene.children.find((child) => child.name === 'roomba');
	console.log(roomba);
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

// --------------------------------------------
// Physics world
const engine = MATTER.Engine.create();
engine.gravity.y = 0;
const render = MATTER.Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: 800,
		height: 800
	}
});
const convertFromBlenderToMatterUnits = (unit) => {
	const mUnit = unit / 4 * 800;
	return mUnit;
};
// Walls
const northWall = MATTER.Bodies.rectangle(400, 5, 780, 10, { isStatic: true });
const eastWall = MATTER.Bodies.rectangle(795, 400, 10, 780, { isStatic: true });
const southWall = MATTER.Bodies.rectangle(400, 795, 780, 10, { isStatic: true });
const westWall = MATTER.Bodies.rectangle(5, 400, 10, 780, { isStatic: true });
// Furniture
const shelfP = MATTER.Bodies.rectangle(
	convertFromBlenderToMatterUnits(0.36),
	convertFromBlenderToMatterUnits(3.5),
	convertFromBlenderToMatterUnits(1.14 - 0.4),
	convertFromBlenderToMatterUnits(1.99),
	{ isStatic: true }
);
const benchP = MATTER.Bodies.rectangle(
	convertFromBlenderToMatterUnits(2.82),
	convertFromBlenderToMatterUnits(0.35),
	convertFromBlenderToMatterUnits(2.37 - 0.2),
	convertFromBlenderToMatterUnits(1.04 - 0.2),
	{ isStatic: true }
);

const chairP = MATTER.Bodies.circle(
	convertFromBlenderToMatterUnits(1.18 - 0.1),
	convertFromBlenderToMatterUnits(1.77 - 0.2),
	80,
	{
		isStatic: true
	}
);
console.log(shelfP.position);

const createRandomVector = () => {
	const randVector = MATTER.Vector.create(Math.random() - 0.5, Math.random() - 0.5);
	const normVector = MATTER.Vector.normalise(randVector);
	const speed = 2;
	normVector.x *= speed;
	normVector.y *= speed;
	return normVector;
};
const rotateVector = (currentVector) => {
	const randomAngle = Math.random() * 0.5 + 3;
	return MATTER.Vector.rotate(currentVector, Math.PI / randomAngle);
};
let currentVector = createRandomVector();

const roombaP = MATTER.Bodies.circle(400, 400, 30);
roombaP.friction = 0;
// MATTER.Body.applyForce(roombaP, { x: 390, y: 400 }, { x: 0.5, y: 0.1 });

MATTER.Composite.add(engine.world, [ roombaP, northWall, eastWall, southWall, westWall, shelfP, benchP, chairP ]);
MATTER.Render.run(render);

// End phyiscs world

let oldElapsedTime = 0;

const clock = new THREE.Clock();
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;
	// console.log(deltaTime);

	//  --------------------------------------------
	// Physics Calculations

	if (
		MATTER.SAT.collides(roombaP, northWall).collided ||
		MATTER.SAT.collides(roombaP, eastWall).collided ||
		MATTER.SAT.collides(roombaP, southWall).collided ||
		MATTER.SAT.collides(roombaP, westWall).collided ||
		MATTER.SAT.collides(roombaP, shelfP).collided ||
		MATTER.SAT.collides(roombaP, benchP).collided ||
		MATTER.SAT.collides(roombaP, chairP).collided
	) {
		currentVector = rotateVector(currentVector);
	}

	MATTER.Body.setVelocity(roombaP, currentVector);

	MATTER.Engine.update(engine);
	// End Physics Calculations
	//  --------------------------------------------

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
	}
	TWEEN.update();

	if ((control.enabled = true)) {
		control.update();
	}

	if (roomba !== null) {
		roomba.position.x = (roombaP.position.x / 800 - 0.5) * 4;
		roomba.position.z = (roombaP.position.y / 800 - 0.5) * 4;
	}

	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();
