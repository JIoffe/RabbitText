import { mat4 } from "gl-matrix";
import { loadTexture } from "../loaders/textures";
import { GuiRoot } from "./gui/gui-root";
import { FragmentShaders } from "./shaders/fragment-shaders";
import { ShaderProgram } from "./shaders/shader-program";
import { VertexShaders } from "./shaders/vertex-shaders";

var gl;
var frameWidth = -1, frameHeight = -1;
var shader;
var fontTexture;
var guiMatrix = mat4.create();
var worldTransform = mat4.create();
mat4.fromTranslation(worldTransform, [0,0,-1]);

var matMVP = mat4.create();

export class WebGL2Renderer{
    constructor(canvas){
        this.canvas = canvas;
        gl = canvas.getContext("webgl2");
        if(!gl){
            throw 'System does not support Webgl2';
        }

        this.shaders = [
            new ShaderProgram(gl, VertexShaders.gui, FragmentShaders.gui)
        ]

        this.gui = new GuiRoot(gl);
    }

    async init(){
        //Always enable attrib array 0
        gl.enableVertexAttribArray(0);

        //We don't actually need depth testing for this sample but why not
        gl.enable(gl.DEPTH_TEST);
        // gl.enable(gl.CULL_FACE);
        // gl.cullFace(gl.FRONT);

        fontTexture = await loadTexture(gl, '/assets/fonts/arial_1_0.png', true, true, true);

        await this.gui.init();
    }

    render(scene, time, dT){
        //Rebuild the projection and viewport with every
        //frame, just in case of resize.
        //This causes a small performance hit but is always correct.
        const rect = this.canvas.getBoundingClientRect(),
              w    = Math.floor(rect.right - rect.left),
              h    = Math.floor(rect.bottom - rect.top),
              ratio = w/h;

        if(w !== frameWidth || h !== frameHeight){
            //this will resize the main frame buffer
            this.canvas.setAttribute('width', '' + w);
            this.canvas.setAttribute('height', '' + h);
            frameWidth = w;
            frameHeight = h;

            console.log('Rezised: ', w, h);
        }

        //Recover if context is lost
        if(!gl){
            gl = this.canvas.getContext("webgl2");
        }

        let projectionWidth = w / 256, projectionHeight = h / 256;
        guiMatrix = mat4.ortho(guiMatrix, -(projectionWidth/2), (projectionWidth/2), -(projectionHeight/2), (projectionHeight/2), 0.1, 100);
        mat4.mul(matMVP, guiMatrix, worldTransform);

        gl.viewport(0,0,w,h);
        gl.clearColor(0,0,0.4,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        shader = this.shaders[0];
        gl.useProgram(shader.program);
        gl.uniformMatrix4fv(shader.uniformLocations.matMVP, false, matMVP);
        gl.uniform1i(shader.uniformLocations.diffuse, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fontTexture);

        this.gui.draw(gl);
    }
}