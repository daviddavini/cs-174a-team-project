import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Rocket extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
            // s1: new defs.Subdivision_Sphere(1),
            // s2: new defs.Subdivision_Sphere(2),
            mercury: new defs.Subdivision_Sphere(4),
            venus: new defs.Subdivision_Sphere(4),
            earth: new defs.Subdivision_Sphere(4),
            mars: new defs.Subdivision_Sphere(4),
            jupiter: new defs.Subdivision_Sphere(4),
            saturn: new defs.Subdivision_Sphere(4),
            uranus: new defs.Subdivision_Sphere(4),
            neptune: new defs.Subdivision_Sphere(4),
            pluto: new defs.Subdivision_Sphere(4),
            // s4: new defs.Subdivision_Sphere(4),
            // f1: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
            // f2: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            // f3: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(3),
            // f4: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(4),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            ring: new Material(new Ring_Shader()),
            // TODO:  Fill in as many additional material objects as needed in this key/value table.
            //        (Requirement 4)
            sun: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#ffffff")}),
            mercury: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            venus: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            earth: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            mars: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            jupiter: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            saturn: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            uranus: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            neptune: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            pluto: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            // planet_1: new Material(new defs.Phong_Shader(),
            //     {diffusivity: 1, specularity: 0, color: hex_color("#808080")}),
            // planet_2_phong: new Material(new defs.Phong_Shader(),
            //     {diffusivity: 0.25, specularity: 1, color: hex_color("#80ffff")}),
            // planet_2_gouraud: new Material(new Gouraud_Shader(),
            //     {diffusivity: 0.25, specularity: 1, color: hex_color("#80ffff")}),
            // planet_3: new Material(new defs.Phong_Shader(),
            //     {diffusivity: 1, specularity: 1, color: hex_color("#b08040")}),
            // planet_3_ring_simple: new Material(new defs.Phong_Shader(),
            //     {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#b08040")}),
            // planet_3_ring_fancy: new Material(new Ring_Shader(),
            //     {diffusivity: 1, specularity: 1, color: hex_color("#b08040")}),
            // planet_4: new Material(new defs.Phong_Shader(),
            //     {diffusivity: 1, specularity: 1, smoothness: 400, color: hex_color("#ADD8E6")}),
            // planet_4_moon: new Material(new defs.Phong_Shader(),
            //     {diffusivity: 1, specularity: 1, color: hex_color("#ff00ff")}),
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("View solar system", ["Control", "0"], () => this.attached = () => null);
        this.new_line();
        this.key_triggered_button("Attach to planet 1", ["Control", "1"], () => this.attached = () => this.planet_1);
        this.key_triggered_button("Attach to planet 2", ["Control", "2"], () => this.attached = () => this.planet_2);
        this.new_line();
        this.key_triggered_button("Attach to planet 3", ["Control", "3"], () => this.attached = () => this.planet_3);
        this.key_triggered_button("Attach to planet 4", ["Control", "4"], () => this.attached = () => this.planet_4);
        this.new_line();
        this.key_triggered_button("Attach to moon", ["Control", "m"], () => this.attached = () => this.moon);
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

        // TODO: Lighting (Requirement 2)
        // const sun_time_offset = t % 8;
        // const sun_radius = (sun_time_offset < 4) ? 1 + 2*(sun_time_offset/4) : 3 - 2*((sun_time_offset-4)/4);
        // const sun_radius_normalized = (sun_radius - 1) / 2;
        // const sun_color = color(1,sun_radius_normalized,sun_radius_normalized,1)
        // const sun_position = vec4(0,0,0,1);
        // const light_position = sun_position.copy();
        // The parameters of the Light are: position, color, size
        const sun_radius = 3;
        const yellow = hex_color("#fac91a");
        program_state.lights = [new Light(vec(0,0,0,0), yellow, 10 ** sun_radius)];

        // TODO: Create Planets (Requirement 1)
        const sun_transform = Mat4.scale(sun_radius, sun_radius, sun_radius);
        this.shapes.sphere.draw(context, program_state, sun_transform, this.materials.sun.override({color: yellow}));

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 3 and 4)

        let mercury_radius = 5;
        let venus_radius = 8;
        let earth_radius = 11;
        let mars_radius = 14;
        let jupiter_radius = 17;
        let saturn_radius = 20;
        let uranus_radius = 23;
        let neptune_radius = 26;
        let pluto_radius = 29;

        let mercury_rate = 1;
        let venus_rate = 0.75;
        let earth_rate = 0.5;
        let mars_rate = 0.25;
        let jupiter_rate = 0.25;
        let saturn_rate = 0.25;
        let uranus_rate = 0.25;
        let neptune_rate = 0.25;
        let pluto_rate = 0.25;

        let mercury_num = 0;
        let venus_num = 1;
        let earth_num = 2;
        let mars_num = 3;
        let jupiter_num = 4;
        let saturn_num = 5;
        let uranus_num = 6;
        let neptune_num = 7;
        let TGen = 0.015*t;


		
        let merc_coords = plotPlanet_Planets(TGen, 0);
        let venus_coords = plotPlanet_Planets(TGen, 1);
        let earth_coords = plotPlanet_Planets(TGen, 2);
        let mars_coords = plotPlanet_Planets(TGen, 3);
        let jupiter_coords = plotPlanet_Planets(TGen, 4);
        let saturn_coords = plotPlanet_Planets(TGen, 5);
        let uranus_coords = plotPlanet_Planets(TGen, 6);
        let neptune_coords = plotPlanet_Planets(TGen, 7);

		
        let mercury_transform = Mat4.translation(merc_coords[0], 0, merc_coords[1]);
        this.mercury = mercury_transform;
		console.log();
        let venus_transform = Mat4.translation(venus_coords[0], 0, venus_coords[1]);
        this.venus = venus_transform;

        let earth_transform = Mat4.translation(earth_coords[0], 0, earth_coords[1]);
        this.earth = earth_transform;

        let mars_transform = Mat4.translation(mars_coords[0], 0, mars_coords[1]);
        this.mars = mars_transform;

        let jupiter_transform = Mat4.translation(jupiter_coords[0], 0, jupiter_coords[1]);
        this.jupiter = jupiter_transform;

        let saturn_transform = Mat4.translation(saturn_coords[0], 0,saturn_coords[1]);
        this.saturn = saturn_transform;

        let uranus_transform = Mat4.translation(uranus_coords[0], 0, uranus_coords[1]);
        this.uranus = uranus_transform;

        let neptune_transform = Mat4.translation(neptune_coords[0], 0, neptune_coords[1]);
        this.neptune = neptune_transform;


        this.shapes.mercury.draw(context, program_state, mercury_transform, this.materials.mercury);
        this.shapes.venus.draw(context, program_state, venus_transform, this.materials.venus);
        this.shapes.earth.draw(context, program_state, earth_transform, this.materials.earth);
        this.shapes.mars.draw(context, program_state, mars_transform, this.materials.mars);
        this.shapes.jupiter.draw(context, program_state, jupiter_transform, this.materials.jupiter);
        this.shapes.saturn.draw(context, program_state, saturn_transform, this.materials.saturn);
        this.shapes.uranus.draw(context, program_state, uranus_transform, this.materials.uranus);
        this.shapes.neptune.draw(context, program_state, neptune_transform, this.materials.neptune);


        // old code
        
        // let p1_transform = Mat4.translation(p1_radius * Math.cos(p1_rate * t), 0, p1_radius * Math.sin(-p1_rate * t));
        // this.planet_1 = p1_transform;
        // let p2_transform = Mat4.translation(p2_radius * Math.cos(p2_rate * t), 0, p2_radius * Math.sin(-p2_rate * t));
        // this.planet_2 = p2_transform;
        //
        // let p3_rotation_rate = 3;
        // let p3_transform = Mat4.translation(p3_radius * Math.cos(p3_rate * t), 0, p3_radius * Math.sin(-p3_rate * t)).times(Mat4.rotation(p3_rotation_rate * t, 0, 1, 0));
        // this.planet_3 = p3_transform;
        // let p3_ring_transform = p3_transform.times(Mat4.scale(3,3,0.2));
        //
        // let p4_transform = Mat4.translation(p4_radius * Math.cos(p4_rate * t), 0, p4_radius * Math.sin(-p4_rate * t));
        // this.planet_4 = p4_transform;
        // let p4_moon_radius = 2;
        // let p4_moon_rate = 2;
        // let p4_moon_transform = p4_transform.times(Mat4.translation(p4_moon_radius * Math.cos(p4_moon_rate * t), 0, p4_moon_radius * Math.sin(p4_moon_rate * t)));
        // this.moon = p4_moon_transform;
        //
        // this.shapes.f2.draw(context, program_state, p1_transform, this.materials.planet_1);
        //
        // if (t % 2 < 1) {
        //     // odd second
        //     this.shapes.s3.draw(context, program_state, p2_transform, this.materials.planet_2_gouraud);
        // } else {
        //     // even second
        //     this.shapes.s3.draw(context, program_state, p2_transform, this.materials.planet_2_phong);
        // }
        //
        // this.shapes.s4.draw(context, program_state, p3_transform, this.materials.planet_3);
        // this.shapes.torus.draw(context, program_state, p3_ring_transform, this.materials.planet_3_ring_fancy);
        //
        // this.shapes.s4.draw(context, program_state, p4_transform, this.materials.planet_4);
        // this.shapes.f1.draw(context, program_state, p4_moon_transform, this.materials.planet_4_moon);
        //
        // if (this.attached && this.attached() !== null) {
        //     var desired = Mat4.inverse(this.attached().times(Mat4.translation(0, 0, 5)));
        // } else {
        //     var desired = this.initial_camera_location;
        // }
        // const blending_factor = 0.1;
        // var desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, blending_factor));
        // program_state.set_camera(desired);
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        varying vec4 color;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                color = vec4( shape_color.xyz * ambient, shape_color.w );
                color.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = color;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));

        // this.send_material(context, gpu_addresses, material);
    }

    // send_material(gl, gpu, material) {
    //     // send_material(): Send the desired shape-wide material qualities to the
    //     // graphics card, where they will tweak the Phong lighting formula.
    //     gl.uniform4fv(gpu.shape_color, material.color);
    //     // gl.uniform1f(gpu.ambient, material.ambient);
    //     // gl.uniform1f(gpu.diffusivity, material.diffusivity);
    //     // gl.uniform1f(gpu.specularity, material.specularity);
    //     // gl.uniform1f(gpu.smoothness, material.smoothness);
    // }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;

        varying vec4 position_OCS;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            gl_Position = projection_camera_model_transform * vec4( position, 1.0 ); 
            point_position = vec4( position, 1.0 );
            center = model_transform * vec4( 0.0, 0.0, 0.0, 1.0 );
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + ` 
        void main(){
            float factor = sin(0.0+50.0 * sqrt(pow(point_position.x, 2.0) + pow(point_position.y, 2.0)));
            // float factor = sin(50.0 * distance(center, point_position));
            vec4 mixed_color =  factor * vec4(0.69,0.502,0.25,1.0);
            gl_FragColor = mixed_color;
        }`;
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
	if(Year<0){
		Year++;
	}
	if(Month==1||Month==2){
		Year = Year - 1;
		Month = Month + 12;
	}
	var B = 2-A+Math.floor(A/4);
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