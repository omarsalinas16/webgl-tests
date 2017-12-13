class Texture {
	constructor(textureImageUrl) {
		this.image = null;
		this._texture = null;

		this.init(textureImageUrl);
	}

	get texture() {
		if (this._texture == null) {
			this._texture =  this.createTexture();
		}

		return this._texture;
	}

	async init(textureImageUrl) {
		let imageSrc = await loadImage(textureImageUrl);

		this.image = new Image();
		this.image.src = imageSrc;
	}

	createTexture() {
		if (!this.image) {
			return null;
		}

		let texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
		
		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	useTexture() {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.activeTexture(gl.TEXTURE0);
	}
}