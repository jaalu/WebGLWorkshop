// Kildekode for vertex-shaderen:
const vertexShaderSource = `
attribute vec4 inputPosition;

// Vi lagrer rotasjonen vi skal sette på hvert punkt 
// i en transformasjonsmatrise:
uniform mat4 transformationMatrix;

void main() {
    // For å utføre transformasjonen, multipliserer vi denne matrisen 
    // med vektoren for koordinatet:
    gl_Position = transformationMatrix * inputPosition;
}
`;

// Kildekode for fragment-shaderen:
const fragmentShaderSource = `
precision mediump float;
void main() {
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
    let coordinates = logoCoordinates;

    // For å levere data fra prosessoren til skjermkortet bruker vi et buffer:
    let positionBuffer = gl.createBuffer();

    // Vi bruker bindBuffer for å signalisere at vi skal operere på et buffer:
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Deretter bruker vi bufferData for å laste inn data i positionBuffer:
    gl.bufferData(gl.ARRAY_BUFFER, coordinates, gl.STATIC_DRAW);

    // Vi må finne ut hvor shader-programmet forventer å få inn
    // variabelen inputPosition (se øverst):
    let inputPositionLocation = gl.getAttribLocation(shaderProgram, "inputPosition");

    // Nå må vi finne ut hvor transformasjonsmatrisen skal inn:
    let transformationMatrixLocation = gl.getUniformLocation(shaderProgram, "transformationMatrix");

    // Vi bruker vertexAttribPointer for å beskrive hvordan
    // dataene i positionBuffer skal tolkes om til verdier som kan
    // settes inn i inputPosition:
    gl.enableVertexAttribArray(inputPositionLocation);
    let components = 3; // Hent ut tre tall - et 3D-koordinat - for hver runde vi kjører vertex-shaderen
    let bufferType = gl.FLOAT; // Bufferet består av floats
    let normalized = false; // Ikke gjør om til floats
    let stride = 0; // Anta at verdiene ligger like etter hverandre i bufferet 
    let offset = 0; // Begynn å lese fra første element (element 0) i bufferet
    gl.vertexAttribPointer(inputPositionLocation, 
        components, bufferType, normalized, stride, offset);

    // Vi lager en matrise som roterer logoen.
    // Vi bruker metoden fromZRotation (se http://glmatrix.net/docs/module-mat4.html)
    // for å lage en matrise som snur punkter rundt Z-aksen (mot skjermen):
    let transformationMatrix = glMatrix.mat4.create();
    let vinkel = 45.0 * (Math.PI/180); // Snu logoen 45 grader (må gjøres om til radianer)

    // TODO: Prøv å bytte ut fromZRotation med fromXRotation eller fromYRotation
    glMatrix.mat4.fromZRotation(transformationMatrix, vinkel);

    // Når vi har kompilert shaderne, satt sammen programmet,
    // og fortalt det hvor det skal hente data,
    // kan vi be WebGL om å aktivere programmet,
    // og tegne opp trekanten vår:
    gl.useProgram(shaderProgram);

    // Vi setter transformasjonsmatrisen som skal brukes når shaderprogrammet kjøres:
    gl.uniformMatrix4fv(transformationMatrixLocation, false, transformationMatrix);

    // Nå består hvert punkt/vertex av tre tall:
    let vertices = logoCoordinates.length / 3;

    // Vi lager en funksjon som beskriver hva som må tegnes for hvert bilde.
    // Argumentet "tid" blir satt til antallet millisekunder som har gått siden
    // vi åpnet siden. 
    function update(tid) {
        // Vi ønsker at modellen skal rotere 90 grader i sekundet.
        // For hvert bilde regner vi ut en ny transformasjonsmatrise,
        var fart = 90.0;
        var vinkel = fart * (tid / 1000.0) * (Math.PI/180);
        glMatrix.mat4.fromZRotation(transformationMatrix, vinkel);

        // sender den inn til shaderprogrammet,
        gl.uniformMatrix4fv(transformationMatrixLocation, false, transformationMatrix);

        // visker ut det forrige bildet,
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // og tegner den oppdaterte figuren.
        gl.drawArrays(gl.TRIANGLES, 0, vertices);

        // Etter slutten av hvert bilde er vi nødt til å signalisere
        // at vi ønsker å fortsette animasjonen:
        requestAnimationFrame(update);
    }

    // Start animasjonen:
    requestAnimationFrame(update);
}

window.onload = main;