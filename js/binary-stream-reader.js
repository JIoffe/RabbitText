// FileIO
// Helper Module for working with binary / ASCII streams

const SIZEOF_INT32 = 4;
const SIZEOF_INT16 = 2;
const SIZEOF_INT8 = 1;

/**
 * Wraps common operations to access a stream of binary data
 */
export class BinaryStreamReader{
    constructor(arrayBuffer, littleEndian = false){
        this.dv = new DataView(arrayBuffer);
        this.le = littleEndian;
        this.i = 0;
    }

    get nextInt32(){
        const val = this.dv.getInt32(this.i, this.le);
        this.i += SIZEOF_INT32;
        return val;
    }

    get nextUInt32(){
        const val = this.dv.getUint32(this.i, this.le);
        this.i += SIZEOF_INT32;
        return val;
    }

    get nextInt16(){
        const val = this.dv.getInt16(this.i, this.le);
        this.i += SIZEOF_INT16;
        return val;        
    }

    get nextUInt16(){
        const val = this.dv.getUint16(this.i, this.le);
        this.i += SIZEOF_INT16;
        return val;           
    }

    get nextInt8(){
        const val = this.dv.getInt8(this.i, this.le);
        this.i += SIZEOF_INT8;
        return val;            
    }

    get nextUInt8(){
        const val = this.dv.getUint8(this.i, this.le);
        this.i += SIZEOF_INT8;
        return val;           
    }

    get nextChar(){
        return String.fromCharCode(this.nextUInt8);
    }

    get eof(){
        return this.i >= this.dv.byteLength;
    }

    get nextString(){
        let next;
        let s = '';

        while((next = this.nextChar) !== '\0')
            s += next;

        return s;
    }
}