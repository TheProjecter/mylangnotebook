<?php

session_start();

include_once ("settings.php");
include_once ("functions.php");

class Database
{
   private $db = null;

   function open ()
   {
      if (!isset($this->db)) {
         $db = mysql_pconnect(DB_HOST, DB_USER, DB_PASS);

         mysql_select_db(DB_DATABASE);
      }
   }

   function close ()
   {
      mysql_close();
   }
}
?>
