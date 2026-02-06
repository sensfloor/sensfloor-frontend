import {camera, controls, renderer, scene} from './three_js_steup'


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    
    // Required if controls.enableDamping or autoRotate are set to true
    controls.update();

    // The actual draw call
    renderer.render(scene, camera);
}

animate();