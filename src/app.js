import Sammy from '../node_modules/sammy/lib/sammy';
import '../node_modules/sammy/lib/plugins/sammy.handlebars';

const homeController = require('./controllers/homeController');
const userController = require('./controllers/userController');
const petController = require('./controllers/petController');

$(() => {
    const app = Sammy('#site-content', router);

    app.run('#/');
});

function router() {
    this.use('Handlebars', 'hbs');

    this.route('get', '#/', homeController.index);

    this.route('get', '#/register', userController.registerGet);
    this.route('post', '#/register', userController.registerPost);
    this.route('get', '#/login', userController.loginGet);
    this.route('post', '#/login', userController.loginPost);
    this.route('get', '#/logout', userController.logout);

    this.route('get', '#/dashboard/:category', petController.getAllPets);
    this.route('get', '#/pet/my', petController.myPets);

    this.route('get', '#/pet/details/:id', petController.detailsGet);
    this.route('post', '#/pet/like/:id', petController.like);

    this.route('get', '#/pet/add', petController.addGet);
    this.route('post', '#/pet/add', petController.addPost);
    this.route('get', '#/pet/edit/:id', petController.editGet);
    this.route('post', '#/pet/edit/:id', petController.editPost);
    this.route('get', '#/pet/remove/:id', petController.removeGet);
    this.route('post', '#/pet/remove/:id', petController.removePost);
}