// this is the functions 

$(function() {
	

    $( "#tabs" ).tabs();
    $( "#tabs2" ).tabs();
	//going to have some fun to see if we can create our own lightbox effect!
	$('.flex').click(function(){
		$('.form').show('clip');
		loadmap();
		//now to change its postition so that it is at the top...
		var d = new Date();
		var currentHours = d.getHours(); 
		currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
		document.getElementById('time_input').value = currentHours+":"+d.getMinutes();
		});   
	$(document).keyup(function(e){
		if(e.which == 27)
		{
			if($('.form').css('display') != 'none')
			{
				$('.form').hide('clip');
				
			}	

		};
		if(e.which == 66 && e.ctrlKey)
		{
			$('.form').show('clip');
			loadmap();
			var d = new Date();
			var currentHours = d.getHours(); 
			currentHours = ( currentHours < 10 ? "0" : "" ) + currentHours;
			document.getElementById('time_input').value = currentHours+":"+d.getMinutes();
		};
	});
	$('.form-inner img').click(function(){
		$('.form').hide('clip');
		$('#bookingForm').find("input[type=text], textarea").val("");
	});
	var d = new Date();
	$('#date_input').val(d.toJSON().slice(0,10));
	

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
	dropRows();


	var pacContainerInitialized = false; 
    $('#pickup_input').keypress(function() { 
            if (!pacContainerInitialized) { 
                    $('.pac-container').css('z-index', '9999'); 
                    pacContainerInitialized = true; 
            } 
    }); 	
/*****************************************************************************************************

Search Form
******************************************************************************************************/
$('#jobSearch').submit(function(event){
	// cancels the form submission
    event.preventDefault();
    var search = new Object();
    search.startdate = $('#start_date').val();
    search.enddate = $('#end_date').val();
    search.driver = $('#driver_search').val();
    search.account = $('#account_search').val();
    console.log(search);
	$.ajax({
        	url: '/search/',
        	type: 'POST',
        	contentType: 'application/json; charset=utf-8',
        	data: JSON.stringify(search),
        	dataType: 'text',
        	success: function(result) 
        	{
        		console.log(result);
        		$('.results').html(result);          		
	       	}
		});


});
/*****************************************************************************************************

Submit a booking
******************************************************************************************************/
$('#bookingForm').submit(function(event){
    // cancels the form submission
    event.preventDefault();
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
	    		booking.cus_contact = $('#cust_contact_input').val();
	    		booking.vehicle = $('#vehicle_input').val();
	    		if($('#is_Account').prop('checked'))
	    			booking.isaccount = 'true';
	    		else
	    			booking.isaccount = 'false';
	    		booking.moreinfo = $('#info_input').val();
	    		booking.num_escorts = $('#num_escorts_input').val();
	    		booking.account = $('#account_input').val();

	    		//now going to do an ajax request to pass the variables in to add it to the database, then reload the table.

	    		$.ajax({
		        	url: '/add/',
		        	type: 'POST',
		        	contentType: 'application/json; charset=utf-8',
		        	data: JSON.stringify(booking),
		        	dataType: 'text',
		        	success: function(result) 
		        	{
		           		if(result == "added")
		           		{
		           			$('.form').hide('clip');
		           			//the booking has been added to the database so we need to reload the table
		           			$('#tabs-1').load('/table',function(){
		           				dragRows();

		           			});
		           			
		           			
		           		} 	
		           		else
		           			alert(result);
		           		//clear the form!
		           		$('#bookingForm').find("input[type=text], textarea").val("");
			       	}
	    		});

	    	});

    // do whatever you want here
});




/********************************************************************************************************
	
	Context Menus

	first is for the unavailable drivers
	followed by the table
	
/*********************************************************************************************************/
	$.contextMenu({
        selector: '.drivers_uavail_inner', 
        callback: function(key, options) {
        	switch(key)
        	{
        		case "clear":
        			var jobid = $(this).find('.jobid').text();
        			//we need to tell the system that this job is no complete
		        	$.ajax({
			        	url: '/setBookingClear/',
			        	type: 'POST',
			        	contentType: 'application/json; charset=utf-8',
			        	data: JSON.stringify(jobid),
			        	dataType: 'text',
			        	success: function(result) {
			            	
			           	}
		    		});
        			var text = $(this[0]).text();
        			//this removes the accordian element
        			
        			var thtml = $(this);
        			console.log(thtml[0].children);
        			thtml[0].removeChild(thtml[0].children[2]);
        			console.log(thtml[0].children);
        			$(this).fadeOut('slow',function(){$(this).remove();});
        			//now to add the driver back into the top divs...
        			var newDiv = '<div id="'+$(this).attr('id')+'" class="drivers_avail drivers">'+thtml[0].innerHTML+'</div>';

        			$('#DriversAvail').append(newDiv);
  					
  					$('#tabs-1').load('/table',function(){
		           				dragRows();
		           				dropRows();
		           			});
  					$('#tabs-2').load('/cleartable',function(){

  					});
        			break;
        		case "info":
        		//lets get the id of the job so that we can get the data.
        			var jobid = $(this).find('.jobid').text();
        			var thisRow = $(this);
        			//now we need to go ask the system for the information
        			getJobInfo(jobid,function(result){
        				var t = jQuery.parseJSON(result);
        				
        				$(thisRow).qtip({
	        						content:
	        						{
	        							text: t[1],
		        						title:
		        						{
											text: t[0],
											button: true,
										},
									},
									position:
									{
										my: 'right bottom',
										at: 'left bottom',
									},
			        				show:
			        				{
			        					event:false,
			        					ready:true,
			        				},
			        				hide: 
			        					false,
			        				style: 
			        				{
										classes: 'qtip-light qtip-shadow',
										width: '400px',
									},			
			        			});


        			});
        			break;
        		case "remove":
        			var jobid = $(this).find('.jobid').text();
        			var thisRow = $(this);
        			//we need to remove this driver from the job and then reload the job table
        			$.ajax({
			        	url: '/removeFromJob/',
			        	type: 'POST',
			        	contentType: 'application/json; charset=utf-8',
			        	data: JSON.stringify(jobid),
			        	dataType: 'text',
			        	success: function(result) {
			            	var text = thisRow.text();
		        			//this removes the accordian element
		        			thisRow.fadeOut('slow',function(){$(this).remove();});
		        			var thtml = thisRow;
		        			thtml[0].removeChild(thtml[0].children[2]);
		        			
		        			//now to add the driver back into the top divs...
		        			var newDiv = '<div id="'+thisRow.attr('id')+'" class="drivers_avail drivers">'+thtml[0].innerHTML+'</div>';

		        			$('#DriversAvail').append(newDiv);
		  					
		  					$('#tabs-1').load('/table',function(){
				           				dragRows();
				           				dropRows();
				           	});
			           	}
		    		});
        			break;

        			
        	}
        },
        items: {
            "clear": {name: "Clear", icon: ""},
            "info": {name: "Job Info",icon:""},
            "remove":{name: "Remove From Job",icon:""},

            
        }
    });
// FOR current jobs
	$.contextMenu({
        selector: '.tableOfJobs tr', 
        callback: function(key, options) {
        	switch(key)
        	{
        		case "info":
        			//lets get the id of the job so that we can get the data.
        			var jobid = $(this).find('.jobid').text();
        			var thisRow = $(this);
        			//now we need to go ask the system for the information
        			getJobInfo(jobid,function(result){
        				var t = jQuery.parseJSON(result);
        				
        				$(thisRow).find('.midtable').qtip({
	        						content:
	        						{
	        							text: t[1],
		        						title:
		        						{
											text: t[0],
											button: true,
										},
									},
									position:
									{
										my: 'top center',
										at: 'bottom center',
									},
			        				show:
			        				{
			        					event:false,
			        					ready:true,
			        				},
			        				hide: 
			        					false,
			        				style: 
			        				{
										classes: 'qtip-light qtip-shadow'
									},			
			        			});


        				});

        			break;
        		case "Cancel":
        			var thisrow = $(this);
        			// need to add in the code to cancel a booking, future scope would be a reason why it was canceled.
        			 $("#dialog-confirm").dialog({
							resizable: false,
							height:140,
							modal: true,
							buttons: {
								"Cancel Booking": function() {
									$( this ).dialog( "close" );
									//so the booking has been confirmed as wanting to cancel now we need to send the info to the django system
									var jobid = thisrow.find('.jobid').text();
									$.ajax({
							        	url: '/cancelBooking/',
							        	type: 'POST',
							        	contentType: 'application/json; charset=utf-8',
							        	data: JSON.stringify(jobid),
							        	dataType: 'text',
							        	success: function(result) {
							        		// It is also required that if there is a driver dispatched we need to be able to remove him from the list and add him back
							        		$('.drivers_uavail_inner').each(function(){
							        			var innerjob = $(this).find('.jobid').text();
							        			if(innerjob == jobid)
							        			{
							        				//then remove and add back to list
							        				var thtml = $(this);
								        			thtml[0].removeChild(thtml[0].children[2]);
								        			
								        			//now to add the driver back into the top divs...
								        			var newDiv = '<div id="'+$(this).attr('id')+'" class="drivers_avail drivers">'+thtml[0].innerHTML+'</div>';

								        			$('#DriversAvail').append(newDiv);
								        			$(this).fadeOut('slow',function(){$(this).remove();});
												}
							        		});
							            	$('#tabs-1').load('/table',function(){
						           				dragRows();
						           				dropRows();
						           			});
							           	}
						    		});
								},
								Cancel: function() 
								{
									$( this ).dialog( "close" );
								}
							}
							});
        			break;
        			
        	}
        },
        items: {
            "info": {name: "Job Information", icon: ""},
            "Cancel":{name:"Cancel Booking",icon:""}

            
        }
    });
//for completed jobs
$.contextMenu({
        selector: '.complete tr', 
        callback: function(key, options) {
        	switch(key)
        	{
        		case "info":
        			//lets get the id of the job so that we can get the data.
        			var jobid = $(this).find('.jobid').text();
        			var thisRow = $(this);
        			//now we need to go ask the system for the information
        			getJobInfo(jobid,function(result){
        				var t = jQuery.parseJSON(result);
        				
        				$(thisRow).find('.midtable').qtip({
	        						content:
	        						{
	        							text: t[1],
		        						title:
		        						{
											text: t[0],
											button: true,
										},
									},
									position:
									{
										my: 'top center',
										at: 'bottom center',
									},
			        				show:
			        				{
			        					event:false,
			        					ready:true,
			        				},
			        				hide: 
			        					false,
			        				style: 
			        				{
										classes: 'qtip-light qtip-shadow'
									},			
			        			});


        			});
        			break;
        	}
        },
        items: {
            "info": {name: "Job Information", icon: ""},
           
        }
    });
//for completed jobs
$.contextMenu({
        selector: '.results tr', 
        callback: function(key, options) {
        	switch(key)
        	{
        		case "info":
        			//lets get the id of the job so that we can get the data.
        			var jobid = $(this).find('.jobid').text();
        			var thisRow = $(this);
        			//now we need to go ask the system for the information
        			getJobInfo(jobid,function(result){
        				var t = jQuery.parseJSON(result);
        				
        				$(thisRow).find('.midtable').qtip({
	        						content:
	        						{
	        							text: t[1],
		        						title:
		        						{
											text: t[0],
											button: true,
										},
									},
									position:
									{
										my: 'top center',
										at: 'bottom center',
									},
			        				show:
			        				{
			        					event:false,
			        					ready:true,
			        				},
			        				hide: 
			        					false,
			        				style: 
			        				{
										classes: 'qtip-light qtip-shadow'
									},			
			        			});


        			});
        			break;
        	}
        },
        items: {
            "info": {name: "Job Information", icon: ""},
           
        }
    });












  });

function getJobInfo(jobid,callback)
{
	$.ajax({
		url: '/getBookingInfo/',
		type: 'POST',
		contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(jobid),
		dataType: 'text',
		success: function(result) {
				var d = jQuery.parseJSON(result);
				//we can test on the size of the returned to find out if it is an account or now
				var title ="";
				var text = "";
				var status = "";
				console.log(d);
				for(var i =0; i< d.length; i++)
				{
					switch(d[i].model)
					{
						case "tamas.booking":
							title = "Local";
	        				text = "<strong>Date: </strong>"+d[0].fields['date']+"<br/>"+
	        						"<strong>Leave Time:</strong> "+d[0].fields['leave_time']+", <strong>Pickup Time:</strong> "+d[0].fields['pickup_time']+"<br/>"+
	        						"<strong>Pickup Loc:</strong> "+d[0].fields['pickup_address']+" <br/>"+
	        						"<strong>Destination:</strong> "+d[0].fields['destin_address']+"<br/>"+
	        						"<strong>No. Passengers:</strong> "+d[0].fields['no_passengers']+"<br/>"+
	        						"<strong>Customer Name:</strong> "+d[0].fields['customer_name']+" <br/>"+
	        						"<strong>Customer Contact:</strong> "+d[0].fields['customer_contact']+"<br/>"+
	        						"<strong>Vehicle Type:</strong> "+d[0].fields['vehicle_type']+"<br/>"+
	        						"<strong>Extra Info:</strong> "+d[0].fields['extra_info']+'<br/>';
	        				break;
	        			case "tamas.account":
	        				title = d[i].fields['alias'];
							text = "<strong>Date: </strong>"+d[0].fields['date']+"<br/>"+
									"<strong>Leave Time:</strong> "+d[0].fields['leave_time']+", <strong>Pickup Time:</strong> "+d[0].fields['pickup_time']+"<br/>"+
	        						"<strong>Pickup Loc:</strong> "+d[0].fields['pickup_address']+" <br/>"+
	        						"<strong>Destination:</strong> "+d[0].fields['destin_address']+"<br/>"+
	        						"<strong>No. Passengers:</strong> "+d[0].fields['no_passengers']+"<br/>"+
	        						"<strong>Customer Name:</strong> "+d[0].fields['customer_name']+" <br/>"+
	        						"<strong>Customer Contact:</strong> "+d[0].fields['customer_contact']+"<br/>"+
	        						"<strong>Vehicle Type:</strong> "+d[0].fields['vehicle_type']+"<br/>"+
	        						"<strong>Extra Info:</strong> "+d[0].fields['extra_info']+'<br/>'+
	        						"<strong>Account Ref: </strong>"+d[i].fields['ref_no']+"<br/>"+
	        						"<strong>Account Contact: </strong>"+d[i].fields['contact_number']+"<br/>"+
	        						"<strong>Escort Req: </strong>"+d[0].fields['num_escorts'];
	        				break;
	        			case "tamas.driver":
	        				text += "<br/><strong class='red'>**Job Dispatched**</strong><br/>"+
	        						"<strong>Driver Name: </strong>"+d[i].fields['name']+"<br/>"+
	        						"<strong>Driver Callsign:</strong> "+d[i].fields['callsign']+'<br/>'+
	        						"<strong>Driver Contact: </strong>"+d[i].fields['contact_number'];
	        				break;
	        		}
				}

				var tArray = new Array();
				tArray.push(title);
				tArray.push(text);
				var sendback = JSON.stringify(tArray);
				callback(sendback);
			}
		});
}


/*
 * Common dialogue() function that creates our dialogue qTip.
 * We'll use this method to create both our prompt and confirm dialogues
 * as they share very similar styles, but with varying content and titles.
 */
function dialogue(content, title) {
	/* 
	 * Since the dialogue isn't really a tooltip as such, we'll use a dummy
	 * out-of-DOM element as our target instead of an actual element like document.body
	 */
	$('<div />').qtip(
	{
		content: {
			text: content,
			title: title
		},
		position: {
			my: 'center', at: 'center', // Center it...
			target: $(window) // ... in the window
		},
		show: {
			ready: true, // Show it straight away
			modal: {
				on: true, // Make it modal (darken the rest of the page)...
				blur: false // ... but don't close the tooltip when clicked
			}
		},
		hide: false, // We'll hide it maunally so disable hide events
		style: 'qtip-light qtip-rounded qtip-dialogue', // Add a few styles
		events: {
			// Hide the tooltip when any buttons in the dialogue are clicked
			render: function(event, api) {
				$('button', api.elements.content).click(api.hide);
			},
			// Destroy the tooltip once it's hidden as we no longer need it!
			hide: function(event, api) { api.destroy(); }
		}
	});
}
function Confirm(question, callback)
{
	// Content will consist of the question and ok/cancel buttons
	var message = $('<p />', { text: question }),
		ok = $('<button />', { 
			text: 'Ok',
			click: function() { callback(true); }
		}),
		cancel = $('<button />', { 
			text: 'Cancel',
			click: function() { callback(false); }
		});

	dialogue( message.add(ok).add(cancel), 'Attention' );
}
 

//need a function to add clicks to the new created elements
function addClick()
{
	$('.drivers_uavail_inner').each(function(){
	 	$(this).click(function(){
	 		var t = $(this).find('.jobid').text();
			alert(t);
	 	});
	 })
}
/********************************************************************************************************
	
		Dispatch Code
	
/*********************************************************************************************************/
function dropRows()
{

	
	//need to make the driver divs droppable
	 $('#DriversAvail div').droppable({
	 	tolerance:'pointer',
	 	hoverClass: "drop-hover" ,
	 	drop:function(event, ui){
	 		
			//need some magic to happen which makes the job remove from the list and set it to being assigned on the database
			var driverId = $(this).find('.driverid').text();
			//As long as the id is always the first column on the table this this works
			var jobId = ui.draggable[0].cells[0].textContent;
			var done = false;
			$('.drivers_uavail_inner').each(function(){
				var temp_jobid = $(this).find('.jobid').text();
				if(temp_jobid == jobId)
					done = true;
			});
			if(done)
			{
				console.log('done');
				return;
			}
				


			var num_escorts = ui.draggable[0].cells[7].textContent;
			var details = new Object();
			var thisObj = $(this);
			if(parseInt(num_escorts) > 0)
			{
				var height = 0;
				//so we have some escorts, so we need to prompt for them.
				switch(parseInt(num_escorts))
				{
					case 1:
						$('#es1').removeClass('hidden');
						height = 220;
						break;
					case 2:
						$('#es1').removeClass('hidden');
						$('#es2').removeClass('hidden');
						height = 270;
						break;
					case 3:
						$('#es1').removeClass('hidden');
						$('#es2').removeClass('hidden');
						$('#es3').removeClass('hidden');
						height = 320;
						break;
					case 4:
						$('#es1').removeClass('hidden');
						$('#es2').removeClass('hidden');
						$('#es3').removeClass('hidden');
						$('#es4').removeClass('hidden');
						height = 400;
						break;
				}
				$("#dialog-escort").dialog({
					resizable: false,
					height: height,
					modal: true,
					buttons: {
						"Ok": function() {
							$( this ).dialog( "close" );
							
							details.escort1 = $('#esc1').val();
							details.escort2 = $('#esc2').val();
							details.escort3 = $('#esc3').val();
							details.escort4 = $('#esc4').val();
							details.driverid = driverId;
							details.jobid = jobId;
							$.ajax({
					        	url: '/addDriverToBooking/',
					        	type: 'POST',
					        	contentType: 'application/json; charset=utf-8',
					        	data: JSON.stringify(details),
					        	dataType: 'text',
					        	success: function(result) {
					            	//as the job has now been dispatched we need to do something to let the user know.
					            	ui.draggable[0].cells[6].innerHTML = "<img src='/static/Tick-32.png' />";
					           	}
				    		});
				    		var thtml = thisObj;
							//lets add the dropped driver to the lower list
					 		var testDiv = '<div id="'+thisObj.attr('id')+'" class="drivers drivers_uavail_inner">'+thisObj.html()+'<span class="hidden jobid">'+jobId+'</span></div>';
					 		$('.drivers_unavil').append(testDiv);
							//remove the one it was dropped on
							thisObj.remove();
							addClick();
							$('.es').each(function(){
								$(this).addClass('hidden');
							});
						},
						Cancel: function() 
						{
							$( this ).dialog( "close" );
							$('.es').each(function(){
								$(this).addClass('hidden');
							});
						}
					}
					});
				
			}
			else
			{
				details.driverid = driverId;
				details.jobid = jobId;
				$.ajax({
		        	url: '/addDriverToBooking/',
		        	type: 'POST',
		        	contentType: 'application/json; charset=utf-8',
		        	data: JSON.stringify(details),
		        	dataType: 'text',
		        	success: function(result) {
		            	//as the job has now been dispatched we need to do something to let the user know.
		            	ui.draggable[0].cells[6].innerHTML = "<img src='/static/Tick-32.png' />";
		           	}
	    		});
	    		var thtml = $(this);
				//lets add the dropped driver to the lower list
		 		var testDiv = '<div id="'+$(this).attr('id')+'" class="drivers drivers_uavail_inner">'+$(this).html()+'<span class="hidden jobid">'+jobId+'</span></div>';
		 		$('.drivers_unavil').append(testDiv);
				//remove the one it was dropped on
				$(this).remove();
				addClick();
			}
			

			
	 	},
	 });
}

function dragRows()
{
	 $(".tableOfJobs tr").draggable({
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
	console.log('triggered');
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