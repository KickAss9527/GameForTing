var GameConfig ={
  sceneWidth : 1440,
  sceneHeight : 960
}

function InitAllCards(arr)
{
  for (var i = 1; i <= CardConfig.cardNumCnt*0.5; i++)
  {
    arr.push(new CardData(CardConfig.Type_Day, i));
    arr.push(new CardData(CardConfig.Type_Night, i));
  }
  for (var i = 0; i < CardConfig.cardCoverCnt*0.5; i++) {
    arr.push(new CardData(CardConfig.Type_Day, -1));
    arr.push(new CardData(CardConfig.Type_Night, -1));
  }
}

function RandomCards(cards)
{
  for (var i = 0; i < cards.length; i++) {
    var tmp = cards[i];
    var randomIdx = Math.random()*cards.length;
    randomIdx = Math.floor(randomIdx);
    cards[i] = cards[randomIdx];
    cards[randomIdx] = tmp;
  }
}

function evtReady(evt)
{
  var lbl = evt.target;
  lbl.text = "Waiting...";
  connector.playerReady();
}

var connector = new Con();
connector.init();
var allCards = new Array();
InitAllCards(allCards);
RandomCards(allCards);

var renderer = PIXI.autoDetectRenderer(GameConfig.sceneWidth, GameConfig.sceneHeight,{backgroundColor : 0x333333});
document.getElementsByTagName('body')[0].appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var tStyle = {
  fontFamily : 'Arial',
  fontSize: 40,
  fill : 0x66ff00,
  align : 'center'};
this.lblReady = new PIXI.Text("Ready?",tStyle);
this.lblReady.anchor.set(0.5,0.5);
this.lblReady.position.set(GameConfig.sceneWidth*0.5, GameConfig.sceneHeight*0.5);
this.lblReady.interactive = true;
this.lblReady.on('click', evtReady);
this.lblReady.on('tap', evtReady);
stage.addChild(this.lblReady);

animate();
function animate() {
    requestAnimationFrame(animate);

    // just for fun, let's rotate mr rabbit a little
    //bunny.rotation += 0.1;

    // render the container
    renderer.render(stage);
}
