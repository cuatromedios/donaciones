/**
 * Creado por Alonso el 02/11/2015.
 */

var PAYMENT_METHODS = {
    'card_payment': "Pago con Tarjeta"
};

Template.myDonations.helpers({
    donations: function () {
        var don = Donations.find( { recurrent: { '$exists': false } }).fetch();

        var donations = [];

        _.each(don, function(e) {
            _.each(e.payments, function(ee) {
                var elm = {};
                elm.projectName = Projects.findOne( { _id: e._idProject }).name;
                elm.date = moment(ee.paid_at*1000).format("DD/MMM/YYYY hh:mm A");
                elm.amount = ee.amount;
                //TODO: Adjust the paymentMethodString according to every possible payment method.
                elm.paymentMethodString = PAYMENT_METHODS[ee.method.object]+" "+ee.method.last4+" "+ee.method.brand;
                donations.push(elm);
            });
        });

        return donations;
    },
    user: function () {
        if(!Meteor.user())
        {
            return {name:"",store:"",number:""};
        }

        return{name:Meteor.user().profile.name,store:Meteor.user().profile.store,number:Meteor.user().profile.employeenumber};
    },

    subscriptions: function() {
        var don = Donations.find( { recurrent: true }).fetch();

        var donations = [];

        _.each(don, function(e) {
            _.each(e.payments, function(ee) {
                var elm = {};
                elm.projectName = Projects.findOne( { _id: e._idProject }).name;
                elm.date = moment(ee.paid_at*1000).format("DD/MMM/YYYY hh:mm A");
                elm.amount = ee.amount;
                //TODO: Adjust the paymentMethodString according to every possible payment method.
                elm.paymentMethodString = PAYMENT_METHODS[ee.method.object]+" "+ee.method.last4+" "+ee.method.brand;
                donations.push(elm);
            });
        });

        return donations;
    }
});

Template.myDonations.events( {
    'click #logout': function (e, template) {
        Meteor.logout(function()
        {
            Router.go('/logIn');
        });
    }
});