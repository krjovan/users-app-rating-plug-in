let settings = {
    icon: 'fa fa-star',
    showAvg: 'no',
    showCount: 'no'
};

function load() {
    buildfire.datastore.get("settings", (err, response) => {

        if (err) return console.error(err);

        if (response && response.data) {
            settings.icon = response.data.icon;
            settings.showAvg = response.data.showAvg;
            settings.showCount = response.data.showCount;
            icons = document.getElementById('iconsDiv').getElementsByTagName('i');
            for (var i = 0; i < icons.length; i++) {
                if (icons[i].className == response.data.icon) {
                    icons[i].style.color = 'orange'
                }
            }
            if (response.data.showAvg == 'yes') {
                document.getElementById("avgYes").checked = true;
            } else {
                document.getElementById("avgNo").checked = true;
            }
            if (response.data.showCount == 'yes') {
                document.getElementById("countYes").checked = true;
            } else {
                document.getElementById("countNo").checked = true;
            }
        } else {
            document.getElementById("avgNo").checked = true;
            document.getElementById("countNo").checked = true;

        }
    });

    refreshAvgAndCount();
}

function chooseIcon(icon) {
    icons = document.getElementById('iconsDiv').getElementsByTagName('i');
    for (var i = 0; i < icons.length; i++) {
        icons[i].style.color = 'grey';
    }

    icon.style.color = 'orange';
    settings.icon = icon.className;

    save(err => {
        if (err)
            return console.error(err);
        else {
        }
    });
}

function save(callback) {
    buildfire.datastore.save(settings, "settings", callback);
}

buildfire.messaging.onReceivedMessage = function (message) {
    var searchOptions = {
        "filter": { "$json.user_id": message.user_id }
    };
    buildfire.datastore.search(searchOptions, 'userRatings', function (err, records) {
        if (err) {
            console.log('there was a problem retrieving your data');
        }
        else {
            if (records.length == 0) {
                buildfire.datastore.insert(message, 'userRatings', false, function (err, data) {
                    if (err) {
                        console.log('There was a problem saving your data!');
                    }
                    else {
                        console.log('Saved successfully!');
                        refreshAvgAndCount();
                    }
                });
            } else {
                buildfire.datastore.searchAndUpdate({ "user_id": message.user_id }, { $set: { "rating": message.rating } }, 'userRatings', function (err, data) {
                    buildfire.datastore.search({}, 'userRatings', function (err, records) {
                        if (err) {
                            console.log('There was a problem retrieving your data!');
                        } else {
                            console.log('Updated successfully!');
                            refreshAvgAndCount();
                        }
                    });
                });
            }
        }
    });
}

function refreshAvgAndCount() {
    buildfire.datastore.search({}, 'userRatings', function (err, records) {
        if (err) {
            console.log('There was a problem retrieving your data!');
        } else {
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

function toggleAverage(avgRadio) {
    settings.showAvg = avgRadio.value;

    save(err => {
        if (err)
            return console.error(err);
        else {
            load();
        }
    });
}

function toggleCount(countRadion) {
    settings.showCount = countRadion.value;

    save(err => {
        if (err)
            return console.error(err);
        else {
            load();
        }
    });
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

load();