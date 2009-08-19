<?php

define ("DB_HOST", "localhost");
// define ("DB_HOST", "mysql1.000webhost.com");
define ("DB_USER", "root");
// define ("DB_USER", "a5355433_fegabe");
define ("DB_PASS", "");
// define ("DB_PASS", "fegabe_a5355433");
define ("DB_DATABASE", "lang_notebook");

// session names
define ("SESSION_USERNAME", "user");
define ("SESSION_USER_ID", "uid");
define ("SESSION_FOREIGN_LANG", "foreign");

// db_names
define ("BD_PREFIX",        "nl_");
define ("USERS",            BD_PREFIX."users");
define ("CATEGORIES",       BD_PREFIX."categories");
define ("USERS_CATEGORIES_LANGUAGES", BD_PREFIX."users_categories_languages");
define ("LANGUAGES",        BD_PREFIX."languages");
define ("LANGUAGE_ITEMS",   BD_PREFIX."language_items");

// form items
define ("INPUT_MOTHER",    "mother");
define ("INPUT_FOREIGN",   "foreign");
define ("INPUT_CATEGORY",  "cat");

define ("PARAM_ID",        "id");
define ("PARAM_RESULT",    "result");

define ("MAX_ITEM_STATUS", 3);
?>
