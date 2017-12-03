attribute vec3 vertPosition;
attribute vec2 vertTexCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProjection;

varying vec2 fragTexCoord;

void main() {
	fragTexCoord = vertTexCoord;
	mat4 matrix = mProjection * mView * mWorld;
	gl_Position = matrix * vec4(vertPosition, 1.0);
}
