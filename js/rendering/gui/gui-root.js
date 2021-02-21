import { getFontAsync } from "../../loaders/font";

const fontPath = '/assets/fonts/arial_1.fnt';

const DEFAULT_MAX_QUADS = 1024;

//GUI Vertex layout - 16 BYTES
//Interleaved: 2 * 4 bytes for POSITION (8)
//             2 * 2 bytes, normalized for TEX COORDS (4) => 12
//             3 * 1 byte COLOR (3) => 15
//             1 byte padding => 16
const GUI_VERTEX_STRIDE = 16;
const QUAD_STRIDE = GUI_VERTEX_STRIDE*4;

var font;

export class GuiRoot{
    constructor(gl, maxQuads = DEFAULT_MAX_QUADS){
        this.gl = gl;
        this.maxQuads = maxQuads;
        this.quadsUsed = 0;
        this.children = [];

        //16 bytes per vertex * 4 vertices per sprite
        const vboBufferSize = QUAD_STRIDE * maxQuads;
        this.vboBuffer = new ArrayBuffer(vboBufferSize);
        this.dv = new DataView(this.vboBuffer);

        this.buffers = [
            gl.createBuffer(),
            this.generateIndexBufferObject(gl, maxQuads)
        ]
        console.log(`Creating GUI container with initial allocation of: ${maxQuads} quads`);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.bufferData(gl.ARRAY_BUFFER, vboBufferSize, gl.STATIC_DRAW);
    }

    async init(){
        font = await getFontAsync(fontPath);
        console.log(font);

        this.addText(font, 2, 'Hello World');

    }

    addText(font, size, str){
        //Analyze text for any formatting codes
        var tagStartRegex = /<color:(.*?)>/gi,
            tagEndRegex = /<\/color>/gi,
            tagStarts = tagStartRegex.exec(str),
            tagEnds = tagEndRegex.exec(str),
            tagStack = [];

        let x = 0, y = 0;
        let bufferOffset = this.quadsUsed * QUAD_STRIDE;

        let r = 255, g = 255, b = 255;

        for(let i = 0; i < str.length; ++i){
            const charCode = str.charCodeAt(i);
            const char = font.chars[charCode - 32];

            if(i > 0){
                const prevCharCode = str.charCodeAt(i - 1);
                const kerning = font.kernings.find(k => k.first === prevCharCode && k.second === charCode);
                if(!!kerning)
                    x += (kerning.amount/256) * size;
            }

            this.addQuad(x + char.xoffset*size, y - char.yoffset*size, char.width * size, char.height * size, 
                char.x, 1. - (char.y + char.height),
                char.x + char.width, 1. - char.y);

            x += char.xadvance * size;
        }

        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, bufferOffset, this.dv, bufferOffset, QUAD_STRIDE*str.length);
    }

    draw(gl){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, GUI_VERTEX_STRIDE, 0); //POS
        gl.vertexAttribPointer(1, 2, gl.UNSIGNED_SHORT, true, GUI_VERTEX_STRIDE, 8); // UVs
        gl.vertexAttribPointer(2, 3, gl.UNSIGNED_BYTE, true, GUI_VERTEX_STRIDE, 12); // VertexColors

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[1]);

        gl.drawElements(gl.TRIANGLES, this.quadsUsed*6, gl.UNSIGNED_SHORT, 0);
    }

    addQuad(x,y,w,h,minU,minV,maxU,maxV,r=0xFF,g=0xFF,b=0xFF){
        const dv = this.dv;
        let offset = this.quadsUsed * QUAD_STRIDE;
        const append = (x,y,u,v) => {
            dv.setFloat32(offset, x, true);
            dv.setFloat32(offset + 4, y, true);
            dv.setUint16(offset + 8, u * 0xFFFF, true);
            dv.setUint16(offset + 10, v * 0xFFFF, true);
            dv.setUint8(offset + 12, r, true);
            dv.setUint8(offset + 13, g, true);
            dv.setUint8(offset + 14, b, true);
            dv.setInt8(offset + 15, 0, true);
            offset += GUI_VERTEX_STRIDE;
        }

        append(x,y,minU,maxV)
        append(x+w,y,maxU,maxV)
        append(x,y-h,minU,minV)
        append(x+w,y-h,maxU,minV)
        ++this.quadsUsed;
    }

    setVertex(i,x,y,u,v){

    }

    // setVertexPos(i,x,y,z){
    //     const dv = this.dv;
    //     let offset = i * 16;

    //     dv.setFloat32(offset, x, true);
    //     dv.setFloat32(offset + 4, y, true);
    //     dv.setFloat32(offset + 8, z, true);
    // }

    // setVertexUV(i,u,v){
    //     const dv = this.dv;
    //     let offset = i * 16;

    //     dv.setInt16(offset + 12, u, true);
    //     dv.setInt16(offset + 14, v, true);
    // }

    commit(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.bufferSubData(gl.ARRAY_BUFFER, this.quadsUsed * QUAD_STRIDE, this.vboBuffer);
    }

    generateIndexBufferObject(gl, size){;
        const indices = new Array(size * 6);
        for(let i = 0; i < size; ++i){
            const indexStride = i * 6;
            const vertexStride = i * 4;
            
            indices[indexStride]   = vertexStride;
            indices[indexStride+1] = vertexStride + 1;
            indices[indexStride+2] = vertexStride + 2;
            indices[indexStride+3] = vertexStride + 2;
            indices[indexStride+4] = vertexStride + 1;
            indices[indexStride+5] = vertexStride + 3;
        }

        const ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        return ibo;
    }
}