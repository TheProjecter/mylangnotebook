<?php

include_once ("Database.php");

$cmd = isset($_REQUEST["cmd"]) ? $_REQUEST["cmd"] : false;

// no command?
if(!$cmd) {
   echo '{"success":false,"data" => array ( "msg" => "No command")';
   exit;
}

switch($cmd) {
   case "login":

      @ $user = getRequest("user");
      @ $pass = getRequest("pass");

      list ($id, $foreign) = login($user, $pass);

      if ($id)
      {
         $_SESSION[SESSION_USERNAME] = $user;
         $_SESSION[SESSION_USER_ID] = $id;
         $_SESSION[SESSION_FOREIGN_LANG] = $foreign;

         $response = array (
         "success" => true,
         "data" => array (
            "user" => $user,
            "id" => $id,
            "foreign" => $foreign
            )
         );
      }
      else {
         $response = array ("success" => false, "data" => array ( "id" => "69", "msg" => "Invalid user"));
      }
      break;

   case "checkUser":

      @$id = $_SESSION[SESSION_USER_ID];
      @$user = $_SESSION[SESSION_USERNAME];
      @$foreign = $_SESSION[SESSION_FOREIGN_LANG];

      if (!$id)
      {
         $response = array (
         "success" => false,
         "data" => array (
            "msg" => "You must login"
            )
         );
      }
      else
      {
         $response = array (
         "success" => true,
         "data" => array (
               "id" => $id,
               "user" => $user,
               "foreign" => $foreign,
            )
         );
      }

      break;

   case "logout":

      $_SESSION[SESSION_USER_ID] = $_SESSION[SESSION_USERNAME] = $_SESSION[SESSION_FOREIGN_LANG] = null;

      $response = array (
         "success" => true
      );

      break;
}

header("Content-Type: application/json");
echo json_encode($response);

////////////////
// FUNCTIONS
////////////////

function login($user, $pass)
{
   $db = new Database();
   $id = null;
   $foreign = null;

   $db->open();

   $sql = sprintf("SELECT us.id FROM `%s` as us WHERE us.user = '%s' AND us.password = '%s'", USERS, $user, $pass);

   $query = mysql_query($sql) or die(mysql_error()."<br>SQL: $sql");

   if ($row=mysql_fetch_row($query))
   {
      $id=$row[0];

      $sql = sprintf("SELECT us_lan.foreign_language FROM `%s` as us_lan WHERE us_lan.user = '%s'", USERS_CATEGORIES_LANGUAGES, $id);

      $query = mysql_query($sql) or die(mysql_error()."<br>SQL: $sql");

      $row=mysql_fetch_row($query);

      $foreign=$row[0];
   }

   $db->close();

   return array($id, $foreign);
}

?>
