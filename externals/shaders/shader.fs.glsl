precision highp float;

varying vec2 fragTexCoord;
uniform sampler2D texture0;

void main() {
	gl_FragColor = texture2D(texture0, fragTexCoord);
}
