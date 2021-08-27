import * as TWEEN from '@tweenjs/tween.js';
import { CameraHelper } from 'three';

export const centerPosition = {
	newX: 3,
	newY: 3,
	newZ: 3,
	newRX: -0.7853981571068328,
	newRY: 0.6154797114558709,
	newRZ: 0.5235987718562193
};

export const zoomOutMonitor = {
	newX: -1.4427103804282106,
	newY: 1.1507012737959565 + 0.03,
	newZ: -0.29740390033229747,
	newRX: -2.958725860248746,
	newRY: 1.5032790968342025,
	newRZ: 2.9591333121149503
};

export const topShelf = {
	newX: -0.75,
	newY: 2.2,
	newZ: 1.15,
	newRX: -1.5830496534737715,
	newRY: 1.5707963267948966,
	newRZ: 1.588522321555869
};

export const secondShelf = {
	newX: -0.75,
	newY: 1.8,
	newZ: 1.15,
	newRX: -1.591994818810587,
	newRY: 1.5707963267948966,
	newRZ: 1.5955637766629143
};

export const displayShelf = {
	newX: 1,
	newY: 1,
	newZ: 0.1,
	newRX: 0,
	newRY: 0,
	newRZ: 0
};

export const bottomPosition = {
	newX: 0,
	newY: -2,
	newZ: 0,
	newRX: 0,
	newRY: Math.PI,
	newRZ: 0
};

export const cameraPositions = [ topShelf, secondShelf, displayShelf, centerPosition, bottomPosition ];

export const moveCameraToNextPosition = (camera, newPosition) => {
	const { x, y, z } = camera.position;
	const { x: rX, y: rY, z: rZ } = camera.rotation;
	const coords = { x, y, z, rX, rY, rZ };
	const { newX, newY, newZ, newRX, newRY, newRZ } = newPosition;
	const tween = new TWEEN.Tween(coords)
		.to(
			{
				x: newX,
				y: newY,
				z: newZ,
				rX: newRX,
				rY: newRY,
				rZ: newRZ
			},
			1000
		)
		.onUpdate(() => {
			camera.position.set(coords.x, coords.y, coords.z);
			camera.rotation.set(coords.rX, coords.rY, coords.rZ);
			// camera.updateProjectionMatrix();
		});
	tween.start();
};

export const moveBoxesOut = (displayBenchBoxes, displayBenchBoxesAnimating) => {
	const boxPosition = { z: displayBenchBoxes.position.z };
	const boxNewZ = -1.5636427640914916;
	new TWEEN.Tween(boxPosition)
		.to({ z: boxNewZ }, 400)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => {
			displayBenchBoxes.position.z = boxPosition.z;
		})
		.onStart(() => {
			displayBenchBoxesAnimating = true;
		})
		.onStop(() => {
			displayBenchBoxesAnimating = false;
		})
		.start();
};

export const moveBoxesIn = (displayBenchBoxes, displayBenchBoxesAnimating) => {
	const boxPosition = { z: displayBenchBoxes.position.z };
	const boxNewZ = -1.6636427640914917;
	new TWEEN.Tween(boxPosition)
		.to({ z: boxNewZ }, 200)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => {
			displayBenchBoxes.position.z = boxPosition.z;
		})
		.onStart(() => {
			displayBenchBoxesAnimating = true;
		})
		.onStop(() => {
			displayBenchBoxesAnimating = false;
		})
		.start();
};

export const rotateGlobe = (globe, elapsedTime) => {
	globe[1].rotation.y = elapsedTime;
	globe[2].rotation.y = elapsedTime;
};

export const scaleTextbookOut = (textbooks) => {
	const textbooksScale = { x: textbooks.scale.x, y: textbooks.scale.y, z: textbooks.scale.z };
	const scale = 1.2;
	const newTextbooksScale = { x: scale, y: scale, z: scale };
	new TWEEN.Tween(textbooksScale)
		.to(newTextbooksScale, 500)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => {
			textbooks.scale.set(textbooksScale.x, textbooksScale.y, textbooksScale.z);
		})
		.start();
};
export const scaleTextbookIn = (textbooks, textbooksAnimating) => {
	const textbooksScale = { x: textbooks.scale.x, y: textbooks.scale.y, z: textbooks.scale.z };
	const newTextbooksScale = { x: 1, y: 1, z: 1 };
	new TWEEN.Tween(textbooksScale)
		.to(newTextbooksScale, 300)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => {
			textbooks.scale.set(textbooksScale.x, textbooksScale.y, textbooksScale.z);
		})
		.onStart(() => {
			textbooksAnimating = true;
		})
		.onStop(() => {
			textbooksAnimating = false;
		})
		.start();
};

const helloSubtitle = 'My name is Jonathan Wong.';

const zoomOutMonitorSubtitle = "I'm a self-taught web developer currently focused on the front-end.";

const topShelfSubtitle = "I've learned a couple of languages such as Javascript and Python among others.";

const midShelfSubtitle =
	"I've also picked up a couple of frameworks/technologies along the way, the main one being React.";

const displayBenchSubtitle =
	"And with the skills and technologies I've picked up, I've tried my hand at a couple of projects.";

export let subtitleTimeline = [
	helloSubtitle,
	zoomOutMonitorSubtitle,
	topShelfSubtitle,
	midShelfSubtitle,
	displayBenchSubtitle
];

export const rotateSceneToBottom = (scene, camera) => {
	const sceneRotation = { x: scene.position.x, y: scene.position.y };
	const camZoom = { zoom: camera.zoom };
	const newRX = Math.PI * 1.25;
	const newRY = -Math.PI / 2;
	const newZoomX = 2;
	const rotateX = new TWEEN.Tween(sceneRotation)
		.to({ x: newRX }, 2000)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => {
			scene.rotation.x = sceneRotation.x;
		});
	const rotateY = new TWEEN.Tween(sceneRotation)
		.to({ y: newRY }, 2000)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => {
			scene.rotation.y = sceneRotation.y;
		});
	const zoomIn = new TWEEN.Tween(camZoom)
		.to({ zoom: newZoomX }, 2000)
		.easing(TWEEN.Easing.Quadratic.Out)
		.onUpdate(() => {
			camera.zoom = camZoom.zoom;
			camera.updateProjectionMatrix();
			console.log(camZoom.zoom);
			console.log(camera.zoom);
		});

	rotateY.start();
	rotateX.chain(zoomIn).start();
};
