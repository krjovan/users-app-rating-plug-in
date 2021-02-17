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

load();