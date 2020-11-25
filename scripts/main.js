"use strict";

function scrollToContent(selector){
    document.querySelector(selector).scrollIntoView({behavior: 'smooth'});
}