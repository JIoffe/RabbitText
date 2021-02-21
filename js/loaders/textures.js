export async function loadTexture(gl, src, useBilinearFiltering, generateMipMaps, flipY){
    const image = new Image();
    image.src = src;
    console.log(`Downloading texture: ${src}`);

    const texId = await loadTexture2DFromImage(gl, image, useBilinearFiltering, generateMipMaps, !!flipY);
    image.remove();

    return texId;
}

export function loadTexture2DFromImage(gl, image, useBilinearFiltering, generateMipMaps, flipY = true){
    return new Promise((resolve, reject) => {
        const processTask = () => {
            const tex = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            let magFilter, minFilter;
            if(!!useBilinearFiltering){
                magFilter = gl.LINEAR;
                minFilter = !!generateMipMaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR;
            }else{
                magFilter = gl.NEAREST;
                minFilter = gl.NEAREST;
            }

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);					
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);

            if(generateMipMaps)
                gl.generateMipmap(gl.TEXTURE_2D);
            
            gl.bindTexture(gl.TEXTURE_2D, null);     
            resolve(tex);
        };

        if(!!image.complete){
            processTask();
        }else{
            image.onload = processTask;
        }

        image.onerror = () => reject();
    });
}
