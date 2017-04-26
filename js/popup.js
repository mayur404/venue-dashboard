$(document).ready(function(){
    
	if(localStorage.loginData){
		loginData = JSON.parse(localStorage.loginData);
		console.log(loginData);
		if(loginData.timestamp != "NA"){
			$(".clientCoverImg").attr('src',loginData.cover);
			$(".clientName").html(loginData.clientTitle);
		}
	}

	$(".popupClose").click(function(){
		$(this).parent('.popupHeaderContainer').parent('.popupContainer').parent('.popup').hide();
	});

	$('.actionBtn').click(function(){
		handleAction($(this));
	});

});


function handleAction(action){

	//alert(action.attr('data-action'));
	switch(action.attr('data-action')){
		case 'messengerSendNewBroadcast':
			$('.broadcastMessage').show();
		break;
		case 'messengerBroadcastNewOffer':
			$('.broadcastOffers').show();
		break;
		case 'messengerEventBroadcast':
			$('.broadcastEvent').show();	
		break;
		case 'sendMessengerUserMessage':
			$('.broadcastUserMessage').show();	
		break;
		case 'sendMessengerUserOffer':
			$('.sendUserOffer').show();	
		break;
	}
}