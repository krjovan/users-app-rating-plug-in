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
                        reload();
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
                            reload();
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
            var five = 0;
            var four = 0;
            var three = 0;
            var two = 0;
            var one = 0;
            if (records.length == 0) {
                document.getElementById('numberOfRatings').innerHTML = 0;
                document.getElementById('averageRating').innerHTML = 0;
                return;
            }
            document.getElementById('numberOfRatings').innerHTML = records.length;
            ratingSum = 0;
            for (var i = 0; i < records.length; i++) {
                ratingSum = ratingSum + records[i].data.rating;
                if(records[i].data.rating == 5)
                    ++five;
                if(records[i].data.rating == 4)
                    ++four;
                if(records[i].data.rating == 3)
                    ++three;
                if(records[i].data.rating == 2)
                    ++two;
                if(records[i].data.rating == 1)
                    ++one;
                
            }
            document.getElementById('averageRating').innerHTML = round(ratingSum / records.length, 1);
            var chart = new CanvasJS.Chart("chartContainer", {
                animationEnabled: true,

                title: {
                    text: "User Ratings in detail"
                },
                axisX: {
                    interval: 1
                },
                axisY2: {
                    interlacedColor: "rgba(1,77,101,.2)",
                    gridColor: "rgba(1,77,101,.1)",
                    title: "Number of Ratings"
                },
                data: [{
                    type: "bar",
                    name: "companies",
                    axisYType: "secondary",
                    color: "#014D65",
                    dataPoints: [
                        { y: one, label: "1 points" },
                        { y: two, label: "2 points" },
                        { y: three, label: "3 points" },
                        { y: four, label: "4 points" },
                        { y: five, label: "5 points" }
                    ]
                }]
            });
            chart.render();
        }
    });
}

function toggleAverage(avgRadio) {
    settings.showAvg = avgRadio.value;
    reload();
}

function toggleCount(countRadion) {
    settings.showCount = countRadion.value;
    reload();
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function reload() {
    save(err => {
        if (err)
            return console.error(err);
        else {
            load();
        }
    });
}

load();