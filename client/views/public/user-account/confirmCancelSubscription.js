/**
 * Creado por Alonso el 21/12/2015.
 */

Template.confirmCancelSubscription.events({
    'click #aceptarCancelacion': function (e, template) {
        e.preventDefault();

        //$('#modal' + template.data).closeModal();

        //template.find('#progressBarDiv').style.display = "block";
        //template.find('#aceptarCancelacion').disabled = true;
        //template.find('#cancelarCancelacion').disabled = true;

        Meteor.call("cancelRecurrentDonation", template.data, function(err,ret) {
            template.find('#progressBarDiv').style.display = "none";
            if (err) {
                //template.find('#aceptarCancelacion').removeAttribute('disabled');
                //template.find('#cancelarCancelacion').removeAttribute('disabled');
                Materialize.toast(err.reason,2000,"red");
            }else if (ret.object == "error") {
                //template.find('#aceptarCancelacion').removeAttribute('disabled');
                //template.find('#cancelarCancelacion').removeAttribute('disabled');
                Materialize.toast(ret.message_to_purchaser, 5000, "red");
            }else {
                //console.log('#modal' + template.data);
                //console.log($('#modal' + template.data));
                //console.log($('#modal' + template.data).closeModal);
                //$('#modal'+template.data).closeModal();
                Materialize.toast("Subscripción cancelada con éxito", 2000, "blue");
            }
        });
    }
});