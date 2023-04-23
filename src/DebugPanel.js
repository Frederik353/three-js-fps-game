// import * as THREE from "three";
import { Pane } from "tweakpane";
import Component from "./Component";
import DirectionDebug from "./entities/NPC/DirectionDebug";

export default class DebugPanel extends Component {
    constructor(game) {
        super();
        this.name = "DebugPanel";

        this.game = game;
        this.entityManager = this.game.entityManager;
        this.scene = this.game.scene;

        // this.entityManager.entities.forEach((v, i) => {
        // if (v.name == "Player") {
        // this.weapon = v.components.Weapon;
        // }
        // else if (v.name.includes("Player")) {
        // });

        this.lastUpdate = Date.now();
        this.stats = { fps: 0 };
        this.settings = {
            weapon: {
                scale: 0.5,
                position: { x: 0, y: 0, z: 0 },
                muzzlePosition: { x: 0, y: 0, z: 0 },
            },
            graplingGun: {
                scale: 0.5,
                position: { x: 0, y: 0, z: 0 },
            },
            debug: {
                debugArrow: false,
                physicsObjects: false,
                DebugCameraPosition: { x: 4, y: 1, z: 0 },
            },
        };
    }
    Initialize() {
        this.weapon = this.FindEntity("Player").GetComponent("Weapon");
        this.uimanager = this.FindEntity("UIManager").GetComponent("UIManager");
        this.pane = new Pane({ title: "Debug Panel" });

        this.weaponPane();
        this.debuggerPane();
        this.monitorPane();
    }

    updateGun(gun,scale, pos) {
        this.weapon.camera.children.forEach((v, i) => {
            if (v.name == gun) {
                if (pos) {
                    v.position.set(pos.x, pos.y, pos.z);
                }
if (scale) {
                        v.scale.set(scale, scale, scale);
                    }
                    console.log(v.scale,v.position);
            }
        });
    }

    weaponPane() {
        this.weaponFolder = this.pane.addFolder({
            title: "Weapon",
            expanded: false,
        });

        this.weaponFolder.addInput(this.weapon, "fireRate", {
            step: 0.01,
            min: 0,
            max: 5,
        });
        this.weaponFolder
            .addInput(this.weapon, "ammo", {
                step: 1,
                min: 0,
                max: 1000,
            })
            .on("change", (e) => {
                this.uimanager.SetAmmo(this.weapon.magAmmo, this.weapon.ammo);
            });
        this.weaponFolder
            .addInput(this.weapon, "magAmmo", {
                step: 1,
                min: 0,
                max: 1000,
            })
            .on("change", (e) => {
                this.uimanager.SetAmmo(this.weapon.magAmmo, this.weapon.ammo);
            });

        this.weaponFolder
            .addInput(this.settings.weapon, "scale", {
                step: 0.01,
                min: 0,
                max: 5,
            })
            .on("change", (e) => {
                this.updateGun( "Scene",e.value, undefined);
            });
        this.settings.weapon.position = {x: this.weapon.camera.children[1].position.x, y: this.weapon.camera.children[1].position.y, z: this.weapon.camera.children[1].position.z};
        this.weaponFolder
            .addInput(this.settings.weapon, "position", {
                x: { step: 0.01, min: -5, max: 5 },
                y: { step: 0.01, min: -5, max: 5 },
                z: { step: 0.01, min: -5, max: 5 },
            })
            .on("change", (e) => {
                this.updateGun( "Scene",undefined, e.value);
            });

        this.weaponFolder
            .addInput(this.settings.weapon, "muzzlePosition", {
                x: { step: 0.1, min: -100, max: 100 },
                y: { step: 0.1, min: -100, max: 100 },
                z: { step: 0.1, min: -100, max: 100 },
            })
            .on("change", (e) => {
                this.weapon.model.children[1].position.set(
                    -e.value.x,
                    e.value.y,
                    -e.value.z
                );
            });
        // grapling gun
        this.weaponFolder.addSeparator();

        this.weaponFolder
            .addInput(this.settings.graplingGun, "scale", {
                step: 0.01,
                min: 0,
                max: 5,
            })
            .on("change", (e) => {
                this.updateGun( "GraplingGun" ,e.value, undefined);
            });
        this.settings.weapon.position = {x: this.weapon.camera.children[2].position.x, y: this.weapon.camera.children[2].position.y, z: this.weapon.camera.children[2].position.z};
        this.weaponFolder
            .addInput(this.settings.weapon, "position", {
                x: { step: 0.01, min: -5, max: 5 },
                y: { step: 0.01, min: -5, max: 5 },
                z: { step: 0.01, min: -5, max: 5 },
            })
            .on("change", (e) => {
                this.updateGun( "GraplingGun",undefined, e.value);
            });
    }
    debuggerPane() {
        this.debug = this.pane.addFolder({
            title: "Debugging tools",
            expanded: false,
        });
        this.debug
            .addInput(this.settings.debug, "physicsObjects")
            .on("change", (e) => {
                e.value
                    ? this.game.debugDrawer.enable()
                    : this.game.debugDrawer.disable();
            });

        this.debug
            .addInput(this.settings.debug, "debugArrow")
            .on("change", (e) => {
                this.entityManager.entities.forEach((v, i) => {
                    if (v.name.includes("Mutant")) {
                        v.components["DirectionDebug"].length = e.value ? 1 : 0;
                        // setter pil lengde til 0 altså ingen pil, enklere enn å fjerne helt
                    }
                });
            });
        this.debug
            .addInput(this.settings.debug, "DebugCameraPosition", {
                x: { step: 0.1, min: 0, max: 5 },
                y: { step: 0.1, min: 0, max: 5 },
                z: { step: 0.1, min: 0, max: 5 },
            })
            .on("change", (e) => {
                let pos = [e.value.x, e.value.y, e.value.z];
                this.parent.components["debugCamera"].debugCameraPosition = pos;
            });
    }

    monitorPane() {
        // monitors for monitoring performance and other stuff
        this.monitors = this.pane.addFolder({
            title: "Monitors",
            expanded: false,
        });

        this.monitors.addMonitor(this.stats, "fps", {
            bufferSize: 1,
        });
        this.monitors.addMonitor(this.stats, "fps", {
            view: "graph",
            min: -1,
            max: +65,
            interval: 200,
            bufferSize: 50,
        });
    }

    updateFps() {
        var now = Date.now();
        var dt = now - this.lastUpdate;
        this.stats.fps = 1000 / dt; //fps
        this.lastUpdate = now;
    }

    Update() {
        this.updateFps();
        this.game.debugDrawer.update();
    }
}
