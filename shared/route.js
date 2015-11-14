/**
 * Created by Alonso on 19/10/2015.
 */

Router.route('/logIn',{name:'logIn'});
Router.route('/myAccount', {name: 'myAccount'});
Router.route('/myDonations', {name: 'myDonations',
    waitOn: function () {
            return [Meteor.subscribe("donations"),
            Meteor.subscribe("projects")];
        }
    }
);
Router.route('/donateSuccess', {name: 'donateSuccess'});
Router.route('/adminAccount',{name:'adminAccount'});

Router.route('/donate/:id', {name: 'donate',
    waitOn: function() {
        return [Meteor.subscribe("projects")];
    }
});


//JAL. Conekta Web Hooks
Router.route("/cwh", {
    where: 'server',
    action: function() {
        console.log(" ======  RECIBIENDO NOTIFICACI�N DE CONEKTA ====== ");
        console.log("=== TIPO: "+this.request.body.type);
        console.log("=== USUARIO: "+this.request.body.data.object.customer_id);
        console.log("=== ID_REFERENCIA: "+this.request.body.data.object.reference_id);
        console.log("=== DESCRIPCION: "+this.request.body.data.object.description);
        console.log("=== ESTADO: "+this.request.body.data.object.status);
        console.log("=== CANTIDAD: "+(this.request.body.data.object.amount/100));
        console.log("=== CARGO: "+(this.request.body.data.object.fee/100));
        console.log("=== METODO DE PAGO: "+this.request.body.data.object.payment_method);
        //console.log(this.request.body);

        if (this.request.body.type == "charge.paid" && this.request.body.data &&
            this.request.body.data.object && this.request.body.data.object.status == "paid") {
            //console.log("paid!");
            var deeta = this.request.body.data.object;
            var donation = Donations.findOne( { _id: deeta.reference_id } );
            if (!donation) {
                //console.log("no reference!: "+deeta.description+", "+deeta.customer_id);
                var proj = Projects.findOne( { name: deeta.description } );
                //console.log("proj: ");
                //console.log(proj);
                var user = Meteor.users.findOne( { 'profile.conekta.userId': deeta.customer_id } );
                //console.log("user: ");
                //console.log(user);

                if (proj && user) {
                    donation = Donations.findOne( { _idProject: proj._id, _idUser: user._id } );
                }
                //console.log("donation: ");
                //console.log(donation);
            }

            if (donation) {
                //console.log("updating payments!");
                var payment = {
                    paid_at: deeta.paid_at,
                    amount: deeta.amount/100,
                    currency: deeta.currency,
                    fee: deeta.fee/100,
                    method: deeta.payment_method
                };
                Donations.update( { _id: donation._id }, {'$push': {payments: payment}} );
            }
        }

        this.response.writeHead(200, {'Content-Type': 'text/html'});
        this.response.end('OK\n');
    }
});

Router.configure({
    layoutTemplate: 'default',
    onBeforeAction: function ()
    {
        if (this.request.url.split('/')[1] == 'cwh') {
            this.next();
            return;
        }
        if ( !Meteor.user() )//Esta llamada lo hace reactivo a los cambios en el usuario
        {
            if (this.request.url.split('/')[1] == 'donate' || this.request.url.split('/')[1] == "donateSuccess") {
                this.next();
            }else {
                //No ha hecho login
                this.render('logIn');
            }
        }
        else
        {
            var loggedUser = Meteor.user();
            var urlSecondValue = this.request.url.split('/')[1];
            //Evitamos acceso a pantallas no permitidas segun el tipo de usuario
            if ( Roles.userIsInRole( loggedUser, "admin" ) )
            {
                ////ADMIN////
                switch(urlSecondValue)
                {
                    case 'adminProjects':
                    case 'adminAccount':
                    case 'donate':
                    case 'donateSuccess':
                    case '':
                        this.next();
                        break;
                    default:
                        this.redirect('/');
                }

            }else if ( Roles.userIsInRole( loggedUser, "donor" ) ) {
                switch ( urlSecondValue ) {
                    case 'donate':
                    case 'donateSuccess':
                    case 'myAccount':
                    case 'myDonations':
                    case '':
                        this.next();
                        break;
                    default:
                        this.redirect('/');
                        break;
                }
            }
        }
    }
});

Router.route('/',{
    action:function()
    {
        var role = Roles.getRolesForUser(Meteor.user())[0];

        switch (role) {
            case "admin": this.redirect("/adminAccount");break;
            case "donor": this.redirect("/myAccount");break;
        }
    }
});