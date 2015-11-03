/**
 * Created by Alonso on 19/10/2015.
 */

Meteor.methods( {
    'chargePayment': function(datos) {

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

        }, function (err, res) {
            if (err) {
                future.return(err);
            }else {
                future.return(res);
            }
        });

        return future.wait();
    },
    'createRecurrentSubscription': function (datos) {

        var user = Meteor.users.findOne({username: datos.email});
        if (user) {
            return {
                object: "error",
                message_to_purchaser: "Usuario ya registrado (correo electrónico)"
            };
        }

        var donativo = {
            _idProject: datos.projectId,
            name: datos.name,
            email: datos.email,
            amount: datos.amount,
            paymentType: datos.paymentType,
            recurrent: true,
            date: new Date()
        };

        var proj = Projects.findOne( { _id: datos.projectId } );

        var conekta = Meteor.npmRequire('conekta');

        //public key
        //conekta.api_key = 'key_G5zLVdKQs5PfmpzFqLhMc6w';

        //private key
        conekta.api_key = "key_qb5ERkHLWdKh24z6w14XKA";
        conekta.locale = 'es';

        var Future = Npm.require( 'fibers/future' );
        var future = new Future();

        conekta.Customer.create({
            "name": datos.name,
            "email": datos.email,
           // "phone": "55-5555-5555",
            "cards": [datos.token.id]
        }, Meteor.bindEnvironment(function(err, customer) {
            if (err) {
                future.return(err);
            }else {

                var user = {
                    username: datos.email,
                    password: "abc",
                    profile: {
                        name: datos.name,
                        conekta: {
                            userId: customer.toObject().id,
                            cards: [
                                datos.token.id
                            ]
                        }
                    }
                };

                donativo._idUser = Accounts.createUser( user );

                Roles.addUsersToRoles( donativo._idUser, "donor" );

                var donationId = Donations.insert( donativo );

                conekta.Plan.create({
                    "id": donationId,
                    "name": proj.name,
                    "amount": datos.amount * 100,
                    "currency": "MXN",
                    "interval": "month"
                }, function(err, plan) {
                    if (err) {
                        future.return(err);
                    }else {


                        customer.createSubscription({
                            "plan_id":plan.toObject().id
                        }, function(err, subscription) {
                            if (err) {
                                future.return(err);
                            }else {
                                if (subscription.toObject().status == "active") {
                                    future.return("Subscripción creada con éxito!");
                                }else if (subscription.toObject().status == "past_due") {
                                    future.return({object:"error",message_to_purchaser:"No se pudo procesar la subscripción"});
                                }
                            }
                        });


                    }
                });



            }
        })
        );

        return future.wait();
    }
});