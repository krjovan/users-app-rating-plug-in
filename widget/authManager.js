const authManager = {
	getCurrentUser(callback) {
		buildfire.auth.getCurrentUser((err, user) => {
			if (!user)
				buildfire.auth.login({ allowCancel: false }, callback);
			else
				callback(null,user);

		});
	}
	,enforceLogin(){
		buildfire.auth.onLogout( () => {
			authManager.getCurrentUser();
		});
	}
};

