/* This file is created or modified with
 * Ext.ux.guid.plugin.GuiDesigner (v2.1.0)
 */
{
  layout : "border",
  items : [    {
      region : "center",
      items : [        {
          region : "west",
          title : "west",
          width : "300px",
          items : [            {
              xtype : "grid",
              border : false,
              viewConfig : {
    forceFit : true
},
              ds : new Ext.data.Store({reader: new Ext.data.ArrayReader({}, [{name: 'comment'}]),data: [['Please set CM and DS properties']]}),
              cm : new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{header: 'Comment', width: 120, sortable: true, dataIndex: 'comment'}])
          }]
      }]
  },    {
      region : "north",
      title : "north"
  }]
}