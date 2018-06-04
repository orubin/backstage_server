var Paypal = require('paypal-express-checkout');
var paypal = Paypal.init('username', 'password', 'signature', 'http://www.example.com/payment_completed', 'http://www.example.com/cancel', true);


paypal.pay('20130001', amount, item, currency, true, ['custom', 'data'], function(err, url){
    if(err) {
        console.log(err);
        return;
    }

    response.redirect(url);
});

