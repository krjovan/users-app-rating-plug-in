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
           loadUserRating(user);
    });

    authManager.enforceLogin();

}

function loadUserRating(user) {
}

function applySettings(data) {
    console.log(data);
    icons =  document.getElementById('iconsDiv').getElementsByTagName('i');
    for (var i=0; i < icons.length; i++) {
        icons[i].className = data.icon;
    }
}


load();