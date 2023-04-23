import Component from "../../Component";
import * as THREE from "three";
import { Ammo, createConvexHullShape } from "../../AmmoLib";

export default class LevelSetup extends Component {
    constructor(mesh, scene, physicsWorld) {
        super();
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.name = "LevelSetup";
        this.mesh = mesh;
        const directionalLight = new THREE.DirectionalLight( 0xFFF1D4, 3 );
        directionalLight.position.set( 0, 1, 1 );
        // directionalLight.castShadow = true;
        scene.add( directionalLight );
    }

    LoadScene(mesh) {
        let currentNode = mesh.name;
        mesh.traverse((node) => {
            // console.log(currentNode, node.name)
            // console.log((node.isGroup && currentNode != node.name))

            if (node.isMesh || node.isLight) {
                node.castShadow = true;
            }

            // console.log(node.name,node.isMesh, node.isGroup, node.isObject3D, node.isLight)
            // console.log(node)

            // if (node.isGroup && currentNode != node.name) {this.LoadScene(node);}
            if (node.isMesh) {
                node.receiveShadow = true;
                // node.material.wireframe = true;
                this.SetStaticCollider(node);
            }
            if (node.isLight) {
                node.intensity = 3;
                const shadow = node.shadow;
                const lightCam = shadow.camera;

                shadow.mapSize.width = 1024 * 3;
                shadow.mapSize.height = 1024 * 3;
                shadow.bias = -0.00007;

                const dH = 35,
                    dV = 35;
                lightCam.left = -dH;
                lightCam.right = dH;
                lightCam.top = dV;
                lightCam.bottom = -dV;

                //const cameraHelper = new THREE.CameraHelper(lightCam);
                //this.scene.add(cameraHelper);
            }
        });

        this.scene.add(this.mesh);
    }

    SetStaticCollider(mesh) {
        // console.log(mesh.scale, mesh.name)
        // console.log(mesh.name, mesh.parent.name);
        // console.log(shape, mesh.name)
        const mass = 0;
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        // modelene / mesh'ene bruker atributter relative til parent dette fungerer ikke med ammo js så må gjøre de om til absolutte verdier
        // fungerer kun hvis mesh'ene kun er nested et nivå
        if (mesh.parent.name != "Scene") {
            mesh.scale.set(mesh.parent.scale.x, mesh.parent.scale.y, mesh.parent.scale.z)
            var shape = createConvexHullShape(mesh);
            mesh.scale.set(1,1,1)

            let pos = [ mesh.position.x + mesh.parent.position.x, mesh.position.y + mesh.parent.position.y, mesh.position.z + mesh.parent.position.z, ];
            transform.setOrigin(new Ammo.btVector3(pos[0], pos[1], pos[2]));
            let quat = [
                mesh.parent.quaternion.x,
                mesh.parent.quaternion.y,
                mesh.parent.quaternion.z,
                mesh.parent.quaternion.w,
            ];
            transform.setRotation(
                new Ammo.btQuaternion(quat[0], quat[1], quat[2], quat[3])
            );
        }
        else{
            var shape = createConvexHullShape(mesh);
        }


        const motionState = new Ammo.btDefaultMotionState(transform);
        const localInertia = new Ammo.btVector3(0, 0, 0);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
            mass,
            motionState,
            shape,
            localInertia
        );
        const object = new Ammo.btRigidBody(rbInfo);
        object.parentEntity = this.parent;
        object.mesh = mesh;

        this.physicsWorld.addRigidBody(object);
    }

    Initialize() {
        this.LoadScene(this.mesh);
    }
}
