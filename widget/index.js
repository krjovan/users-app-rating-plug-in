let myRating = {
    rating: 0
};

function load() {
    buildfire.datastore.get("settings", (err, response) => {
        if (err)
            console.error(err);
        else if (response.data)
            applySettings(response.data);
    });


    buildfire.datastore.onUpdate(obj => {
        applySettings(obj.data);
    });

    authManager.getCurrentUser((err, user) => {
        if (err) {
            return console.error(err);
        }
        else
            loadUserRating();
    });

    authManager.enforceLogin();

}

function loadUserRating() {
    buildfire.userData.get('myRating', function (err, response) {
        if (err) {
            console.log(err);
            return;
        }
        if (response.data != null || response.data.rating != null) {
            document.getElementById('print').innerHTML = response.data.rating;
            icons = document.getElementById('iconsDiv').getElementsByTagName('i');
            for (var i = 0; i < icons.length; i++) {
                if (i < response.data.rating) {
                    icons[i].style.color = 'orange';
                }
                else {
                    icons[i].style.color = 'grey';
                }

            }
        }
    });
}

function saveUserRating(rating) {
    myRating.rating = parseInt(rating.id);
    buildfire.userData.save(myRating, "myRating", function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            loadUserRating();
            authManager.getCurrentUser((err, user) => {
                if (err) {
                    return console.error(err);
                }
                else {
                    buildfire.messaging.sendMessageToControl({ user_id: user._id, rating: myRating.rating });
                }
            });
        }
    });
}

function applySettings(data) {
    icons = document.getElementById('iconsDiv').getElementsByTagName('i');
    for (var i = 0; i < icons.length; i++) {
        icons[i].className = data.icon;
    }
}


load();