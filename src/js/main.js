'use strict';

import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { getCanvasSize, containDocumentBody } from './modules/Utils';
import BlobSphere from './modules/BlobSphere';

// CONSTANTS
const caption = document.querySelector('.app-caption');
const appContainer = document.querySelector('.app');

const canvasFillScreen = true;
const canvasMaxCover = 1;
const captionMaxCover = 0.8;
const defaultFontSize = 24;
const camPos = new THREE.Vector3(0, 0, 10);

// VARIABLES
let scene, camera, renderer, blob, stats, controls, letterRatio;
let lastClickTime = 0,
	runAnimation = true,
	animateBlob = true,
	pointerDown = false,
	isDragging = false;

window.onload = () => {
	letterRatio =
		defaultFontSize /
		(caption.getBoundingClientRect().width / caption.innerText.length);
	updateWindowSize();
	initScene();
	animate();
	initListeners();
};

// Initializes global variables, scene, renderer, camera, blob and updates window size
function initScene() {
	const canvasSize = getCanvasSize(
		appContainer,
		canvasFillScreen,
		canvasMaxCover
	);
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
	});
	camera = new THREE.PerspectiveCamera(13, canvasSize.ratio, 0.1, 1000);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.domElement.classList.add('grab');

	blob = new BlobSphere({
		randomLimits: {
			scale: {
				min: 0.8,
				max: 1.05,
			},
			colorMultiplier: {
				min: 0.25,
				max: 1,
			},
			lightThreshold: {
				min: 0.015,
				max: 0.45,
			},
			frequency: {
				min: 1.5,
				max: 6,
			},
			amplitude: {
				min: 0.1,
				max: 2.5,
			},
			distortionSpeed: {
				min: 0.005,
				max: 0.03,
			},
			rotationSpeed: {
				min: -0.003,
				max: 0.003,
			},
		},
		randomize: true,
	});
	scene.add(blob.mesh);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enablePan = false;
	controls.enableZoom = true;
	controls.enableDamping = true;

	stats = new Stats();
	stats.dom.classList.add('stats-display');

	updateProjection(canvasSize);

	appContainer.appendChild(renderer.domElement);
	appContainer.classList.add('show');
}

// Animate scene
function animate() {
	try {
		runAnimation && requestAnimationFrame(animate);
		animateBlob && blob.animate();
		renderer && renderer.render(scene, camera);
		stats && stats.update();
		controls && controls.update();
	} catch (e) {
		console.error(e, 'stopping execution....');
		runAnimation = false;
	}
}

// Initialize eventlisteners
function initListeners() {
	window.onresize = updateWindowSize;

	try {
		ScreenOrientation.onchange = window.onresize;
	} catch (e) {
		console.error(
			'Screen Orientation API not available in this browser...'
		);
	}

	window.onpointerdown = () => {
		pointerDown = true;
	};

	window.onpointermove = ev => {
		isDragging = pointerDown;
		if (ev.target === renderer.domElement) {
			if (isDragging) {
				!runAnimation && animate();
				!renderer.domElement.classList.contains('grabbing') &&
					renderer.domElement.classList.add('grabbing');
			} else {
				renderer.domElement.classList.contains('grabbing') &&
					renderer.domElement.classList.remove('grabbing');
			}
		}
	};

	window.onpointerup = window.onpointerleave = ev => {
		if (!isDragging) {
			ev.target === renderer.domElement && (animateBlob = !animateBlob);
			if (ev.target === caption && Date.now() - lastClickTime > 200) {
				blob && blob.randomize();
				lastClickTime = Date.now();
			}
		}
		isDragging = pointerDown = false;
	};

	window.onkeydown = ev => {
		if (ev.key === ' ') {
			animateBlob = !animateBlob;
		}
		if (ev.key === '0') {
			document.body.querySelector(`.${stats.dom.classList[0]}`)
				? stats.dom.remove()
				: document.body.appendChild(stats.dom);
		}
	};

	window.oncontextmenu = ev => {
		if (!(ev instanceof MouseEvent) || ev.button === 0) {
			ev.preventDefault();
			ev.stopPropagation();
		}
	};
}

// Update document body size to center content on mobile devices,
// update projection and resize caption
function updateWindowSize() {
	containDocumentBody();
	const c = getCanvasSize(appContainer, canvasFillScreen, canvasMaxCover);
	updateProjection(c);
	if (caption && caption.innerText) {
		const letterWidth =
			(Math.min(c.width, c.height) * captionMaxCover) /
			caption.innerText.length;
		const fontSize = Math.floor(letterRatio * letterWidth);
		caption.style.fontSize =
			Math.min(fontSize, c.height * captionMaxCover) + 'px';
	}
}

// Update camera position, control min and max distance and projection
function updateProjection(canvasSize) {
	if (!camera || !renderer) return;
	const c = canvasSize
		? canvasSize
		: getCanvasSize(appContainer, canvasFillScreen, canvasMaxCover);
	if (camPos) {
		camera.position.z = camPos.z / THREE.MathUtils.clamp(c.ratio, 0, 1);
		camera.lookAt(0, 0, 0);
		if (controls) {
			controls.maxDistance = camera.position.z * 1.5;
			controls.minDistance = camera.position.z * 0.75;
		}
	}
	camera.aspect = c.ratio;
	camera.updateProjectionMatrix();
	renderer.setSize(c.width, c.height);
}
