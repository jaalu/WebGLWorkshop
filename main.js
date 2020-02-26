// Kildekode for vertex-shaderen:
const vertexShaderSource = `
attribute vec4 inputPosition;

void main() {
    gl_Position = inputPosition;
}
`;

// Kildekode for fragment-shaderen:
const fragmentShaderSource = `
precision mediump float;
void main() {
    // TODO: Prøv å endre på tallene her:
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`

function main() {
    let canvas = document.getElementById('mainCanvas');
    let gl = canvas.getContext('webgl');
    if (gl === null) {
        console.log("WebGL støttes ikke i denne nettleseren.");
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Før vi kan bruke shadere, er vi nødt til å kompilere dem.
    // Vi lager en ny vertex-shader,
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    // knytter den til kildekoden (definert øverst),
    gl.shaderSource(vertexShader, vertexShaderSource);
    // og kompilerer den.
    gl.compileShader(vertexShader);

    // Sjekk om det har oppstått noen feil:
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    {
        console.log("Kunne ikke kompilere vertex-shaderen:", gl.getShaderInfoLog(vertexShader));
        return;
    }

    // Vi kompilerer fragment-shaderen på samme måte:
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
    {
        console.log("Kunne ikke kompilere fragment-shaderen:", gl.getShaderInfoLog(fragmentShader));
        return;
    }

    // Deretter slår vi sammen vertex- og fragment-shaderen til et program.
    let shaderProgram = gl.createProgram();
    // Vi legger til shadere med attachShader:
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    // Deretter setter vi sammen programmet med linkProgram:
    gl.linkProgram(shaderProgram);

    // Sjekk om det har oppstått noen feil:
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
        console.log("Kunne ikke lage shader-program:", gl.getProgramInfoLog(shaderProgram));
    }

    // Vi lager et sett med koordinater som skal videresendes til GPUen.
    // Hvert koordinat kommer inn i vertex-shaderen.
    
    let coordinates = new Float32Array([
        0.0, 0.5,
        0.5, -0.5,
        -0.5, -0.5
    ]);

    // For å levere data fra prosessoren til skjermkortet bruker vi et buffer:
    let positionBuffer = gl.createBuffer();

    // Vi bruker bindBuffer for å signalisere at vi skal operere på et buffer:
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Deretter bruker vi bufferData for å laste inn data i positionBuffer:
    gl.bufferData(gl.ARRAY_BUFFER, coordinates, gl.STATIC_DRAW);

    // Vi må finne ut hvor shader-programmet forventer å få inn
    // variabelen inputPosition (se øverst):
    let inputPositionLocation = gl.getAttribLocation(shaderProgram, "inputPosition");

    // Vi bruker vertexAttribPointer for å beskrive hvordan
    // dataene i positionBuffer skal tolkes om til verdier som kan
    // settes inn i inputPosition:
    gl.enableVertexAttribArray(inputPositionLocation);
    let components = 2; // Hent ut to tall - et koordinat - for hver runde vi kjører vertex-shaderen
    let bufferType = gl.FLOAT; // Bufferet består av floats
    let normalized = false; // Ikke gjør om til floats
    let stride = 0; // Anta at verdiene ligger like etter hverandre i bufferet 
    let offset = 0; // Begynn å lese fra første element (element 0) i bufferet
    gl.vertexAttribPointer(inputPositionLocation, 
        components, bufferType, normalized, stride, offset);

    // Når vi har kompilert shaderne, satt sammen programmet,
    // og fortalt det hvor det skal hente data,
    // kan vi be WebGL om å aktivere programmet,
    // og tegne opp trekanten vår:
    gl.useProgram(shaderProgram);

    // Modellen består av tre punkter / vertices:
    let vertices = 3;

    // TODO: Prøv å erstatte gl.TRIANGLES med gl.LINE_LOOP!
    gl.drawArrays(gl.TRIANGLES, 0, vertices);
}

window.onload = main;