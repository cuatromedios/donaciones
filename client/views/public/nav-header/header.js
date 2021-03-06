/**
 * Creado por Alonso el 19/10/2015.
 */

Template.header.events(
    {
        "click #menubutton": function()
        {
            nav = document.getElementById("nav");
            navcontainer = document.getElementById("navcontainer");
            if (nav.style.height == "0px" || !nav.style.height) {
                nav.style.height = "40px";
            } else {
                nav.style.height = "0px";
            }
        }
    }
)
Template.header.helpers(
    {
        showMenu: function()
        {
            //if (Meteor.user())
            //{
            //    return true;
            //}

            return false;
        }
        ,menu:function()
    {
        var result = [];
        if(Meteor.user() && Meteor.user().profile)
        {
            var role = Roles.getRolesForUser(Meteor.user())[0];

            switch(role)
            {
                case 'donor':
                    result.push({href:'/mi-cuenta/donaciones',value:'Mis Donaciones', icon:'mdi-editor-attach-money'});
                    result.push({href:'/mi-cuenta',value:'Mi Cuenta', icon:'mdi-action-account-circle'});
                    break;
                case 'admin':
                    result.push({href:'/adminProjects',value:'Proyectos', icon:'mdi-action-assignment-turned-in'});
                    result.push({href:'/adminAccount',value:'Mi Cuenta', icon:'mdi-action-account-circle'});
                    break;
            }
        }

        return result;
    }
    });