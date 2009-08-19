<?php

include_once ("Database.php");

$cmd = isset($_REQUEST["cmd"]) ? $_REQUEST["cmd"] : false;

// no command?
if(!$cmd) {
   echo '{"success":false,"data" => array ( "msg" => "No command")';
   exit;
}

switch($cmd) {
   case "add":

      @ $nameItem =          getRequest(INPUT_MOTHER);
      @ $translationItem =   getRequest(INPUT_FOREIGN);
      @ $categoryItem =      getRequest(INPUT_CATEGORY);

      if (addItem($nameItem, $translationItem, $categoryItem))
      {
         $response = array (
         "success" => true
         );
      }
      else
      {
         $response = array (
         "success" => false,
         "data" => array (
               "msg" => "Anything was wong!"
            )
         );
      }

      break;

   case "del":

      $listItem = array();

      foreach ($_REQUEST as $id => $value) {
         if ($value == "on" && is_numeric($id)) {
            $listItem[] = $id;
         }
      }

      if (delelteItemsList($listItem))
      {
         $response = array (
         "success" => true
         );
      }
      else
      {
         $response = array (
         "success" => false,
         "data" => array (
               "msg" => "Anything was wong in del case!"
            )
         );
      }

      break;

   case "update" :

      @ $id = getRequest(PARAM_ID);
      @ $result = getRequest(PARAM_RESULT);

      $color = updateItem($id, $result);

      if (is_numeric($color))
      {
         $response = array (
         "success" => true,
         "color" => $color
         );
      }
      else
      {
         $response = array (
         "success" => false,
         "data" => array (
               "msg" => "Anything was wong!"
            )
         );
      }

      break;
   
   case "getList" :
	
      @ $category = getRequest(INPUT_CATEGORY);

      list ($arrList, $direction) = getList($category);

      if ($arrList)
      {
      	 // group items in differents array in groups of 5 or according
		 //  to their fails, shuffle elements after to provide a random order
		 
		 // 1. stores the position of the last items with the same
		 // fails or group
		 $failLastPosition = array ();
		 
		 $pos = 0; // the cursor of the array
		 $cont = 0; // the cursor of groups of randomized words
		 $fail = current($arrList);
		 $fail = $fail[2][0];
		 
		 while ($pos < sizeof($arrList) && $fail > 0) 
		 {
		 	 $nextItem = next($arrList);
		 	 if (($cont + 1) % 5 == 0 || $nextItem[2] != $fail) {
		 		$fail = $nextItem[2];
		 	 	$failLastPosition[] = $pos+1;
				$cont = 0;
		 	 }
			 else {
			 	
				 $cont++;
			 }
			 
			 $pos++;
		 }
		 
		 // shuffle the array portions and merge them
		 $pos = 0;
		 foreach ($failLastPosition as $failPos) {
		 	
			$arrBefore = array_slice_keepassociative($arrList, 0, $pos);			
			$arrToShuffle = array_slice_keepassociative($arrList, $pos, $failPos);			
			$arrAfter = array_slice_keepassociative($arrList, $failPos - $pos, sizeof($arrList));
			
			array_shuffle_keepassociative($arrToShuffle);
			
			$arrList = array_merge_keepassociative($arrBefore, $arrToShuffle, $arrAfter);
			
			$pos = $failPos;
		 }
		 
         $response = array (
         "success" => true,
            "data" => array (
               "items" => $arrList,
               "direction" => $direction
            )
         );
      }
      else
      {
         $response = array (
         "success" => false,
         "data" => array (
               "msg" => "Anything was wong!"
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

function getList($categoryItem)
{
   @ $user = $_SESSION[SESSION_USER_ID];
   @ $foreignLng = $_SESSION[SESSION_FOREIGN_LANG];

   if ($categoryItem)
   {
      $db = new Database();

      $db->open();

      // TODO validation
      $arrList = array ();
      $direction = 0;

      $sql = (sprintf("SELECT study_direction FROM `%s` WHERE category = %d AND user = %d", USERS_CATEGORIES_LANGUAGES, $categoryItem, $user));

      $queryItems = mysql_query($sql) or die(mysql_error());

      $direction = mysql_fetch_row($queryItems);
      $direction = $direction[0];

      $sql = (sprintf("SELECT id, item, translation, fails FROM `%s` WHERE category = %d ORDER BY fails DESC, last_change ASC", LANGUAGE_ITEMS, $categoryItem));

      $queryItems = mysql_query($sql) or die(mysql_error());

      while($row=mysql_fetch_row($queryItems))
      {
         $arrList[$row[0]]= array ($row[1], $row[2], $row[3]);
      }

      $db->close();

   }
   else {
      $arrList = false;
   }

   return array ($arrList, $direction);
}

function updateItem($id, $bad)
{
   @ $user = $_SESSION[SESSION_USER_ID];
   @ $foreignLng = $_SESSION[SESSION_FOREIGN_LANG];

   if ($id)
   {
      $db = new Database();

      $db->open();

      // consulta en bbdd el estado actual del item
      $sql = (sprintf("SELECT fails, last_change FROM `%s` WHERE id = %d", LANGUAGE_ITEMS, $id));

      $queryItems = mysql_query($sql) or die(mysql_error());

      $row=mysql_fetch_row($queryItems);
      $numColor = $row[0];
      $lastChange = $row[1];
      $dateLastChange = explode("-",$lastChange);
      @ $dateLastChange = mktime(0,0,0,$dateLastChange[1],$dateLastChange[2],$dateLastChange[0]) ;
      $today = date('Y-m-d');
      $dateToday = explode("-",$today);
      $dateToday = mktime(0,0,0,$dateToday[1],$dateToday[2],$dateToday[0]) ;

      if(is_numeric($numColor)) {

         if ($bad) {
            $numColor=MAX_ITEM_STATUS;
         }
         else if ($numColor == MAX_ITEM_STATUS || $dateLastChange < $dateToday){
            $numColor=($numColor<=0)?0:$numColor-1;
         }

         $lastChange= date('Y-m-d');
         
         $sql = sprintf("UPDATE `%s` SET fails = %d, last_change = '%s' WHERE id = %d", LANGUAGE_ITEMS, $numColor, $lastChange, $id);

         $queryUpdate = mysql_query($sql) or die(mysql_error());

         $ok = true;
      }
      else {
         $ok = false;
      }

   }
   else {
      $ok = false;
   }

   if ($ok) {
      return $numColor;
   }
   else {
      return null;
   }
}

function delelteItemsList($list)
{
   if ($list)
   {
      $db = new Database();

      $db->open();

      $sql = (sprintf("DELETE FROM `%s` WHERE ", LANGUAGE_ITEMS));

      $i = 0;
      foreach ($list as $item) {
         $sql .= sprintf("`id` = %d ", $item);

         if ($i < sizeof($list) - 1) {
            $sql .= "OR ";
         }

         $i++;
      }

      $queryDelete = mysql_query($sql) or die(mysql_error());

      $ok = $queryDelete && mysql_affected_rows() == sizeof($list);
   }
   else {
      $ok = false;
   }

   return $ok;
}

function addItem($nameItem, $translationItem, $categoryItem)
{
   @ $user = $_SESSION[SESSION_USER_ID];
   @ $foreignLng = $_SESSION[SESSION_FOREIGN_LANG];

   $nameItem = htmlentities($nameItem);
   $translationItem = htmlentities($translationItem);

   if ($nameItem && $translationItem && $categoryItem)
   {
      $db = new Database();

      $db->open();

      // TODO validation

      $sql = (sprintf("INSERT INTO `%s` (`item`, `translation`, `category`) VALUES ('%s', '%s', %d)", LANGUAGE_ITEMS, $nameItem, $translationItem, $categoryItem));

      $queryInsert = mysql_query($sql) or die(mysql_error());

      $ok = $queryInsert && mysql_affected_rows() == 1;

      $db->close();
   }
   else {
      $ok = false;
   }

   return $ok;
}

?>
