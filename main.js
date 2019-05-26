var container, stats, controls;
var camera, scene, renderer, labelRenderer;

var mouse;
var raycaster;

var CLOCK = new THREE.Clock();

var OBJECTS = [];
var LABELS = [];
var ACTIVE;

const NAMES = [
	"A_BEUTH",
	"B_GAUSS",
	"C_GRASHOF",
	"D_BAUWESEN",
	"G_GEWAECHSHAUS",
	"P_PRAESIDIUM",
	// "CONTAINER_3DOT",
	// "CONTAINER_1_2",
	// "CONTAINER_3_4"
]

var INTERSECTION;

var HOVER_HEX = 0x00f9f9;
var ACTIVE_HEX = 0xffff0f;
var delta;

const HEIGHT = window.innerHeight;
const WIDTH = 2 * window.innerWidth / 3;

var INFOWIDTH = document.getElementById("information").offsetWidth;

init();
animate();

function init() {
	$("#information").load("html/NULL.html")
	// container = document.createElement('div');
	container = document.getElementById("three");
	container.style.right = 0;
	// document.body.appendChild(container);


	//RENDERER
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);
	renderer.gammaOutput = true;
	container.append(renderer.domElement);

	// //LABELRENDERER
	// labelRenderer = new THREE.CSS2DRenderer();
	// labelRenderer.setSize(WIDTH, HEIGHT);
	// labelRenderer.domElement.style.position = 'fixed';
	// labelRenderer.domElement.style.pointerEvents = "none";
	// labelRenderer.domElement.style.top = 0;
	// document.body.appendChild(labelRenderer.domElement);


	//INPUTLISTENERS
	window.addEventListener('mousemove', onMouseMove, false);
	window.addEventListener('mousedown', onMouseDown, false);
	window.addEventListener('resize', onWindowResize, false);

	//CAMERA
	camera = new THREE.PerspectiveCamera(40, WIDTH / HEIGHT, 0.1, 5000);
	camera.position.set(-45, 300, 450);

	mouse = new THREE.Vector2();
	raycaster = new THREE.Raycaster();

	scene = new THREE.Scene();

	//3D MODEL LADEN
	var loader = new THREE.GLTFLoader().setPath('assets/');
	loader.load('LAGEPLAN.glb', function (gltf) {
		scene.add(gltf.scene);

		//MATERIAL SET
		let scn = scene.getObjectByName("Scene", true).children;
		for (let i = 0; i < scn.length; i++) {
			if (!(scn[i].name == "ROADS" || scn[i].name == "HOUSES")) {
				scn[i].material = new THREE.MeshLambertMaterial({ color: 0x00A5A5 })
			}

		}
		console.log(scene);
		//LICHTER
		var light = new THREE.AmbientLight(0x495151);
		light.intensity = 1;
		scene.add(light);

		var directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
		directionalLight.position.set(1, 3, 1);
		scene.add(directionalLight);

		scene.background = new THREE.Color(0x969696);
		scene.fog = new THREE.Fog(scene.background, 550, 1600);

		// for (let i = 0; i < NAMES.length; i++) {

		// 	let div = document.createElement('div');
		// 	div.id = NAMES[i];
		// 	div.className = 'label';
		// 	div.textContent = NAMES[i].charAt(0);
		// 	div.style.marginTop = '-1em';

		// 	let label = new THREE.CSS2DObject(div);
		// 	let pos = scene.getObjectByName(NAMES[i]).position
		// 	label.position.set(pos.x, pos.y + 10, pos.z);
		// 	// scene.getObjectByName(NAMES[i]).add(label);
		// 	scene.add(label);
		// 	console.log(scene.getObjectByName(NAMES[i]));//.add(label);

		// }
		//FALLS FEHLER
	}, undefined, function (error) {
		console.error(error);
	});

	//ORBITCONTROLS 
	controls = new THREE.OrbitControls(camera, container);
	controls.maxPolarAngle = Math.PI / 2.5;
	controls.enableDamping = true;
	controls.dampingFactor = 0.9;
	controls.enablePan = false;
	controls.enableKeys = false;

	controls.minDistance = 100;
	controls.maxDistance = 550;

	controls.autoRotate = true;
	controls.autoRotateSpeed = -0.2;

	controls.target.set(0, 0, 0);
	controls.update();


	// stats TODO
	// stats = new Stats();
	// container.appendChild(stats.dom);

}

function onMouseMove(event) {
	event.preventDefault();
	mouse.x = (event.clientX / WIDTH) * 2 - 1;
	mouse.y = - (event.clientY / HEIGHT) * 2 + 1;
}
function onMouseDown(event) {
	event.preventDefault();
	changeActive(INTERSECTION);

}
function onWindowResize() {
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();

	renderer.setSize(WIDTH, HEIGHT);
	// labelRenderer.setSize(WIDTH, HEIGHT);

}

function animate() {

	requestAnimationFrame(animate);
	controls.update()
	render();
	// labelRenderer.render(scene, camera);

	// stats.update();

}


function changeActive(newActive) {

	if (newActive != null) {
		console.log(ACTIVE);
		ACTIVE = newActive;

		console.log(ACTIVE);
		$("#information").load("html/" + ACTIVE.name + ".html")

	} else {
		ACTIVE = null;
	}

}


function render() {

	delta = CLOCK.getDelta();

	//RAYCAST
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(scene.children, true);
	if (intersects.length > 0) {

		var name = intersects[0].object.name;
		var isInteractive = !(name == "PLANE_0" || name == "PLANE_1" || name == "HOUSES" || name == "ROADS");

		if (isInteractive) {
			if (INTERSECTION) INTERSECTION.position.y = THREE.Math.lerp(INTERSECTION.position.y, INTERSECTION.currentY + 1.5, delta * 40);
			if (INTERSECTION != intersects[0].object) {

				//RESETTING OLD INTERSECTION 
				if (INTERSECTION) {
					INTERSECTION.material.color.setHex(INTERSECTION.currentHex);
					INTERSECTION.position.y = INTERSECTION.currentY;
				}

				//SETTING NEW INTERSECTION
				INTERSECTION = intersects[0].object;
				INTERSECTION.currentHex = INTERSECTION.material.color.getHex();
				INTERSECTION.currentY = INTERSECTION.position.y;
				INTERSECTION.material.color.setHex(HOVER_HEX);

				$('#three').css('cursor', 'pointer');
			}
		}
		else {
			if (INTERSECTION) {
				INTERSECTION.material.color.setHex(INTERSECTION.currentHex);

				INTERSECTION.position.y = INTERSECTION.currentY;

			}
			INTERSECTION = null;
			$('#three').css('cursor', 'default');
		}


		//ORBITTARGET
		if (ACTIVE) {
			controls.target.lerp(ACTIVE.position, delta * 4);
			controls.maxDistance = THREE.Math.lerp(controls.maxDistance, 360, delta * 2);
		}

	}


	renderer.render(scene, camera);
}

