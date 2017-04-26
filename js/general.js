$(document).ready(function(){
    
	$(".logoutBtn").click(function(){
		loginData.username = 'NA';
		loginData.password = 'NA';
		loginData.timestamp = 'NA';
		localStorage.loginData = JSON.stringify(loginData);
		window.location = "../";
	});
	$(".linkToBot").click(function(){
		window.open('http://askgig.in/'+loginData.username,'_blank');
	});

	

});

var loginData = new Object();

if(localStorage.loginData){
	loginData = JSON.parse(localStorage.loginData);
	//console.log(loginData);
	if(loginData.timestamp != "NA"){
		var currDate = new Date();
		var loginDate = new Date(Date.parse(loginData.timestamp));
		if(currDate.getMonth() == loginDate.getMonth()&& currDate.getFullYear() == loginDate.getFullYear() && currDate.getDate() == loginDate.getDate()){
			//console.log("Client Logged In");
		}else{
			window.location = "../";
		}
	}else{
		window.location = "../";
	}
}else{
	window.location = "../";
}



