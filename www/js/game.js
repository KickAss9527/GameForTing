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
  this.playerDayView = null;
  this.playerNightView = null;
  this.opponentDayView = null;
  this.opponentNightView = null;
  this.cardStack = null;
  this.cardStack_Discard = null;
  this.cardRandomList = null;
  this.opponentCardStack = null;
  this.btnDiscard = null;
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

  loadBorderContainer : function(width, height)
  {
    var gra = new PIXI.Graphics();
    gra.lineStyle(1, 0x006666, 1);
    gra.beginFill(0x444444, 0);
    gra.drawRect(0, 0, width, height);
    gra.endFill();
    return gra;
  },

  initPlayerCardView : function()
  {
      this.lblReady.parent.removeChild(this.lblReady);
      this.playerCardView = new PIXI.Container();
      this.stage.addChild(this.playerCardView);
      var width = GameConfig.sceneWidth-2;
      var height = CardConfig.cardSizeH;
      this.playerCardView.width = width;
      this.playerCardView.height = height;
      this.playerCardView.position.set(1,GameConfig.sceneHeight - CardConfig.cardSizeH);
      this.playerCardView.addChild(this.loadBorderContainer(width, height));

// load btn Discard
      var tStyle = {
        fontFamily : 'Arial',
        fontSize: 18,
        fill : 0x66ff00,
        align : 'center'};

      this.btnDiscard = new PIXI.Text("Discard",tStyle);
      this.btnDiscard.anchor.set(0.5,0.5);
      this.btnDiscard.position.set(50, -20);
      this.btnDiscard.interactive = true;
      var discardEvt = function(){
        alert();
      };
      this.btnDiscard.on('click', discardEvt);
      this.btnDiscard.on('tap', discardEvt);
      this.playerCardView.addChild(this.btnDiscard);

//load 4 game card board
      this.playerDayView = new CardParentView(width, height, CardConfig.Type_Day);
      this.playerNightView = new CardParentView(width, height, CardConfig.Type_Night);
      this.opponentDayView = new CardParentView(width, height, CardConfig.Type_Day);
      this.opponentNightView = new CardParentView(width, height, CardConfig.Type_Night);

      this.stage.addChild(this.playerDayView);
      this.stage.addChild(this.playerNightView);
      this.stage.addChild(this.opponentDayView);
      this.stage.addChild(this.opponentNightView);

      this.playerNightView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+10)*2);
      this.playerDayView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+10)*3);
      this.opponentNightView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+10)*4);
      this.opponentDayView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+10)*5);

//load initial cardsprite
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
  },

  canPlayThisCard : function (card)
  {
    var center = card.parent.toGlobal(card.position);
    center.x += 0.5*card.width;
    center.y += 0.5*card.height;
    var parentView = new Array(this.playerNightView, this.playerDayView, this.opponentDayView,this.opponentNightView);
    for (var i = 0; i < parentView.length; i++)
    {
      var view = parentView[i];
      if (view.cardType == card.data.dayType &&
          center.y <= view.y + view.height && center.y >= view.y)
      {
          return view;
      }
    }

    return null;
  },

  playCard : function(card, targetView)
  {
    var cardWorldPos = card.parent.toGlobal(card.position);
    var cardLocalPos = targetView.toLocal(cardWorldPos);
    var cardTargetViewLocalPos = new PIXI.Point(cardLocalPos.x, 0);
    var cardTargetWorldPos = targetView.toGlobal(cardTargetViewLocalPos);
    var cardTargetLocalPos = card.parent.toLocal(cardTargetWorldPos);
    var tween = PIXI.tweenManager.createTween(card);
    tween.time = 300;
    tween.to(cardTargetLocalPos);
    tween.easing = PIXI.tween.Easing.inQuad();
    tween.start();
    tween.on("end", function(){
       card.position = cardTargetViewLocalPos;
       card.parent.removeChild(card);
       targetView.addChild(card);
//targetView 本来还有个children， bug
       console.log(targetView.children.length);
    });
  },

  showTip : function()
  {
    //检查 collect

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
      case GameState.PlayerTurn:
      case GameState.OpponentTurn:
      {
        gameInstance.showTip();
      }break;
      default:break;

    }
    requestAnimationFrame(animate);
    renderer.render(gameInstance.stage);
    PIXI.tweenManager.update();
}


// create the root of the scene graph
