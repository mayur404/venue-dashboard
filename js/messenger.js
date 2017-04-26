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
		getMessengerUsers(loginData.username,loginData.clientName,loginData.city);
		if(loginData.city!= 'null')
			getUpcomingEvent(loginData.username,loginData.clientName,loginData.city);
		else
			$('.messengerUpcomingEvent').remove();
		
	}

	


});

var cityCodeList = ["PUN","HYD","GOA","MUM","BLR"];
var cityNameList = ["Pune","Hyderabad","Goa","Mumbai","Bangalore"];

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
  			$(".messengerSummary").children('.contentLoader').hide();

  		}else{
  			console.log("Not Found");
  		}
  		
  	}
  });

  //Getting the total number of Queries

  var Activity = Parse.Object.extend("Activity");
  var query = new Parse.Query(Activity);
  query.containedIn('reference',[reference,venueName]);
  query.containedIn('action',['incoming','onboard']);
  query.count({
  	success:function(count){
  		var newCount = 12457 + count;
  		$(".queryCountN").html(newCount);	
  		$(".messengerQuerySummary").children('.contentLoader').hide();
  	}
  });
}

function getUpcomingEvent(reference,venueName,city){

	switch(city){
	    case "PUN":
	    var Event = Parse.Object.extend("Events");
	    break;
	    case "HYD":
	    var Event = Parse.Object.extend("Event_Hyd");
	    break;
	    case "GOA":
	    var Event = Parse.Object.extend("Event_Goa");
	    break;
	    case "MUM":
	    var Event = Parse.Object.extend("Event_Mum");
	    break;
	    case "BLR":
	    var Event = Parse.Object.extend("Event_Blr");
	    break;
  	}

	var query = new Parse.Query(Event);

	var d = new Date();
	d.setHours(5);
	d.setMinutes(30);
	d.setSeconds(0);


	query.equalTo('venue',venueName);
	query.greaterThanOrEqualTo('startTime',d);
	query.ascending('startTime');
	query.limit(10);
	query.find({
	    success:function(result){
	    	if(result.length > 0){
	    		//console.log("Found Upcoming Event");
	    		console.log(result[0].get('title'));
	    		$(".messengerUpcomingEventTitle").html(result[0].get('title'));
	    		$(".messengerUpcomingEventTime").html(getDateString(result[0].get('startTime')));

	    		$(".messengerUpcomingEvent").children('.actionBtn').attr('data-action','messengerEventBroadcast');
	    		$(".messengerUpcomingEvent").children('.actionBtn').attr('data-eventId',result[0].get('eventId'));
	    		}
	    	else{
	    		//console.log("No Upcoming Events");
	    		$(".messengerUpcomingEventTime").html('No Upcoming Events');

	    		$(".messengerUpcomingEvent").children('.actionBtn').attr('data-action','messengerEventBroadcast');
	    		$(".messengerUpcomingEvent").children('.actionBtn').attr('data-event-id',null);
	    	}
	    	$(".messengerUpcomingEvent").children('.contentLoader').hide();
	    }
	});
}

function getDateString(timestamp){

		  var eventDate = timestamp;
		  eventDate.subHours(5.5)
          var dateString = eventDate.getDate() + " " + monthString[eventDate.getMonth()];
          var hours = eventDate.getHours();

          var min = eventDate.getMinutes();
          if(min <10){
            min = "0"+min;
          }
          if(hours > 12){
            //PM Time
            hours = hours %12;

            var timeString = hours+":"+min+" PM";
          }else{
            hours = hours %12;
            if(hours == 0){
              hours = 12;
              var timeString = hours+":"+min+" PM";
            }else{
              var timeString = hours+":"+min+" AM";
            }
            //AM Time
          }
      

          return dateString.toUpperCase() + " @ " + timeString.toUpperCase();
}


function getMessengerUsers(reference,venueName,city){
	console.log(reference,venueName,city);
	var Activity = Parse.Object.extend("Activity");
	var query = new Parse.Query(Activity);
	query.equalTo('action','subscribed');
	query.equalTo('reference',reference);
	query.descending('timestamp');
	query.limit(2000);
	query.find({
		success:function(result){
			if(result.length >= 10){
				length = 10;
				remaining = result.length - 10;
				var allUserString = '<a href="../messenger-users"><div data-action="showAllMessengerUser" class="allBtn actionBtn">'+remaining+' More Users ></div></a>';
			}else{
				length = result.length;
				var allUserString = '<a href="../messenger-users"><div data-action="showAllMessengerUser" class="allBtn actionBtn">See all Users ></div></a>';
			}
			for(i=0;i<length;i++){
				appendMessengerUser(result[i].get('sender'),result[i].get('userData'),result[i].get('userCity'),i%2,result[i].get('timestamp'));
			}
			$(".messengerRecentUsers").children('.contentLoader').hide();
			
			$(".messengerRecentUsers").append(allUserString);
			$(".actionBtn").click(function(){
				handleAction($(this));
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
		var appendString = '<div class="userMiniContainer dark"><img src="'+user.profile+'" class="userMiniProfile"><div class="userContent"><div class="userTitle">'+fullName+'</div><div class="userCity">'+lastSeen+' - '+cityName+'</div><div class="userActions"><div data-action="sendMessengerUserMessage" data-senderId="'+senderId+'" class="sendMessageAction actionBtn">Message</div><div data-action="sendMessengerUserOffer" data-senderId="'+senderId+'" class="sendOfferAction actionBtn">Send Offer</div></div></div></div>';
	}else{
		var appendString = '<div class="userMiniContainer dark"><img src="'+user.profile+'" class="userMiniProfile"><div class="userContent"><div class="userTitle">'+fullName+'</div><div class="userCity">'+lastSeen+' - '+cityName+'</div><div class="userActions"><div data-action="sendMessengerUserMessage" data-senderId="'+senderId+'" class="sendMessageAction actionBtn">Message</div><div data-action="sendMessengerUserOffer" data-senderId="'+senderId+'" class="sendOfferAction actionBtn">Send Offer</div></div></div></div>';
	}
	

	$(".messengerRecentUsers").append(appendString);

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
