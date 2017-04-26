$(document).ready(function(){
    
	if(localStorage.loginData){
		loginData = JSON.parse(localStorage.loginData);
		console.log(loginData);
		if(loginData.timestamp != "NA"){
			$(".clientCoverImg").attr('src',loginData.cover);
			$(".clientName").html(loginData.clientTitle);
		}
		$(".venueNameSpan").html(loginData.clientTitle);
		console.log('Analysing Event Analysis');
		setHomeAnalysis(loginData.username,loginData.clientName,loginData.city);
		getUpcomingEvents(loginData.username,loginData.clientName,loginData.city);
		getPastEvents(loginData.username,loginData.clientName,loginData.city);
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
 var weekString = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
function setHomeAnalysis(reference,venueName,city){
  console.log(reference);


  //Getting the total number of Events for the current club

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
  query.equalTo('venue',venueName);
  query.count({
  	success:function(count){
  		$(".eventCountN").html(count);	
  		$(".eventSummary").children('.contentLoader').hide();
  	}
  });

  //Getting the total number of Queries
  
  var Activity = Parse.Object.extend("Activity");
  var queryActivity = new Parse.Query(Activity);
  queryActivity.containedIn('reference',[reference,venueName]);
  queryActivity.equalTo('action','event_view');
  queryActivity.count({
  	success:function(count){
  		var newCount = 4785 + count;
  		$(".eventViewCountN").html(newCount);	
  		$(".totalEventSummary").children('.contentLoader').hide();
  	}
  });

}

function getUpcomingEvents(reference,venueName,city){

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
	query.limit(1000);
	query.find({
	    success:function(result){
	    	if(result.length > 0){
	    		//console.log("Found Upcoming Event");
	    		
	    		for(i=0;i<result.length;i++){
	    			appendUpcomingEvent(result[i],city[0].toLowerCase());	
	    		}

	    		$(".eventMiniContainer").click(function(){
					$(this).children('.eventContent').children('.eventDropdown').toggle();
					$(this).toggleClass('eventSelected');
				});
	    		
	    	}
	    	else{
	    		//console.log("No Upcoming Events");
	    	}
	    	$(".eventsUpcomingEvents").children('.contentLoader').hide();
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

function appendUpcomingEvent(event,city){

	
	var startTime = event.get('startTime');
	var eventId = event.get('eventId');
	var shortEventId = eventId.split('_');

	var eventLink = 'http://askgig.in/t/#'+city+shortEventId[1];
	startTime.subHours(5.5)
		  var hours = startTime.getHours();
		  var min = startTime.getMinutes();
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

   	var eventSubtitle = weekString[startTime.getDay()] + " @ " + timeString;
   	
   	var eventTitle = event.get('title');
   	console.log(eventTitle);
   	if(eventTitle.length > 50){
   		eventTitle = eventTitle.substring(0,50) + "...";
   	}
   	console.log(eventTitle);
	var appendString = '<div class="eventMiniContainer dark '+eventId+'"><div class="eventContent"><div class="eventDateContainer"><div class="eventDateMonth">'+monthString[startTime.getMonth()].toUpperCase()+'</div><div class="eventDateTitle">'+startTime.getDate()+'</div></div><div class="eventTitle">'+eventTitle+'</div><div class="eventSubtitle">'+eventSubtitle+'</div><div class="eventViewNumber">-</div><div class="eventViewTitle">Views</div><div class="eventDropdown hidden"><div class="eventDropLeftSection"><div class="dropDownTitle">Artist</div><div class="dropDownSubTitle">'+event.get('artists')+'</div><div class="dropDownTitle">Pricing</div><div class="dropDownSubTitle">'+event.get('pricing')+'</div></div><div class="eventDropRightSection"><div class="dropDownTitle">Event Link</div><a target="_blank" href="'+eventLink+'"><div class="dropDownSubTitle dropEventLink">'+eventLink+'</div></a><div data-action="eventsEventBroadcastMessenger" data-eventId="'+eventId+'" class="dropDownLink openIcon">Broadcast on Messenger</div><div data-action="eventsEventBroadcastSMS" data-eventId="'+eventId+'" class="dropDownLink openIcon">Broadcast on SMS</div><div data-action="eventsApplyTicketing" data-eventId="'+eventId+'"class="dropDownLink openIcon">Turn on Ticketing</div></div></div></div></div>';
	$(".eventsUpcomingEvents").append(appendString);
	getEventViews(eventId);
}


function getEventViews(eventId){

	  var Activity = Parse.Object.extend("Activity");
	  var queryActivity = new Parse.Query(Activity);
	  queryActivity.containedIn('reference',[loginData.username,loginData.clientName]);
	  queryActivity.equalTo('action','event_view');
	  queryActivity.equalTo('eventId',eventId);
	  queryActivity.count({
	  	success:function(count){
	  		
	  		var element = "."+eventId;
	  		$(element).children('.eventContent').children('.eventViewNumber').html(count);
	  	}
	  });

}

function getPastEvents(reference,venueName,city){

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
	query.lessThan('startTime',d);
	query.descending('startTime');
	query.limit(10);
	query.find({
	    success:function(result){
	    	if(result.length > 0){
	    		//console.log("Found Upcoming Event");
	    		
	    		for(i=0;i<result.length;i++){
	    			appendPastEvent(result[i],city[0].toLowerCase());	
	    		}

	    		$(".pastEventMiniContainer").click(function(){
					$(this).children('.eventContent').children('.eventDropdown').toggle();
					$(this).toggleClass('eventSelected');
				});
	    		
	    	}
	    	else{
	    		console.log("No Past Events");
	    	}
	    	$(".eventsPastEvents").children('.contentLoader').hide();
	    }
	});
}

function appendPastEvent(event,city){

	var startTime = event.get('startTime');
	var eventId = event.get('eventId');
	var shortEventId = eventId.split('_');

	var eventLink = 'http://askgig.in/t/#'+city+shortEventId[1];
	startTime.subHours(5.5)
		  var hours = startTime.getHours();
		  var min = startTime.getMinutes();
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

   	var eventSubtitle = weekString[startTime.getDay()] + " @ " + timeString;
   	var eventTitle = event.get('title');
   	console.log(eventTitle);
   	if(eventTitle.length > 50){
   		eventTitle = eventTitle.substring(0,50) + "...";
   	}
   	console.log(eventTitle);

	var appendString = '<div class="eventMiniContainer pastEventMiniContainer dark '+eventId+'"><div class="eventContent"><div class="eventDateContainer"><div class="eventDateMonth">'+monthString[startTime.getMonth()].toUpperCase()+'</div><div class="eventDateTitle">'+startTime.getDate()+'</div></div><div class="eventTitle">'+eventTitle+'</div><div class="eventSubtitle">'+eventSubtitle+'</div><div class="eventViewNumber">-</div><div class="eventViewTitle">Views</div><div class="eventDropdown hidden"><div class="eventDropLeftSection"><div class="dropDownTitle">Artist</div><div class="dropDownSubTitle">'+event.get('artists')+'</div><div class="dropDownTitle">Pricing</div><div class="dropDownSubTitle">'+event.get('pricing')+'</div></div><div class="eventDropRightSection"><div class="dropDownTitle">Event Link</div><a target="_blank" href="'+eventLink+'"><div class="dropDownSubTitle dropEventLink">'+eventLink+'</div></a></div></div></div></div>';
	$(".eventsPastEvents").append(appendString);
	getEventViews(eventId);
}
