/**
 * Created with JetBrains WebStorm.
 * User: stas
 * Date: 30.09.14
 * Time: 18:14
 * To change this template use File | Settings | File Templates.
 */
(function($) {
    $(function(){
        //Dropdown cart in header
        $('.cart-holder > h3').click(function(){
            if($(this).hasClass('cart-opened')) {
                $(this).removeClass('cart-opened').next().slideUp(300);
            } else {
                $(this).addClass('cart-opened').next().slideDown(300);
            }
        });
        //Popup rating content
        $('.star-rating').each(function(){
            rate_cont = $(this).attr('title');
            $(this).append('<b class="rate_content">' + rate_cont + '</b>');
        });
    });
})(jQuery);