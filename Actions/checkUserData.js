exports.action = function(ref , token , user , app){

	if(app.users[ref]!=undefined && app.users[ref]!=null && app.users[ref].token==token)
	{

		return true;

	}
	else
	{

		return false;

	}

};