const canvas = document.querySelector('#cv');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// It would probably be better to have a global gl variable so other objects dont depend on Game,
// and to not need to pass arround gl.
// How bad is it to have gl as a global const?
const gl = canvas.getContext('webgl');

let game = new Game(canvas);

// Obviously textures should be part of either Mesh or a GameObject, not a single texture for an entire game.
game.texture = new Texture('./dirt.jpg');

// Find a way to be able to create mutiple programs, completely independent of the Game creation.
game.init('./shaders/shader.vs.glsl', './shaders/shader.fs.glsl');
