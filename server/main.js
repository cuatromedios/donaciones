/**
 * Created by Alonso on 19/10/2015.
 */

Meteor.startup( function() {

    if (Roles.getUsersInRole("admin").fetch().length == 0) {
        //No hay administrador, crear nueva BD.

        Roles.createRole("admin");
        Roles.createRole("donator");

        var adminId = Accounts.createUser( {
            username: 'admin',
            password: '1',
            profile: {
                name: 'Administrador'
            }
        });

        Roles.addUsersToRoles(adminId, "admin");

        Projects.insert( {
            name: "Mil de Cien",
            description: "Queremos juntar mil de cien",
            url: "mil-de-cien",
            recurrent: true,
            startDate: null,
            endDate: null,
            defaultAmount: 100.0
        });
    }

});