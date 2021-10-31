"use strict";
/**
 * @module BlobSphere
 * @requires THREE
 * @requires BlobShader
 * @requires ThreeUtils
 */
import * as THREE from "https://threejs.org/build/three.module.js";
import {isV3, clampV3, randomV3} from "./ThreeUtils.js";
import * as BlobShader from "./BlobShader.js";
export default class BlobSphere {
	static get DEFAULT_RANDOM_LIMITS() {
		return {
			scale: {min: 0.75, max: 1.25},
			colorMultiplier: {min: 0, max: 1},
			lightThreshold: {min: 0.25, max: 1.0},
			frequency: {min: 1, max: 6},
			amplitude: {min: 1, max: 3},
			distortionSpeed: {min: 0.005, max: 0.05},
			rotationSpeed: {min: -0.05, max: 0.05},
		};
	}
	#currentFrame;
	#rotationSpeed;
	#animationSpeed;
	#randomLimits;
	constructor(options) {
		this.#rotationSpeed = isV3(options.rotationSpeed)
			? options.rotationSpeed
			: new THREE.Vector3(0, 0, 0);
		this.#animationSpeed =
			typeof options.animationSpeed === "number"
				? options.animationSpeed
				: 1;
		const shaderOpt = {...BlobShader.DEFAULT_OPTIONS};
		if (options.shader && typeof options.shader === "object") {
			for (const k in shaderOpt) {
				if (
					!options.shader.hasOwnProperty[k] ||
					("number" === typeof shaderOpt[k]) !== options.shader[k] ||
					(isV3(shaderOpt[k]) && !isV3(options.shader[k]))
				) {
					continue;
				}
				shaderOpt[k] = options.shader[k];
			}
		}
		if (options.randomLimits) {
			this.randomLimits = options.randomLimits;
		} else {
			this.#randomLimits = BlobSphere.DEFAULT_RANDOM_LIMITS;
		}
		this.mesh = new THREE.Mesh(
			new THREE.SphereGeometry(
				typeof options.radius === "number" ? options.radius : 1,
				typeof options.segments === "number" ? options.segments : 64,
				typeof options.rings === "number" ? options.rings : 32
			),
			BlobShader.shader(shaderOpt)
		);
		this.currentFrame = 0;
		if (options.randomize === true) {
			this.randomize();
		}
	}

	//#region GETTERS
	get position() {
		return new THREE.Vector3(
			this.mesh.position.x,
			this.mesh.position.y,
			this.mesh.position.z
		);
	}
	get scale() {
		return new THREE.Vector3(
			this.mesh.scale.x,
			this.mesh.scale.y,
			this.mesh.scale.z
		);
	}
	get rotation() {
		return new THREE.Vector3(
			this.mesh.rotation.x,
			this.mesh.rotation.y,
			this.mesh.rotation.z
		);
	}
	get alpha() {
		return this.mesh.material.uniforms.uAlpha.value;
	}
	get lightThreshold() {
		return new THREE.Vector3(
			this.mesh.material.uniforms.uLightThreshold.value.x,
			this.mesh.material.uniforms.uLightThreshold.value.y,
			this.mesh.material.uniforms.uLightThreshold.value.z
		);
	}
	get amplitude() {
		return new THREE.Vector3(
			this.mesh.material.uniforms.uAmplitude.value.x,
			this.mesh.material.uniforms.uAmplitude.value.y,
			this.mesh.material.uniforms.uAmplitude.value.z
		);
	}
	get frequency() {
		return new THREE.Vector3(
			this.mesh.material.uniforms.uFrequency.value.x,
			this.mesh.material.uniforms.uFrequency.value.y,
			this.mesh.material.uniforms.uFrequency.value.z
		);
	}
	get distortionSpeed() {
		return new THREE.Vector3(
			this.mesh.material.uniforms.uDistSpeed.value.x,
			this.mesh.material.uniforms.uDistSpeed.value.y,
			this.mesh.material.uniforms.uDistSpeed.value.z
		);
	}
	get colorMultiplier() {
		return new THREE.Vector3(
			this.mesh.material.uniforms.uColorMultiplier.value.x,
			this.mesh.material.uniforms.uColorMultiplier.value.y,
			this.mesh.material.uniforms.uColorMultiplier.value.z
		);
	}
	get currentFrame() {
		return this.#currentFrame;
	}

	get rotationSpeed() {
		return {
			x: this.#rotationSpeed.x,
			y: this.#rotationSpeed.y,
			z: this.#rotationSpeed.z,
		};
	}

	get animationSpeed() {
		return this.#animationSpeed;
	}

	get randomLimits() {
		return {...this.#randomLimits};
	}

	//#endregion

	//#region SETTERS

	set position(vec) {
		if (!isV3(vec)) return;
		this.mesh.position.x = vec.x;
		this.mesh.position.y = vec.y;
		this.mesh.position.z = vec.z;
	}
	set scale(vec) {
		if (!isV3(vec)) return;
		this.mesh.scale.x = vec.x;
		this.mesh.scale.y = vec.y;
		this.mesh.scale.z = vec.z;
	}
	set rotation(vec) {
		if (!isV3(vec)) return;
		this.mesh.rotation.x = vec.x;
		this.mesh.rotation.y = vec.y;
		this.mesh.rotation.z = vec.z;
	}

	set alpha(num) {
		if (typeof num !== "number") return;
		this.mesh.material.uniforms.uAlpha.value = THREE.MathUtils.clamp(
			num,
			0,
			1
		);
	}

	set lightThreshold(vec) {
		if (!isV3(vec)) return;
		const l = clampV3(vec, 0, 1);
		this.mesh.material.uniforms.uLightThreshold.value.x = l.x;
		this.mesh.material.uniforms.uLightThreshold.value.y = l.y;
		this.mesh.material.uniforms.uLightThreshold.value.z = l.z;
	}

	set amplitude(vec) {
		if (!isV3(vec)) return;
		const a = clampV3(vec, 0, 20);
		this.mesh.material.uniforms.uAmplitude.x = a.x;
		this.mesh.material.uniforms.uAmplitude.y = a.y;
		this.mesh.material.uniforms.uAmplitude.z = a.z;
	}

	set frequency(vec) {
		if (!isV3(vec)) return;
		const f = clampV3(vec, 0, 10);
		this.mesh.material.uniforms.uFrequency.value.x = f.x;
		this.mesh.material.uniforms.uFrequency.value.y = f.y;
		this.mesh.material.uniforms.uFrequency.value.z = f.z;
	}
	set distortionSpeed(vec) {
		if (!isV3(vec)) return;
		const d = clampV3(vec, 0, 10);
		this.mesh.material.uniforms.uDistSpeed.value.x = d.x;
		this.mesh.material.uniforms.uDistSpeed.value.y = d.y;
		this.mesh.material.uniforms.uDistSpeed.value.z = d.z;
	}
	set colorMultiplier(vec) {
		if (!isV3(vec)) return;
		const c = clampV3(vec, 0, 1);
		this.mesh.material.uniforms.uColorMultiplier.value.x = c.x;
		this.mesh.material.uniforms.uColorMultiplier.value.y = c.y;
		this.mesh.material.uniforms.uColorMultiplier.value.z = c.z;
	}

	set rotationSpeed(vec) {
		if (!isV3(vec)) return;
		this.#rotationSpeed = vec;
	}

	set currentFrame(num) {
		if (typeof num !== "number") return;
		this.#currentFrame = num;
		this.mesh.material.uniforms.uTime.value = this.#currentFrame;
	}

	set animationSpeed(num) {
		if (typeof num !== "number") return;
		this.#animationSpeed = num;
	}

	set randomLimits(limits) {
		if (typeof limits !== "object") return;
		if (!this.#randomLimits) {
			this.#randomLimits = BlobSphere.DEFAULT_RANDOM_LIMITS;
		}
		for (const k in this.#randomLimits) {
			if (
				!limits[k] ||
				typeof limits[k] !== "object" ||
				!limits[k].hasOwnProperty("min") ||
				!limits[k].hasOwnProperty("max") ||
				typeof limits[k]["min"] !== "number" ||
				typeof limits[k]["max"] !== "number"
			) {
				continue;
			}
			this.#randomLimits[k] = limits[k];
		}
	}

	//#endregion

	animate() {
		let speed = this.rotationSpeed;
		const rot = this.rotation;
		rot.x += speed.x;
		rot.y += speed.y;
		rot.z += speed.z;
		this.rotation = rot;
		speed = this.animationSpeed;
		if (speed !== 0) {
			const frame = this.currentFrame;
			this.currentFrame = frame + speed;
		}
	}

	randomize() {
		const limit = this.randomLimits;
		this.scale = randomV3(limit.scale.min, limit.scale.max);
		this.colorMultiplier = randomV3(
			limit.colorMultiplier.min,
			limit.colorMultiplier.max
		);
		this.lightThreshold = randomV3(
			limit.lightThreshold.min,
			limit.lightThreshold.max
		);
		this.frequency = randomV3(limit.frequency.min, limit.frequency.max);
		this.amplitude = randomV3(limit.amplitude.min, limit.amplitude.max);
		this.distortionSpeed = randomV3(
			limit.distortionSpeed.min,
			limit.distortionSpeed.max
		);
		this.rotationSpeed = randomV3(
			limit.rotationSpeed.min,
			limit.rotationSpeed.max
		);
	}
}
