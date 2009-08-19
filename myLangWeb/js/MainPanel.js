MainPanel = function(viewport, user){

   this.actualItem = 0;
   this.totalItems = 0;
   this.actualCategory = null;

   this.categories = new Ext.Panel({
      id: 'loading',
      title: "Loading..."
   });

   this.userbar = loadUserBar (user);

   this.hidePanels = function () {

      if (Ext.getCmp("listPanel") /* && Ext.getCmp("listPanel").isVisible() */ ) {
         Ext.getCmp("listPanel").hide();
      }
      if (Ext.getCmp("addItemForm")/* && Ext.getCmp("addItemForm").isVisible() */) {
         Ext.getCmp("addItemForm").hide();
      }
      if (Ext.getCmp("studyPanel")/* && !Ext.getCmp("studyPanel").isVisible() */) {
         Ext.getCmp("studyPanel").hide();
      }
   }

   this.loadUserCategories = function (fnCallback){

      Ext.Ajax.request({
         url: 'Category.php?cmd=getCategories',
         success: function(responseObject) {

            var server_data = Ext.decode(responseObject.responseText);
            var result;

            if (server_data.success) {
               fnCallback (server_data.data.categories);
            }
            else {
               result = server_data.data.msg;

               msg (result);
            }
         },
         failure: function(responseObject) {
            // console.debug ("error conectando al servidor");
            msg ("error");
         }
      });
   };

   this.listPanel = new Ext.FormPanel({
      title: 'List',
      name: 'listPanel',
      id: 'listPanel',
      frame:true,
      layout: 'anchor',
      defaultType: 'label',
      collapsible:true,
      loadListItems: function (cat) {

         Ext.Ajax.request({
            url: 'Item.php?cmd=getList&cat='+cat,
            success: function(responseObject) {

               var server_data = Ext.decode(responseObject.responseText);
               var result;

               if (server_data.success) {
                  fillListItems (server_data.data.items,  Ext.getCmp("listPanel"), cat);
               }
               else {
                  result = server_data.data.msg;

                  msg (result);
               }
            },
            failure: function(responseObject) {
               // console.debug ("error conectando al servidor");
               msg ("error in loadListItems");
            }
         });
      }
   });

   this.studyPanel = new Ext.Panel({
      title: 'List',
      id: 'studyPanel',
      name: 'studyPanel',
      frame:true,
      layout: 'fit',
      defaultType: 'label',
      collapsible:true,
      loadListItems: function (cat) {

         Ext.Ajax.request({
            url: 'Item.php?cmd=getList&cat='+cat,
            success: function(responseObject) {

               var server_data = Ext.decode(responseObject.responseText);
               var result;

               if (server_data.success) {
                  var direction = server_data.data.direction == "1";
                  fillStudyItems (server_data.data.items,  direction, Ext.getCmp("studyPanel"), cat);
               }
               else {
                  result = server_data.data.msg;

                  msg (result);
               }
            },
            failure: function(responseObject) {
               // console.debug ("error conectando al servidor");
               msg ("error in loadListItems");
            }
         });
      }
   });

   this.disableNav = false;
   this.nav = new Ext.KeyNav(document, {
      "right" : function(e){
         if (Ext.getCmp("studyPanel").isVisible()) {
             /*
               selected word ok
               llamada ajax to Item.php?cmd=update&update=ok
             */

            updateStudyItem (false);
         }
      },
      "left" : function(e){
         if (Ext.getCmp("studyPanel").isVisible()) {
            /*
             selected word bad
             llamada ajax to Item.php?cmd=update&update=bad
            */

            updateStudyItem (true);
         }
      },
      "del" : function (e) {
         if (Ext.getCmp("studyPanel").isVisible()) {
            /*
           retroceder selected word
            */

           selectPreviousStudyItem();
         }
      },
      "home" : function (e) {
         if (Ext.getCmp("studyPanel").isVisible()) {

            mainPanel.loadStudyItems();
         }
      },
      "enter" : function(e){
         if (Ext.getCmp("studyPanel").isVisible()) {
            // mostrar resultado
            var hiddenText = getHiddenTextSelectedStudyItem();
            var textToChange = getTextToChangeSelectedStudyItem();

            if (textToChange === "???") {
               Ext.query("[class*=selected] span")[2].innerHTML = hiddenText;
            } else {
               selectNextStudyItem();
            }

            Ext.getCmp("vp").doLayout();
         }
      },
      scope : this
   });

   this.loadStudyItems = function () {

      mainPanel.studyPanel.setTitle("Loading");
      mainPanel.actualItem = 0;
      mainPanel.totalItems = 0;

      while (mainPanel.studyPanel.items && mainPanel.studyPanel.items.length > 0) {
         mainPanel.studyPanel.remove(0);
      }

      mainPanel.studyPanel.loadListItems(mainPanel.actualCategory);
   };

   this.addItemForm = new Ext.FormPanel({
      id: "addItemForm",
      name: 'addItemForm',
      labelWidth: 75, // label settings here cascade unless overridden
      frame:true,
      title: 'Add new',
      autoWidth: true,
      autoHeight : true,
      collapsible:true,
      defaultType: 'textfield',
      items: [{
         fieldLabel: 'Spanish',
         id: 'mother',
         name: 'mother',
         allowBlank:false
      },{
         fieldLabel: 'English',
         id: 'foreign',
         name: 'foreign',
         allowBlank:false
      },{
         xtype: 'hidden',
         id: 'cat',
         name: 'cat',
         value: 5
      }
      ],
      buttons: [{
         text: 'Insert',
         handler: function(){
            this.ownerCt.getForm().submit({
               url: 'Item.php?cmd=add',
               waitMsg: 'Adding...',
               success: this.ownerCt.onSuccess,
               failure: this.ownerCt.showError
            });
         }
      }],
      onSuccess: function () {
         msg ("ok",  "added item "+Ext.getCmp("mother").getValue());
         Ext.getCmp("mother").reset();
         Ext.getCmp("foreign").reset();
      },
      onFailure: function () {
         msg ("error")
      }
   });
}

function getHiddenTextSelectedStudyItem () {
   return Ext.query("[class*=selectedHidden] span")[0].textContent;
}

function getTextToChangeSelectedStudyItem () {
   return Ext.query("[class*=selected] span")[2].innerHTML;
}

function getColorByNumber (number) {

   var color;

   if (number == 3) {
      color = "black";
   }
   else if (number == 2) {
      color = "red";
   }
   else if (number == 1) {
      color = "yellow";
   }
   else if (number == 0) {
      color = "green";
   }
   else {
      color = "ok";
   }

   return color;
}

function updateStudyItem (result) {

   if (!mainPanel.disableNav) {

      mainPanel.disableNav = true;
      var id = Ext.query("[class*=selectedHidden] span")[1].textContent;

      Ext.Ajax.request({
         url: 'Item.php?cmd=update&id='+id+'&result='+((result)?1:0),
         success: function(responseObject) {

            var server_data = Ext.decode(responseObject.responseText);
            var result;

            if (server_data.success) {

               Ext.query("[class*=selected] span")[0].className = "fails " + getColorByNumber(server_data.color);

               var textToChange = getTextToChangeSelectedStudyItem();
               if (textToChange === "???") {
                  Ext.query("[class*=selected] span")[2].innerHTML = getHiddenTextSelectedStudyItem();
               }

               selectNextStudyItem ();

            }
            else {
               result = server_data.data.msg;

               msg (result);
            }

            mainPanel.disableNav = false;
         },
         failure: function(responseObject) {
            // console.debug ("error conectando al servidor");
            msg ("error");

            mainPanel.disableNav = false;
         }
      });
   }
}

function deselectStudyItem () {

   //quitar selección
   Ext.getCmp("studyPanel").items.items[mainPanel.actualItem].removeClass("selected");
   Ext.getCmp("studyPanel").items.items[mainPanel.actualItem+1].removeClass("selectedHidden");
}

function selectStudyItem () {

   // poner nueva selección
   Ext.getCmp("studyPanel").items.items[mainPanel.actualItem].addClass("selected");
   Ext.getCmp("studyPanel").items.items[mainPanel.actualItem+1].addClass("selectedHidden");
}

function hideAllStudyTranslations() {
   // hidden all translations
   for (var i = 1; i <= mainPanel.totalItems; i++) {

       Ext.query("[class=item]:nth("+i+") span")[2].textContent = '???';

   }
}

function selectStudyItemByPosition (pos) {

   if (pos >= 0 && pos < mainPanel.totalItems*2) {

      deselectStudyItem ();

      mainPanel.actualItem = pos;

      selectStudyItem ();

      Ext.getCmp("vp").doLayout();
   }
}

function selectNextStudyItem () {

   selectStudyItemByPosition((mainPanel.actualItem+2)%(mainPanel.totalItems*2));

   if (mainPanel.actualItem == 0) {
      mainPanel.loadStudyItems();
   }

}

function selectPreviousStudyItem () {

   var prevPosition;

   if (mainPanel.actualItem == 0) {

      prevPosition = mainPanel.totalItems*2-2;
   }
   else {
      prevPosition = (mainPanel.actualItem-2)%(mainPanel.totalItems*2);
   }

   selectStudyItemByPosition(prevPosition);
}

function fillStudyItems (listItems, direction, panel, cat) {

   for (var item in listItems) {

      var color;
      var htmlCode;
      var fails = listItems[item][2];
      var motherItem = listItems[item][0];
      var foreignItem = listItems[item][1];
      var firstItem = (direction)?foreignItem:motherItem;
      var sndItem = (direction)?motherItem:foreignItem;

      color = getColorByNumber(fails);

      htmlCode = "<div class=\"item\"><span class=\"fails "+color+"\"></span><span>" + firstItem + "</span> -> <span>???</span>";

      panel.add({
         html: htmlCode
      });

      htmlCode = "<span class=\"studyItem\">" + sndItem + "</span><span>"+ item +"</span></div>";

      panel.add({
         hidden: true,
         html: htmlCode
      });

      mainPanel.totalItems++;
   }

   panel.setTitle(getNameCategory(cat)+" study");

   panel.add({
      xtype: 'button',
      text: 'hide translations',
      handler: function () {
         hideAllStudyTranslations ();
      }
   })

   Ext.getCmp("studyPanel").items.items[0].addClass("selected");
   Ext.getCmp("studyPanel").items.items[1].addClass("selectedHidden");

   Ext.getCmp("vp").doLayout();
}

function fillListItems (listItems, panel, cat) {

   for (var item in listItems) {

      var color;
      var htmlCode;
      var fails = listItems[item][2];

      color = getColorByNumber(fails);

      htmlCode = "<div class=\"item\"><span class=\"fails "+color+"\"></span><span>"+ listItems[item][0] +"</span> -> <span>"+ listItems[item][1]+"</span></div>";

      panel.add(new Ext.Panel({
         layout: "table",
         id: "item"+item,
         layoutConfig: {
            columns: 2
         },
         items:
            [{
               xtype: "checkbox",
               name: item,
               id: "cbItem"+item
            },
            {
               cls: "x-panel-mc",
               html: htmlCode,
               width: 1000
            }]}
      ));

      mainPanel.totalItems++;
   }

   panel.add(new Ext.Button({
         text: 'Delete',
         handler: function(){

            this.ownerCt.getForm().submit({
               url: 'Item.php?cmd=del',
               waitMsg: 'Deleting...',
               success: function () {
                 var listToDelete = getCheckedListItems();
                 for (var i=0; i<listToDelete.length; i++) {

                    Ext.getCmp("item"+listToDelete[i]).destroy();
                 }
                 mainPanel.totalItems = Ext.query("*[id*=cbItem]").length;
               },
               failure: function(responseObject) {
                  // console.debug ("error conectando al servidor");
                  msg ("error");
               }
            });
         }
      })
   );

   panel.setTitle(getNameCategory(cat)+" list");

   Ext.getCmp("vp").doLayout();

}

function getCheckedListItems () {
   var listToDelete = Array ();

   var cbItems = Ext.query("*[id*=cbItem]");
   for (i=0; i<mainPanel.totalItems; i++) {

      if (cbItems[i].checked) {
         listToDelete.push(cbItems[i].name);
      }
   }

   return listToDelete;
}

function loadUserBar (user) {
   var userPanel =  [
   new Ext.Toolbar.MenuButton({
      text: 'language',
      menu: {
         items: [

         {
            text: 'english'
         },
         {
            text: 'spanish'
         }
         ]
      }
   }),
   '->',
   'Welcome '+user
   ];

   return userPanel;
}

function onButtonClick(btn) {
   alert ("eo");
   alert (btn);
}
