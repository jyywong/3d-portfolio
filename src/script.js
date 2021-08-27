import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';
import * as MATTER from 'matter-js';
import * as dat from 'dat.gui';

import {
	moveCameraToNextPosition,
	cameraPositions,
	displayShelf,
	moveBoxesOut,
	moveBoxesIn,
	rotateGlobe,
	scaleTextbookOut,
	scaleTextbookIn,
	subtitleTimeline,
	rotateSceneToBottom,
	hoverAnimation
} from './helperFunctions';
import { DoubleSide } from 'three';

// Picture
let picZoomout = false;
let picDisappear = false;
const picture = document.createElement('img');
picture.src = 'pictures/helloBrowser.png';
const browser = document.querySelector('.browser');
picture.style.height = '100%';
picture.style.transition = 'all .5s';
browser.appendChild(picture);

// DEBUG
const gui = new dat.GUI({ width: 800 });
const debugObject = {
	cameraX: -1.582,
	cameraY: 1.149,
	cameraZ: -0.3
};
gui.add(debugObject, 'cameraX').min(-2).max(2).step(0.001);
gui.add(debugObject, 'cameraY').min(-2).max(2).step(0.001);
gui.add(debugObject, 'cameraZ').min(-2).max(2).step(0.001);

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

// Model
const planeGeometry = new THREE.PlaneBufferGeometry(2.75, 0.5);
// const planeGeometry = new THREE.PlaneBufferGeometry(0.5 * 5, 2.5 * 5);
const portfolioButton = textureLoader.load('pictures/portfolioButton.png', (tex) => {
	let imgRatio = tex.image.width / tex.image.height;
	let planeRatio = planeGeometry.parameters.width / planeGeometry.parameters.height;
	tex.wrapS = THREE.RepeatWrapping;
	tex.repeat.x = planeRatio / imgRatio;
	tex.offset.x = -0.5 * (planeRatio / imgRatio - 1);
});

const githubButton = textureLoader.load('pictures/githubButton.png', (tex) => {
	let imgRatio = tex.image.width / tex.image.height;
	let planeRatio = planeGeometry.parameters.width / planeGeometry.parameters.height;
	tex.wrapS = THREE.RepeatWrapping;
	tex.repeat.x = planeRatio / imgRatio;
	tex.offset.x = -0.5 * (planeRatio / imgRatio - 1);
});

const exploreButton = textureLoader.load('pictures/exploreScene.png', (tex) => {
	let imgRatio = tex.image.width / tex.image.height;
	let planeRatio = planeGeometry.parameters.width / planeGeometry.parameters.height;
	tex.wrapS = THREE.RepeatWrapping;
	tex.repeat.x = planeRatio / imgRatio;
	tex.offset.x = -0.5 * (planeRatio / imgRatio - 1);
});

const planeMaterialPort = new THREE.MeshBasicMaterial({ map: portfolioButton });

const planeMaterialGit = new THREE.MeshBasicMaterial({ map: githubButton });

const planeMaterialExplore = new THREE.MeshBasicMaterial({ map: exploreButton });

const plane1 = new THREE.Mesh(planeGeometry, planeMaterialPort);
const plane2 = new THREE.Mesh(planeGeometry, planeMaterialGit);
const plane3 = new THREE.Mesh(planeGeometry, planeMaterialExplore);

const varRot = -Math.PI / 2;

plane1.rotation.x = Math.PI / 2;
plane1.rotation.z = varRot;
plane1.position.y = -0.01;
plane1.position.x = 1;

plane2.rotation.x = Math.PI / 2;
plane2.rotation.z = varRot;
plane2.position.y = -0.01;
plane2.position.x = 0;

plane3.rotation.x = Math.PI / 2;
plane3.rotation.z = varRot;
plane3.position.y = -0.01;
plane3.position.x = -1;

let entireScene = null;

let hMonitor = null;

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
	gltf.scene.add(plane1, plane2, plane3);
	entireScene = gltf.scene;
	hMonitor = gltf.scene.children.find((child) => child.name === 'hMonitor');
	const shelf = gltf.scene.children.find((child) => child.name === 'shelf');
	const tv = gltf.scene.children.find((child) => child.name === 'tv');
	displayBenchBoxes = gltf.scene.children.find((child) => child.name === 'displayBenchBoxes');
	globe = gltf.scene.children.find((child) => child.name === 'globe').children;
	textbooks = gltf.scene.children.find((child) => child.name === 'textbooks');
	roomba = gltf.scene.children.find((child) => child.name === 'roomba');
	// pointLight.position.set(lamp.position);

	// Position to look at hMonitor
	// x: -1.5427103804282107
	// y: 1.2007012737959566
	// z: -0.28940390033229746

	camera.position.x = -1.582;
	camera.position.y = 1.149;
	camera.position.z = -0.3;

	// camera.position.x = 0;
	// camera.position.y = 5;
	// camera.position.z = 5;

	camera.lookAt(hMonitor.position);

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

// const control = new OrbitControls(camera, renderer.domElement);
// control.enableDamping = true;
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
let subtitlePosition = 0;
window.addEventListener('dblclick', () => {
	// camera.lookAt(shelfV.position);
	// camera.rotation.y = Math.PI / 2;

	const subtitle = document.querySelector('.subtitle');
	subtitle.innerHTML = subtitleTimeline[subtitlePosition];

	if (picZoomout === false) {
		picture.style.transform = 'scale(0.8)';
		picZoomout = true;
	} else if (picDisappear === false) {
		picture.style.opacity = 0;
		picture.style.transform = 'scaleY(0) scaleX(0.2)';
		picDisappear = true;
	} else {
		console.log('hello');
		console.log(nextPosition);
		moveCameraToNextPosition(camera, cameraPositions[nextPosition]);
		nextPosition += 1;
	}

	// if (nextPosition === cameraPositions.length) {
	// 	control.enabled = true;
	// }

	// rotateSceneToBottom(entireScene, camera);
	// camera.zoom = 3;
	// camera.updateProjectionMatrix();

	subtitlePosition += 1;
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

const chairP = MATTER.Bodies.circle(convertFromBlenderToMatterUnits(1.14), convertFromBlenderToMatterUnits(1.51), 60, {
	isStatic: true
});
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

MATTER.Composite.add(engine.world, [ roombaP, northWall, eastWall, southWall, westWall, shelfP, benchP, chairP ]);
MATTER.Render.run(render);

// End phyiscs world

let oldElapsedTime = 0;

const clock = new THREE.Clock();
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	// camera.position.x = debugObject.cameraX;
	// camera.position.y = debugObject.cameraY;
	// camera.position.z = debugObject.cameraZ;
	// if (hMonitor !== null) {
	// 	camera.lookAt(hMonitor.position);
	// }

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
		const objectsToTest = [ displayBenchBoxes, ...globe, ...textbooks.children, plane1, plane2, plane3 ];
		const intersects = raycaster.intersectObjects(objectsToTest);
		// console.log(hover);

		if (intersects.length && currentIntersect === null) {
			if (intersects[0].object === plane1) {
				plane1.position.y = -0.5;
			} else if (intersects[0].object === plane2) {
				plane2.position.y = -0.5;
			} else if (intersects[0].object === plane3) {
				plane3.position.y = -0.5;
			}
		} else {
			plane1.position.y = -0.01;
			plane2.position.y = -0.01;
			plane3.position.y = -0.01;
			currentIntersect = null;
		}

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

	// if ((control.enabled = true)) {
	// 	control.update();
	// }

	if (roomba !== null) {
		roomba.position.x = (roombaP.position.x / 800 - 0.5) * 4;
		roomba.position.z = (roombaP.position.y / 800 - 0.5) * 4;
	}

	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();
