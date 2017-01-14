var CardAtt = {
  Type_Day : 1,
  Type_Night : 2

}

var Card = {
  dayType : 0,
  value : 0,

  var hasBug : function()
  {
    if (value==1 || value==4 || value==9 || value==14 ||
        value==19 || value==20 || value==25 || value==29 ||) {
          return true;
    }
    return false;
  }
}
