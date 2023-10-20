import WEBGL from "three/examples/jsm/capabilities/WebGL";
import * as THREE from "three";

import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { TGALoader } from "three/examples/jsm/loaders/TGALoader";
import { JoyStick, SFX, Preloader } from "./toon3d";

// game class
class Game {
    public container: HTMLElement;
    public player: Player;
    public player1: Player;
    public banner: Banner;
    public animations: Map<string, any>;
    public camera: THREE.PerspectiveCamera;
    public scene: THREE.Scene;
    public renderer: THREE.WebGLRenderer;
    public clock: THREE.Clock;
    public sun: THREE.DirectionalLight;
    public joystick: JoyStick | any;
    public colliders: Array<THREE.Mesh>;
    public modes: any;
    public mode: any;
    public assetsPath: string;
    public messages: any;
    public animationFiles: Array<string>;
    public loadingManager: THREE.LoadingManager;
    public environment: any;
    public remotePlayers: any;
    public remoteColliders: any;
    public loadingPlayers: any;
    public remoteData: any;
    public sfx: any;

    constructor(container: HTMLElement) {

        // check if webgl is enabled
        if (WEBGL.isWebGLAvailable() === false) alert(WEBGL.getWebGLErrorMessage());

        // game modes for preloader
        this.modes = Object.freeze({
            NONE: Symbol("none"),
            PRELOAD: Symbol("preload"),
            INITIALISING: Symbol("initialising"),
            CREATING_LEVEL: Symbol("creating_level"),
            ACTIVE: Symbol("active"),
            GAMEOVER: Symbol("gameover")
        });
        this.mode = this.modes.NONE;

        // game variables
        this.player = {} as Player;
        this.player1 = {} as Player;
        this.banner = {} as Banner;
        this.animations = new Map();
        this.container = container;
        this.colliders = [];
        this.clock = new THREE.Clock();

        this.messages = {
            text: [
                "Hi there surfer!",
                "Have fun!"
            ],
            index: 0
        }

        // asset preloading
        this.assetsPath = "/assets";
        this.animationFiles = ["walking", "running", "walkback", "turn", "idle"];

        const game = this;
        game.init();
        const options = {
            assets: [
                `${this.assetsPath}/city/city.fbx`,
                `${this.assetsPath}/city/Volumes/Vault/Dropbox/BITGEM_Products/_smashy_craft_series/city/city/construction/city_tex.tga`,
                `${this.assetsPath}/players/player1.fbx`,
                `${this.assetsPath}/players/banner.fbx`,
            ],
            oncomplete: function () {
                game.animate;
            }
        };
        this.animationFiles.forEach(filename => {
            options.assets.push(`assets/animations/${filename}.fbx`)
        });
        this.mode = this.modes.PRELOAD;
        const preloader = new Preloader(options);

        // in-game sfx audio
        const sfxExt = SFX.supportsAudioType('mp3') ? 'mp3' : 'ogg';

        // generic error handler
        window.addEventListener("error", (error) => { console.error(JSON.stringify(error)); });
    };

    // initialize threejs components
    init() {
        const game = this;
        this.mode = this.modes.INITIALISING;

        // setup camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 200000);

        // create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x00a0f0);

        // setup ambient light
        const ambientLight = new THREE.AmbientLight(0xaaaaaa);
        this.scene.add(ambientLight);

        // setup directional light and shadows
        const dicrectionalLight = new THREE.DirectionalLight(0xaaaaaa);
        dicrectionalLight.position.set(30, 100, 40);
        dicrectionalLight.target.position.set(0, 0, 0);
        dicrectionalLight.castShadow = true;

        const shadowSize = 500;
        dicrectionalLight.shadow.camera.near = 1;
        dicrectionalLight.shadow.camera.far = shadowSize;
        dicrectionalLight.shadow.camera.left = dicrectionalLight.shadow.camera.bottom = -shadowSize;
        dicrectionalLight.shadow.camera.right = dicrectionalLight.shadow.camera.top = shadowSize;
        dicrectionalLight.shadow.bias = 0.0039;
        dicrectionalLight.shadow.mapSize.width = 1024;
        dicrectionalLight.shadow.mapSize.height = 1024;
        this.sun = dicrectionalLight;
        this.scene.add(dicrectionalLight);

        // load player model
        this.loadingManager = new THREE.LoadingManager();
        // add handler for TGA textures
        this.loadingManager.addHandler(/\.tga$/i, new TGALoader());

        const loader = new FBXLoader(this.loadingManager);
        loader.load(`${this.assetsPath}/players/player1.fbx`, (object) => {
            // animations
            const mixer = new THREE.AnimationMixer(object);
            game.player.mixer = mixer;
            game.player.root = mixer.getRoot();
            game.animations["idle"] = object.animations[0];

            // name for the object
            object.name = "player";

            // traverse children and update attributes
            object.traverse(function (child) {
                let isMesh = (child as THREE.Mesh).isMesh;
                if (isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = false;
                }
            });

            // wrap player in a 3D object
            object.scale.set(1.2, 1.2, 1.2);
            game.player.object = new THREE.Object3D();
            game.player.object.position.set(2600, 0, 4300);
            game.player.object.rotation.set(0, 2, 0); // between 0 - 6
            game.sun.target = game.player.object;
            game.player.object.add(object);
            game.scene.add(game.player.object);

            game.joystick = new JoyStick({
                onMove: game.playerControl,
                game: game
            });

            // create cameras and environment
            game.createCameras();
            game.loadEnvironment(loader);
        });

        // banner
        loader.load(`${this.assetsPath}/players/banner.fbx`, (object) => {
            // animations
            const mixer = new THREE.AnimationMixer(object);
            game.banner.mixer = mixer;
            game.banner.root = mixer.getRoot();
            game.animations["idle"] = object.animations[0];

            // name for the object
            object.name = "banner";

            // traverse children and update attributes
            object.traverse(function (child) {
                let isMesh = (child as THREE.Mesh).isMesh;
                if (isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = false;
                }
            });

            // wrap player in a 3D object
            object.scale.set(1.2, 1.2, 1.2);
            game.banner.object = new THREE.Object3D();
            game.banner.object.position.set(200, 0, 900);
            game.banner.object.rotation.set(0, 2, 0); // between 0 - 6
            game.sun.target = game.banner.object;
            game.banner.object.add(object);
            game.scene.add(game.banner.object);

            // create cameras and environment
            game.createCameras();
            game.loadEnvironment(loader);
        });

        // create renderer and attach to DOM
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.innerHTML = "";
        this.container.appendChild(this.renderer.domElement);

        // add event listener to resize canvas on window resize
        window.addEventListener("resize", () => { game.onWindowResize(); }, false);
    };

    // load in-game audio
    // initSfx() {
    //     this.sfx = {};
    //     this.sfx.context = new (window.AudioContext || window.webkitAudioContext)();
    //     this.sfx.gliss = new SFX({
    //         context: this.sfx.context,
    //         src: { mp3: `${this.assetsPath}/sfx/gliss.mp3`, ogg: `${this.assetsPath}/sfx/gliss.ogg` },
    //         loop: false,
    //         volume: 0.3
    //     });
    // }

    // load city environment
    loadEnvironment(loader) {
        const game = this;
        loader.load(`${game.assetsPath}/city/city.fbx`, function (object) {
            game.environment = object;
            game.colliders = [];
            game.scene.add(object);

            // create obstacle colliders
            object.traverse(function (child) {
                if (child.isMesh) {
                    game.colliders.push(child);
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // const tloader = new THREE.CubeTextureLoader(game.loadingManager);

            // var textureCube = tloader.load([
            //     `${game.assetsPath}/city_glow.tga`,
            //     `${game.assetsPath}/city_metal.tga`,
            //     `${game.assetsPath}/city_rough.tga`,
            //     `${game.assetsPath}/city_tex.tga`,
            //     `${game.assetsPath}/sidewalk_tile.tga`,
            //     `${game.assetsPath}/sidewalk_tile_metal.tga`,
            //     `${game.assetsPath}/sidewalk_tile_rough.tga`
            // ]);

            // game.scene.background = textureCube;

            game.loadAnimations(loader);
        })
    };

    // load all animations
    loadAnimations(loader: FBXLoader) {
        const game = this;
        for (let filename of this.animationFiles) {
            loader.load(`${game.assetsPath}/animations/${filename}.fbx`, (object) => {
                game.animations[filename] = object.animations[0];
            });
        }

        // set action and start rendering
        game.action = "idle";
        game.mode = game.modes.ACTIVE;
        game.animate();
    };


    // move the player on canvas
    movePlayer(dt) {
        // fetch current position of player
        const currentPosition = this.player.object.position.clone();
        currentPosition.y += 60; // above the ground

        // fetch current direction - object's Z axis
        let direction = new THREE.Vector3();
        this.player.object.getWorldDirection(direction);

        // backward direction based on joystick
        const forward = this.player.move.forward > 0 ? true : false;
        if (!forward) direction.negate();

        // raycaster to identify collision
        let raycaster = new THREE.Raycaster(currentPosition, direction);
        let blocked = false;
        const colliders = this.colliders;

        // cast rays towards obstacles and find intersections
        if (colliders !== undefined) {
            const intersect = raycaster.intersectObjects(colliders);

            if (intersect.length > 0) {
                if (intersect[0].distance < 50) blocked = true;
                // for (let collision of intersect) {
                //     // forward collision
                //     if (collision.distance < 10 && forward) {
                //         blocked = true;
                //         break;
                //     }

                //     // collision in other directions
                //     if (collision.distance < 100 && !forward) {
                //         blocked = true;
                //         break;
                //     }
                // }
            }
        }

        // move the player if not blocked
        if (!blocked) {
            // move the player forward
            if (forward) {
                const speed = (this.player.action == "running") ? 400 : 150;
                this.player.object.translateZ(dt * speed);
            }
            else {
                // move player backwards
                this.player.object.translateZ(-dt * 30);
            }
        }

        // collision in other directions
        // if (colliders !== undefined) {
        //     cast left
        //     direction.set(-1, 0, 0);
        //     direction.applyMatrix4(this.player.object.matrix);
        //     direction.normalize();
        //     raycaster = new THREE.Raycaster(currentPosition, direction);

        //     let intersect = raycaster.intersectObjects(colliders);
        //     if (intersect.length > 0) {
        //         if (intersect[0].distance < 50) this.player.object.translateX(100 - intersect[0].distance);
        //     }

        //     // cast right
        //     direction.set(1, 0, 0);
        //     direction.applyMatrix4(this.player.object.matrix);
        //     direction.normalize();
        //     raycaster = new THREE.Raycaster(currentPosition, direction);

        //     intersect = raycaster.intersectObjects(colliders);
        //     if (intersect.length > 0) {
        //         if (intersect[0].distance < 50) this.player.object.translateX(intersect[0].distance - 100);
        //     }

        //     cast down
        //     direction.set(0, -1, 0);
        //     direction.y += 200;
        //     raycaster = new THREE.Raycaster(currentPosition, direction);
        //     const gravity = 30;

        //     intersect = raycaster.intersectObjects(colliders);
        //     console.log(intersect);
        //     if (intersect.length > 0) {
        //         const targetY = currentPosition.y - intersect[0].distance;
        //         if (targetY > this.player.object.position.y) {
        //             //Going up
        //             this.player.object.position.y = 0.8 * this.player.object.position.y + 0.2 * targetY;
        //             this.player.velocityY = 0;
        //         } else if (targetY < this.player.object.position.y) {
        //             //Falling
        //             if (this.player.velocityY == undefined) this.player.velocityY = 0;
        //             this.player.velocityY += dt * gravity;
        //             this.player.object.position.y -= this.player.velocityY;
        //             if (this.player.object.position.y < targetY) {
        //                 this.player.velocityY = 0;
        //                 this.player.object.position.y = targetY;
        //             }
        //         }
        //     }
        // }

        // turn
        this.player.object.rotateY(this.player.move.turn * dt);
    };

    // window resize callback
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // set animation action
    set action(name: string) {
        // stop all current animations and load new ones
        const action = this.player.mixer.clipAction(this.animations[name]);
        action.time = 0;
        this.player.mixer.stopAllAction();
        this.player.action = name;
        this.player.actionTime = Date.now();

        // action.fadeIn(0.05);
        action.play();
    }

    // read current action
    get action() {
        if (this.player === undefined || this.player.action === undefined) return "";
        return this.player.action;
    }

    // player control states - callback for joystick
    playerControl(forward, turn) {
        turn = -turn;

        if (forward > 0.3) {
            // walking forward
            if (this.player.action != "walking" && this.player.action != "running") this.action = "walking";
        }
        else if (forward < -0.3) {
            // walking backward
            if (this.player.action != "walkback") this.action = "walkback";
        }
        else {
            // turn
            forward = 0;
            if (Math.abs(turn) > 0.1) {
                if (this.player.action != "turn") this.action = "turn";
            }
            else if (this.player.action != "idle") {
                this.action = "idle";
            }
        };

        // stop moving
        if (forward == 0 && turn == 0) {
            delete this.player.move;
        }
        else {
            // set movement speed
            this.player.move = { forward, turn };
        }
    }

    // set current active camera
    set activeCamera(object) {
        this.player.cameras.active = object;
    }

    // create cameras for different views of the player
    createCameras() {
        const game = this;
        const offset = new THREE.Vector3(0, 80, 0);

        const front = new THREE.Object3D();
        front.position.set(112, 100, 600);
        front.parent = this.player.object;

        const back = new THREE.Object3D();
        back.position.set(0, 300, -600);
        back.parent = this.player.object;

        const wide = new THREE.Object3D();
        wide.position.set(178, 139, 1665);
        wide.parent = this.player.object;

        const overhead = new THREE.Object3D();
        overhead.position.set(0, 400, 0);
        overhead.parent = this.player.object;

        const collect = new THREE.Object3D();
        collect.position.set(40, 82, 94);
        collect.parent = this.player.object;

        // store cameras in player
        this.player.cameras = { front, back, wide, overhead, collect };
        game.activeCamera = this.player.cameras.back;
    }

    // render game
    animate() {
        const game = this;
        const dt = this.clock.getDelta();

        // set render loop
        requestAnimationFrame(function () { game.animate(); });

        // update animations
        if (this.player.mixer != undefined && this.mode == this.modes.ACTIVE) this.player.mixer.update(dt);

        // update player control state
        if (this.player.action == "walking") {
            const elapsedTime = Date.now() - this.player.actionTime;

            if (elapsedTime > 1000 && this.player.move.forward > 0) {
                this.action = "running";
            }
        }

        // update player position
        if (this.player.move !== undefined) {
            this.movePlayer(dt);
        }

        // move the camera
        if (this.player.cameras != undefined && this.player.cameras.active != undefined) {
            // fetch current active position of the player camera
            // and move game camera to that position smoothly
            let worldPosition = this.player.cameras.active.getWorldPosition(new THREE.Vector3());
            this.camera.position.lerp(worldPosition, 0.05);

            // set cameras target object to look at
            const pos = this.player.object.position.clone();
            pos.y += 300;
            this.camera.lookAt(pos);
        }

        // move the directional light to focus the player
        if (this.sun != undefined) {
            this.sun.position.copy(this.camera.position);
            this.sun.position.y += 10;
        }

        // render scene
        this.renderer.render(this.scene, this.camera);

        // if (this.stats != undefined) this.stats.update();
    }
}

export { Game };
