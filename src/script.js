import * as THREE from 'three';
import './style.css';
import DeviceOrientationController from './DeviceOrientationController.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { VideoTexture } from 'three';

function main() {
    // Canvas
  const canvas = document.querySelector('canvas.webgl')
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
  renderer.setClearAlpha(0.0);

  // grab the video element
  const video = document.querySelector('video');
  // this object needs to be an argument of getUserMedia
  const constraints = {
    video: {
      facingMode: 'environment'
    }
  };

  if(navigator.mediaDevices != undefined){
    // when you grab the stream - display it on the <video> element
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {video.srcObject = stream})
      .catch(console.error);
  }

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  const scene = new THREE.Scene();

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  function makeInstance(geometry, color, x, y, z){
    const material = new THREE.MeshPhongMaterial({color});  // greenish blue
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

    return cube;
  }

  const cubes = [
    makeInstance(geometry, 0xaa8844,  0, 0, 4.5),
    makeInstance(geometry, 0x44aa88,  3, 0, 3),
    makeInstance(geometry, 0xaa8844, 4.5, 0, 0),
    makeInstance(geometry, 0x44aa88,  3, 0, -3),
    makeInstance(geometry, 0xaa8844, 0, 0, -4.5),
    makeInstance(geometry, 0x44aa88, -3, 0, -3),
    makeInstance(geometry, 0xaa8844, -4.5, 0, 0),
    makeInstance(geometry, 0x44aa88, -3, 0, 3),
  ];

  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.PointLight(color,intensity, 20);
  light.position.set(0,0,0);
  scene.add(light);

  if(typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
    .then(response => {
    if (response == 'granted') {
      window.addEventListener('deviceorientation', (e) => {
        const controls = new DeviceOrientationController(camera, renderer.domElement);
        controls.connect();
      })
    } 
  })
  .catch(console.error)
  } else {
    const controls = new DeviceOrientationController(camera, renderer.domElement);
    controls.connect();
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time){
    time *= 0.001;
    controls.update();
    if(resizeRendererToDisplaySize(renderer)){
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
