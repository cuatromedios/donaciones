/**
 * Created by Alonso on 19/10/2015.
 */

Meteor.methods( {
    'generatePayment': function(datos, conektaCallback) {

        //console.log(datos);

        var donativo = {
            _idProject: datos.projectId,
            name: datos.name,
            email: datos.email,
            amount: datos.amount,
            paymentType: datos.paymentType,
            date: new Date()
        };

        var donationId = Donations.insert( donativo );

        var proj = Projects.findOne( { _id: datos.projectId } );

        var conekta = Meteor.npmRequire('conekta');

        //public key
        //conekta.api_key = 'key_G5zLVdKQs5PfmpzFqLhMc6w';

        //private key
        conekta.api_key = "key_qb5ERkHLWdKh24z6w14XKA";
        conekta.locale = 'es';

        var Future = Npm.require( 'fibers/future' );
        var future = new Future();

        conekta.Charge.create({
            description: 'Donativo a "'+proj.name+'"',
            amount: datos.amount * 100,
            currency: 'MXN',
            reference_id: donationId,
            card: datos.token.id,
            details: {
                name: datos.name,
                email: datos.email,
                line_items: [{
                    name: 'Donativo a "'+proj.name+'"',
                    description: 'Donativo a "'+proj.name+'"',
                    unit_price: datos.amount,
                    quantity: 1
                }]
            }

        }, function (res) {
            future.return(res);
        });

        return future.wait();
    }
});