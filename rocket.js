import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class Rocket extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        const planet_subdivs = 6;

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            sun: new defs.Subdivision_Sphere(planet_subdivs),
            mercury: new defs.Subdivision_Sphere(planet_subdivs),
            venus: new defs.Subdivision_Sphere(planet_subdivs),
            earth: new defs.Subdivision_Sphere(planet_subdivs),
            mars: new defs.Subdivision_Sphere(planet_subdivs),
            jupiter: new defs.Subdivision_Sphere(planet_subdivs),
            saturn: new defs.Subdivision_Sphere(planet_subdivs),
            uranus: new defs.Subdivision_Sphere(planet_subdivs),
            neptune: new defs.Subdivision_Sphere(planet_subdivs),
            pluto: new defs.Subdivision_Sphere(planet_subdivs),
            uranusring: new defs.Torus(30,30),
            saturnring: new defs.Torus(30,30),
            background: new defs.Subdivision_Sphere(6),
            rocket: new Shape_From_File("our-assets/rocketship2.obj"),
            particle: new defs.Subdivision_Sphere(2),
        };

        // Shader options common to all planets
        const planet_options = {
            color: color(.5, .5, .5, 1),
            ambient: 0.5, diffusivity: 0.5, specularity: 0.5,
        };
        // Set initial rocket location to initial sun location
        this.rocket_matrix = Mat4.identity().times(Mat4.scale(2,2,2)).times(Mat4.translation(0,0,-3));
        this.to_rocket = false;

        // *** Materials
        this.materials = {
            sun: new Material(new defs.Fake_Bump_Map(1), {
               ...planet_options, texture: new Texture("our-assets/sun_resized.jpeg")
            }),
            mercury: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/mercury.jpeg")
            }),
            venus: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/venus.jpeg")
            }),
            earth: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/earth.jpeg")
            }),
            mars: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/mars.jpg")
            }),
            jupiter: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/jupiter.jpeg")
            }),
            saturn: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/saturn_resized.jpeg")
            }),
            uranus: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/uranus.jpg")
            }),
            neptune: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/neptune_resized.jpg")
            }),
            pluto: new Material(new defs.Fake_Bump_Map(1), {
                ...planet_options, texture: new Texture("our-assets/pluto.png")
            }),

            uranusring: new Material(new Ring_Shader(),
                {...planet_options, color: hex_color('#ADD8E6')}),
            saturnring: new Material(new Ring_Shader(),
                {...planet_options}),

            background: new Material(new defs.Fake_Bump_Map(1), {
                ambient: 1.0, texture: new Texture("our-assets/starmap_2020_8k.jpeg")
            }),
            rocket: new Material(new defs.Phong_Shader(),
                {ambient: .5, diffusivity: 1, specularity: 1, shininess: 1000, color: hex_color("#9FA1A3")
            }),
            particle: new Material(new defs.Phong_Shader(),
                {ambient:1, color: hex_color("#992200", 0.5)
            })
        }

        this.moving_up = false;
        this.moving_down = false;
        this.moving_left = false;
        this.moving_right = false;
        this.thrust = false;
        this.angle = 0;

        this.velocity = 0;

        this.thrust_particles = [];

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    date_select(recipient = this, parent = this.control_panel) {
        const date_widget = parent.appendChild(document.createElement("INPUT"));
        date_widget.setAttribute("id", "date");
        date_widget.setAttribute("type", "date");
        date_widget.setAttribute("value", this.date);

        let current_date = new Date(this.date);
        this.lastTGen = (getJulianDate_Planets(current_date.getFullYear(), current_date.getMonth(), current_date.getDay())-2451545.0)/36525;

        const new_date = () => {
            this.date = date_widget.value;
            let current_date = new Date(this.date);
            let julianDate = getJulianDate_Planets(current_date.getFullYear(), current_date.getMonth(), current_date.getDay());
            this.lastTGen = (julianDate-2451545.0)/36525;
        }

        date_widget.addEventListener("change", new_date);
    }


    set_camera_state(val){
        if(val == false){
            this.attached = () => this.initial_camera_location;
        }
        else{
            this.attached = () => this.rocket_cam;
        }
    }
    // const yearSelect = document.querySelector('#year');
    // const monthSelect = document.querySelector('#month');
    // const daySelect = document.querySelector('#day');

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.date = "2023-05-25";
        this.paused = false;
        this.days = 0.0;
        this.date_select();
        this.new_line();
        this.key_triggered_button("Pause/Play", ["Control", "0"], () => this.pause());
        this.key_triggered_button("Camera to Rocket", ["t"], () => this.set_camera_state(true));
        this.key_triggered_button("View Solar System", ["y"], () => this.set_camera_state(false));
        this.key_triggered_button("Move Left", ["j"], () => {this.moving_left = true}, '#6E6460', () => {this.moving_left = false});
        this.key_triggered_button("Move Up", ["i"], () => {this.moving_up = true}, '#6E6460', () => {this.moving_up = false});
        this.key_triggered_button("Move Down", ["k"], () => {this.moving_down = true}, '#6E6460', () => {this.moving_down = false});
        this.key_triggered_button("Move Right", ["l"], () => {this.moving_right = true}, '#6E6460', () => {this.moving_right = false});
        this.key_triggered_button("Thrust", ["m"], () => {this.thrust = true}, '#6E6460', () => {this.thrust = false});
        // this.key_triggered_button("View solar system", ["Control", "0"], () => this.attached = () => null);
        // this.new_line();
        // this.key_triggered_button("Attach to planet 1", ["Control", "1"], () => this.attached = () => this.planet_1);
        // this.key_triggered_button("Attach to planet 2", ["Control", "2"], () => this.attached = () => this.planet_2);
        // this.new_line();
        // this.key_triggered_button("Attach to planet 3", ["Control", "3"], () => this.attached = () => this.planet_3);
        // this.key_triggered_button("Attach to planet 4", ["Control", "4"], () => this.attached = () => this.planet_4);
        // this.new_line();
        // this.key_triggered_button("Attach to moon", ["Control", "m"], () => this.attached = () => this.moon);
    }

    pause() {
        this.paused = !(this.paused);
        let current_date = new Date(this.date);
        current_date.setDate(current_date.getDate() + this.days)
        this.days = 0.0;
        this.date = current_date.toISOString().slice(0, 10);
    }

    update_particles(context, program_state) {
        const particle_time_limit = 300;
        for (let particle of this.thrust_particles) {
            let time = Date.now();
            if (time - particle.time > particle_time_limit) {
                this.thrust_particles.expired = true;
            } else {
                const scale = this.particle_scale * particle.scale * (1 - (time - particle.time) / particle_time_limit);
                let particle_transform = particle.matrix.times(Mat4.scale(scale, scale, scale));
                this.shapes.particle.draw(context, program_state, particle_transform, this.materials.particle);
                // add random translation
                const random_x = (Math.random()*2-1) * this.particle_scale;
                const random_y = (Math.random()*2-1) * this.particle_scale;
                const random_z = (Math.random()*2-1) * this.particle_scale;
                particle.matrix = particle.matrix.times(Mat4.translation(random_x,random_y,random_z));
            }
        }
        this.thrust_particles = this.thrust_particles.filter(particle => !particle.expired);
    }

    create_particle() {
        const random_x = (Math.random()*2-1) * this.particle_scale;
        const random_y = (Math.random()*2-1) * this.particle_scale;
        const random_z = (Math.random()*2-1) * this.particle_scale;
        const random_scale = 1 + (Math.random()*2-1) * 0.15;

        let particle = {
            matrix: this.rocket_matrix.times(Mat4.translation(0,-this.rocket_scale,0)).times(Mat4.translation(random_x,random_y,random_z)),
            time: Date.now(),
            scale: random_scale,
        }
        this.thrust_particles.push(particle);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        // The parameters of the Light are: position, color, size
        this.sun_light = new Light(vec4(0, 0, 0, 1), color(1, 1, 1, 1), 10000)
        program_state.lights = [this.sun_light];

        const kms_to_aus = 6.68459e-9;
        const scale_factor = 3_000_000;
        const sun_scale_factor = 10;
        let sun_radius_kms = 695_700;
        let sun_radius = sun_radius_kms * kms_to_aus * sun_scale_factor;

        let TGen = this.lastTGen;
        if(!(this.paused)){
            TGen += 0.0015*dt;
            this.days += dt;
            this.lastTGen = TGen;
        }

        const sun_transform = Mat4.scale(sun_radius, sun_radius, sun_radius);
        this.shapes.sun.draw(context, program_state, sun_transform, this.materials.sun);

        const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        const axis_angles = { 'mercury': 2, 'venus': 3, 'earth': 23.5, 'mars': 25, 'jupiter': 3, 'saturn': 27, 'uranus': 98, 'neptune': 28 };
        let earth_rot_speed = 1;
        const planet_rot_speeds = { 'mercury': 24 / 1408, 'venus': 24 / 5832, 'earth': 24 / 24, 'mars': 24 / 25, 'jupiter': 24 / 10, 'saturn': 24 / 11, 'uranus': 24 / 17, 'neptune': 24 / 16 };
        const planet_radii_kms = { 'mercury': 2.4397, 'venus': 6.0518, 'earth': 6.371, 'mars': 3.3895, 'jupiter': 69.911, 'saturn': 58.232, 'uranus': 25.362, 'neptune': 24.622 };

        for (const planet of planets) {
            const planet_coords = plotPlanet_Planets(TGen, planets.indexOf(planet));
            const planet_radius = planet_radii_kms[planet] * kms_to_aus * scale_factor;
            const planet_rot = planet_rot_speeds[planet] * earth_rot_speed * t;
            const planet_axis_angle = axis_angles[planet] * Math.PI / 180;
            let planet_transform = Mat4.translation(planet_coords[0], 0, planet_coords[1]).times(Mat4.scale(planet_radius, planet_radius, planet_radius));
            planet_transform = planet_transform.times(Mat4.rotation(planet_rot, Math.sin(planet_axis_angle), Math.cos(planet_axis_angle), 0));
            this[planet] = planet_transform;
            this.shapes[planet].draw(context, program_state, planet_transform, this.materials[planet]);
        }
		
        let uranus_ring_transform = this.uranus.times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.scale(3,3,0.1));
        this.shapes.uranusring.draw(context, program_state, uranus_ring_transform, this.materials.uranusring);
        let saturn_ring_transform = this.saturn.times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.scale(3,3,0.1));
        this.shapes.saturnring.draw(context, program_state, saturn_ring_transform, this.materials.saturnring);

        // Draw the starry background 
        const bg_radius = 300
        const bg_transformation = Mat4.scale(bg_radius, bg_radius, bg_radius).times(Mat4.rotation(0.03*t, 0, 1, 0));
        this.shapes.background.draw(context, program_state, bg_transformation, this.materials.background);

        const angular_speed = 0.02;
        // Add camera and rocket controls.
        this.rocket_scale = 0.01;
        this.particle_scale_factor = 0.1;
        this.particle_scale = this.rocket_scale * this.particle_scale_factor;
        if(this.attached == undefined){ //reset rocket to rotate around earth if player not controlling
            var rocket_transform = this.earth.times(Mat4.translation(10,5,0).times(Mat4.scale(this.rocket_scale,this.rocket_scale,this.rocket_scale)));
            this.shapes.rocket.draw(context, program_state, rocket_transform, this.materials.rocket);
        }
        else{ // go back to the rocket_matrix to start moving the rocket
            if (this.moving_up) {
                this.rocket_matrix = this.rocket_matrix.times(Mat4.rotation(angular_speed,1,0,0));
            } if (this.moving_down) {
                this.rocket_matrix = this.rocket_matrix.times(Mat4.rotation(-angular_speed,1,0,0));
            } if (this.moving_left) {
                this.rocket_matrix = this.rocket_matrix.times(Mat4.rotation(angular_speed,0,0,1));
            } if (this.moving_right) {
                this.rocket_matrix = this.rocket_matrix.times(Mat4.rotation(-angular_speed,0,0,1));
            } if (this.thrust) {
                this.velocity += 0.0001;
                this.create_particle();
            } 
            // friction
            this.velocity *= 0.99;
            this.angular_velocity_ratio = 1000;
            this.angular_velocity = this.velocity * this.angular_velocity_ratio;
            // this.angular_velocity = 0;
            this.angle += this.angular_velocity * dt;
            // make dynamics tend towards multiples of pi
            this.reset_weight = 5;
            if (this.thrust) {
                this.reset_term = 0;
            } else {
                this.reset_term = Math.sin(this.angle);
                if ((this.angle-Math.PI/2) % (2*Math.PI) > Math.PI) {
                    this.reset_term *= -1;
                }
            }
            this.angle += this.reset_term * this.reset_weight * dt;
            this.rocket_matrix = this.rocket_matrix.times(Mat4.translation(0,this.velocity,0));
            var rocket_transform = this.rocket_matrix.times(Mat4.scale(this.rocket_scale,this.rocket_scale,this.rocket_scale));
            // twist rocket
            rocket_transform = rocket_transform.times(Mat4.rotation(this.angle,0,1,0));
            this.shapes.rocket.draw(context, program_state, rocket_transform, this.materials.rocket);

            this.update_particles(context, program_state);
        }

        this.rocket_cam = Mat4.inverse(this.rocket_matrix);
        this.rocket_cam = Mat4.rotation(-Math.PI/180 * 70, 1,0,0).times(this.rocket_cam);
        this.rocket_cam = Mat4.translation(0,0,-0.2).times(this.rocket_cam);

        if(this.attached != undefined){
            program_state.camera_inverse = this.attached().map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));

        }
    }
}

var Planets = {
	fps:20, //Set desired framerate
	now:null,
	then:Date.now(),
	interval:null,
	delta:null,
	//TPS
	nowTPS:null,
	thenTPS:Date.now(),
	avgTPSCount:0,
	TPSCount:0,
	deltaTPS:0,
	//FPS
	nowFPS:null,
	thenFPS:Date.now(),
	avgFPSCount:0,
	FPSCount:0,
	deltaFPS:0,

	julianCenturyInJulianDays:36525,
	julianEpochJ2000:2451545.0,
	julianDate:null,
	current:null,
	newDate:null,
	DAY:null,
	MONTH:null,
	YEAR:null,
	
//ELEMENTS @ J2000: a, e, i, mean longitude (L), longitude of perihelion, longitude of ascending node
planetElements: [
	//MERCURY (0)
	[0.38709927,0.20563593,7.00497902,252.25032350,77.45779628,48.33076593],
	//VENUS (1)
	[0.72333566,0.00677672,3.39467605,181.97909950,131.60246718,76.67984255],
	//EARTH (2)
	[1.00000261,0.01671123,-0.00001531,100.46457166,102.93768193,0.0],
	//MARS (3)
	[1.52371034,0.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],
	//JUPITER (4)
	[5.20288700,0.04838624,1.30439695,34.39644051,14.72847983,100.47390909],
	//SATURN (5)
	[9.53667594,0.05386179,2.48599187,49.95424423,92.59887831,113.66242448],
	//URANUS (6)
	[19.18916464,0.04725744,0.77263783,313.23810451,170.95427630,74.01692503],
	//NEPTUNE (7)
	[30.06992276,0.00859048,1.77004347,-55.12002969,44.96476227,131.78422574]
],
	
//RATES: a, e, i, mean longitude (L), longitude of perihelion, longitude of ascending node
planetRates: [
	//MERCURY (0)
	[0.00000037,0.00001906,-0.00594749,149472.67411175,0.16047689,-0.1253408],
	//VENUS (1)
	[0.00000390,-0.00004107,-0.00078890,58517.81538729,0.00268329,-0.27769418],
	//EARTH (2)
	[0.00000562,-0.00004392,-0.01294668,35999.37244981,0.32327364,0.0],
	//MARS (3)
	[0.00001847,0.00007882,-0.00813131,19140.30268499,0.44441088,-0.29257343],
	//JUPITER (4)
	[-0.00011607,-0.00013253,-0.00183714,3034.74612775,0.21252668,0.20469106],
	//SATURN (5)
	[-0.00125060,-0.00050991,0.00193609,1222.49362201,-0.41897216,-0.28867794],
	//URANUS (6)
	[-0.00196176,-0.00004397,-0.00242939,428.48202785,0.40805281,0.04240589],
	//NEPTUNE (7)
	[0.00026291,0.00005105,0.00035372,218.45945325,-0.32241464,-0.00508664]
],
	
	orbitalElements:null,
	
	xMercury:null,
	yMercury:null,
	xVenus:null,
	yVenus:null,
	xEarth:null,
	yEarth:null,
	xMars:null,
	yMars:null,
	xJupiter:null,
	yJupiter:null,
	xSaturn:null,
	ySaturn:null,
	xUranus:null,
	yUranus:null,		
	xNeptune:null,
	yNeptune:null,			
	
	scale:50,
	
	//Divide AU multiplier by this number to fit it into  "orrery" style solar system (compressed scale)
	jupiterScaleDivider:2.5, 
	saturnScaleDivider:3.5,
	uranusScaleDivider:6.2,
	neptuneScaleDivider:8.7
}

function getJulianDate_Planets(Year,Month,Day){
    var inputDate = new Date(Year,Month,Math.floor(Day));
    var switchDate = new Date("1582","10","15");

    var isGregorianDate = inputDate >= switchDate;
    //Adjust if B.C.
    if(Year<0){
        Year++;
    }
    //Adjust if JAN or FEB
    if(Month==1||Month==2){
        Year = Year - 1;
        Month = Month + 12;
    }

    //Calculate A & B; ONLY if date is equal or after 1582-Oct-15
    var A = Math.floor(Year/100); //A
    var B = 2-A+Math.floor(A/4); //B

    //Ignore B if date is before 1582-Oct-15
    if(!isGregorianDate){B=0;}

    return ((Math.floor(365.25*Year)) + (Math.floor(30.6001*(Month+1))) + Day + 1720994.5 + B);
}

function plotPlanet_Planets(TGen,planetNumber){
	//--------------------------------------------------------------------------------------------
	//1.
	//ORBIT SIZE
	//AU (CONSTANT = DOESN'T CHANGE)
	var aGen = Planets.planetElements[planetNumber][0] + (Planets.planetRates[planetNumber][0] * TGen);
	//2.
	//ORBIT SHAPE
	//ECCENTRICITY (CONSTANT = DOESN'T CHANGE)
	var eGen = Planets.planetElements[planetNumber][1] + (Planets.planetRates[planetNumber][1] * TGen);
	//--------------------------------------------------------------------------------------------
	//3.
	//ORBIT ORIENTATION
	//ORBITAL INCLINATION (CONSTANT = DOESN'T CHANGE)
	var iGen = Planets.planetElements[planetNumber][2] + (Planets.planetRates[planetNumber][2] * TGen);
	var iGen = iGen%360;
	//4.
	//ORBIT ORIENTATION
	//LONG OF ASCENDING NODE (CONSTANT = DOESN'T CHANGE)
	var WGen = Planets.planetElements[planetNumber][5] + (Planets.planetRates[planetNumber][5] * TGen);
	var WGen = WGen%360;
	//5.
	//ORBIT ORIENTATION
	//LONGITUDE OF THE PERIHELION
	var wGen = Planets.planetElements[planetNumber][4] + (Planets.planetRates[planetNumber][4] * TGen);
	wGen = wGen%360;
	if(wGen<0){wGen = 360+wGen;}	
	//--------------------------------------------------------------------------------------------
	//6.
	//ORBIT POSITION
	//MEAN LONGITUDE (DYNAMIC = CHANGES OVER TIME)
	var LGen = Planets.planetElements[planetNumber][3] + (Planets.planetRates[planetNumber][3] * TGen);
	LGen = LGen%360;
	if(LGen<0){LGen = 360+LGen;}	
	
	
	//MEAN ANOMALY --> Use this to determine Perihelion (0 degrees = Perihelion of planet)
	var MGen = LGen - (wGen);
	if(MGen<0){MGen=360+MGen;}

	//ECCENTRIC ANOMALY
	var EGen = EccAnom_Planets(eGen,MGen,6);
	
	//ARGUMENT OF TRUE ANOMALY
	var trueAnomalyArgGen = (Math.sqrt((1+eGen) / (1-eGen)))*(Math.tan(toRadians_Planets(EGen)/2));

	//TRUE ANOMALY (DYNAMIC = CHANGES OVER TIME)
	var K = Math.PI/180.0; //Radian converter variable
	if(trueAnomalyArgGen<0){ 
		var nGen = 2 * (Math.atan(trueAnomalyArgGen)/K+180); //ATAN = ARCTAN = INVERSE TAN
	}
	else{
		var nGen = 2 * (Math.atan(trueAnomalyArgGen)/K)
	}
	//--------------------------------------------------------------------------------------------
	
	//CALCULATE RADIUS VECTOR
	var rGen = aGen * (1 - (eGen * (Math.cos(toRadians_Planets(EGen)))));
	
	//TAKEN FROM: http://www.stargazing.net/kepler/ellipse.html
	//CREDIT: Keith Burnett
	//Used to determine Heliocentric Ecliptic Coordinates
	var xGen = rGen *(Math.cos(toRadians_Planets(WGen)) * Math.cos(toRadians_Planets(nGen+wGen-WGen)) - Math.sin(toRadians_Planets(WGen)) * Math.sin(toRadians_Planets(nGen+wGen-WGen)) * Math.cos(toRadians_Planets(iGen)));
	var yGen = rGen *(Math.sin(toRadians_Planets(WGen)) * Math.cos(toRadians_Planets(nGen+wGen-WGen)) + Math.cos(toRadians_Planets(WGen)) * Math.sin(toRadians_Planets(nGen+wGen-WGen)) * Math.cos(toRadians_Planets(iGen)));
	var zGen = rGen *(Math.sin(toRadians_Planets(nGen+wGen-WGen))*Math.sin(toRadians_Planets(iGen)));

	return [xGen, yGen];
}

function EccAnom_Planets(ec,m,dp) {
	var pi=Math.PI, K=pi/180.0;
	var maxIter=30, i=0;
	var delta=Math.pow(10,-dp);
	var E, F;

	m=m/360.0;
	m=2.0*pi*(m-Math.floor(m));

	if (ec<0.8) E=m; else E=pi;

	F = E - ec*Math.sin(m) - m;

	while ((Math.abs(F)>delta) && (i<maxIter)) {
		E = E - F/(1.0-ec*Math.cos(E));
		F = E - ec*Math.sin(E) - m;
		i = i + 1;
	}

	E=E/K;

	return Math.round(E*Math.pow(10,dp))/Math.pow(10,dp);
}

function toRadians_Planets(deg){
	return deg * (Math.PI / 180);
}

function round_Planets(value, decimals) {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
          point_position = model_transform * vec4(position, 1.0);
          gl_Position = projection_camera_model_transform * vec4(position, 1.0);  
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
        void main(){
            float scalar = 0.4* sin( 3.0 * distance(point_position.xyz, center.xyz));
            gl_FragColor = scalar * vec4(1.0, 1.0, 0.01, 1.0);
        }`;
    }
}
