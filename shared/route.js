/**
 * Created by Alonso on 19/10/2015.
 */

Router.route('/logIn',{name:'logIn'});
Router.route('/myAccount', {name: 'myAccount'});
Router.route('/adminAccount',{name:'adminAccount'});

Router.route('/donate/:id', {name: 'donate',
    waitOn: function() {
        return [Meteor.subscribe("projects")];
    }
});

Router.configure({
    layoutTemplate: 'default',
    onBeforeAction: function ()
    {
        if ( !Meteor.user() )//Esta llamada lo hace reactivo a los cambios en el usuario
        {
            //No ha hecho login
            this.render('logIn');
        }
        else
        {
            var loggedUser = Meteor.user();
            var urlSecondValue = this.request.url.split('/')[1];
            //Evitamos acceso a pantallas no permitidas segun el tipo de usuario
            if ( Roles.userIsInRole( loggedUser, "admin" ) )
            {
                ////ADMIN////
                switch(urlSecondValue)
                {
                    case 'adminProjects':
                    case 'adminAccount':
                    case 'donate':
                    case '':
                        this.next();
                        break;
                    default:
                        this.redirect('/');
                }

            }else if ( Roles.userIsInRole( loggedUser, "donator" ) ) {
                switch ( urlSecondValue ) {
                    case 'donate':
                    case 'myAccount':
                    case '':
                        this.next();
                        break;
                    default:
                        this.redirect('/');
                        break;
                }
            }
        }
    }
});

Router.route('/',{
    action:function()
    {
        var role = Roles.getRolesForUser(Meteor.user())[0];

        switch (role) {
            case "admin": this.redirect("/adminAccount");break;
            case "student":
            case "teacher": this.redirect("/myAccount");break;
        }
    }
});