<?php

include_once ("Database.php");

$cmd = isset($_REQUEST["cmd"]) ? $_REQUEST["cmd"] : false;

// no command?
if(!$cmd) {
   echo '{"success":false,"data" => array ( "msg" => "No command")';
   exit;
}

switch($cmd) {
   case "getCategories":

      $arrCategory = getCategories();
      
      if (!$arrCategory)
      {
         $response = array (
         "success" => false,
         "data" => array (
            "msg" => "error"
            )
         );
      }
      else
      {
         $response = array (
         "success" => true,
         "data" => array (
               "categories" => $arrCategory
            )
         );
      }

      break;
}

header("Content-Type: application/json");
echo json_encode($response);

////////////////
// FUNCTIONS
////////////////

function getCategories()
{
   @ $user = $_SESSION[SESSION_USER_ID];
   @ $foreignLng = $_SESSION[SESSION_FOREIGN_LANG];

   $db = new Database();

   $db->open();

   // TODO validation

   $arrCategory = array ();

   $sql = sprintf("SELECT cat.id, cat.name FROM `%s` cat INNER JOIN `%s` us_cat ON cat.id = us_cat.category WHERE us_cat.user = %d AND us_cat.foreign_language = %d ORDER BY category_order", CATEGORIES, USERS_CATEGORIES_LANGUAGES, $user, $foreignLng);

   $queryCategories = mysql_query($sql) or die(mysql_error());

   while($row=mysql_fetch_row($queryCategories))
   {
      $arrCategory[$row[0]]=$row[1];
   }

   $db->close();

   return $arrCategory;
}

?>
