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
            description: "¡Tu aportación hace la diferencia, únete al programa 1,000 de a $100 y "+
            "suma con nosotros! Queremos sumar a 1,000 donadores que aporten 100 pesos al mes para los "+
            "gastos cotidianos de manutención",
            url: "mil-de-cien",
            recurrent: true,
            startDate: null,
            endDate: null,
            defaultAmount: 100.0
        });

        Projects.insert( {
            name: "Apadrina a un Niño",
            description: "Si así lo deseas, puedes optar por ser padrino de un niño, proporcionándole"+
            "todo lo que necesita para su subsistencia y educación por el tiempo que tú decidas. "+
            "La cantidad mínima que necesita un niño al mes es de $1,500, ponte en contacto con nosotros.",
            url: "apadrina-a-un-nino",
            recurrent: true,
            startDate: null,
            endDate: null,
            defaultAmount: 1500.0
        });

        Projects.insert( {
            name: "Un Salario al Mes",
            description: "Las personas que trabajan con nosotros son importantísimas para el bienestar"+
                "de los niños, si quieres, también puedes apoyarnos cubriendo el sueldo mensual de $4,000"+
                "pesos de uno de ellos. ¡Con tu ayuda nosotros ayudamos más.!",
            url: "un-salario-al-mes",
            recurrent: true,
            startDate: null,
            endDate: null,
            defaultAmount: 4000.0
        });
    }

});