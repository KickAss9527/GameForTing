var GameConfig ={
  sceneWidth : 1440,
  sceneHeight : 960,
  handCardCnt : 5
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
  this.playerCardView = null;
  this.cardStack = null;
  this.cardStack_Discard = null;
  this.cardRandomList = null;
  this.opponentCardStack = null;
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
  },

  initPlayerCardView : function()
  {
      this.playerCardView = new PIXI.Container();
      this.stage.addChild(this.playerCardView);
      var width = GameConfig.sceneWidth-2;
      var height = CardConfig.cardSizeH;
      this.playerCardView.width = width;
      this.playerCardView.height = height;
      this.playerCardView.position.set(1,GameConfig.sceneHeight - CardConfig.cardSizeH);

      var gra = new PIXI.Graphics();
      gra.lineStyle(1, 0x006666, 1);
      gra.beginFill(0x444444, 0);
      gra.drawRect(0, 0, width, height);
      gra.endFill();
      this.playerCardView.addChild(gra);

      console.log("stack count : %d", this.cardStack.length);
      this.opponentCardStack = new Array();
      if (this.state == GameState.PrepareSecondHand)
      {
        for(var i=0; i<GameConfig.handCardCnt; i++){this.opponentCardStack.push(this.cardStack.pop());}
      }
      for(var i=0; i<GameConfig.handCardCnt; i++)
      {
        var data = this.cardStack.pop();
        var card = new Card(data);
        card.x = i*(card.width+10);
        card.on('click', function(event){
          alert(this.data.value);
        });
        card.on('mousedown', function(event){
          this.alpha = 0.5;
          this.interactiveData = event.data;
          this.dragging = true;
        });
        card.on('mouseup', function(event){
          this.alpha = 1;
          this.interactiveData = null;
          this.dragging = false;
        });
        card.on('mousemove', function(event){
          if(this.dragging)
          {
            var newPosition = this.interactiveData.getLocalPosition(this.parent);
            this.position.x = newPosition.x - this.width*0.5;
            this.position.y = newPosition.y - this.height*0.5;
          }
        });
        this.playerCardView.addChild(card);
      }
      if (this.state == GameState.PrepareFirstHand)
      {
        for(var i=0; i<GameConfig.handCardCnt; i++){this.opponentCardStack.push(this.cardStack.pop());}
      }
      console.log("stack count : %d", this.cardStack.length);
  },



  InitCardStack : function()
  {
    this.cardStack = new Array();
    for (var i = 1; i <= CardConfig.cardNumCnt*0.5; i++)
    {
      this.cardStack.push(new CardData(CardConfig.Type_Day, i));
      this.cardStack.push(new CardData(CardConfig.Type_Night, i));
    }
    for (var i = 0; i < CardConfig.cardCoverCnt*0.5; i++) {
      this.cardStack.push(new CardData(CardConfig.Type_Day, -1));
      this.cardStack.push(new CardData(CardConfig.Type_Night, -1));
    }
  },

  randomCardStack : function()
  {
    var newCardStack = new Array();
    for (var i = 0; i < this.cardStack.length; i++)
    {
      newCardStack.push(this.cardStack[this.cardRandomList[i]]);
    }
    this.cardStack = newCardStack;
  }
};

var gameInstance = new Game();
var allCards = new Array();
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
        gameInstance.InitCardStack();
        gameInstance.randomCardStack();
        gameInstance.initPlayerCardView();
        //发牌
        gameInstance.state = gameInstance==GameState.PrepareFirstHand ? GameState.PlayerTurn : GameState.OpponentTurn;
      }break;
      default:break;

    }
    requestAnimationFrame(animate);
    renderer.render(gameInstance.stage);
}


// create the root of the scene graph
