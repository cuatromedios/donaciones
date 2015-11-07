/**
 * Created by Alonso on 19/10/2015.
 */

Meteor.publish("projects", function() {
    return Projects.find({});
});

Meteor.publish("donations", function() {
    return Donations.find( { _idUser: this.userId } );
});