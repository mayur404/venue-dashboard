$(document).ready(function(){
    
	if(localStorage.loginData){
		loginData = JSON.parse(localStorage.loginData);
		console.log(loginData);
		if(loginData.timestamp != "NA"){
			$(".clientCoverImg").attr('src',loginData.cover);
			$(".clientName").html(loginData.clientTitle);
		}
		$(".venueNameSpan").html(loginData.clientTitle);
		setHomeAnalysis(loginData.username,loginData.clientName);
		//getUpcomingEvent(loginData.username,loginData.clientName,loginData.city);
		getMessengerUsers(loginData.username,loginData.clientName,loginData.city);
	}

	$(".searchFilter").click(function(){
		$(this).toggleClass('filterSelected');
		var index = parseInt($(this).attr('data-index'));
		if($(this).hasClass('filterSelected')){
			filterArray[index] = 1;
		}else{
			filterArray[index] = 0;
		}
		//Trigger a new Search Query
		searchUserQuery('');
	});

	$(".searchUserBarImg").click(function(){
		searchUserQuery($('.searchUserInput').val());
	});

	$('.searchUserInput').keypress(function (e) {
	  if (e.which == 13) {
	   	searchUserQuery($(this).val());
	  }
	});


});

var cityCodeList = ["PUN","HYD","GOA","MUM","BLR"];
var cityNameList = ["Pune","Hyderabad","Goa","Mumbai","Bangalore"];

var filterArray = [0,0,0,0,0,0];
var userResultArray = new Array();
Parse.initialize("mbzon2lS3h92s4usHA74ZWirzs4kCKhE4R3bnvro");
Parse.serverURL = 'https://gigserver.herokuapp.com/parse';

Date.prototype.addHours = function(h) {
   this.setTime(this.getTime() + (h*60*60*1000));
   return this;
 }
 Date.prototype.subHours = function(h) {
   this.setTime(this.getTime() - (h*60*60*1000));
   return this;
 }

 var monthString = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function setHomeAnalysis(reference,venueName){
  console.log(reference);


  //Getting the total number of Subscribers
  var Venue = Parse.Object.extend("Venue_All");
  var query = new Parse.Query(Venue);
  query.equalTo('reference',reference);
  query.find({
  	success:function(result){
  		if(result.length > 0){
  			var subscriberList = result[0].get('subscribers');
  			//console.log(subscriberList);
  			if(subscriberList){
  				$(".userCountN").html(subscriberList.length);	
  			}
  			$(".messengerUserSummary").children('.contentLoader').hide();

  		}else{
  			console.log("Not Found");
  		}
  		
  	}
  });

}




function getMessengerUsers(reference,venueName,city){

	var Activity = Parse.Object.extend("Activity");
	var query = new Parse.Query(Activity);
	query.equalTo('action','subscribed');
	query.equalTo('reference',reference);
	query.descending('timestamp');
	query.limit(2000);
	query.find({
		success:function(result){
			userResultArray.length = 0;
			userResultArray = result;
			console.log(userResultArray);
			if(result.length >= 25){
				length = 25;
				remaining = result.length - 25;
				var allUserString = '<div data-action="showNextSetUsers" data-index="25" class="allBtn actionBtn remainingUsers">'+remaining+' More Users ></div>';
			}else{
				length = result.length;
				//var allUserString = '<div data-action="showAllMessengerUser" class="allBtn actionBtn">See all Users ></div>';
				allUserString = "";
			}
			for(i=0;i<length;i++){
				appendMessengerUser(result[i].get('sender'),result[i].get('userData'),result[i].get('userCity'),i%2,result[i].get('timestamp'));
			}
			$(".messengerRecentUsers").children('.contentLoader').hide();
			
			$(".messengerRecentUsers").append(allUserString);

			$(".remainingUsers").click(function(){
				if($(this).attr('data-action') == 'showNextSetUsers'){
					showNextSetUsers($(this));
				}
			});
		}
	});

}


function appendMessengerUser(senderId,user,currentCity,mod,timestamp){

	
	var lastSeen = getLastSeen(timestamp);
	if(cityCodeList.indexOf(currentCity) > -1){
		var cityName = cityNameList[cityCodeList.indexOf(currentCity)];	
	}else{
		var cityName = "Unknown";
	}
	var fullName = user.name + " " + user.lastName; 
	if(mod){
		var appendString = '<div class="allUserMiniContainer dark"><img src="'+user.profile+'" class="userMiniProfile"><div class="userContent"><div class="userTitle">'+fullName+'</div><div class="userCity">'+lastSeen+' - '+cityName+'</div><div class="userActions"><div data-action="sendMessengerUserMessage" data-senderId="'+senderId+'" class="sendMessageAction actionBtn">Message</div><div data-action="sendMessengerUserMessage" data-senderId="'+senderId+'" class="sendOfferAction actionBtn">Send Offer</div></div></div></div>';
	}else{
		var appendString = '<div class="allUserMiniContainer dark"><img src="'+user.profile+'" class="userMiniProfile"><div class="userContent"><div class="userTitle">'+fullName+'</div><div class="userCity">'+lastSeen+' - '+cityName+'</div><div class="userActions"><div data-action="sendMessengerUserMessage" data-senderId="'+senderId+'" class="sendMessageAction actionBtn">Message</div><div data-action="sendMessengerUserMessage" data-senderId="'+senderId+'" class="sendOfferAction actionBtn">Send Offer</div></div></div></div>';
	}
	

	$(".messengerUserResults").append(appendString);

}

function getLastSeen(timestamp){
	var today = new Date();
	var diffMs = (today - timestamp); // milliseconds between now & timestamp
	var diffDays = Math.floor(diffMs / 86400000); // days
	var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
	var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

	if(diffDays > 10){
		return  timestamp.getDate() + " " + monthString[timestamp.getMonth()];
	}else if(diffDays > 0){
		return diffDays + " days ago"
	}else if(diffHrs > 0){
		return diffHrs + " hrs ago"
	}else if(diffMins > 0){
		return diffMins + " min ago"
	}else{
		return "just now";
	}

}


function searchUserQuery(searchQuery){

	$(".messengerRecentUsers").children('.contentLoader').show();
	var Activity = Parse.Object.extend("Activity");
	var query = new Parse.Query(Activity);
	query.equalTo('action','subscribed');
	query.equalTo('reference',loginData.username);
	query.descending('timestamp');
	if(searchQuery){
		searchQuery = toTitleCase(searchQuery);
		var fullName = searchQuery.split(' ');
		console.log(fullName);
		if(fullName.length == 2)
			query.equalTo('userFullName',fullName[0] + ' ' + fullName[1]);
		else{
			query.containedIn('userName',fullName);
		}
	}

	if(filterArray[0]){
		//onboarded today
		var today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		query.greaterThanOrEqualTo('timestamp',today);
	}
	if(filterArray[1]){
		//onboarded this month
		var today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setDate(1);
		query.greaterThanOrEqualTo('timestamp',today);
	}
	if(filterArray[2]){
		//male users
		if(!filterArray[3])
		query.equalTo('userGender','male');
	}
	if(filterArray[3]){
		//female users
		if(!filterArray[2])
		query.equalTo('userGender','female');
	}
	if(filterArray[4]){
		//bought tickets atleast once
		query.equalTo('userGender','Unknown');
	}
	if(filterArray[5]){
		//bought tickets more than once
		query.equalTo('userGender','Unknown');
	}

	query.limit(2000);
	query.find({
		success:function(result){
			userResultArray.length = 0;
			userResultArray = result;
			console.log(userResultArray);
			if(result.length > 0){

				$(".messengerUserResults").empty();
				var allUserString = "";
				if(result.length >= 25){
					var length = 25;
					remaining = result.length - 25;
					allUserString = '<div data-action="showNextSetUsers" data-index="25" class="allBtn actionBtn remainingUsers">'+remaining+' More Users ></div>';
				}else{
					var length = result.length;
				}
				for(i=0;i<length;i++){
					appendMessengerUser(result[i].get('sender'),result[i].get('userData'),result[i].get('userCity'),i%2,result[i].get('timestamp'));
				}
				$(".messengerRecentUsers").children('.contentLoader').hide();
				$(".messengerRecentUsers").children('.actionBtn').remove();
				$(".messengerRecentUsers").append(allUserString);
				var resultText = result.length + " Users Found";
				$(".messengerRecentUsers").children('.contentTitle').html(resultText);
				$(".remainingUsers").click(function(){
						if($(this).attr('data-action') == 'showNextSetUsers'){
							showNextSetUsers($(this));
						}
				});

			}else{
				//No Results Found
				$(".messengerUserResults").empty();
				$(".messengerRecentUsers").children('.actionBtn').remove();
				$(".messengerRecentUsers").children('.contentTitle').html('No users with this Search Query');
				$(".messengerRecentUsers").children('.contentLoader').hide();
			}
		}
	});	

}

function showNextSetUsers(action){
	var index = parseInt(action.attr('data-index'));
	console.log(index);
	var totalLength = userResultArray.length;
	var diff = totalLength - index - 25;
	console.log(diff);
	$(".messengerRecentUsers").children('.actionBtn').remove();
	length = index + 25;
	for(i=index;i<length;i++){
		//console.log(userResultArray[i]);
		appendMessengerUser(userResultArray[i].get('sender'),userResultArray[i].get('userData'),userResultArray[i].get('userCity'),i%2,userResultArray[i].get('timestamp'));
	}
	var remaining = userResultArray.length - index - 25;
	var newIndex = index + 25;
	var allUserString = '<div data-action="showNextSetUsers" data-index="'+newIndex+'" class="allBtn actionBtn remainingUsers">'+remaining+' More Users ></div>';
	$(".messengerRecentUsers").append(allUserString);

	$(".remainingUsers").click(function(){
		if($(this).attr('data-action') == 'showNextSetUsers'){
					showNextSetUsers($(this));
		}
	});

}


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}