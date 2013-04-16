// this is the functions 

$(function() {
	

    $( "#tabs" ).tabs();
    $( "#tabs2" ).tabs();
	//going to have some fun to see if we can create our own lightbox effect!
	$('.flex').click(function(){
		$('.form').show('clip');
		loadmap();
		//now to change its postition so that it is at the top...
		});   
	$('.lol').click(function(){
		$('.form').hide('clip');
	});
	$(document).keyup(function(e){
		if(e.which == 27)
		{
			if($('.form').css('display') != 'none')
				$('.form').hide('clip');
		};
		if(e.which == 66 && e.ctrlKey)
		{
			$('.form').show('clip');
			loadmap();
		};
	});
	$('.footer-inner img').click(function(){
		$('.form').hide('clip');
	});

	$('#date_input').val(new Date().toJSON().slice(0,10));

    //this is a test to see a clock in the corner.
	var inters = setInterval(
	 function()
	 {
	 	$.ajax({
	        	url: '/test',
	        	type: 'GET',
	        	contentType: 'application/json; charset=utf-8',
	        	dataType: 'text',
	        	success: function(result) {
	            	if(result != "none")
	            	{
	            		alert("new booking added!");
	            	}
	           	}
    		});

	 }, 30000);
	var inter = setInterval(
		function()
		{
			$('.tableOfJobs').load('/table');
		},10000);
	$('.tableOfJobs').click(function(){
		$.ajax({
	        	url: '/test',
	        	type: 'GET',
	        	contentType: 'application/json; charset=utf-8',
	        	dataType: 'text',
	        	success: function(result) {
	            	if(result != "none")
	            	{
	            		alert("new booking added!");
	            	}
	           	}
    		});
	});
	// this will refresh the table, if there is a new entry.
	// $('.flex').fancybox(
	// {
	// 	type: 'ajax',
	// 	afterClose: function(){
	// 		alert('done!');
	// 	}
	// }
	// );
	dragRows();
	
	//need to make the driver divs droppable
	 $('#DriversAvail div').droppable({
	 	tolerance:'pointer',
	 	hoverClass: "drop-hover" ,
	 	drop:function(event, ui){
	 		//lets add the dropped driver to the lower list
	 		var testDiv = '<div class="drivers drivers_uavail"> '+$(this).html()+'</div>';
	 		$('.drivers_unavil').append(testDiv);
			//remove the one it was dropped on
			$(this).remove();
	 	},
	 });

	var pacContainerInitialized = false; 
    $('#pickup_input').keypress(function() { 
            if (!pacContainerInitialized) { 
                    $('.pac-container').css('z-index', '9999'); 
                    pacContainerInitialized = true; 
            } 
    }); 	
    // Code to add a booking from the create booking screen TODO- add accounts
    $('#submitBooking').click(function(){
    	//alert($('#isAccount').val());
    	if($('#is_Account').prop('checked'))
    	{
    		//hid current form and show the account one.... which i need to write still.....
    		$('.form-inner').hide('slide',{ direction: "left" }, 1000);
    		$('.acc-form').show('slide', { direction: "right" }, 1000);

    	}
    	else
    	{

    		// need all the available details from the form.
    		//TODO: work out the leave time.
    		var pickup = $('#pickup_input').val();
	    	
	    	//due to the async nature of the google maps functions need to do it this way:
	    	getLeavetime(pickup,function(result)
	    	{
	    		//result is the time in seconds google thinks it takes to travel from bodmin to the pickup
	    		//as it is an async call we need to wait for that o finish before we do anything else
	    		booking = new Object();
	    		booking.pickup = pickup;
	    		booking.date = $('#date_input').val();
	    		booking.time = $('#time_input').val();
	    		booking.travelTime = result;
	    		booking.destination = $('#destin_input').val();
	    		booking.num_of_pass = $('#pass_no_input').val();
	    		booking.cus_name = $('#cust_name_input').val();

	    		//now going to do an ajax request to pass the variables in to add it to the database, then reload the table.

	    		$.ajax({
	        	url: '/add/',
	        	type: 'POST',
	        	contentType: 'application/json; charset=utf-8',
	        	data: JSON.stringify(booking),
	        	dataType: 'text',
	        	success: function(result) {
	            		console.log(result);
		           	}
	    		});

	    	});

    		
    		
    		//alert(getLeavetime($('#pickup_input').val()));
    	}
    });
  });



function dragRows()
{
	 $("tr").draggable({
              helper:function(event) {
              		var t = $(event.target).closest('tr').html();
              		var l = [];
              		l = t.split('</td>');
              		
              		for(var i = 0; i < l.length;i++)
              		{
              			l[i] = l[i].substring((l[i].indexOf('<td>'))+4,l[i].length);
              			
              			
              		}

					var tableDrag = '<div class="tableDrag">';
					tableDrag += '<div class="drag-head">'+l[0]+'</div>';
					tableDrag += 'Time: '+l[1]+'<br/>';
					tableDrag += 'Pickup: '+l[2]+'<br/>';
					tableDrag += 'Destination: '+l[3]+'<br/>';
					tableDrag += '</div>';
              		

                  return $(tableDrag);
              },
              cursorAt: { left: -20}
          });
	// $(document).bind('mousemove', function(e){
	//     $('#test').css({
	//        left:  e.pageX,
	//        top:   e.pageY
	//     });

	// });
}

// setting the hieght of the driver_avail divs
function setDriverHeight()
{
	var i = 0;
	// find out how many there are in the drivers div.
	$('#DriversAvail div').each(function(){
		i++;
	});

	//get the overall hieght of the containing div
	var h = $("#DriversAvail").height() -i;
	h = h/i;
	h= h-5;
	$('#DriversAvail div').each(function(){
		$(this).css('height',h);
		$(this).css('color','red');
	});
}

// This is the code for the drop down from the google maps api
// do map stuff function
function loadmap()
{
	var mapOptions = {
          center: new google.maps.LatLng(50.468213,-4.722118),
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
	map = new google.maps.Map(document.getElementById('custMap'),
          mapOptions);
	//pickup.
	var input = document.getElementById('pickup_input');
	//destin
	var input2 = document.getElementById('destin_input');
	var autocomplete ;
	var autocomplete2;

	var defaultBounds = new google.maps.LatLngBounds(
	new google.maps.LatLng(50.445481,-4.739628),
  	new google.maps.LatLng(50.508623,-4.692593));

        //need to set bounds to cornwall/bodmin
    var options = {
        type: ['(regions)'],
        bounds: defaultBounds,
      	componentRestrictions: {country: 'GB'}
        };
	autocomplete = new google.maps.places.Autocomplete(input,options);
	autocomplete2 = new google.maps.places.Autocomplete(input2,options);
	google.maps.event.addListener(autocomplete2 , 'place_changed', function() {
  		var objLocation = autocomplete2.getPlace();
  		
  			
  		//makeDirections($('#custPickup'),$('#custDest'));
	});
		google.maps.event.addListener(autocomplete , 'place_changed', function() {
  		var objLocation = autocomplete.getPlace();

  			
  		//makeDirections($('#custPickup'),$('#custDest'));
	});

}
function getLeavetime(pickup,callback)
{
	var pickupLocation = pickup;
	var leaveLocation = "Bodmin";
	var directionsService = new google.maps.DirectionsService();
	var request = { 
		origin: leaveLocation,
		destination: pickupLocation,
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem:google.maps.UnitSystem.IMPERIAL
	};
	
	directionsService.route(request,function(result,status){
		if(status==google.maps.DirectionsStatus.OK)
		{

			callback(result.routes[0].legs[0].duration.value);
			
		}
	
		
	});

	
}
function makeDirections(pickup,destination)
{
	//get the values from the 2 text boxes
	var pickLoc = pickup.val();
	var destLoc = destination.val();

	var arr = ['cat and fiddle','callywith','cornish garage'];

	for (var i =0; i < arr.length; i++)
	{
		if(pickLoc.indexOf(arr[i]) >= 0 && pickLoc.indexOf('Bodmin') < 0)
		{
			pickLoc += ', Bodmin';
			$('#pickup_input').val($('#pickup_input').val()+',Bodmin');

		}	
		else if(destLoc.indexOf(arr[i]) >= 0 && destLoc.indexOf('Bodmin') < 0)
		{
			destLoc += ', Bodmin';
			$('#destin_input').val($('#destin_input').val()+',Bodmin');
		}
	}
	var directionsDisplay;

	var directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer();
	directionsDisplay.setMap(map);

	var request = { 
		origin: pickLoc,
		destination: destLoc,
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem:google.maps.UnitSystem.IMPERIAL

	};
	directionsService.route(request, function(result, status) {
	    if (status == google.maps.DirectionsStatus.OK) {
	      directionsDisplay.setDirections(result);
	      //testing time and distance
	      $('#custMile span').text((result.routes[0].legs[0].distance.text).replace('mi',''));
	      $('#custTime').text(result.routes[0].legs[0].duration.text);
	      	//costings......

			if (destination.val().indexOf("Bodmin") >= 0 && pickup.val().indexOf("Bodmin") >= 0  )
			{
				//then we need to do local milage for cost
				var cost = 0;
				var dis = parseInt((result.routes[0].legs[0].distance.text).replace('mi',''));
				console.log(dis);
				if(dis < 1)
					cost = 3.00;
				else if(dis >= 1 && dis <= 2)
					cost = 3.50;
				else
					cost = 4.00
				$('#custCost span').text(cost);
			}
			else
			{
				//we need to look up the place against the cost form..... 
			}
	    }
  	});


}