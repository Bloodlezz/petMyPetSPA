const requester = require('../helpers/requester');

module.exports = (() => {

    function getAll() {
        return requester.get('appdata', 'pets', 'kinvey');
    }

    function getAllByCategory(category) {
        return requester.get('appdata', `pets?query={"category":"${category}"}`, 'kinvey');
    }

    function getOne(id) {
        return requester.get('appdata', `pets/${id}`, 'kinvey');
    }

    function addPet(petData) {
        return requester.post('appdata', 'pets', 'kinvey', petData);
    }

    function editPet(petData) {
        return requester.update('appdata', `pets/${petData._id}`, 'kinvey', petData);
    }

    function removePet(id) {
        return requester.remove('appdata', `pets/${id}`, 'kinvey');
    }

    return {
        getAll,
        getAllByCategory,
        getOne,
        addPet,
        editPet,
        removePet
    }

})();