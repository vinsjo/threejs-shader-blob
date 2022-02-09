'use strict';

import * as THREE from 'three';
import { isV3 } from './ThreeUtils.js';

const DEFAULT_OPTIONS = {
	alpha: 1.0,
	lightThreshold: new THREE.Vector3(0.2, 0.2, 0.2),
	frequency: new THREE.Vector3(5, 5, 5),
	amplitude: new THREE.Vector3(0.2, 0.2, 0.2),
	distSpeed: new THREE.Vector3(0.05, 0.05, 0.05),
	colorMultiplier: new THREE.Vector3(1.0, 1.0, 1.0),
	colorNormals: { x: 'x', y: 'y', z: 'z' },
};

export { DEFAULT_OPTIONS, frag_shader, vert_shader, uniforms, shader };

function shader(options) {
	const opt = options ? options : DEFAULT_OPTIONS;
	return new THREE.ShaderMaterial({
		uniforms: uniforms(opt),
		vertexShader: vert_shader(
			{ x: 'y', y: 'z', z: 'x' },
			{ x: 'z', y: 'x', z: 'y' }
		),
		fragmentShader: frag_shader(),
	});
}

function uniforms(options) {
	const opt = options ? { ...options } : { ...DEFAULT_OPTIONS };
	return {
		uTime: {
			value: opt.time ? opt.time : 0.0,
		},
		uAlpha: {
			value: opt.alpha ? opt.alpha : DEFAULT_OPTIONS.alpha,
		},
		uLightThreshold: {
			value: isV3(opt.lightThreshold)
				? opt.lightThreshold
				: DEFAULT_OPTIONS.lightThreshold,
		},
		uFrequency: {
			value: isV3(opt.frequency)
				? opt.frequency
				: DEFAULT_OPTIONS.frequency,
		},
		uAmplitude: {
			value: isV3(opt.amplitude)
				? opt.amplitude
				: DEFAULT_OPTIONS.amplitude,
		},
		uDistSpeed: {
			value: isV3(opt.distSpeed)
				? opt.distSpeed
				: DEFAULT_OPTIONS.distSpeed,
		},
		uColorMultiplier: {
			value: isV3(opt.colorMultiplier)
				? opt.colorMultiplier
				: DEFAULT_OPTIONS.colorMultiplier,
		},
	};
}

function vert_shader(positionVector, normalVector) {
	return `
        uniform float uTime;
        uniform vec3 uFrequency;
        uniform vec3 uAmplitude;
        uniform vec3 uDistSpeed;
    
        varying vec3 vNormal;
    
        void main() {
            vec4 positionVec4 = vec4(position, 1.0);
    
            vec3 distortion = vec3(
				sin(positionVec4.${
					positionVector.x ? positionVector.x : 'x'
				} * uFrequency.x + uTime * uDistSpeed.x),
				sin(positionVec4.${
					positionVector.y ? positionVector.y : 'y'
				} * uFrequency.y + uTime * uDistSpeed.y),
				sin(positionVec4.${
					positionVector.z ? positionVector.z : 'z'
				} * uFrequency.z + uTime * uDistSpeed.z)
            );
    
            positionVec4.x += distortion.x * normal.${
				normalVector.x ? normalVector.x : 'x'
			} * uAmplitude.x;
			positionVec4.y += distortion.y * normal.${
				normalVector.y ? normalVector.y : 'y'
			} * uAmplitude.y;
			positionVec4.z += distortion.z * normal.${
				normalVector.z ? normalVector.z : 'z'
			} * uAmplitude.z;
    
            gl_Position = projectionMatrix * modelViewMatrix * positionVec4;
    
            vNormal = normal;
        }`;
}

function frag_shader() {
	return `
	precision mediump float;
	
	uniform float uAlpha;
	uniform vec3 uLightThreshold;
	uniform vec3 uColorMultiplier;

	varying vec3 vNormal;

	void main() {
		vec3 lThreshold= vec3(
			1.0 - uLightThreshold.x,
			1.0 - uLightThreshold.y,
			1.0 - uLightThreshold.z
		);
		vec3 color = vec3(        
			uColorMultiplier.x * (vNormal.x * uLightThreshold.x + lThreshold.x),
			uColorMultiplier.y * (vNormal.y * uLightThreshold.y + lThreshold.y),
			uColorMultiplier.z * (vNormal.z * uLightThreshold.z + lThreshold.z)
		);
	
		gl_FragColor = vec4(color, uAlpha);
	}`;
}
