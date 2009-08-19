<?php 
// get word with acents
function getRequest($name) {
    return utf8_decode($_REQUEST[$name]);
}

/**
 * Array slice function that preserves associative keys
 *
 * @function array_slice_keepassociative
 *
 * @param  Array  $array  Array to slice
 * @param  Integer  $start
 * @param  Integer  $end
 *
 * @return  Array
 */
function array_slice_keepassociative($array, $start, $end) {
    // Method param restrictions
    if ($start < 0)
        $start = 0;
    if ($end > count($array))
        $end = count($array);
        
    // Process vars
    $new = Array();
    $i = 0;
    
    // Loop
    foreach ($array as $key=>$value) {
        if ($i >= $start && $i < $end) {
            $new[$key] = $value;
        }
        $i++;
    }
    return ($new);
}

/* Function that does the same as shuffle(), but preserves key=>values.  */
function array_shuffle_keepassociative(&$array) {
    if (count($array) > 1) { //$keys needs to be an array, no need to shuffle 1 item anyway
        $keys = array_rand($array, count($array));
        
        foreach ($keys as $key)
            $new[$key] = $array[$key];
            
        $array = $new;
    }
    return true; //because it's a wannabe shuffle(), which returns true
}

function array_merge_keepassociative(){
    $args = func_get_args();
    $result = array();
    foreach($args as &$array){
        foreach($array as $key=>&$value){
            $result[$key] = $value;
        }
    }
    return $result;
}

?>
