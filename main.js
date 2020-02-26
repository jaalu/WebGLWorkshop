function main() {
    let canvas = document.getElementById('mainCanvas');
    let gl = canvas.getContext('webgl');
    if (gl === null) {
        console.log("WebGL støttes ikke i denne nettleseren.");
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

window.onload = main;