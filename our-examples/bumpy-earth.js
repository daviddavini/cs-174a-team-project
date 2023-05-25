import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class BumpyEarth extends Scene {
    constructor() {
        super();

        this.shapes = {
            sphere: new defs.Subdivision_Sphere(5),
        };

        // *** Materials
        this.materials = {
            bumps: new Material(new defs.Fake_Bump_Map(1), {
                color: color(.5, .5, .5, 1),
                ambient: .3, diffusivity: .5, specularity: .5, texture: new Texture("assets/earth.jpeg")
            })
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    display(context, program_state) {
        const t = program_state.animation_time;

        program_state.set_camera(Mat4.translation(0, 0, -5));    // Locate the camera here (inverted matrix).
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 500);
        // A spinning light to show off the bump map:
        program_state.lights = [new Light(
            Mat4.rotation(t / 300, 1, 0, 0).times(vec4(3, 2, 10, 1)),
            color(1, .7, .7, 1), 100000)];

        for (let i of [-1, 1]) {                                       // Spin the 3D model shapes as well.
            const model_transform = Mat4.rotation(t / 2000, 0, 2, 1)
                .times(Mat4.translation(2 * i, 0, 0))
                .times(Mat4.rotation(t / 1500, -1, 2, 0))
                .times(Mat4.rotation(-Math.PI / 2, 1, 0, 0));
            this.shapes.sphere.draw(context, program_state, model_transform, this.materials.bumps);
        }
    }
}
