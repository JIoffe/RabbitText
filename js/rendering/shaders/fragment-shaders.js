import { Uniforms } from './shader-program'

export const FragmentShaders = {
    gui:
    `#version 300 es
    precision mediump float;
    
    uniform sampler2D ${Uniforms.diffuse};
    in vec2 vTexCoords;
    in vec3 vColor;

    out vec4 color;
    
    void main() {
        color = texture(${Uniforms.diffuse}, vTexCoords);
        if(color.r < 0.9)
            discard;

        color.rgb = vColor;
        color.a = 1.0;
    }
    `
}