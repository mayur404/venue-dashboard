$(document).ready(function(){
    	
	if(localStorage.loginData){
		loginData = JSON.parse(localStorage.loginData);
		console.log(loginData);
		if(loginData.timestamp != "NA"){
			$(".clientCoverImg").attr('src',loginData.cover);
			$(".clientName").html(loginData.clientTitle);
		}
		$(".venueNameSpan").html(loginData.clientTitle);

		$(".offerTitleInput").keyup(function(){
			var l = $(this).val().length;
			$('.offerTitleCountSpan').text(60 - l);
			$(this).css('border','1px solid #212121');
		});

		$(".offerDescInput").keyup(function(){
			var l = $(this).val().length;
			$('.offerDescCountSpan').text(80 - l);
			$(this).css('border','1px solid #212121');
		});

		$(".offerValidityInput").keyup(function(){
			var l = $(this).val().length;
			$('.offerValidityCountSpan').text(300 - l);
			$(this).css('border','1px solid #212121');
		});

		$(".offersAddOffer").children('.contentLoader').hide();

		$(".addOfferBtn").click(function(){
			var title = $('.offerTitleInput');
			var desc = $('.offerDescInput');
			var validity = $('.offerValidityInput');

			if(title.val() && desc.val() && validity.val()){
				$(".offersAddOffer").children('.contentLoader').show();
				addOfferToParse(title,desc,validity);
			}else{
				if(!title.val()){
					title.css('border','1px solid red');
				}	
				if(!desc.val()){
					desc.css('border','1px solid red');
				}
				if(!validity.val()){
					validity.css('border','1px solid red');
				}
			}

		});

		console.log("Set up Offers");
		//setHomeAnalysis(loginData.username,loginData.clientName);
		getOffers(loginData.username,loginData.clientName);
		//getUpcomingEvent(loginData.username,loginData.clientName,loginData.city);
		//getMessengerUsers(loginData.username,loginData.clientName,loginData.city);
	}

});

var cityCodeList = ["PUN","HYD","GOA","MUM","BLR"];
var cityNameList = ["Pune","Hyderabad","Goa","Mumbai","Bangalore"];

Parse.initialize("mbzon2lS3h92s4usHA74ZWirzs4kCKhE4R3bnvro");
Parse.serverURL = 'https://gigserver.herokuapp.com/parse';


function getOffers(reference,venueName){
	$(".offersAddOffer").children('.contentLoader').show();
	
	var Offer = Parse.Object.extend("Offers");
	var query = new Parse.Query(Offer);
	query.equalTo('reference',reference);
	query.ascending('status');
	query.find({
		success:function(result){
			if(result.length > 0){
				$(".rightFullContainer").empty();
				for(i=0;i<result.length;i++){
					appendOffer(result[i].get('title'),result[i].get('description'),result[i].get('validity'),result[i].get('status'),result[i].get('offerId'));
				}
				$(".offersAddOffer").children('.contentLoader').hide();
				$('.statusOfferBtn').click(function(){
					var action = $(this).attr('data-action');
					if(action == 'disableOffer'){
						disableOffer($(this));	
					}else{
						enableOffer($(this));	
					}
				});

			}else{
				//No Offers Warning
				console.log("No Offers");
				$(".offersAddOffer").children('.contentLoader').hide();
				$(".warnningContent").show();
			}
		}
	});
}

function addOfferToParse(title,desc,validity){

	var Offer = Parse.Object.extend("Offers");
	var query = new Parse.Query(Offer);
	query.count(function(count){
		console.log(count);
		count = count + 1;
		var offerId = 'o_'+count;
		var offer = new Offer();
		offer.set('title',title.val());
		offer.set('description',desc.val());
		offer.set('validity',validity.val());
		offer.set('offerId',offerId);
		offer.set('reference',loginData.username);
		offer.set('venueName',loginData.clientName);
		offer.set('city',loginData.city);
		offer.set('status','on');

		offer.save(null, {
				  success: function(event) {
				    console.log('New object created with objectId: ' + event.id);
				    $(".offersAddOffer").children('.contentLoader').hide();
				    getOffers(loginData.username,loginData.clientName);
				    clearOffersForm();
				  },
				  error: function(event, error) {
				    console.log('Failed to create new object, with error code: ' + error.message);
				  }
		});
	});
}

function appendOffer(title,desc,validity,status,offerId){

	if(status == 'on'){
		var appendString = '<div class="content offersLiveOffers"><div class="contentTitle">'+title+'</div><div class="contentSubTitleOffer">'+desc+'</div><div class="contentSubSubTitle">'+validity+'</div><div data-action="disableOffer" data-offerId="'+offerId+'" class="contentLink addIcon statusOfferBtn">Disable Offer</div></div>';
	}else{
		var appendString = '<div class="content offersDeadOffers"><div class="contentTitle">'+title+'</div><div class="contentSubTitleOffer">'+desc+'</div><div class="contentSubSubTitle">'+validity+'</div><div data-action="enableOffer" data-offerId="'+offerId+'" class="contentLink addIcon statusOfferBtn">Enable Offer</div></div>';
	}

	$('.rightFullContainer').prepend(appendString);

}

function disableOffer(offer){

	console.log("Disable Offer");
	var offerId = offer.attr('data-offerId');
	console.log(offerId);

	offer.parent('.content').removeClass('offersLiveOffers').addClass('offersDeadOffers');
	offer.text('Enable Offer');
	offer.attr('data-action','enableOffer');
	changeOfferStatus(offerId,'off');
}

function enableOffer(offer){

	console.log("Enable Offer");
	var offerId = offer.attr('data-offerId');
	console.log(offerId);

	offer.parent('.content').removeClass('offersDeadOffers').addClass('offersLiveOffers');
	offer.text('Disable Offer');
	offer.attr('data-action','disableOffer');
	changeOfferStatus(offerId,'on');
}

function changeOfferStatus(offerId,status){

	var Offer = Parse.Object.extend("Offers");
	var query = new Parse.Query(Offer);
	query.equalTo('offerId',offerId);
	query.find({
		success:function(result){
			console.log(result[0]);
			var updateOffer = result[0];
			updateOffer.set('status',status);
			updateOffer.save();
			console.log('Updated the Status of the Offer '+ offerId + ' to '+ status);
		}
	});

}

function clearOffersForm(){
	$('.offerTitleInput').val('');
	$('.offerDescInput').val('');
	$('.offerValidityInput').val('');
}
