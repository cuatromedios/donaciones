/**
 * Creado por Alonso el 21/12/2015.
 */

Template.recurrentDonationElement.helpers({
    isActive: function(status) {
        return status == 'active';
    }
});

Template.recurrentDonationElement.onRendered( function() {
    this.$('.modal-trigger').leanModal({
        dismissible: false
    });
});