var paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'iutcore_api1.gmail.com',
  'client_secret': 'YV7FST63KRZWBSZM'
});

pp = {};

pp.pay(product){
    new Promise((resolve,reject) =>{
        if(product%5 != 0 || product == 0)
            reject("Bad amount");
            
        paypal.payment.create(createPayment(product), function (error, payment) {
            if (error) {
                reject(error);
            } else {
                resolve(payment);
            }
        });
    });
}

function createPayment(prod){
    return {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://return.url",
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "recharge",
                    "sku": "recharge",
                    "price": prod,
                    "currency": "EUR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "EUR",
                "total": prod
            },
            "description": "Recharge du compte amicaliste"
        }]
    };
}


module.exports = paypal;
