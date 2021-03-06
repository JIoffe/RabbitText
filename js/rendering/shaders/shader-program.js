export const Attributes = {
    Pos: 'aVertexPosition',
    Tex: 'aTexCoords',
    Norm: 'aNormal',
    Tangent: 'aTangent',
    Groups: 'aGroups',
    Weights: 'aWeights',
    Color: 'aColor',

    Index: 'aIndex', //Index of vertex or element, eg. for particles    
};

export const Uniforms = {
    ratio: 'uRatio', //SCREEN RATIO X:Y 
    matMVP: 'uModelViewProj',
    matProj: 'uProjection',
    matView: 'uView',
    matViewProj: 'uViewProj',
    matInvViewProj: 'uInvViewProj',
    matWorld: 'uWorld',
    matNormal: 'uNormalMatrix',

    matLight: 'uMatLight',
    shadowCoords: 'uShadowCoords',

    lightPositions: 'uLightPositions',
    lightColors: 'uLightColors',
    shadowIndices: 'uShadowIndices',
    nLights: 'uNLights',

    
    diffuse: 'uDiffuse',
    boneTex: 'uBoneTex',  //Holds bone transform information as a texture
    shadowTex: 'uShadowTex', //Holds direct shadowmap
    depth: 'uDepth',
    ramp: 'uRamp',
    normalMap: 'uNormalMap',
    cubeMap: 'uCubeMap',
    cameraPos: 'uCameraPos',
    lightPos: 'uLightPos',
    reflection: 'uReflection',
    time: 'uTime',
    color: 'uColor',

    //For simple offsets
    offset: 'vOffset',

    //For animation
    keyframes: 'uKeyframes',

    //For certain effects
    lineThickness: 'uLineThickness',

    //Image properties:
    aspect: 'uAspect',

    noise: 'uNoise',

    //For post process pipeline
    pipe: 'uPipe',
    forwardPass: 'uForwardPass',

    //MAINLY FOR PARTICLES
    startTime: 'uStartTime',
    direction: 'uDirection',
    emissionRate: 'uEmissionRate',
    gravity: 'uGravity',
    minPower: 'uMinPower',
    maxPower: 'uMaxPower',
    spread: 'uSpread',

    startSize: 'uStartSize',
    endSize: 'uEndSize',

    minLifetime: 'uMinLifetime',
    maxLifetime: 'uMaxLifetime'
};

/*
* Encapsulates a compiled shader program with attribute locations
*/
export class ShaderProgram{
    constructor(gl, vsSource, fsSource){
        const program = this.loadShaderProgram(gl, vsSource, fsSource);
        if(!program){
            throw 'Could not compile shader';
        }

        this.program = program;
        this.attribLocations = {};
        Object.keys(Attributes).forEach(k => this.attribLocations[k] = gl.getAttribLocation(program, Attributes[k]));

        this.uniformLocations = {};
        Object.keys(Uniforms).forEach(k => this.uniformLocations[k] = gl.getUniformLocation(program, Uniforms[k]));

        //Key uniform points for particle shaders
        this.uniformLocations.particles = gl.getUniformLocation(program, 'startTime');
    }

    get isReady(){
        return !!this.program;
    }

    loadShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
      
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          console.error('Could not load shader program: ' + gl.getProgramInfoLog(shaderProgram));
          return null;
        }
      
        return shaderProgram;
    }

    loadShader(gl, type, source) {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
      
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const shaderLog = gl.getShaderInfoLog(shader);
            alert(shaderLog);
            console.error('Could not compile shader: ' + shaderLog);
            gl.deleteShader(shader);
            return null;
        }
      
        return shader;
    }
    
    free(gl){
        gl.deleteProgram(this.program);
        this.program = null;
    }
}