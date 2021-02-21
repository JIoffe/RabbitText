import { getBinaryStreamReader } from "./binary-stream";

export async function getFontAsync(url){
    const reader = await getBinaryStreamReader(url, true);

    const fileToken = `${reader.nextChar}${reader.nextChar}${reader.nextChar}`;
    if(fileToken !== 'BMF'){
        console.error(`Invalid file identifier: ${fileToken}`);
        return null;
    }

    const version = reader.nextUInt8;
    const output = {
        fileType: fileToken,
        version: version
    }

    while(!reader.eof){
        const nextBlock = reader.nextUInt8;
        const blockSize = reader.nextInt32;

        switch(nextBlock){
            case 1: //Info
                output.info = {
                    fontSize: reader.nextInt16,
                    bitField: reader.nextUInt8,
                    charSet: reader.nextUInt8,
                    stretchH: reader.nextUInt16,
                    aa: reader.nextUInt8,
                    paddingUp: reader.nextUInt8,
                    paddingRight: reader.nextUInt8,
                    paddingDown: reader.nextUInt8,
                    paddingLeft: reader.nextUInt8,
                    spacingHoriz: reader.nextUInt8,
                    spacingVert: reader.nextUInt8,
                    outline: version >= 2 ? reader.nextUInt8 : 0, //added in version 2+
                    fontName: reader.nextString                                  
                };
                break;
            case 2: //common
                output.common = {
                    lineHeight: reader.nextInt16,
                    base: reader.nextInt16,
                    scaleW: reader.nextInt16,
                    scaleH: reader.nextInt16,
                    pages: reader.nextInt16,
                    bitField: reader.nextUInt8,
                    alphaChnl: reader.nextUInt8,
                    redChnl: reader.nextUInt8,
                    greenChnl: reader.nextUInt8,	
                    blueChnl: reader.nextUInt8,
                };
                break;
            case 3: //pages
            {
                //Each entry in 'pages' is the same length and there will always be at least one
                output.pages = [reader.nextString];
                const nPages = Math.floor(blockSize / output.pages[0].length);
                for(let i = 1; i < nPages; ++i){
                    output.pages.push(reader.nextString);
                }
                break;
            }
            case 4: //chars
            {
                const charBlockSize = 20;
                const nChars = Math.floor(blockSize / charBlockSize);
                output.chars = new Array(nChars);

                for(let i = 0; i < nChars; ++i){
                    output.chars[i] = {
                        id: reader.nextUInt32,
                        x: reader.nextUInt16,	
                        y: reader.nextUInt16,
                        width: reader.nextUInt16,
                        height: reader.nextUInt16,
                        xoffset: reader.nextInt16,
                        yoffset: reader.nextInt16,
                        xadvance: reader.nextInt16,
                        page: reader.nextUInt8,
                        chnl: reader.nextUInt8
                    }
                }
               break;
            }
            case 5: //kerning pairs
            {
                const kerningsBlockSize = 10;
                const nKernings = Math.floor(blockSize / kerningsBlockSize);
                output.kernings = new Array(nKernings);

                for(let i = 0; i < nKernings; ++i){
                    output.kernings[i] = {
                        first: reader.nextUInt32,
                        second: reader.nextUInt32,
                        amount: reader.nextInt16
                    }
                }
                break;
            }
            default:
                break;
        }
    }

    //Adjust output properties for easier consumption
    //- Set scale to be in texture space
    //- List chars by ASCII ID

    let toScale = ['x','y','xadvance','xoffset','yoffset', 'width', 'height']
    
    output.chars.forEach(c => {
        toScale.forEach(p => c[p] /= output.common.scaleW)
    });

    return output;
}