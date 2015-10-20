/**
 * Creado por Alonso el 19/10/2015.
 */

Template.myAccount.helpers({
    user: function () {
        if(!Meteor.user())
        {
            return {name:"",store:"",number:""};
        }

        return{name:Meteor.user().profile.name,store:Meteor.user().profile.store,number:Meteor.user().profile.employeenumber};
    }
});

Template.myAccount.events({
    'click #logout': function (e, template) {
        Meteor.logout(function()
        {
            Router.go('/');
        });
    }
});