const Handlebars = require('../../node_modules/handlebars/dist/handlebars.min');
const storage = require('../helpers/storage');

module.exports = (() => {

    function isAuthor() {
        Handlebars.registerHelper('isAuthor', function (creatorId) {
            return storage.getData('userId') === creatorId;
        });
    }

    function isUserInLikes() {
        Handlebars.registerHelper('isUserInLikes', function (likes) {
            return likes.indexOf(storage.getData('userId')) !== -1;
        });
    }

    function likesCounter() {
        Handlebars.registerHelper('likesCounter', function (likes) {
            return likes.length;
        });
    }

    return {
        isAuthor,
        isUserInLikes,
        likesCounter
    }
})();