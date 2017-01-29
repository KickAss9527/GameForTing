var GameConfig ={
  sceneWidth : 1440,
  sceneHeight : 960,
  handCardCnt : 10,
  ViewTag_OpponentDay : 1,
  ViewTag_OpponentNight : 2,
  ViewTag_PlayerDay : 3,
  ViewTag_PlayerNight : 4
}

var GameState = {
  Invalid : -1,
  Waiting : 0,
  PrepareFirstHand : 1,
  PrepareSecondHand : 2,
  PlayerTurn : 3,
  OpponentTurn : 4,
  CommunicateToServer : 5,
  Init : 6,
  PlayerTurnWaiting : 7,
  OpponentTurnWaiting : 8
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
  this.cardStack_Discard = new Array();
  this.cardRandomList = null;
  this.opponentCardStack = null;
  this.btnDiscard = null;
  this.lblTurnInfo = null;
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
      var width = GameConfig.sceneWidth-2;
      var height = CardConfig.cardSizeH;
      this.playerCardView = new CardParentView(width, height, 0);
      this.playerCardView.position.set(1,GameConfig.sceneHeight - CardConfig.cardSizeH);

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
      var that = this;
      var discardEvt = function(){
        console.log(that.cardStack_Discard);
        that.cardStack_Discard = that.cardStack_Discard.concat(that.playerNightView.dropAllCards())
        that.cardStack_Discard = that.cardStack_Discard.concat(that.playerDayView.dropAllCards());
        that.cardStack_Discard = that.cardStack_Discard.concat(that.playerCardView.cardNodeParent.children);
        that.playerCardView.cardNodeParent.removeChildren();

        console.log("discard cnt : " + that.cardStack_Discard.length);
      };
      this.btnDiscard.on('click', discardEvt);
      this.btnDiscard.on('tap', discardEvt);
      this.playerCardView.addChild(this.btnDiscard);

//load 4 game card board
      this.playerDayView = new CardParentView(width, height, CardConfig.Type_Day);
      this.playerNightView = new CardParentView(width, height, CardConfig.Type_Night);
      this.opponentDayView = new CardParentView(width, height, CardConfig.Type_Day);
      this.opponentNightView = new CardParentView(width, height, CardConfig.Type_Night);
      this.playerDayView.tag = GameConfig.ViewTag_PlayerDay;
      this.playerNightView.tag = GameConfig.ViewTag_PlayerNight;
      this.opponentDayView.tag = GameConfig.ViewTag_OpponentDay;
      this.opponentNightView.tag = GameConfig.ViewTag_OpponentNight;

      this.stage.addChild(this.playerDayView);
      this.stage.addChild(this.playerNightView);
      this.stage.addChild(this.opponentDayView);
      this.stage.addChild(this.opponentNightView);
      this.stage.addChild(this.playerCardView);

      this.playerNightView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+10)*2);
      this.playerDayView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+10)*3);
      this.opponentNightView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+10)*4);
      this.opponentDayView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+10)*5);

//load initial cardsprite
      console.log("stack count : %d", this.cardStack.length);
      this.opponentCardStack = new Array();
      this.lblTurnInfo = new PIXI.Text("TurnInfo",tStyle);
      this.lblTurnInfo.position.set(50, 20);
      this.stage.addChild(this.lblTurnInfo);

      if (this.state == GameState.PrepareSecondHand)
      {
        this.lblTurnInfo.text = this.connector.userId + " _ Opponent Turn";
        for(var i=0; i<GameConfig.handCardCnt; i++){this.opponentCardStack.push(this.cardStack.pop());}
      }
      for(var i=0; i<GameConfig.handCardCnt; i++)
      {
        var card = this.cardStack.pop();
        card.setupCardPlayerEvent(true);
        this.playerCardView.cardNodeParent.addChild(card);
      }
      this.refreshPlayerCardsLayout();
      if (this.state == GameState.PrepareFirstHand)
      {
        this.lblTurnInfo.text = this.connector.userId + " _ Your Turn";
        for(var i=0; i<GameConfig.handCardCnt; i++){this.opponentCardStack.push(this.cardStack.pop());}
      }
  },

  InitCardStack : function()
  {
    this.cardStack = new Array();
    for (var i = 1; i <= CardConfig.cardNumCnt*0.5; i++)
    {
      this.cardStack.push(new CardOnBoard(new Card(new CardData(CardConfig.Type_Day, i))));
      this.cardStack.push(new CardOnBoard(new Card(new CardData(CardConfig.Type_Night, i))));
    }
    for (var i = 0; i < CardConfig.cardCoverCnt*0.5; i++) {
      this.cardStack.push(new CardOnBoard(new Card(new CardData(CardConfig.Type_Day, -1))));
      this.cardStack.push(new CardOnBoard(new Card(new CardData(CardConfig.Type_Night, -1))));
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
      var targetView = parentView[i];
      if (targetView.cardType == card.getData().dayType &&
          center.y <= targetView.y + targetView.height && center.y >= targetView.y)
          //在大队列范围内
      {
          if (targetView.canRecieveCard(card))
          {
            console.log("can play the card in this view");
            return targetView;
          }
      }
    }

    return null;
  },

  hideTip : function(cardData)
  {
    var parentView = new Array(this.playerNightView, this.playerDayView, this.opponentDayView,this.opponentNightView);
    for (var i = 0; i < parentView.length; i++)
    {
      var targetView = parentView[i];
      targetView.hideTip(cardData);
    }
  },

  showTip : function(cardData)
  {
    //检查 collect
    var parentView = new Array(this.playerNightView, this.playerDayView, this.opponentDayView,this.opponentNightView);
    for (var i = 0; i < parentView.length; i++)
    {
      var targetView = parentView[i];
      targetView.showTip(cardData);
    }
  },

  showWaitingTip : function()
  {
      this.playerDayView.showCollectTip();
      this.playerNightView.showCollectTip();
  },

  refreshPlayerCardsLayout : function()
  {
    var nodes = this.playerCardView.cardNodeParent.children;
    nodes.sort(function(a,b){
      return (a.getData().value + a.getData().dayType*100) - (b.getData().value + b.getData().dayType*100);
    });

    var cnt = nodes.length;
    if (cnt == 0) return;
    var cardW = nodes[0].width;
    var space = 10;

    var x = 0.5*(GameConfig.sceneWidth - cnt*cardW - (cnt-1)*space);
    for (var i = 0; i < cnt; i++) {
      var node = nodes[i];
      var newPos = new PIXI.Point(x + i*(space + cardW), node.y);
      var tween = PIXI.tweenManager.createTween(node);
      tween.time = 100;
      tween.to(newPos);
      tween.start();
    }
  },

  opponentPlayCard : function(data)
  {
    var cardData = data[0];
    var tag = data[1];
    var idx = data[2];

    var targetView = null;
    if (tag == GameConfig.ViewTag_OpponentDay) targetView = this.playerDayView;
    else if (tag == GameConfig.ViewTag_OpponentNight) targetView = this.playerNightView;
    else if (tag == GameConfig.ViewTag_PlayerDay) targetView = this.opponentDayView;
    else if (tag == GameConfig.ViewTag_PlayerNight) targetView = this.opponentNightView;

    var targetCard = null;
    for (var i = 0; i < this.opponentCardStack.length; i++) {
      var card = this.opponentCardStack[i];
      if (card.getData().value == cardData.value &&
          card.getData().dayType == cardData.dayType) {
        targetCard = card;
        this.opponentCardStack.slice(i, 1);
        break;
      }
    }

    targetView.recieveCardFromOpponent(targetCard, idx);

    if (!targetCard.getData().hasBug()) {
      this.state = GameState.PlayerTurn;
    }
  },

  playCard : function(cardData, viewTag, idx){
    this.connector.playCard(cardData, viewTag, idx);
    if (cardData.hasBug())
    {
        //continue
    }
    else
    {
      this.state = GameState.OpponentTurn;
    }
  },

  updateTurnInfo : function(){
    var text = this.state == GameState.PlayerTurn ? "_ Your Turn Now!!!" : "_ Opponent Turn..."
    this.lblTurnInfo.text = this.connector.userId + text;
  },

  setupPlayerControl : function(flgEnable)
  {
    this.btnDiscard.interactive = flgEnable;
    var cards = this.playerCardView.cardNodeParent.children;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i]
      card.interactive = flgEnable;
    }
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
        gameInstance.setupPlayerControl(false);
        gameInstance.state = gameInstance.state==GameState.PrepareFirstHand ? GameState.PlayerTurn : GameState.OpponentTurn;
      }break;
      case GameState.PlayerTurn:
      {
        gameInstance.setupPlayerControl(true);
        gameInstance.showWaitingTip();
        gameInstance.updateTurnInfo();
        gameInstance.state = GameState.PlayerTurnWaiting;
      }break;
      case GameState.PlayerTurnWaiting:{}break;
      case GameState.OpponentTurn:
      {
        gameInstance.setupPlayerControl(false);
        gameInstance.updateTurnInfo();
        gameInstance.state = GameState.OpponentTurnWaiting;
      }break;
      case gameInstance.OpponentTurnWaiting:{}break;
      default:break;

    }
    requestAnimationFrame(animate);
    renderer.render(gameInstance.stage);
    PIXI.tweenManager.update();
}


// create the root of the scene graph
