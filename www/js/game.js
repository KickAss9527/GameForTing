var Config ={
  cardNumCnt : 58, //数值卡
  cardCoverCnt : 10, //日食月食卡
  cardHandCnt : 5, //手牌数
  cardSizeW : 100,
  cardSizeH : 100*2.2,
  sceneWidth : 1440,
  sceneHeight : 960
}



function InitAllCards(arr)
{
  for (var i = 1; i <= Config.cardNumCnt*0.5; i++)
  {
    arr.push(new CardData(CardConfig.Type_Day, i));
    arr.push(new CardData(CardConfig.Type_Night, i));
  }
  for (var i = 0; i < Config.cardCoverCnt*0.5; i++) {
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

var allCards = new Array();
InitAllCards(allCards);
RandomCards(allCards);

var renderer = PIXI.autoDetectRenderer(Config.sceneWidth, Config.sceneHeight,{backgroundColor : 0x1099bb});
document.getElementsByTagName('body')[0].appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

for (var i = 0; i < 10; i++)
{
  var cardObj = new Card(allCards[i]);
  cardObj.position.set(i*(Config.cardSizeW + 20)+10, 120);
  stage.addChild(cardObj);
}

animate();
function animate() {
    requestAnimationFrame(animate);

    // just for fun, let's rotate mr rabbit a little
    //bunny.rotation += 0.1;

    // render the container
    renderer.render(stage);
}
