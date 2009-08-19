
var msg = function(title, msg){
   Ext.Msg.show({
      title: title,
      msg: msg,
      minWidth: 200,
      modal: true,
      icon: Ext.Msg.INFO,
      buttons: Ext.Msg.OK
   });
};