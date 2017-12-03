class Mesh {
	constructor(vertexArray, indexArray) {
		this.vertexArray = vertexArray;
		this.indexArray = indexArray;

		this.vertexBuffer = null;
		this.indexBuffer = null;
		this.texture = null;

		this.init();
	}

	init() {
		if (this.vertexArray) {
			this.vertexBuffer = this.createBuffer(this.vertexArray, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
		}

		if (this.indexArray) {
			this.indexBuffer = this.createBuffer(this.indexArray, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
		}
	}

	createBuffer(array, type, use) {
		let buffer = gl.createBuffer();

		gl.bindBuffer(type, buffer);
		gl.bufferData(type, array, use);

		return buffer;
	}
}