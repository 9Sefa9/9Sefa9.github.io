"use strict";

//scrolls to a certain selector
function scrollToContent(selector){
    document.querySelector(selector).scrollIntoView({behavior: 'smooth'});
}