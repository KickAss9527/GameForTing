function CardParentView(width, height, cardType)
{
    PIXI.Container.call(this);
    this.cardType = cardType;

    this.width = width;
    this.height = height;
    this.borderLayer = new PIXI.Graphics();
    this.arrCardNode = new Array();
    this.arrCardTip = new Array();
    this.cardTipParent = new PIXI.Container();
    this.cardNodeParent = new PIXI.Container();
    this.addChild(this.cardTipParent);
    this.addChild(this.cardNodeParent);

    this.cardTipParent.width = this.cardNodeParent.width = width;
    this.cardTipParent.height = this.cardNodeParent.height = height;

    this.tag = 0;

    this.getBorderColor = function()
    {
      var color = 0x444444;
      if (this.cardType == CardConfig.Type_Day)
      {
        color = 0xffffff;
      }
      else if(this.cardType == CardConfig.Type_Night)
      {
        color = 0x0000FF;
      }
      return color;
    };
    this.borderLayer.lineStyle(1, this.getBorderColor(), 1);
    this.borderLayer.drawRect(0, 0, width, height);
    this.addChild(this.borderLayer);

    this.getMatchedCardNode = function(cardCenter)
    {
      if(this.arrCardTip.length == 0) return null;
      for (var i = 0; i < this.arrCardTip.length; i++) {
        var node = this.arrCardTip[i];
        if (node.x < cardCenter.x && cardCenter.x < node.x + node.width &&
            node.y < cardCenter.y && cardCenter.y < node.y + node.height){
            return node;
        }
      }
      return null;
    }

    this.loadCardTip = function()
    {
      var tipCard = new CardTip(CardConfig.cardSizeW, CardConfig.cardSizeH);
      this.cardTipParent.addChild(tipCard);
      this.arrCardTip.push(tipCard);
      return tipCard;
    }

    this.refreshCardsLayout = function()
    {
      for (var i = 0; i < this.arrCardNode.length; i++) {
        var arr = this.arrCardNode[i];
        var pos = this.arrCardTip[i+1].position;
        for (var j = 0; j < arr.length; j++) {
          var card = arr[j];
          var tween = PIXI.tweenManager.createTween(card);
          tween.time = 100;
          tween.to({"x":pos.x, "y":pos.y});
          tween.start();
        }
      }
    };

    var cardSpaceWidth = 5;
    this.prepareNextCards = function()
    {
      if (this.arrCardTip.length == 0)
      {
        this.loadCardTip();
      }
      else {
        var surfaceCards = this.getSurfaceArr();
        while (this.arrCardTip.length < surfaceCards.length + 2) {
          this.loadCardTip();
        };
      }
      var cardW = CardConfig.cardSizeW;
      var cnt = this.arrCardTip.length;

      var x = 0.5*this.width - 0.5*(cnt*cardW + (cnt-1)*cardSpaceWidth);

      for (var i = 0; i < cnt; i++) {
        var node = this.arrCardTip[i];
        var newPos = new PIXI.Point(x + i*(cardSpaceWidth + cardW), 0);
        node.x = newPos.x;
      }
    };
    if(this.cardType > 0) this.prepareNextCards();

    this.recieveCard = function(card)
    {
      var pos = this.getPlayerCardLocalPos(card);
      var tipNode = this.getMatchedCardNode(new PIXI.Point(pos.x + card.width*0.5, pos.y + card.height*0.5));
      console.log(tipNode);
      this.addCard(card,pos,this.arrCardTip.indexOf(tipNode));//加入新的view
      this.prepareNextCards();
      this.refreshCardsLayout();
    };

    this.addCard = function(card, pos, idx)//加入node，但card作为子节点保持当前位置，之后用动画位移
    {
      if (card.parent)
      {
        card.parent.removeChild(card);
      }
      card.setupCardPlayerEvent(false);
      card.position = pos;
      this.cardNodeParent.addChild(card);

      var head = this.getHeadNode();
      if(head && head.getData().value >= CardConfig.CardMinValue) idx--;

      if (idx >= this.arrCardNode.length ) {
        this.arrCardNode.splice(idx, 0, new Array());
      }else if(idx < 0)
      {
        idx = 0;
        this.arrCardNode.splice(0, 0, new Array());
      }

      var arr = this.arrCardNode[idx];
      console.log(idx+"_"+arr);
      arr.push(card);
    };

    this.getHeadNode = function()
    {
      var surfaceCards = this.getSurfaceArr();

      if (surfaceCards.length == 0) {
        return null;
      }
      else {
        return surfaceCards[0];
      }
    };

    this.getTailNode = function()
    {
      var surfaceCards = this.getSurfaceArr();

      if (surfaceCards.length == 0) {
        return null;
      }
      else {
        return surfaceCards[surfaceCards.length-1];
      }
    };

    this.getAcceptiveCards = function()
    {
      var res = new Array();
      var surfaceCards = this.getSurfaceArr();
      for (var i = 0; i < surfaceCards.length; i++) {
        var node = surfaceCards[i];
        if (node.canPlaceHere()) res.push(node);
      }

      var leftNode = surfaceCards[0].left;
      if(leftNode!=null && leftNode.canPlaceHere()) res.push(leftNode);

      var rightNode = surfaceCards[surfaceCards.length-1].right;
      if(rightNode!=null && rightNode.canPlaceHere()) res.push(rightNode);
      return res;
    };

    this.getPlayerCardLocalPos = function(card)
    {
      var cardWorldPos = card.parent.toGlobal(card.position);
      var cardLocalPos = this.toLocal(cardWorldPos);
      return cardLocalPos;
    };

    this.canRecieveCard = function(card)
    {
      if (this.arrCardNode.length == 0 && card.getData.value > 0)
      {
        return true;
      }
      var center = this.getPlayerCardLocalPos(card);
      center.x += card.width*0.5;
      center.y += card.height*0.5;
      return this.getMatchedCardNode(center)!= null;
    };

    this.getSurfaceArr = function(){
      var surfaceCards = new Array();
      for (var i = 0; i < this.arrCardNode.length; i++) {
        var arr = this.arrCardNode[i];
        surfaceCards.push(arr[arr.length-1]);
      }
      return surfaceCards;
    };

    this.canShowTip = function(cardData)
    {

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
      console.log("card parent view hide tip");
      for (var i = 0; i < this.cardTipParent.children.length; i++) {
        var node = this.cardTipParent.children[i];
        node.visible = false;
      }
    };

    this.showTip = function(cardData)
    {
      // console.log(this.tag+"--"+cardData.dayType);
      if (!this.canShowTip(cardData))
      {
        return;
      }

      var surfaceCards = this.getSurfaceArr();

      if (cardData.value < 0) {
        for (var i = 0; i < surfaceCards.length; i++) {
          var node = surfaceCards[i];
          if (node.getData().value > 0) {
              this.arrCardTip[i+1].visible = true;
          }
        }
      }
      else
     {
        //出牌是 数值卡， 最上 是 日食月食
        //左右两边是否可放置
        if(surfaceCards.length == 0)
        {
          this.arrCardTip[0].visible = true;
          return;
        }
        var headNode = surfaceCards[0];
        var tailNode = surfaceCards[surfaceCards.length-1];
        if (headNode.getData().value > cardData.value)
        {
            this.arrCardTip[0].visible = true;
        }
        else if(tailNode.getData().value < cardData.value)
        {
            this.arrCardTip[this.arrCardTip.length-1].visible = true;
        }
        else
        {
          var prevValue = 0;
          for (var i = 0; i < surfaceCards.length; i++) {
            var node = surfaceCards[i];
            if (node.getData() < 0)//找出 日食月食
            {
              if (cardData.value > prevValue)
              {
                var rightValue = 9999;
                var rightNode;
                var tmpI = i;
                do{//find the right nearest valid node
                  if (tmpI >= surfaceCards.length) {
                    break;
                  }
                  rightNode = surfaceCards[++tmpI];
                }while(rightNode.getData().value < 0);
                if(rightNode.getData().value > 0)  rightValue = rightNode.getData().value;

                if(prevValue < cardData.value && cardData.value < rightValue)
                {
                  for (var j = i; j < tmpI; j++) {
                    this.arrCardTip[j].visible = true;
                  }
                }
              }
            }
            else
            {
              prevValue = surfaceCards[i].getData().value;
            }
          }
        }
      }

    };
}
CardParentView.prototype = Object.create(PIXI.Container.prototype);
