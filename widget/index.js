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
    refreshAvgAndCount();
    if (data.showAvg == 'yes') {
        document.getElementById("showingRating").style.display = 'block';
    } else {
        document.getElementById("showingRating").style.display = 'none';
    }
    if (data.showCount == 'yes') {
        document.getElementById("showingCount").style.display = 'block';
    } else {
        document.getElementById("showingCount").style.display = 'none';
    }
}

function refreshAvgAndCount() {
    buildfire.datastore.search({}, 'userRatings', function (err, records) {
        if (err) {
            console.log('There was a problem retrieving your data!');
        } else {
            console.log(records);
            if (records.length == 0) {
                document.getElementById('numberOfRatings').innerHTML = 0;
                document.getElementById('averageRating').innerHTML = 0;
                return;
            }
            document.getElementById('numberOfRatings').innerHTML = records.length;
            ratingSum = 0;
            for (var i = 0; i < records.length; i++) {
                ratingSum = ratingSum + records[i].data.rating;
            }
            document.getElementById('averageRating').innerHTML = round(ratingSum / records.length, 1);
        }
    });
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

load();