$(document).ready(function(){
    

	$(".submitInput").click(function(){
		validateUser();
	});	
	$(".troubleLogin").click(function(){
		alert('To Regenerate your credentials please contact us on \n\nPhone : +91 7875480555\nEmail : business@askgig.in\n\nRegards');
	});

});
Parse.initialize("mbzon2lS3h92s4usHA74ZWirzs4kCKhE4R3bnvro");
Parse.serverURL = 'https://gigserver.herokuapp.com/parse';

var loginData = new Object();
if(localStorage.loginData){
	loginData = JSON.parse(localStorage.loginData);
	if(loginData.timestamp != "NA"){
		var currDate = new Date();
		var loginDate = new Date(Date.parse(loginData.timestamp));
		if(currDate.getMonth() == loginDate.getMonth()&& currDate.getFullYear() == loginDate.getFullYear() && currDate.getDate() == loginDate.getDate()){
			window.location = "./home";
		}
		

	}
}else{
	loginData.username = "NA";
	loginData.password = "NA";
	loginData.timestamp = "NA";
	loginData.clientName = "NA";
	loginData.cover = "NA";
	loginData.locality = "NA";
	loginData.city = "NA";
	loginData.subscribers = "NA";
	localStorage.loginData = JSON.stringify(loginData);
}

function validateUser(){
	$(".gigLoader").show();
	var username = $(".username").val();
	var pass = $(".pass").val();
	var Venue = Parse.Object.extend("Venue_All");
    var query = new Parse.Query(Venue);
    query.equalTo('reference',username);
    //query.equalTo('password',pass);
    query.find({
    	success:function(result){
    		if(result.length > 0){
    			
    			loginData.username = username;
    			loginData.password = pass;
    			loginData.timestamp = new Date();
    			loginData.clientName = result[0].get('name');
    			loginData.clientTitle = result[0].get('title');
    			loginData.cover = result[0].get('cover');
    			loginData.locality = result[0].get('locality');
    			loginData.city = result[0].get('city');
    			loginData.subscribers = result[0].get('subscribers');
    			localStorage.loginData = JSON.stringify(loginData);
    			window.location = "./home";
    			//$(".gigLoader").hide();
    		}else{
    			$(".gigLoader").hide();
    			alert('Incorrect Username or Password');
    		}
    	}
    });

}