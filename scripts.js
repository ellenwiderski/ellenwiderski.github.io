$(function() {
    $('#myNavmenu a').on('click', function(){
        if($('.navbar-toggle').css('display') !='none') {
        $(".navbar-toggle").trigger( "click" );
        }
    });
});