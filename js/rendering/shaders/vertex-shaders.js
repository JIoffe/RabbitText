import { Attributes, Uniforms } from './shader-program'

export const VertexShaders = {
    gui:
    `#version 300 es
    
    in vec4 ${Attributes.Pos};
    in vec2 ${Attributes.Tex};
    in vec3 ${Attributes.Color};

    uniform mat4 ${Uniforms.matMVP};

    out vec2 vTexCoords;
    out vec3 vColor;
    
    void main(){
        gl_Position = ${Uniforms.matMVP} * ${Attributes.Pos};


        //pass through tex coords
        vTexCoords = ${Attributes.Tex};
        vColor = ${Attributes.Color};
    }
    `
}