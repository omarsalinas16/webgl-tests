class Game {
	constructor(canvas) {
		this.canvas = canvas;
		this.gl = this.canvas.getContext('webgl');

		this.renderer = null;
		this.shouldExit = false;

		this.angle = 0;
		this.speed = Math.PI / (8000 / 60);

		this.init = this.init.bind(this);
		this.run = this.run.bind(this);
		this.drawFrame = this.drawFrame.bind(this);
	}

	async init(vertexShaderUrl, fragmentShaderUrl, textureImageUrl) {
		try {
			let vertexShaderText = await loadTextResource(vertexShaderUrl);
			let fragmentShaderText = await loadTextResource(fragmentShaderUrl);

			this.renderer = new Renderer(this.gl, vertexShaderText, fragmentShaderText);

			let textureImageSrc = await loadImage(textureImageUrl);
			
			let image = new Image();
			image.src = textureImageSrc;

			this.run(image);
		} catch(e) {
			console.log(e);
			return;
		}
	}

	run(image) {
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.cullFace(this.gl.BACK);
		this.gl.frontFace(this.gl.CCW);
		this.gl.clearColor(0.5, 0.5, 0.5, 1);

		let verts = new Float32Array([
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
	
		this.indexes = new Uint16Array([
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
		
		let vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, verts, this.gl.STATIC_DRAW);
	
		let indexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indexes, this.gl.STATIC_DRAW);
	
		this.texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
		
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	
		this.gl.useProgram(this.renderer.program);
	
		this.renderer.program.position = this.gl.getAttribLocation(this.renderer.program, 'vertPosition');
		this.renderer.program.texture = this.gl.getAttribLocation(this.renderer.program, 'vertTexCoord');
	
		this.gl.vertexAttribPointer(
			this.renderer.program.position, 
			positionSize, 
			this.gl.FLOAT, 
			false,
			vertexSize * Float32Array.BYTES_PER_ELEMENT, 
			0
		);
		
		this.gl.vertexAttribPointer(
			this.renderer.program.texture, 
			textureSize, 
			this.gl.FLOAT, 
			false, 
			vertexSize * Float32Array.BYTES_PER_ELEMENT, 
			positionSize * Float32Array.BYTES_PER_ELEMENT
		);
	
		this.gl.enableVertexAttribArray(this.renderer.program.position);
		this.gl.enableVertexAttribArray(this.renderer.program.texture);
		
		this.renderer.program.world = this.gl.getUniformLocation(this.renderer.program, 'mWorld');
		this.renderer.program.view = this.gl.getUniformLocation(this.renderer.program, 'mView');
		this.renderer.program.projection = this.gl.getUniformLocation(this.renderer.program, 'mProjection');
	
		this.worldMatrix = mat4.identity(new Float32Array(16));
		this.viewMatrix = mat4.lookAt(new Float32Array(16), [0, 0, -10], [0, 0, 0], [0, 1, 0]);
		this.projectionMatrix = mat4.perspective(new Float32Array(16), glMatrix.toRadian(45.0), this.canvas.width / this.canvas.height, 0.1, 1000.0);
		
		this.identityMatrix = mat4.identity(new Float32Array(16));
		this.xRotationMatrix = mat4.identity(new Float32Array(16));
		this.yRotationMatrix = mat4.identity(new Float32Array(16));
	
		this.gl.uniformMatrix4fv(this.renderer.program.world, this.gl.FALSE, this.worldMatrix);
		this.gl.uniformMatrix4fv(this.renderer.program.view, this.gl.FALSE, this.viewMatrix);
		this.gl.uniformMatrix4fv(this.renderer.program.projection, this.gl.FALSE, this.projectionMatrix);

		requestAnimationFrame(this.drawFrame);
	}

	drawFrame() {
		if (!this.shouldExit) {
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
			this.angle = (this.angle + this.speed) % (Math.PI * 2);
			mat4.rotate(this.xRotationMatrix, this.identityMatrix, this.angle, [1, 0, 0]);
			mat4.rotate(this.yRotationMatrix, this.identityMatrix, this.angle, [0, 1, 0]);
			mat4.mul(this.worldMatrix, this.xRotationMatrix, this.yRotationMatrix);

			this.gl.uniformMatrix4fv(this.renderer.program.world, this.gl.FALSE, this.worldMatrix);

			this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
			this.gl.activeTexture(this.gl.TEXTURE0);

			this.gl.drawElements(this.gl.TRIANGLES, this.indexes.length, this.gl.UNSIGNED_SHORT, 0);

			requestAnimationFrame(this.drawFrame);
		}
	}
}