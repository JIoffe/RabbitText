import { WebGL2Renderer } from './rendering/webgl2-renderer';

var timePrev = 0;

(function(d){
    var canvas;
    var renderer;

    d.addEventListener('DOMContentLoaded', () => {
        canvas = d.getElementById('canvas');
        renderer = new WebGL2Renderer(canvas);

        init().then(() => window.requestAnimationFrame(mainLoop));
    });

    async function init(){      
        await renderer.init();
    }

    function mainLoop(time){
        //Delta Time in MILLISECONDS
        const dT = time - timePrev;
        timePrev = time;

        renderer.render(null, time, dT);

        window.requestAnimationFrame(mainLoop);
    }

})(document);