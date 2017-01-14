var Config ={
  cardNumCnt : 58, //数值卡
  cardCoverCnt : 10, //日食月食卡
  cardHandCnt : 5, //手牌数
  sceneWidth : 1440,
  sceneHeight : 96
}

var renderer = PIXI.autoDetectRenderer(Config.sceneWidth, Config.sceneHeight,{backgroundColor : 0x1099bb});
document.getElementsByTagName('body')[0].appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

// create a texture from an image path
var texture = PIXI.Texture.fromImage('img/snowflake135.png');

// create a new Sprite using the texture
var bunny = new PIXI.Sprite(texture);

// center the sprite's anchor point
bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;

// move the sprite to the center of the screen
bunny.position.x = 200;
bunny.position.y = 150;

stage.addChild(bunny);

// start animating
animate();
function animate() {
    requestAnimationFrame(animate);

    // just for fun, let's rotate mr rabbit a little
    bunny.rotation += 0.1;

    // render the container
    renderer.render(stage);
}
