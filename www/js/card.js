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
    console.log(this.data.value);
  }).on('mousedown', function(event){
    this.alpha = 0.5;
    this.interactiveData = event.data;
    this.dragging = true;
    this.originalPosition = new PIXI.Point(this.x, this.y);
  }).on('mouseup', function(event){
    this.alpha = 1;
    this.interactiveData = null;
    this.dragging = false;

    var dropView = this.isDropAble();
    if (dropView)
    {
      gameInstance.playCard(this, dropView);
    }
    else
    {
        var tween = PIXI.tweenManager.createTween(this);
        tween.time = 300;
        tween.to({x:this.originalPosition.x, y:this.originalPosition.y});
        tween.easing = PIXI.tween.Easing.inQuad();
        tween.start();
    }
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
}
CardParentView.prototype = Object.create(PIXI.Container.prototype);

function CardOnBoard(card)
{
  this.left = null;
  this.right = null;
  this.above = null;
  this.card = card;
}CardOnBoard.prototype = Object.create(PIXI.Container.prototype);
