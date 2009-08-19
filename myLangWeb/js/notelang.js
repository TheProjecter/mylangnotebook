// next: hacer q se guarden los items

var viewport;
var mainPanel;

var actions = {
   'add' : function(){
/*
      if (Ext.getCmp("studyPanel") && Ext.getCmp("studyPanel").isVisible()) {
         Ext.getCmp("studyPanel").hide();
      }
      if (Ext.getCmp("listPanel") && Ext.getCmp("listPanel").isVisible()) {
         Ext.getCmp("listPanel").hide();
      }
*/
      if (Ext.getCmp("addItemForm") && !Ext.getCmp("addItemForm").isVisible()) {
         Ext.getCmp("addItemForm").show();
      }

      var nameCategory = Ext.select("div#"+mainPanel.actualCategory+" > div > span").first().dom.innerHTML;

      mainPanel.addItemForm.getComponent('cat').setValue(mainPanel.actualCategory);
      mainPanel.addItemForm.setTitle("Add new "+ nameCategory);

      viewport.getComponent('center').add(mainPanel.addItemForm);
      viewport.doLayout();
   },
   'view' : function(){
/*
      if (Ext.getCmp("studyPanel") && Ext.getCmp("studyPanel").isVisible()) {
         Ext.getCmp("studyPanel").hide();
      }
      if (Ext.getCmp("addItemForm") && Ext.getCmp("addItemForm").isVisible()) {
         Ext.getCmp("addItemForm").hide();
      }
*/
      if (Ext.getCmp("listPanel") && !Ext.getCmp("listPanel").isVisible()) {
         Ext.getCmp("listPanel").show();
      }

      mainPanel.listPanel.setTitle("Loading");

      while (mainPanel.listPanel.items && mainPanel.listPanel.items.length > 0) {
        mainPanel.listPanel.remove(0);
      }

      viewport.getComponent('center').add(mainPanel.listPanel);

      mainPanel.listPanel.loadListItems(mainPanel.actualCategory);
   },
   'study' : function(){
/*
      if (Ext.getCmp("listPanel") && Ext.getCmp("listPanel").isVisible()) {
         Ext.getCmp("listPanel").hide();
      }
      if (Ext.getCmp("addItemForm") && Ext.getCmp("addItemForm").isVisible()) {
         Ext.getCmp("addItemForm").hide();
      }
*/
      if (Ext.getCmp("studyPanel") && !Ext.getCmp("studyPanel").isVisible()) {
         Ext.getCmp("studyPanel").show();
      }

      viewport.getComponent('center').add(mainPanel.studyPanel);

      mainPanel.loadStudyItems (mainPanel.actualCategory);
   }
};

function getNameCategory(cat) {
   return Ext.select("div#"+cat+" > div > span").first().dom.innerHTML;
}

function checkUser ()
{
   Ext.Ajax.request({
      url: 'Session.php?cmd=checkUser',
      success: function(responseObject) {

         var server_data = Ext.decode(responseObject.responseText);
         var result;

         if (server_data.success) {
            loadLayout (server_data.data.user, server_data.data.foreign);
         }
         else {
            result = server_data.data.msg;

            loadLogin ();
         }

      },
      failure: function(responseObject) {
         // console.debug ("error conectando al servidor");
         msg ("error");
      }
   });
}

function loadLogin ()
{
   var items;

   var loginForm = new Ext.FormPanel({
      labelWidth: 75, // label settings here cascade unless overridden
      frame:true,
      id: "loginForm",
      region: "center",
      title: 'Login',
      autoWidth: true,
      autoHeight : true,
      defaultType: 'textfield',
      draggable: false,
      /*{
         //      Config option of Ext.Panel.DD class.
         //      It's a floating Panel, so do not show a placeholder proxy in the original position.
         insertProxy: false,

         //      Called for each mousemove event while dragging the DD object.
         onDrag : function(e){
            //          Record the x,y position of the drag proxy so that we can
            //          position the Panel at end of drag.
            var pel = this.proxy.getEl();
            this.x = pel.getLeft(true);
            this.y = pel.getTop(true);

            //          Keep the Shadow aligned if there is one.
            var s = this.panel.getEl().shadow;
            if (s) {
               s.realign(this.x, this.y, pel.getWidth(), pel.getHeight());
            }
         },

         //      Called on the mouseup event.
         endDrag : function(e){
            this.panel.setPosition(this.x, this.y);
         }
      },*/
      items: [{
         fieldLabel: 'Username',
         name: 'user',
         allowBlank:false
      },{
         fieldLabel: 'Password',
         name: 'pass',
         allowBlank:false
      }
      ],
      buttons: [{
         text: 'Login',
         handler: function(){
            loginForm.getForm().submit({
               url: 'Session.php?cmd=login',
               waitMsg: 'Loading...',
               success: loginForm.onSuccess,
               failure: loginForm.showError
            });
         }
      }],
      onSuccess: function(form, action){
         var rs = Ext.util.JSON.decode(action.response.responseText).data;
         msg('Login ok', 'Welcome '+rs.user);

         Ext.getCmp("loginForm").destroy();

         loadLayout(rs.user, rs.foreign)
      },
      showError: function (form, action) {
         // var rs = form.errorReader.read(action.response);
         var rs = Ext.util.JSON.decode(action.response.responseText).data;

         Ext.MessageBox.show({
            title: 'Error al salvar los datos '+rs.id+', '+rs.msg,
            msg: 'Error al salvar los datos.',
            buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.ERROR
         });
      }
   });

   items = [loginForm];

   loadViewport(items);
}

function loadLayout (user, foreign)
{
   var items;

   mainPanel = new MainPanel(viewport, user);

   mainPanel.loadUserCategories(fillCategories);

   items = [
   new Ext.Panel({
      id: 'userbar',
      region: 'north',
      tbar: mainPanel.userbar
   })
   ,
   new Ext.Panel({
      id: 'categories',
      region: 'west',
      width: 150,
      resizable: true,
      autoScroll: true,
      cls: "x-panel-mc",
      style: "padding: 0",
      items : mainPanel.categories
   }),
   new Ext.Panel({
      id: 'center',
      region: 'center',
      autoScroll: true,
      fitToFrame: true
   })
   ];

   loadViewport(items);
}

function fillCategories(arrCategories)
{
   viewport.getComponent("categories").remove("loading");

   for (var cat in arrCategories) {
      // alert (cat+", "+arrCategories[cat]);

      viewport.getComponent("categories").add(new Ext.Panel({
         title: arrCategories[cat],
         id: cat,
         layout: 'table',
         collapsible:true,
         titleCollapse: true,
         layoutConfig: {
            columns: 1,
         },
         items: [
         {
            xtype:'label',
            cls: "linkCategory x-panel-mc",
            cellCls: "categoryCell",
            html: '<a href=# class="add" id="'+cat+'">Add '+arrCategories[cat]+'</a>'
         },
         {
            xtype:'label',
            cls: "linkCategory x-panel-mc",
            cellCls: "categoryCell",
            html: '<a href=# class="view" id="'+cat+'">View '+arrCategories[cat]+'</a>'
         },
         {
            xtype:'label',
            cls: "linkCategory x-panel-mc",
            cellCls: "categoryCell",
            html: '<a href=# class="study" id="'+cat+'">Study '+arrCategories[cat]+'</a>'
         }]
      }));
   }

   viewport.doLayout();

   Ext.select("label[class*=linkCategory]").on('click', doAction, null, {
      delegate:'a'
   });
}


/**
 * do action from categories
 */
function doAction(e, t)
{
   e.stopEvent();
   mainPanel.hidePanels();
   mainPanel.totalItems = 0;
   mainPanel.actualCategory = t.id;

   actions[t.className]();
}

function loadViewport (items)
{
   viewport = new Ext.Viewport({
      id : "vp",
      name : "vp",
      layout : 'border',
      items: items
   });

}

Ext.onReady(function() {

   Ext.QuickTips.init();

   checkUser ();
});