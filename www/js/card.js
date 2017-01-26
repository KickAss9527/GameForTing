function CardData(type, val){
  this.dayType = type;
  this.value = val;

  this.hasBug = function(){
    var value = this.value;
    if (value==1 || value==4 || value==9 || value==14 ||
        value==19 || value==20 || value==25 || value==29)
        {
          return true;
        }
    return false;
  }
}

function Card(data){

  this.getBgColor = function(){
    return this.data.dayType==CardConfig.Type_Day ? CardConfig.BgColor_Day : CardConfig.BgColor_Night;
  };

  this.getLblValueColor = function(){
    return this.data.dayType==CardConfig.Type_Day ? CardConfig.BgColor_Night : CardConfig.BgColor_Day;
  };

  this.getLogoImgName = function(){
    return this.data.dayType==CardConfig.Type_Day ? "img/sun.png" : "img/moon.png";
  };

  this.getBugImgName = function(){
    var idx = Math.floor(Math.random()*5);
    return "img/bug_" + idx + ".png";
  };

  this.isDropAble = function(){
    return gameInstance.canPlayThisCard(this);
  };

  this.data = data;
  this.dragging = false;
  this.interactiveData = null;
  this.originalPosition = null;
  PIXI.Container.call(this);
  this.width = CardConfig.cardSizeW;
  this.height = CardConfig.cardSizeH;
  this.interactive = true;

  this.on('click', function(event){

  }).on('mousedown', function(event){
    this.alpha = 0.5;
    this.interactiveData = event.data;
    this.dragging = true;
    this.originalPosition = new PIXI.Point();
    this.originalPosition.copy(this.position);
    gameInstance.showTip(this.data);
  }).on('mouseup', function(event){
    this.alpha = 1;
    this.interactiveData = null;
    this.dragging = false;

    var dropView = this.isDropAble();
    if (dropView)
    {
      dropView.recieveCard(this);
    }
    else
    {
        var tween = PIXI.tweenManager.createTween(this);
        tween.time = 300;
        tween.to(this.originalPosition);
        tween.easing = PIXI.tween.Easing.inQuad();
        tween.start();
    }
    gameInstance.hideTip(this.data);
  }).on('mousemove', function(event){
    if(this.dragging)
    {
      var newPosition = this.interactiveData.getLocalPosition(this.parent);
      this.position.x = newPosition.x - this.width*0.5;
      this.position.y = newPosition.y - this.height*0.5;
    }
  });

  this.background = new PIXI.Graphics();
  this.background.beginFill(this.getBgColor());
  this.background.drawRoundedRect(0,0, CardConfig.cardSizeW, CardConfig.cardSizeH, 8);
  this.background.endFill();
  this.background.position.set(0,0);
  this.addChild(this.background);

  var logoImgName = this.getLogoImgName();
  var te = PIXI.Texture.fromImage(logoImgName);
  this.logo = new PIXI.Sprite(te);
  this.logo.anchor.set(0.5, 0);
  this.logo.position.set(this.width*0.5, 10);
  var scale = 0.43;
  this.logo.scale.set(scale, scale);
  this.addChild(this.logo);

  if (this.data.hasBug())
  {
    te = PIXI.Texture.fromImage(this.getBugImgName());
    this.SpBug = new PIXI.Sprite(te);
    this.SpBug.position.set(this.width*0.5, this.height*0.5);
    scale = 0.25;
    this.SpBug.scale.set(scale, scale);
    this.SpBug.anchor.set(0.5,0.5);
    this.addChild(this.SpBug);
  }

  if (this.data.value>0) {
    var tStyle = {
      fontFamily : 'Chalkboard',
      fontSize: 40,
      fill : this.getLblValueColor(),
      align : 'center'};
    this.lblValue = new PIXI.Text(this.data.value.toString(),tStyle);
    this.lblValue.anchor.set(0.5, 1);
    this.lblValue.position.set(this.width*0.5, this.height - CardConfig.LblValMarginBtm);

    this.addChild(this.lblValue);
  }
}
Card.prototype = Object.create(PIXI.Container.prototype);


function CardParentView(width, height, cardType)
{
    PIXI.Container.call(this);
    this.cardType = cardType;
    this.width = width;
    this.height = height;
    this.borderLayer = new PIXI.Graphics();
    this.cardContainer = new PIXI.Container();
    this.tag = 0;
    this.cardNodeHead = null;
    var color = 0x444444;
    if (cardType == CardConfig.Type_Day)
    {
      color = 0xffffff;
    }
    else if(cardType == CardConfig.Type_Night)
    {
      color = 0x0000FF;
    }
    this.borderLayer.lineStyle(1, color, 1);
    this.borderLayer.drawRect(0, 0, width, height);
    this.addChild(this.borderLayer);
    this.addChild(this.cardContainer);

    this.getPlayCardPosition = function(card)
    {
      if (this.cardContainer.children.length == 1)
      {
        return new PIXI.Point(this.width*0.5 - card.width*0.5, 0);
      }
      return null;
    };

    var cardSpaceWidth = 5;
    this.prepareNextCards = function()
    {
      if (this.cardNodeHead.card)
      {
        if(this.cardNodeHead.left==null && this.cardNodeHead.cardData().value > CardConfig.CardMinValue)
        {
          // add to left
          var newCard = new CardOnBoard(null);
          newCard.position = new PIXI.Point(this.cardNodeHead.x - cardSpaceWidth - this.cardNodeHead.width, 0);
          this.cardContainer.addChild(newCard);
          this.cardNodeHead.left = newCard;
        }
        var nodeTail = this.getTailNode();
        if (nodeTail.card)
        {
            if (nodeTail.right == null && this.cardNodeHead.cardData().value < CardConfig.CardMaxValue)
            {
              var newCard = new CardOnBoard(null);
              newCard.position = new PIXI.Point(this.cardNodeHead.x + cardSpaceWidth + this.cardNodeHead.width, 0);
              this.cardContainer.addChild(newCard);
              nodeTail.right = newCard;
            }
        }
      }
    };

    this.recieveCard = function(card)
    {
      var cardWorldPos = card.parent.toGlobal(card.position);
      var cardLocalPos = this.toLocal(cardWorldPos);
      var newCard = this.addCard(card, cardLocalPos);

      var targetPos = this.getPlayCardPosition(newCard);
      var tween = PIXI.tweenManager.createTween(newCard);
      tween.time = 300;
      tween.to(targetPos);
      tween.easing = PIXI.tween.Easing.inQuad();
      tween.start();
      var that = this;
      tween.on("end", function(){
        that.prepareNextCards();
      });

    }

    this.addCard = function(card, pos)
    {
      if (card.parent)
      {
        card.parent.removeChild(card);
      }
      var cardOnBoard = new CardOnBoard(card);
      cardOnBoard.position = pos;
      this.cardContainer.addChild(cardOnBoard);
      this.cardNodeHead = this.getHeadNode();

      return cardOnBoard;
    };

    this.getHeadNode = function()
    {
      var arr = this.cardContainer.children;
      if (arr.length == 0) {
        return null;
      }
      else {
        var node = arr[0];
        while (node.left && node.left.card)
        {
            node = node.left;
        }
        return node;
      }
    };

    this.getTailNode = function()
    {
      var arr = this.cardContainer.children;

      if (arr.length == 0) {
        return null;
      }
      else {
        var node = arr[0];
        while (node.right)
        {
            node = node.right;
        }
        return node;
      }
    };

    this.canShowTip = function(cardData)
    {
      if (!this.cardNodeHead) return false;
      if(cardData.dayType == CardConfig.Type_Night)
      {
        if (this.tag == GameConfig.ViewTag_PlayerNight || this.tag == GameConfig.ViewTag_OpponentNight)
        {
          return true;
        }
        return false;
      }
      else if(cardData.dayType == CardConfig.Type_Day)
      {
        if (this.tag == GameConfig.ViewTag_PlayerDay || this.tag == GameConfig.ViewTag_OpponentDay)
        {
          return true;
        }
        return false;
      }

      return false;
    };

    this.hideTip = function(cardData)
    {
      if (!this.canShowTip(cardData))
      {
        return;
      }

      for (var i = 0; i < this.cardContainer.children.length; i++) {
        var node = this.cardContainer.children[i];
        node.setBorderVisible(false);
      }
    };

    this.showTip = function(cardData)
    {
      // console.log(this.tag+"--"+cardData.dayType);
      if (!this.canShowTip(cardData))
      {
        return;
      }

      var node = this.cardNodeHead;
      if (cardData.value < 0) {
        var tmpNode = node;
        while (tmpNode && tmpNode.cardData())
        {
          var aboveNode = tmpNode.above;
          if (aboveNode)
          {
            while (aboveNode.above) {
              aboveNode = aboveNode.above;
            }
            if(aboveNode.cardData().value > 0)  tmpNode.setBorderVisible(true);
          }
          else if(tmpNode.cardData().value > 0)
          {
            tmpNode.setBorderVisible(true);
          }
          tmpNode = tmpNode.right;
        }
      }
      else {
        //出牌是 数值卡， 最上 是 日食月食
        var surfaceCards = new Array();
        var tmpNode = node;
        while (tmpNode && tmpNode.cardData)
        {
          var above = tmpNode.above;
          while (above) {
            above = above.above;
          };
          if (!(above || tmpNode.cardData())) break;
          surfaceCards.push(above ? above : tmpNode);
          tmpNode = tmpNode.right;
        }
      console.log("arr.length = "+surfaceCards.length);
        //左右两边是否可放置
        if (surfaceCards[0].cardData().value > cardData.value)
        {
            surfaceCards[0].left.setBorderVisible(true);
        }
        else if(surfaceCards[surfaceCards.length - 1].cardData().value < cardData.value)
        {
            surfaceCards[surfaceCards.length - 1].right.setBorderVisible(true);
        }
        else
        {
          var prevValue = 0;
          for (var i = 0; i < surfaceCards.length; i++) {
            var node = surfaceCards[i];
            if (node.cardData() < 0)//找出 日食月食
            {
              if (cardData.value > prevValue)
              {
                var rightValue = 9999;
                var rightNode;
                var tmpI = i;
                do{
                  if (tmpI >= surfaceCards.length) {
                    break;
                  }
                  rightNode = surfaceCards[++tmpI];
                }while(rightNode.cardData().value < 0);
                if(rightNode.cardData().value > 0)  rightValue = rightNode.cardData().value;

                if(prevValue < cardData.value && cardData.value < rightValue)
                {
                  for (var j = i+1; i < tmpI-i-1; j++) {
                    var node = array[i];
                    node.setBorderVisible(true);
                  }
                }
              }
            }
            else
            {
              prevValue = surfaceCards[i].cardData().value;
            }
          }
        }
      }

    };
}
CardParentView.prototype = Object.create(PIXI.Container.prototype);

function CardOnBoard(card)
{
  this.addCard = function(card)
  {
    this.card = card;
    this.card.position = new PIXI.Point(0);
    this.addChild(this.card);
  };

  this.canPlaceHere = function()
  {
    return this.borderLayer.alpha == 1;
  }

  this.cardData = function(){
    if (this.card) {
      return this.card.data;
    }else return null;

  };
  this.setBorderVisible = function(flg){this.borderLayer.alpha = flg?1:0;};

  PIXI.Container.call(this);
  this.left = null;
  this.right = null;
  this.above = null;
  this.card = card;

  this.borderLayer = new PIXI.Graphics();
  var borderW = 2;
  this.borderLayer.lineStyle(2, 0xbb0909, 1);
  this.borderLayer.drawRect(-borderW, -borderW, CardConfig.cardSizeW+borderW*2, CardConfig.cardSizeH+borderW*2);
  this.setBorderVisible(false);
  this.addChild(this.borderLayer);

  if (this.card)
  {
    this.addCard(card);
  };



}CardOnBoard.prototype = Object.create(PIXI.Container.prototype);
