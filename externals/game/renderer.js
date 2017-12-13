class Renderer {
	constructor(vertexShaderText, fragmentShaderText) {
		this._program = null;

		this.vertexShader = this.buildShader(vertexShaderText, gl.VERTEX_SHADER);
		this.fragmentShader = this.buildShader(fragmentShaderText, gl.FRAGMENT_SHADER);
	}

	get program() {
		if (this._program == null) {
			this._program = this.buildProgram();
		}

		return this._program;
	}

	buildShader(shaderText, type) {
		let shader = gl.createShader(type);

		gl.shaderSource(shader, shaderText);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('Error compiling vertex shader');
			return null;
		}

		return shader;
	}

	buildProgram() {
		let program = gl.createProgram();

		gl.attachShader(program, this.vertexShader);
		gl.attachShader(program, this.fragmentShader);

		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Error linking program');
			return null;
		}

		gl.validateProgram(program);

		if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
			console.error('Error validating program');
			return null;
		}

		return program;
	}

	useProgram() {
		gl.useProgram(this.program);
	}

	getAttribLocation(name) {
		if (this.program) {
			return gl.getAttribLocation(this.program, name);
		}

		return null;
	}

	getUniformLocation(name) {
		if (this.program) {
			return gl.getUniformLocation(this.program, name);
		}

		return null;
	}
}