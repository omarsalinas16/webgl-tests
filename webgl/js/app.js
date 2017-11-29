let canvas = document.querySelector('#cv');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gl = canvas.getContext('webgl');

(() => {
	gl.clearColor(0.5, 0.5, 0.5, 1);
	
	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	
	gl.shaderSource(vertexShader, `
		attribute vec2 vertPosition;
		attribute vec3 vertColor;
	
		varying vec3 fragColor;

		void main() {
			fragColor = vertColor;
			gl_Position = vec4(vertPosition, 0.0, 1.0);
		}
	`);
	
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('Error compiling vertex shader');
		return;
	}
	
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	
	gl.shaderSource(fragmentShader, `
		precision highp float;
	
		varying vec3 fragColor;
	
		void main() {
			gl_FragColor = vec4(fragColor, 1.0);
		}
	`);
	
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('Error compiling fragment shader');
		return;
	}
	
	let program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Error linking program');
		return;
	}

	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('Error validating program');
		return;
	}
	
	let verts = new Float32Array([
		// X, Y				R, G, B
		-0.5, -0.5,		1.0, 1.0, 0.0,
		 0.5, -0.5,		1.0, 0.0, 1.0,
		 0.0, 0.5,		0.0, 1.0, 0.0,
	]);

	let positionSize = 2;
	let colorSize = 3;
	let vertexSize = positionSize + colorSize;
	
	let buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	program.position = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		program.position, 
		positionSize, 
		gl.FLOAT, 
		false, vertexSize * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	gl.enableVertexAttribArray(program.position);

	program.color = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		program.color, 
		colorSize, 
		gl.FLOAT, 
		false, 
		vertexSize * Float32Array.BYTES_PER_ELEMENT, 
		positionSize * Float32Array.BYTES_PER_ELEMENT
	);
	gl.enableVertexAttribArray(program.color);
	
	const renderLoop = () => {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(program);
		gl.drawArrays(gl.TRIANGLES, 0, verts.length / vertexSize);

		requestAnimationFrame(renderLoop);
	};

	requestAnimationFrame(renderLoop);
})();
