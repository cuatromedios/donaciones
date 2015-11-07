/**
 * Creado por Alonso el 19/10/2015.
 */

Template.donate.onCreated( function() {
    this._id = Router.current().params.id;
    this.myData = new ReactiveVar( Projects.findOne({ url: this._id }) );
    this.conektaSuccessCallback = function(token) {
        //Success

        var $form = this.find("#formDonate");

        var datos = {
            name: $form.name.value,
            email: $form.email.value,
            amount: $form.amount.value,
            paymentType: $form.paymentType.value,
            projectId: this.myData.get()._id,
            token: token
        };

        var self = this;

        var command = "chargePayment";

        if ($form.recurrent.checked) {
            command = "createRecurrentSubscription";
        }

        this.find('#progressBarDiv').style.display = "block";

        Meteor.call(command, datos, function (err, regreso) {
            if (err) {
                Materialize.toast(err.reason, 5000, "red");
            } else {
                if (regreso && regreso.object == "error") {
                    Materialize.toast(regreso.message_to_purchaser, 5000, "red");
                    self.find("button").removeAttribute("disabled");
                    self.find('#progressBarDiv').style.display = "none";
                } else {
                    Materialize.toast(regreso, 3000, "blue");
                    Meteor.setTimeout( function() {
                        Router.go("donateSuccess");
                    }, 3000);
                }
            }
        });



    }.bind(this);
});

Template.donate.helpers({
    name: function () {
        return Template.instance().myData.get().name;
    }
    , defaultAmount: function () {
        return Template.instance().myData.get().defaultAmount;
    }
    , existe: function() {
        return Template.instance().myData.get() !== undefined;
    }
    , checkRecurrent: function() {
        return Template.instance().myData.get().recurrent ? "checked" : "";
    }
    , years: function () {
        var year = parseInt( (""+(new Date()).getFullYear()).substr(2,2) );
        var years = [];
        for (var i = 0; i < 10; i++) {
            years.push( {label: (year+i), value: (year+i)} );
        }
        return years;
    }
    , conektaPublicAPIKey: function() {
        return process.env.CONEKTA_PUBLIC_API_KEY;
    }
});

Template.donate.events( {
    'keyup #name': function (e,template) {
        template.$("#creditCardName").val(e.currentTarget.value);
        template.$("label[for='creditCardName']")[0].classList.add("active");
    }
    ,'change #name': function (e,template) {
        template.$("#creditCardName").val(e.currentTarget.value);
        template.$("label[for='creditCardName']")[0].classList.add("active");
    }
    , 'change #paymentTypeCredit': function (e,template) {
        template.$('#divCreditCardInfo').css('height','350px');
    }
    , 'submit #formDonate': function (e,template) {
        e.preventDefault();

        var $form = e.currentTarget;

        template.find("button").setAttribute("disabled", true);

        Conekta.token.create($form, template.conektaSuccessCallback, function (err) {
            //Fail
            Materialize.toast(err.message_to_purchaser,2000, "red");
            console.log(err);
            template.find("button").removeAttribute("disabled");
        });


    }
});