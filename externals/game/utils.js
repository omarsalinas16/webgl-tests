const loadTextResource = async function(url) {
	const promise = await fetch(url);
	const data = await promise;

	if (data.ok && data.status > 199 && data.status < 300) {
		return data.text();
	}
	
	return null;
};

const loadImage = async function(url, callback) {
	const promise = await fetch(url);
	const data = await promise;
	const arrayBuffer = await data.arrayBuffer();

	if (data.ok && data.status > 199 && data.status < 300) {
		if (arrayBuffer != null) {
			return `data:image/jpeg;base64,${arrayBufferToBase64(arrayBuffer)}`;
		}
	}

	return null;
};

const arrayBufferToBase64 = function(buffer) {
	let binary = '';
	let bytes = new Uint8Array(buffer);

	bytes.forEach((b) => binary += String.fromCharCode(b));

	return window.btoa(binary);
};

const loadJSONResource = async function(url) {
	const data = await loadTextResource(url);

	if (data) {
		return JSON.parse(data);
	}

	return null;
};
