/**
 * Created by Alonso on 19/10/2015.
 */

Template.adminAccount.helpers({
    user: function () {
        if(!Meteor.user())
        {
            return {name:"",store:"",number:""};
        }

        return{name:Meteor.user().profile.name,store:Meteor.user().profile.store,number:Meteor.user().profile.employeenumber};
    }
});

Template.adminAccount.events({
    'click #logout': function (e, template) {
        Meteor.logout(function()
        {
            Router.go('/');
        });
    }
});