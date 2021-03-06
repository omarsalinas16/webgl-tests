class Game {
	constructor(canvas) {
		this.canvas = canvas;

		this.renderer = null;
		this.shouldExit = false;

		this.angle = 0;
		this.speed = Math.PI / (8000 / 60);

		this.drawFrame = this.drawFrame.bind(this);
	}

	async init(vertexShaderUrl, fragmentShaderUrl) {
		try {
			let vertexShaderText = await loadTextResource(vertexShaderUrl);
			let fragmentShaderText = await loadTextResource(fragmentShaderUrl);

			this.renderer = new Renderer(vertexShaderText, fragmentShaderText);
		} catch(e) {
			console.log(e);
			return false;
		}

		this.run();
		return true;
	}

	run() {
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.clearColor(0.5, 0.5, 0.5, 1);

		let vertexArray = new Float32Array([
			// X, Y, Z					U, V
			// Top
			-1.0, 1.0, -1.0,		0, 0,
			-1.0, 1.0, 1.0,			0, 1,
			1.0, 1.0, 1.0,			1, 1,
			1.0, 1.0, -1.0,			1, 0,
	
			// Left
			-1.0, 1.0, 1.0,			0, 0,
			-1.0, -1.0, 1.0,		1, 0,
			-1.0, -1.0, -1.0,		1, 1,
			-1.0, 1.0, -1.0,		0, 1,
	
			// Right
			1.0, 1.0, 1.0,			1, 1,
			1.0, -1.0, 1.0,			0, 1,
			1.0, -1.0, -1.0,		0, 0,
			1.0, 1.0, -1.0,			1, 0,
	
			// Front
			1.0, 1.0, 1.0,			1, 1,
			1.0, -1.0, 1.0,			1, 0,
			-1.0, -1.0, 1.0,		0, 0,
			-1.0, 1.0, 1.0,			0, 1,
	
			// Back
			1.0, 1.0, -1.0,			0, 0,
			1.0, -1.0, -1.0,		0, 1,
			-1.0, -1.0, -1.0,		1, 1,
			-1.0, 1.0, -1.0,		1, 0,
	
			// Bottom
			-1.0, -1.0, -1.0,		1, 1,
			-1.0, -1.0, 1.0,		1, 0,
			1.0, -1.0, 1.0,			0, 0,
			1.0, -1.0, -1.0,		0, 1,
		]);
	
		let indexArray = new Uint16Array([
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
		let textureSize = 2;
		let vertexSize = positionSize + textureSize;
		
		this.mesh = new Mesh(vertexArray, indexArray);

		this.renderer.useProgram();
	
		// This probably goes to renderer, as it depends on the attribs of the renderer program.
		let vertexAttribLocation = this.renderer.getAttribLocation('vertPosition');
		let textureAttribLocation = this.renderer.getAttribLocation('vertTexCoord');
	
		gl.vertexAttribPointer(
			vertexAttribLocation, 
			positionSize, 
			gl.FLOAT, 
			false,
			vertexSize * Float32Array.BYTES_PER_ELEMENT, 
			0
		);
		
		gl.vertexAttribPointer(
			textureAttribLocation, 
			textureSize, 
			gl.FLOAT, 
			false, 
			vertexSize * Float32Array.BYTES_PER_ELEMENT, 
			positionSize * Float32Array.BYTES_PER_ELEMENT
		);
	
		gl.enableVertexAttribArray(vertexAttribLocation);
		gl.enableVertexAttribArray(textureAttribLocation);
		
		// This does belong to game, or to a camera object
		this.worldUniformLocation = gl.getUniformLocation(this.renderer.program, 'mWorld');

		let viewUniformLocation = this.renderer.getUniformLocation('mView');
		let projectionUniformLocation = this.renderer.getUniformLocation('mProjection');
	
		this.worldMatrix = mat4.identity(new Float32Array(16));
		this.viewMatrix = mat4.lookAt(new Float32Array(16), [0, 0, -10], [0, 0, 0], [0, 1, 0]);
		this.projectionMatrix = mat4.perspective(new Float32Array(16), glMatrix.toRadian(45.0), this.canvas.width / this.canvas.height, 0.1, 1000.0);
		
		this.identityMatrix = mat4.identity(new Float32Array(16));
		this.xRotationMatrix = mat4.identity(new Float32Array(16));
		this.yRotationMatrix = mat4.identity(new Float32Array(16));
	
		gl.uniformMatrix4fv(this.worldUniformLocation, gl.FALSE, this.worldMatrix);
		gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, this.viewMatrix);
		gl.uniformMatrix4fv(projectionUniformLocation, gl.FALSE, this.projectionMatrix);

		requestAnimationFrame(this.drawFrame);
	}

	drawFrame() {
		if (this.shouldExit) {
			return;
		}

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
		this.angle = (this.angle + this.speed) % (Math.PI * 2);

		mat4.rotate(this.xRotationMatrix, this.identityMatrix, this.angle, [1, 0, 0]);
		mat4.rotate(this.yRotationMatrix, this.identityMatrix, this.angle, [0, 1, 0]);
		mat4.mul(this.worldMatrix, this.xRotationMatrix, this.yRotationMatrix);

		gl.uniformMatrix4fv(this.worldUniformLocation, gl.FALSE, this.worldMatrix);

		// Texture binding and drawing should be part of a specific mesh or GameObject.
		this.texture.useTexture();
		gl.drawElements(gl.TRIANGLES, this.mesh.indexArray.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(this.drawFrame);
	}
}
