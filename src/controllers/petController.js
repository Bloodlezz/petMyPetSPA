const notificator = require('../helpers/notificator');
const hbsHelpers = require('../helpers/hbsHelpers');
const binder = require('../helpers/binder');
const validator = require('../helpers/validator');
const storage = require('../helpers/storage');

const petModel = require('../models/petModel');

module.exports = (() => {

    function getAllPets(context) {
        notificator.showLoading();
        storage.saveData('category', context.params.category);

        let petsQuery;
        let category = this.params.category.toLowerCase();

        if (category !== 'all') {
            category = category
                .charAt(0)
                .toUpperCase()
                .concat(category.slice(1))
                .slice(0, -1);
        }

        if (category === 'all') {
            petsQuery = petModel.getAll();
        } else {
            petsQuery = petModel.getAllByCategory(category);
        }

        petsQuery
            .then(function (pets) {
                const petsByLikesDesc = pets.sort((a, b) => {
                    return b.likes.length - a.likes.length;
                });

                context.pets = petsByLikesDesc;
                hbsHelpers.isAuthor();
                hbsHelpers.isUserInLikes();
                hbsHelpers.likesCounter();
                binder.bindPartials(context)
                    .then(function () {
                        notificator.hideLoading();
                        this.partial('views/pet/dashboard.hbs');
                    });
            })
            .catch(function (error) {
                notificator.hideLoading();
                notificator.handleError(error);
            });
    }

    function detailsGet(context) {
        notificator.showLoading();

        const petId = this.params.id;

        petModel.getOne(petId)
            .then(function (pet) {
                context.pet = pet;
                hbsHelpers.isAuthor();
                hbsHelpers.isUserInLikes();
                hbsHelpers.likesCounter();
                binder.bindPartials(context)
                    .then(function () {
                        notificator.hideLoading();
                        this.partial('views/pet/details-other.hbs');
                    })
            })
            .catch(function (error) {
                notificator.hideLoading();
                notificator.handleError(error);
            });
    }

    function like(context) {
        notificator.showLoading();

        const petId = context.params.id;
        const previousPage = context.params.from || null;
        const currentCategory = storage.getData('category');

        petModel.getOne(petId)
            .then(function (petData) {
                const userId = storage.getData('userId');

                if (userId === petData._acl.creator) {
                    notificator.hideLoading();
                    notificator.showError('Can\'t like your own pet!');
                    return;
                }

                const updatedLikes = petData.likes;

                if (updatedLikes.indexOf(userId) !== -1) {
                    updatedLikes.splice(updatedLikes.indexOf(userId), 1);
                } else {
                    updatedLikes.push(userId);
                }

                petData.likes = updatedLikes;

                petModel.editPet(petData)
                    .then(() => {
                        notificator.hideLoading();

                        if (previousPage) {
                            context.redirect(`#/pet/details/${petId}`);
                            notificator.showInfo('Like updated');
                            return;
                        }

                        context.redirect(`#/dashboard/${currentCategory}`);
                        notificator.showInfo('Like updated');
                    });
            })
            .catch(function (error) {
                notificator.hideLoading();
                notificator.handleError(error);
            });
    }

    function addGet(context) {
        binder.bindPartials(context)
            .then(function () {
                this.partial('views/pet/add.hbs');
            });
    }

    function addPost(context) {
        const petData = binder.bindFormToObj(this.params);

        validator.validateFormData(petData, 'create');

        if (validator.isFormValid()) {
            notificator.showLoading();

            petData['likes'] = [];
            petModel.addPet(petData)
                .then(() => {
                    notificator.hideLoading();
                    this.redirect('#/dashboard/all');
                    notificator.showInfo('Pet added');
                })
                .catch(function (error) {
                    notificator.hideLoading();
                    notificator.handleError(error);
                });
        } else {
            notificator.hideLoading();
            notificator.showError('Please fill in the fields correctly!');
        }
    }

    function myPets(context) {
        notificator.showLoading();

        const userId = storage.getData('userId');

        petModel.getAll()
            .then(pets => {
                const myPets = pets
                    .filter(p => p._acl.creator === userId);

                context.pets = myPets;

                hbsHelpers.likesCounter();
                return binder.bindPartials(context);
            })
            .then(function () {
                notificator.hideLoading();
                this.partial('views/pet/my-pets.hbs');
            })
            .catch(function (error) {
                notificator.hideLoading();
                notificator.handleError(error);
            });
    }

    function editGet(context) {
        notificator.showLoading();

        const petId = this.params.id;

        petModel.getOne(petId)
            .then(pet => {
                context.pet = pet;

                hbsHelpers.likesCounter();
                return binder.bindPartials(context);
            })
            .then(function () {
                notificator.hideLoading();
                this.partial('views/pet/edit.hbs');
            })
            .catch(function (error) {
                notificator.hideLoading();
                notificator.handleError(error);
            });
    }

    function editPost(context) {
        const petId = this.params.id;
        const updatedData = binder.bindFormToObj(this.params);
        // const newDescription = this.params.description;

        validator.validateFormData(updatedData, 'create');

        if (validator.isFormValid()) {
            notificator.showLoading();

            petModel.getOne(petId)
                .then(pet => {
                    pet.description = updatedData.description;
                    pet.imageURL = updatedData.imageURL;

                    return petModel.editPet(pet);
                })
                .then(() => {
                    notificator.hideLoading();
                    this.redirect(`#/pet/edit/${petId}`);
                    notificator.showInfo('Pet updated');
                })
                .catch(function (error) {
                    notificator.hideLoading();
                    notificator.handleError(error);
                });
        } else {
            notificator.hideLoading();
            notificator.showError('Please fill in the fields correctly!');
        }
    }

    function removeGet(context) {
        const petId = this.params.id;

        petModel.getOne(petId)
            .then(pet => {
                context.pet = pet;

                hbsHelpers.likesCounter();
                return binder.bindPartials(context);
            })
            .then(function () {
                notificator.hideLoading();
                this.partial('views/pet/delete.hbs');
            })
            .catch(function (error) {
                notificator.hideLoading();
                notificator.handleError(error);
            });
    }

    function removePost(context) {
        notificator.showLoading();

        const userId = storage.getData('userId');
        const petId = this.params.id;

        petModel.getOne(petId)
            .then(pet => {
                if (pet._acl.creator === userId) {
                    petModel.removePet(pet._id)
                        .then(() => {
                            notificator.hideLoading();
                            this.redirect('#/pet/my');
                            notificator.showInfo('Pet removed');
                        });
                } else {
                    notificator.hideLoading();
                    this.redirect(`#/pet/remove/${pet._id}`);
                    notificator.showError('Access denied !');
                }
            })
            .catch(function (error) {
                notificator.hideLoading();
                notificator.handleError(error);
            });
    }

    return {
        getAllPets,
        detailsGet,
        like,
        addGet,
        addPost,
        myPets,
        editGet,
        editPost,
        removeGet,
        removePost
    }
})();