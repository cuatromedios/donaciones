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

        donativo._idUser = Meteor.call("createOrGetUser", datos);

        var donationId = Donations.insert( donativo );

        var proj = Projects.findOne( { _id: datos.projectId } );

        var conekta = Meteor.npmRequire('conekta');

        conekta.api_key = process.env.CONEKTA_PRIVATE_API_KEY;
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
                future.return("Donativo recibido con éxito, gracias!");
            }
        });

        return future.wait();
    },
    'createRecurrentSubscription': function (datos) {

        //TODO: If something goes wrong at some point everything must be rolled back.

        var user = Meteor.users.findOne({username: datos.email});
        if (user) {
            var donation = Donations.findOne( { _idProject: datos.projectId, recurrent: true, _idUser: user._id } );

            if (donation) {
                return {
                    object: "error",
                    message_to_purchaser: "Usuario ya suscrito a este proyecto."
                };
            }
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

        conekta.api_key = process.env.CONEKTA_PRIVATE_API_KEY;
        conekta.locale = 'es';

        var Future = Npm.require( 'fibers/future' );
        var future = new Future();

        //TODO: No volver a crear el customer de conekta si ya existe.

        conekta.Customer.create({
            "name": datos.name,
            "email": datos.email,
           // "phone": "55-5555-5555",
            "cards": [datos.token.id]
        }, Meteor.bindEnvironment(function(err, customer) {
            if (err) {
                future.return(err);
            }else {

                datos.conektaCustomerId = customer.toObject().id;

                donativo._idUser = Meteor.call("createOrGetUser", datos);

                var donationId = Donations.insert( donativo );

                var plan = Meteor.call("createOrGetPlan", proj._id, datos.amount);

                if (plan.object == "error") {
                    future.return(plan);
                }else {

                    customer.createSubscription({
                        "plan_id":plan._idConektaPlan
                    }, function(err, subscription) {
                        if (err) {
                            future.return(err);
                        }else {
                            if (subscription.toObject().status == "active") {
                                future.return("Aportación recurrente creada con éxito!");
                            }else if (subscription.toObject().status == "past_due") {
                                future.return({object:"error",message_to_purchaser:"No se pudo procesar la subscripción"});
                            }
                        }
                    });

                }
            }
        })
        );

        return future.wait();
    }
    ,createOrGetPlan: function ( projectId, amount ) {

        var proj = Projects.findOne( { _id: projectId });

        if (!proj) {
            return { object: "error", message_to_purchaser: "Projecto no encontrado." };
        }

        var plan = Plans.findOne( { _idProject: projectId, amount: amount } );

        if (!plan) {

            var Future = Npm.require( 'fibers/future' );
            var future = new Future();

            var conekta = Meteor.npmRequire('conekta');

            conekta.api_key = process.env.CONEKTA_PRIVATE_API_KEY;
            conekta.locale = 'es';

            conekta.Plan.create({
                "id": proj.url+Random.id(8),
                //JAL. Plan name is received as the charge description from the cokecta webhooks and it's used
                //to get the project from which the subscription charge is being paid
                "name": proj.name,
                "amount": amount * 100,
                "currency": "MXN",
                "interval": "month"
            }, Meteor.bindEnvironment(function(err, plan) {
                if (err) {
                    future.return(err);
                }else {
                    plan.toObject();

                    var planObj = {
                        _idProject: proj._id,
                        _idConektaPlan: plan.toObject().id,
                        projectName: proj.name,
                        amount: amount
                    };
                    console.log("conekta plan created, inserting in own db");
                    var planId = Plans.insert(planObj);
                    future.return( Plans.findOne( {_id: planId } ) );
                }
            }));

            return future.wait();
        }

        return plan;
    }
    ,createOrGetUser: function ( datos ) {

        var user = Meteor.users.findOne( { username: datos.email });
        var _idUser;

        if (!user) {

            var userPassword = Random.id(8);

            user = {
                username: datos.email,
                password: userPassword,
                profile: {
                    name: datos.name,
                    conekta: {
                        cards: [
                        ]
                    }
                }
            };

            if (datos.conektaCustomerId) {
                user.profile.conekta.userId = datos.conektaCustomerId;
            }

            if (datos.token.id) {
                user.profile.conekta.cards.push( datos.token.id );
            }

            _idUser = Accounts.createUser( user );

            Roles.addUsersToRoles( _idUser, "donor" );

            var subject = "Se ha creado una cuenta nueva en Hogar San Isidro";

            var body = "Hola "+datos.name+"! Muchas gracias por tu donación a Hogar San Isidro!<br/><br/>";
            body += "Se ha creado una cuenta nueva para que puedas revisar el estado de tus donaciones y ";
            body += "subscripciones. Tu contraseña es: <br/><br/>";
            body += userPassword + "<br/><br/>";
            body += "Puedes acceder desde <a href='http://"+this.connection.httpHeaders.host+"/logIn'>http://"+this.connection.httpHeaders.host+"/logIn</a>";

            Meteor.call("sendSimpleEmail", datos.email, subject, body);

        }else {

            _idUser = user._id;

        }

        return _idUser;
    }
    ,sendSimpleEmail: function (to, subject, body) {
        this.unblock();

        var postURL = process.env.MAILGUN_API_URL;

        var options = {
            auth: "api:" + process.env.MAILGUN_API_KEY,
            params: {
                "from": "Donaciones Hogar San Isidro <donaciones@hogarsanisidro.org>",
                "to": to instanceof Array ? to : [to],
                "subject": subject,
                "html": body
            }
        };

        var onError = function ( error, result ) {
            if (error) {
                console.log("Error: "+error);
            }
        };

        Meteor.http.post(postURL, options, onError);
    }
});