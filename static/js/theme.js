import $ from 'jquery';
if (navigator.appVersion.indexOf('Win') !== -1) {
    $(`<style type='text/css'> 
    .ReactModal__Body--open{ padding-right:17px;} 
    .ReactModal__Body--open .gapo-header{ padding-right:33px;} 
    .ReactModal__Body--open .header__nav--main{    left: calc(50% - 8px);}
    </style>`).appendTo("head");
}
