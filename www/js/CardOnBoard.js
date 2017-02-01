function CardOnBoard(card)
{
  this.addCard = function(card)
  {
    this.card = card;
    this.card.position = new PIXI.Point(0);
    this.addChild(this.card);
  };

  this.getData = function(){
    if (this.card) {
      return this.card.data;
    }else return null;
  };

  PIXI.Container.call(this);

  this.tag = 0;
  this.dragging = false;
  this.interactiveData = null;
  this.originalPosition = null;
  this.interactive = true;
  this.targetPos = null;

  if (card)
  {
    this.card = card;
    this.addCard(card);
  };

  var mouseDoneCallback = function(event)
  {
    this.alpha = 0.5;
    this.interactiveData = event.data;
    this.dragging = true;
    this.originalPosition = new PIXI.Point();
    this.originalPosition.copy(this.position);
    gameInstance.showPlayCardTip(this.getData());
  };

  var mouseUpCallback = function(event)
  {
    this.alpha = 1;
    this.interactiveData = null;
    this.dragging = false;
    var dropView = gameInstance.canPlayThisCard(this);
    if (dropView)
    {
      console.log("recieve card !!!!");
      dropView.recieveCard(this);
      gameInstance.refreshPlayerCardsLayout();
    }
    else
    {
      //put back
        var tween = PIXI.tweenManager.createTween(this);
        tween.time = 300;
        tween.to(this.originalPosition);
        tween.easing = PIXI.tween.Easing.inQuad();
        tween.start();
    }
    gameInstance.hidePlayCardTip(this.getData());
  };

  var mousemoveCallback = function(event)
  {
    if(this.dragging)
    {
      var newPosition = this.interactiveData.getLocalPosition(this.parent);
      this.position.x = newPosition.x - this.width*0.5;
      this.position.y = newPosition.y - this.height*0.5;
    }
  };

  this.setupCardPlayerEvent = function(flg)
  {
    if(flg)
    {
      this.on('mousedown', mouseDoneCallback);
      this.on('mouseup', mouseUpCallback);
      this.on('mousemove', mousemoveCallback);
      this.on('touchstart', mouseDoneCallback);
      this.on('touchend', mouseUpCallback);
      this.on('touchmove', mousemoveCallback);
    }
    else
    {
      this.removeListener('mousedown', mouseDoneCallback);
      this.removeListener('mouseup', mouseUpCallback);
      this.removeListener('mousemove', mousemoveCallback);
      this.removeListener('touchstart', mouseDoneCallback);
      this.removeListener('touchend', mouseUpCallback);
      this.removeListener('touchmove', mousemoveCallback);
    }

  };

}
CardOnBoard.prototype = Object.create(PIXI.Container.prototype);
