var CardConfig = {
  Type_Day : 1,
  Type_Night : 2,
  BgColor_Day : 0xf5f5d2,
  BgColor_Night : 0x3b3c3c,
  LblValMarginBtm : 10
}

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
  };
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

  this.data = data;

  var clickCard = function(event){
    console.log(this.data.value);
  }
  PIXI.Container.call(this);
  this.width = Config.cardSizeW;
  this.height = Config.cardSizeH;
  this.interactive = true;
  this.on('click', clickCard);

  this.background = new PIXI.Graphics();
  this.background.beginFill(this.getBgColor());
  this.background.drawRoundedRect(0,0, Config.cardSizeW, Config.cardSizeH, 8);
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
