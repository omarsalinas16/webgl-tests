class Renderer {
	constructor(gl, vertexShaderText, fragmentShaderText) {
		this.gl = gl;
		this._program = null;

		this.buildShader = this.buildShader.bind(this);
		this.buildProgram = this.buildProgram.bind(this);

		this.vertexShader = this.buildShader(vertexShaderText, this.gl.VERTEX_SHADER);
		this.fragmentShader = this.buildShader(fragmentShaderText, this.gl.FRAGMENT_SHADER);
	}

	get program() {
		if (this._program == null) {
			this._program = this.buildProgram();
		}

		return this._program;
	}

	buildShader(shaderText, type) {
		let shader = this.gl.createShader(type);

		this.gl.shaderSource(shader, shaderText);
		this.gl.compileShader(shader);

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			console.error('Error compiling vertex shader');
			return null;
		}

		return shader;
	}

	buildProgram() {
		let program = this.gl.createProgram();

		this.gl.attachShader(program, this.vertexShader);
		this.gl.attachShader(program, this.fragmentShader);

		this.gl.linkProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			console.error('Error linking program');
			return null;
		}

		this.gl.validateProgram(program);

		if (!this.gl.getProgramParameter(program, this.gl.VALIDATE_STATUS)) {
			console.error('Error validating program');
			return null;
		}

		return program;
	}
}