let canvas = document.querySelector('#cv');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gl = canvas.getContext('webgl');

(() => {
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CCW);
	gl.clearColor(0.5, 0.5, 0.5, 1);
	
	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	
	gl.shaderSource(vertexShader, `
		attribute vec3 vertPosition;
		attribute vec3 vertColor;
	
		uniform mat4 mWorld;
		uniform mat4 mView;
		uniform mat4 mProjection;

		varying vec3 fragColor;

		void main() {
			fragColor = vertColor;
			mat4 matrix = mProjection * mView * mWorld;
			gl_Position = matrix * vec4(vertPosition, 1.0);
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
		// X, Y, Z				R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.8, 0.8, 0.8,
		-1.0, 1.0, 1.0,    0.8, 0.8, 0.8,
		1.0, 1.0, 1.0,     0.8, 0.8, 0.8,
		1.0, 1.0, -1.0,    0.8, 0.8, 0.8,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	]);

	var indexes = new Uint16Array([
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	]);

	let positionSize = 3;
	let colorSize = 3;
	let vertexSize = positionSize + colorSize;
	
	let vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	let indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

	gl.useProgram(program);

	program.position = gl.getAttribLocation(program, 'vertPosition');
	program.color = gl.getAttribLocation(program, 'vertColor');

	gl.vertexAttribPointer(
		program.position, 
		positionSize, 
		gl.FLOAT, 
		false,
		vertexSize * Float32Array.BYTES_PER_ELEMENT, 
		0
	);
	
	gl.vertexAttribPointer(
		program.color, 
		colorSize, 
		gl.FLOAT, 
		false, 
		vertexSize * Float32Array.BYTES_PER_ELEMENT, 
		positionSize * Float32Array.BYTES_PER_ELEMENT
	);

	gl.enableVertexAttribArray(program.position);
	gl.enableVertexAttribArray(program.color);
	
	program.world = gl.getUniformLocation(program, 'mWorld');
	program.view = gl.getUniformLocation(program, 'mView');
	program.projection = gl.getUniformLocation(program, 'mProjection');

	let worldMatrix = mat4.identity(new Float32Array(16));
	let viewMatrix = mat4.lookAt(new Float32Array(16), [0, 0, -10], [0, 0, 0], [0, 1, 0]);
	let projectionMatrix = mat4.perspective(new Float32Array(16), glMatrix.toRadian(45.0), canvas.width / canvas.height, 0.1, 1000.0);
	
	let identityMatrix = mat4.identity(new Float32Array(16));
	let xRotationMatrix = mat4.identity(new Float32Array(16));
	let yRotationMatrix = mat4.identity(new Float32Array(16));

	gl.uniformMatrix4fv(program.world, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(program.view, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(program.projection, gl.FALSE, projectionMatrix);

	let angle = 0;
	let speed = Math.PI / (8000 / 60);

	const renderLoop = () => {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		angle = (angle + speed) % (Math.PI * 2);
		mat4.rotate(xRotationMatrix, identityMatrix, angle, [1, 0, 0]);
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);

		gl.uniformMatrix4fv(program.world, gl.FALSE, worldMatrix);

		gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(renderLoop);
	};

	requestAnimationFrame(renderLoop);
})();
