/**
 * Creado por Alonso el 19/10/2015.
 */

Template.logIn.events({
    'submit #formLogin':function(event)
    {
        event.preventDefault();

        $(event.currentTarget.username).attr('disabled','disabled');
        $(event.currentTarget.password).attr('disabled','disabled');


        Meteor.loginWithPassword(event.currentTarget.username.value,event.currentTarget.password.value,
            function(err)
            {
                if(err)
                {
                    $(event.currentTarget.username).removeAttr('disabled');
                    $(event.currentTarget.password).removeAttr('disabled');
                    $('#message').text(err.reason);
                }

            });
    }
});