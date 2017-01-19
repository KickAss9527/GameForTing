var GameConfig ={
  sceneWidth : 1440,
  sceneHeight : 960
}

var GameState = {
  Invalid : -1,
  Waiting : 0,
  PrepareFirstHand : 1,
  PrepareSecondHand : 2,
  PlayerTurn : 3,
  OpponentTurn : 4,
  CommunicateToServer : 5,
  Init : 6
}

function Game(){

  this.state = GameState.Init;
  this.lblReady = null;
  this.connector = new Con();
  this.connector.init();
  this.stage = new PIXI.Container();
  this.lblReady = null;

};

Game.prototype = {
  evtReady : function(evt)
  {
    gameInstance.lblReady.text = "Waiting...";
    gameInstance.connector.playerReady();
  },

  initPrepareInfo : function()
  {
    var tStyle = {
      fontFamily : 'Arial',
      fontSize: 40,
      fill : 0x66ff00,
      align : 'center'};

    this.lblReady = new PIXI.Text("Ready?",tStyle);
    this.lblReady.anchor.set(0.5,0.5);
    this.lblReady.position.set(GameConfig.sceneWidth*0.5, GameConfig.sceneHeight*0.5);
    this.lblReady.interactive = true;
    this.lblReady.on('click', this.evtReady);
    this.lblReady.on('tap', this.evtReady);
    this.stage.addChild(this.lblReady);
  }
};

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

var gameInstance = new Game();
var allCards = new Array();
// InitAllCards(allCards);
// RandomCards(allCards);
var renderer = PIXI.autoDetectRenderer(GameConfig.sceneWidth, GameConfig.sceneHeight,{backgroundColor : 0x333333});
document.getElementsByTagName('body')[0].appendChild(renderer.view);
animate();
function animate() {
    switch (gameInstance.state)
    {
      case GameState.Init:
      {
        gameInstance.initPrepareInfo();
        gameInstance.state = GameState.Waiting;
      }
      break;
      case GameState.Waiting:{}break;
      case GameState.PrepareFirstHand:
      case GameState.PrepareSecondHand:
      {
        //发牌
      }break;
      default:alert();break;

    }
    requestAnimationFrame(animate);
    renderer.render(gameInstance.stage);
}


// create the root of the scene graph
