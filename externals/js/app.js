let canvas = document.querySelector('#cv');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let game = new Game(canvas);
game.init('./js/shader.vs.glsl', './js/shader.fs.glsl', './dirt.jpg');
