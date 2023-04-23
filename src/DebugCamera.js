

import Component from "./Component";
import * as THREE from "three";



export default class DebugCamera extends Component{
    constructor(scene, lookAt){
        super();

        this.name = 'debugCamera';
        this.scene = scene;
        this.lookAt = lookAt;
        this.camera = new THREE.PerspectiveCamera();
        this.camera.near = 0.01;
        this.debugCameraPosition = [4,1,0]

        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);



        this.canvas = document.getElementById("canvas2");
        // const context = canvas2.getContext("2d");
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: true });
        // this.renderer = new THREE.WebGLRenderer({context: context, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 1;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

        this.WindowResizeHandler();
        window.addEventListener("resize", this.WindowResizeHandler);

    }

    WindowResizeHandler = () => {
        let { innerHeight, innerWidth } = window;
        innerHeight *= 0.3
        innerWidth *= 0.3
        // const { innerHeight, innerWidth } = this.canvas.getBoundingClientRect();
        // const innerWidth = this.canvas.scrollWidth;
        // const innerHeight = this.canvas.scrollHeight;
        this.renderer.setSize(innerWidth, innerHeight);
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
    };

    Initialize(){
        this.camera.position.set(1, 2, 1);
        // this.camera.setRotationFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(5), THREE.MathUtils.degToRad(185), 0));

    }


    Update(){
        const pos = this.lookAt.position
        this.camera.position.set(pos.x + this.debugCameraPosition[0], pos.y + this.debugCameraPosition[1] , pos.z + this.debugCameraPosition[2]);
        this.camera.lookAt(pos)

        this.renderer.render(this.scene, this.camera);
    }

}