const Paypal = require('paypal-recurring');
const paypal = new Paypal({
                                username:  process.env.PAYPAL_USER || 'backstageisrael-facilitator_api1.gmail.com',
                                password:  process.env.PAYPAL_PASS || 'A6FBM3CUZT4P4785',
                                signature: process.env.PAYPAL_SIGNATURE || 'ADut7-IKOalKBWeDK1g1S7BZ6aa9Adyy-3pC7mI4pQHnMM966kANu7gS'
                            }, "");

module.exports = {
	PayWithPaypal : function (amount, description, res){
        paypal.authenticate({
            RETURNURL:                      process.env.RETURNURL || "http://localhost:3001/purchase/success",
            CANCELURL:                      process.env.CANCELURL || "http://localhost:3001/purchase/fail",
            PAYMENTREQUEST_0_AMT:          amount,
            L_BILLINGAGREEMENTDESCRIPTION0: description
        }, function(err, data, url) {
            // Redirect the user if everything went well with
            // a HTTP 302 according to PayPal's guidelines
            if(err) { console.log("PayWithPaypal error:" + err);console.log(data);console.log(url); }
            if (!err) { return res(null, url); }
        });
    },
    CreateSubscription : function (amount, description, token, payerid, res){
        paypal.createSubscription(token, payerid, {
            AMT:              amount,
            DESC:             description,
            BILLINGPERIOD:    "Month",
            BILLINGFREQUENCY: 12,
        }, function(err, data) {
            console.log('Inside create subscription response data : ');
            console.log(data);
            console.log('Inside create subscription response err: ' + err);
            if (!err) {
                return res(false, data);
            }
        });
    },
    CancelSubscription : function (subscriptionid, res) {
        paypal.modifySubscription(subscriptionid, 'Cancel' , function(err, data) {
            if (!err) { return res(null, "Your subscription was cancelled") }
            return res(err, null);
        });
    }
}