// this is the functions 

$(function() {
    $( "#tabs" ).tabs();
    $( "#tabs2" ).tabs();
    setDriverHeight();
  });

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