let settings = {
    icon: 'fa fa-star'
};

function load() {
    buildfire.datastore.get("settings", (err, response) => {

        if (err) return console.error(err);

        if (response && response.data) {
            icons = document.getElementById('iconsDiv').getElementsByTagName('i');
            for (var i = 0; i < icons.length; i++) {
                if (icons[i].className == response.data.icon) {
                    icons[i].style.color = 'orange'
                }
            }
        }
    });
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
    console.log(message);
    var searchOptions = {
        "filter": { "$json.user_id": message.user_id }
    };
    console.log(searchOptions);
    buildfire.datastore.search(searchOptions, 'userRatings', function (err, records) {
        if (err) {
            console.log('there was a problem retrieving your data');
        }
        else {
            console.log(records);
            if (records.length == 0) {
                buildfire.datastore.insert(message, 'userRatings', false, function (err, data) {
                    if (err) {
                        console.log('There was a problem saving your data!');
                    }
                    else {
                        console.log('Saved successfully!');
                    }
                });
            } else {
                buildfire.datastore.searchAndUpdate({ "user_id": message.user_id }, { $set: { "rating": message.rating } }, 'userRatings', function (err, data) {
                    console.log(data);
                });
            }
        }
    });
}

load();