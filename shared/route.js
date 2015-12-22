/**
 * Created by Alonso on 19/10/2015.
 */

Router.route('/mi-cuenta/ingresar', {
    onBeforeAction: function() {
        if (!Meteor.user()) {
            this.render('logIn');
        }else {
            this.next();
        }
    }
    ,action: function () {
        //this.redirect("/logIn");


//        this.redirect("http://www.hogarsanisidro.org/como-ayudar");



         var role = Roles.getRolesForUser(Meteor.user())[0];

         switch (role) {
            case "admin": this.redirect("/adminAccount");break;
            case "donor": this.redirect("/mi-cuenta/donaciones");break;
         }
    }
});

Router.route('/mi-cuenta', {
    action: function() {
        if (!Meteor.user()) {
            this.redirect('/mi-cuenta/ingresar');
        }else {
            var role = Roles.getRolesForUser(Meteor.user())[0];

            switch (role) {
                case "admin": this.redirect("/adminAccount");break;
                case "donor": this.redirect("/mi-cuenta/donaciones");break;
            }
        }
    }
});
Router.route('/mi-cuenta/donaciones', {name: 'myDonations',
    waitOn: function () {
            return [Meteor.subscribe("donations"),
            Meteor.subscribe("projects")];
        }
    }
);
Router.route('/gracias', {name: 'donateSuccess'});
Router.route('/adminAccount',{name:'adminAccount'});

Router.route('/proyecto/:id', {name: 'donate',
    waitOn: function() {
        return [Meteor.subscribe("projects")];
    }
});

Router.configure({
    layoutTemplate: 'default',
    onBeforeAction: function ()
    {
        var urlSecondValue = this.request.url.split('/')[1];
        if (urlSecondValue == 'cwh' || urlSecondValue == 'proyecto'
            || urlSecondValue == "gracias" || urlSecondValue == ""
            || urlSecondValue == "mi-cuenta") {
            this.next();
            return;
        }

        if ( !Meteor.user() )//Esta llamada lo hace reactivo a los cambios en el usuario
        {
            this.redirect("/");
        }
        else
        {
            var loggedUser = Meteor.user();

            //Evitamos acceso a pantallas no permitidas segun el tipo de usuario
            if ( Roles.userIsInRole( loggedUser, "admin" ) )
            {
                ////ADMIN////
                switch(urlSecondValue)
                {
                    case 'adminProjects':
                    case 'adminAccount':
                    case 'proyecto':
                    case 'gracias':
                    case '':
                        this.next();
                        break;
                    default:
                        this.redirect('/adminAccount');
                }

            }else if ( Roles.userIsInRole( loggedUser, "donor" ) ) {
                switch ( urlSecondValue ) {
                    case 'proyecto':
                    case 'gracias':
                    case '':
                        this.next();
                        break;
                    case 'mi-cuenta':
                        this.redirect('/mi-cuenta/donaciones');
                        break;
                    default:
                        this.redirect('/mi-cuenta');
                        break;
                }
            }
        }
    }
});

Router.route('/', {
    action: function () {
        this.response.writeHead(302, {
            'Location': "http://www.hogarsanisidro.org/como-ayudar"
        });
        this.response.end();
    }
    ,where: 'server'
});

//{
//        action:function()
//        {
//            //this.redirect("/logIn");
//
//
////        this.redirect("http://www.hogarsanisidro.org/como-ayudar");
//            /*
//             var role = Roles.getRolesForUser(Meteor.user())[0];
//
//             switch (role) {
//             case "admin": this.redirect("/adminAccount");break;
//             case "donor": this.redirect("/myAccount");break;
//             }*/
//        }
//    }
//});

//JAL. Conekta Web Hooks
Router.route("/cwh", {
    where: 'server',
    action: function() {
        console.log(" ======  RECIBIENDO NOTIFICACIÓN DE CONEKTA ====== ");
        console.log("=== TIPO: "+this.request.body.type);
        console.log("=== USUARIO: "+this.request.body.data.object.customer_id);
        console.log("=== ID_REFERENCIA: "+this.request.body.data.object.reference_id);
        console.log("=== DESCRIPCION: "+this.request.body.data.object.description);
        console.log("=== ESTADO: "+this.request.body.data.object.status);
        console.log("=== CANTIDAD: "+(this.request.body.data.object.amount/100));
        console.log("=== CARGO: "+(this.request.body.data.object.fee/100));
        console.log("=== METODO DE PAGO: "+this.request.body.data.object.payment_method);
        //console.log(this.request.body);

        var deeta;

        if ( this.request.body.data !== undefined && this.request.body.data.object !== undefined &&
            ( (this.request.body.type == "charge.paid" && this.request.body.data.object.status == "paid")
                || this.request.body.type == "subscription.paid")
            ) {
            //console.log("paid!");
            deeta = this.request.body.data.object;
            var donation = Donations.findOne({_id: deeta.reference_id});

            var payment = null;

            if (!donation && this.request.body.type == "subscription.paid") {
                //console.log("no reference!: "+deeta.description+", "+deeta.customer_id);
                //var proj = Projects.findOne({name: deeta.description});
                ////console.log("proj: ");
                ////console.log(proj);
                //var user = Meteor.users.findOne({'profile.conekta.userId': deeta.customer_id});
                ////console.log("user: ");
                ////console.log(user);
                //
                //if (proj && user) {
                    donation = Donations.findOne({_idConektaCustomer: deeta.customer_id});
                //}
                //console.log("donation: ");
                //console.log(donation);

                payment = {
                    paid_at: deeta.created_at,
                    amount: donation.amount
                };
            }else {
                payment = {
                    paid_at: deeta.paid_at,
                    amount: deeta.amount / 100,
                    currency: deeta.currency,
                    fee: deeta.fee / 100,
                    method: deeta.payment_method
                };
            }

            if (payment && donation) {
                Donations.update({_id: donation._id}, {'$push': {payments: payment}});
            }

        }else if (this.request.body.type == "subscription.canceled") {

            //Meteor.call("cancelSubscription", this.request.body.object.customer_id);

        }else if (this.request.body.type == "ping" ||
                    // Just a normal ping, respond OK.
                this.request.body.type == "customer.created" ||
                    // A user we created, customer id already saved.
                this.request.body.type == "plan.created" ||
                    // A plan we created, id already saved.
                this.request.body.type == "subscription.created"
            // A subscription created, we don't need the id, we use the customer id for cancelation.
            ) {

        }
        //else {
            PendingConektaNotifs.insert( {body: this.request.body, date: new Date()} );
        //}

        this.response.writeHead(200, {'Content-Type': 'text/html'});
        this.response.end('OK\n');
    }
});
