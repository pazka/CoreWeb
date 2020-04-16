# CoreWeb app (old not used anymore)

Application de gestion des amicalistes, finances et des stocks de l'amicale Core.

###LAUNCHING
Win  : npm start

###PACKAGES

npm to install everything

node.js         (server)
sequelize       (db)
body-parser     (parameters passage)
express         (router)
crypto-js       (password encryption)
client-sessions (cookies)
node-persist    (spam test)
paypal-rest-sdk (paypal) //https://github.com/paypal/PayPal-node-SDK

###SYSTEM VAR (they will be used in the program):
$passwordKey // encription key of node persist
$cookieKey   // encription key of cookies
$bddpsw      // db password
$bddbdd      // db name
$bdduser     // db user
