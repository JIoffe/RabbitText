import { BinaryStreamReader } from "../binary-stream-reader";

export function getBinaryStream(url){
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";

        xhr.onload = e => {
            try{
                if(xhr.status != 200){
                    let msg = 'Could not load resource: ' + url;
                    console.error(msg);
                    reject(new Error(msg));
                    return;
                }
    
                const arrayBuffer = xhr.response;
                if(!arrayBuffer){
                    let msg = url + ' : server responded with null response';
                    console.error(msg);
                    reject(new Error(msg));
                    return;
                }

                resolve(arrayBuffer);
            }catch(ex){
                console.error(ex);
                reject(ex);
            }
        }

        xhr.open("GET",url,true);
        xhr.send(); 
    });
}

export async function getBinaryStreamReader(url, littleEndian = false){
    const arrayBuffer = await getBinaryStream(url);
    return new BinaryStreamReader(arrayBuffer, littleEndian);
}