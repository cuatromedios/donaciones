/**
 * Created by Alonso on 19/10/2015.
 */

Meteor.methods( {
    'generatePayment': function(datos) {

        console.log(datos);

        var conekta = Meteor.npmRequire('conekta');

        //public key
        //conekta.api_key = 'key_G5zLVdKQs5PfmpzFqLhMc6w';

        //private key
        conekta.api_key = "key_qb5ERkHLWdKh24z6w14XKA";
        conekta.locale = 'es';

        //conekta.Charge.create({
        //    description: 'Stogies',
        //    amount: 50000,
        //    currency: 'MXN',
        //    reference_id: '9839-wolf_pack',
        //    card: 'tok_test_visa_4242',
        //    details: {
        //        name: "Logan",
        //        email: 'logan@x-men.org',
        //        line_items: [{
        //            name: "Donativo",
        //            description: "Esto es un donativo",
        //            unit_price: 50000,
        //            quantity: 1
        //        }]
        //    }
        //
        //}, function(err, res) {
        //    if (err) {
        //        console.log(err.message_to_purchaser);
        //        return;
        //    }
        //    console.log(res.toObject());
        //});
    }
});