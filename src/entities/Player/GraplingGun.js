import * as THREE from "three";
import Component from "../../Component";
import Input from "../../Input";
import { Ammo, AmmoHelper, CollisionFilterGroups } from "../../AmmoLib";

import GraplingGunFSM from "./GraplingGunFSM";

export default class GraplinGun extends Component {
    constructor(camera, model, physicsWorld, shotSoundBuffer, listener, world) {
        super();
        this.name = "GraplinGun";
        this.camera = camera;
        this.physicsWorld = physicsWorld;
        this.world = world
        this.model = model;
        this.animations = {};
        this.shoot = false;
        this.equipped = false;
        this.ropeStartPos = [-0.12,-0.166,0.015]

        this.shotSoundBuffer = shotSoundBuffer;
        this.audioListner = listener;

        // this.damage = 2;
        this.reloading = false;
        this.hitResult = {
            intersectionPoint: new THREE.Vector3(),
            intersectionNormal: new THREE.Vector3(),
        };
    }

    SetAnim(name, clip) {
        const action = this.mixer.clipAction(clip);
        this.animations[name] = { clip, action };
    }

    SetAnimations() {
        this.mixer = new THREE.AnimationMixer(this.model);
        this.SetAnim("shoot", this.model.animations[0]);
        this.SetAnim("equip", this.model.animations[1]);
        this.SetAnim("idle", this.model.animations[2]);
        this.SetAnim("reload", this.model.animations[3]);
    }

    SetSoundEffect() {
        this.shotSound = new THREE.Audio(this.audioListner);
        this.shotSound.setBuffer(this.shotSoundBuffer);
        this.shotSound.setLoop(false);
    }

    Initialize() {
        this.GetComponent("PlayerControls").guns.push(this);
        this.model.name = "GraplingGun";
        const scene = this.model;
        let scale = 0.17;
        let pos = [0.07, 0.1, -0.54];
        this.model.scale.set(scale, scale, scale);
        this.model.position.set(...pos);
        this.model.setRotationFromEuler(
            new THREE.Euler(
                THREE.MathUtils.degToRad(5),
                THREE.MathUtils.degToRad(185),
                0
            )
        );

        this.model.traverse((child) => {
            if (!child.isSkinnedMesh) {
                return;
            }

            child.visible = false;
            child.receiveShadow = true;
            child.frustumCulled = false;
        });

        this.camera.add(scene);

        this.SetAnimations();
        this.SetSoundEffect();

        this.stateMachine = new GraplingGunFSM(this);
        this.stateMachine.SetState("idle");

        this.uimanager = this.FindEntity("UIManager").GetComponent("UIManager");

        // this.SetupInput();
    }

    ToggleEquipped() {
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.visible = !child.visible;
            }
        });
        if (!this.equipped) {
            this.stateMachine.SetState("equip");
            this.equipping = true;
        }
        this.equipped = !this.equipped;
    }

    EquipDone() {
        this.equipping = false;
    }

    // setupinput() {
    //     input.addmousedownlistner((e) => {
    //         if (!input.islocked || e.button != 0 || this.reloading) {
    //             return;
    //         }

    //         this.shoot = true;
    //         this.shoottimer = 0.0;
    //     });

    //     input.addmouseuplistner((e) => {
    //         if (e.button != 0) {
    //             return;
    //         }

    //         this.shoot = false;
    //     });

    // }

    ToggleShoot() {
        this.shoot = !this.shoot;
        this.shootTimer = 0.0;
    }

    Reload() {
        this.reloading = true;
        this.stateMachine.SetState("reload");
    }

    ReloadDone() {
        this.reloading = false;
    }

    Raycast() {
        const start = new THREE.Vector3(0.0, 0.0, -1.0);
        start.unproject(this.camera);
        const end = new THREE.Vector3(0.0, 0.0, 1.0);
        end.unproject(this.camera);

        const collisionMask =
            CollisionFilterGroups.AllFilter &
            ~CollisionFilterGroups.SensorTrigger;

        if (
            AmmoHelper.CastRay(
                this.physicsWorld,
                start,
                end,
                this.hitResult,
                collisionMask
            )
        ) {
            const ghostBody = Ammo.castObject(
                this.hitResult.collisionObject,
                Ammo.btPairCachingGhostObject
            );
            const rigidBody = Ammo.castObject(
                this.hitResult.collisionObject,
                Ammo.btRigidBody
            );
            const entity = ghostBody.parentEntity || rigidBody.parentEntity;

            entity &&
                entity.Broadcast({
                    topic: "hit",
                    from: this.parent,
                    amount: this.damage,
                    hitResult: this.hitResult,
                });
        }
    }

    rope() {
        // The rope
        // Rope graphic object
        const ropeNumSegments = 10;
        const ropeLength = 4;
        const ropeMass = 3;
        // const ropePos = {x: this.model.position.x, y: this.model.position.y, z: this.model.position.z};
        let ropePos = this.camera.localToWorld(this.model.position.clone());
        // ropePos = ropePos.add(new THREE.Vector3(0, -6.5, (this.model.position.x/2) - 2.9))
        // console.log(this.FindEntity("Debug").GetComponent("DebugPanel"))
        // console.log(this.FindEntity("Debug").GetComponent("DebugPanel").settings)
        this.ropeStartPos =  this.FindEntity("Debug").GetComponent("DebugPanel").settings.graplingGun.ropeStartPos
        console.log(this.ropeStartPos)
        ropePos = new THREE.Vector3(this.ropeStartPos.x, this.ropeStartPos.y, this.ropeStartPos.z).add(ropePos);
        // console.log(ropePos)

        // const ropePos = this.camera.localToWorld(new THREE.Vector3(10,-1, 0));
        // const ropePos = this.model.position.clone()
        // const ropePos = this.camera.position.clone()
        // const ropePos = new THREE.Vector3(0,0,0)
        // matrixWorld.getPosition();
        // ball.position.clone();
        // ropePos.y += ballRadius;

        const segmentLength = ropeLength / ropeNumSegments;
        const ropeGeometry = new THREE.BufferGeometry();
        const ropeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const ropePositions = [];
        const ropeIndices = [];

        for (let i = 0; i < ropeNumSegments + 1; i++) {
            ropePositions.push(
                ropePos.x,
                ropePos.y + i * segmentLength,
                ropePos.z
            );
        }

        for (let i = 0; i < ropeNumSegments; i++) {
            ropeIndices.push(i, i + 1);
        }

        ropeGeometry.setIndex(
            new THREE.BufferAttribute(new Uint16Array(ropeIndices), 1)
        );
        ropeGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(ropePositions), 3)
        );
        ropeGeometry.computeBoundingSphere();
        let rope = new THREE.LineSegments(ropeGeometry, ropeMaterial);
        rope.castShadow = true;
        rope.receiveShadow = true;
        // this.camera.add(rope);
        this.world.add(rope);

        // Rope physic object
        const softBodyHelpers = new Ammo.btSoftBodyHelpers();
        const ropeStart = new Ammo.btVector3(ropePos.x, ropePos.y, ropePos.z);
        const ropeEnd = new Ammo.btVector3(
            ropePos.x,
            ropePos.y + ropeLength,
            ropePos.z
        );
        const ropeSoftBody = softBodyHelpers.CreateRope(
            this.physicsWorld.getWorldInfo(),
            ropeStart,
            ropeEnd,
            ropeNumSegments - 1,
            0
        );

        const margin = 0.05;
        const sbConfig = ropeSoftBody.get_m_cfg();
        sbConfig.set_viterations(10);
        sbConfig.set_piterations(10);
        ropeSoftBody.setTotalMass(ropeMass, false);
        Ammo.castObject(ropeSoftBody, Ammo.btCollisionObject)
            .getCollisionShape()
            .setMargin(margin * 3);
        this.physicsWorld.addSoftBody(ropeSoftBody, 1, -1);
        rope.userData.physicsBody = ropeSoftBody;
        // Disable deactivation
        ropeSoftBody.setActivationState(4);

        // Glue the rope extremes to the ball and the arm

        // const influence = 1;
        // ropeSoftBody.appendAnchor( 0, ball.userData.physicsBody, true, influence );
        // ropeSoftBody.appendAnchor( ropeNumSegments, arm.userData.physicsBody, true, influence );
    }

    Shoot(t) {
        if (!this.shoot) {
            return;
        }

        if (this.shootTimer <= 0.0) {
            //Shoot

            this.Raycast();
            this.Broadcast({ topic: "graplingGun_shot" });
            this.rope()

            this.shotSound.isPlaying && this.shotSound.stop();
            this.shotSound.play();
        }

        this.shootTimer = Math.max(0.0, this.shootTimer - t);
    }

    Update(t) {
        this.mixer.update(t);
        this.stateMachine.Update(t);
        this.Shoot(t);
    }
}
