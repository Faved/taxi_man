# Create your views here.
from django.http import HttpResponse
from django.utils import simplejson
from django.views.decorators.csrf import csrf_exempt
from django.template import Context
from django.template.loader import get_template
from django.contrib.auth.decorators import login_required
from django.core import serializers
from tamas.models import *
import datetime
from datetime import date, time, timedelta
import logging
log = logging.getLogger(__name__)

@login_required
def home(request):
	now = datetime.datetime.now()
	# need to filter the results for that day and order them by the time.
	startdate = date.today()
	enddate = startdate + timedelta(days=1)
	bookings = Booking.objects.filter(complete=0,cancelled=0,date__range=[startdate, enddate]).order_by('pickup_time')
	completeBookings = Booking.objects.filter(complete=1,cancelled=0,date__range=[startdate, enddate]).order_by('pickup_time')
	# need to also get the driver details for who is on rota today. TODO - need some sort of mechanisim to work on the times
	drivers = Rotas.objects.filter(date__range=[startdate,enddate])
	# we need to split the drivers into on jobs and available...
	tempArray = []
	for b in bookings:
		if b.driver != None:
			tempArray.append(b.driver.id)
	driverAvail = []
	driverBusy = []
	for d in drivers:
		if d.id in tempArray:
			driverBusy.append(d)
		else:
			driverAvail.append(d)
	
	t = get_template('content.html')
	html = t.render(Context({'time':now,'bookings':bookings,'driversAvail':driverAvail,"driversUnavail":driverBusy,"completebookings":completeBookings}))
	# log it
	log.debug(request.user.username+' - loaded all jobs from home')
	return HttpResponse(html)

def table(request):
	now = datetime.datetime.now()
	# need to filter the results for that day and order them by the time.
	startdate = date.today()
	enddate = startdate + timedelta(days=1)
	bookings = Booking.objects.filter(complete=0,cancelled=0,date__range=[startdate, enddate]).order_by('pickup_time')
	t = get_template('table.html')
	html = t.render(Context({'time':now,'bookings':bookings}))
	return HttpResponse(html)

def cleartable(request):
	now = datetime.datetime.now()
	# need to filter the results for that day and order them by the time.
	startdate = date.today()
	enddate = startdate + timedelta(days=1)
	bookings = Booking.objects.filter(complete=1,cancelled=0,date__range=[startdate, enddate]).order_by('pickup_time')
	t = get_template('completedTable.html')
	html = t.render(Context({'time':now,'completebookings':bookings}))
	return HttpResponse(html)

@csrf_exempt	
def api(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		idCode = ""
		try:
			name = data[0]
			fromPlace = data[1]
			destin = data[2]
			time = data[3]
			info = data[4]
			b = Booking(pickup_address=fromPlace,no_passengers=1,destin_address=destin,leave_time=time,pickup_time=time,customer_name=name,date=datetime.datetime.now(),extra_info=info)
			b.save()
			idCode = b.pk
		except:
			HttpResponseServerError("Malformed data!")
		
		message = idCode
	else:
		message = "fail"
	return HttpResponse(message)

# This is the url call to add a booking, it is simalar to the api call.
@csrf_exempt
def add(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		# access the object data by doing data['value name']
		# create a date object
		date_array = data['date'].split('-')
		jobDate = datetime.date(int(date_array[0]),int(date_array[1]),int(date_array[2]))
		# create a time object for leave time....
		temptime = data['time'].split(':')
		pickup_time = datetime.time(int(temptime[0]),int(temptime[1]))
		# to make it work we need to create a datetime object frm the time
		tempdate = datetime.date(2010,8,27)
		tempdate2 = datetime.datetime.combine(tempdate,pickup_time)
		temp_leavedatetime = tempdate2 - timedelta(seconds=data['travelTime'])
		leave_time = temp_leavedatetime.time()
		# need to getthe user who is submitting
		user = request.user
		# lets make a booking object
		b = Booking(pickup_address=data['pickup'],destin_address=data['destination'],date=jobDate,leave_time=leave_time,pickup_time=pickup_time,entered_by=user,no_passengers=data['num_of_pass'],customer_name=data['cus_name'],vehicle_type=data['vehicle'])
		b.save()
		# log it
		log.debug(request.user.username+' - Added new booking to the database, added job id: '+unicode(b.pk))
		return HttpResponse("added")
	else:
		# log it
		log.debug(request.user.username+' - Tried to add a new booking but the method was incorrect')
		return HttpResponse("incorrect format")

#lets get the booking info
@csrf_exempt
def getBookingInfo(request):
	if request.method == 'POST':
		jobno = simplejson.loads(request.body)
		b = Booking.objects.filter(id=int(jobno))
		listofData = list(b)
		# need to check to see if it is an account or not
		if b[0].account != None:
			account = Account.objects.filter(id=b[0].account.id)
			listofData += list(account)
		if b[0].driver != None:
			driver = Driver.objects.filter(id=b[0].driver.id)
			listofData += list(driver)
		returnData = serializers.serialize("json",listofData)
		# log it
		log.debug(request.user.username+' - Requested booking info for job: '+jobno)
	return HttpResponse(returnData,mimetype='application/json')

# cancel a booking
@csrf_exempt
def cancelBooking(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		b = Booking.objects.get(id=int(data))
		b.cancelled = True
		b.save()
		# log it
		log.debug(request.user.username+' - Cancelled Job: '+data)
	return HttpResponse("OK")

# this is the url call to add a driver to a booking
@csrf_exempt
def addDriverToBooking(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		b = Booking.objects.get(id=int(data['jobid']))
		d = Driver.objects.get(id=int(data['driverid']))
		b.driver = d
		b.save()
		# log it
		log.debug(request.user.username+' - Added driver: '+data['driverid']+' to booking: '+data['jobid'])
	return HttpResponse("OK")
# This will remove a driver from a job
@csrf_exempt
def removeFromJob(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		b = Booking.objects.get(id=int(data))
		driver = b.driver
		b.driver = None
		b.save()
		# log it
		log.debug(request.user.username+' - Removed driver: '+unicode(driver.id)+' from job number: '+data)
	return HttpResponse("OK")

# This is a test view
def CreateLogFile(data):
	fo = open("log.txt", 'a')
	fo.write(data)
	fo.write("\n")
	fo.close()
	


#This is to set a job as "clear" ie complete
@csrf_exempt
def setBookingClear(request):
	if request.method == 'POST':
		jobno = simplejson.loads(request.body)
		b = Booking.objects.get(id=int(jobno)) 
		b.complete = True
		b.save()
		# log it
		log.debug(request.user.username+' - Cleared job: '+jobno)
	return HttpResponse("OK")


def login(request):
	return render_to_response('login.html',
        context_instance=RequestContext(request))



def time(request):
	now = datetime.datetime.now()
	time = now.time()
	t = get_template('header.html')
	html = t.render(Context({'time':time.strftime("%H:%M:%S %Z")}))
	return HttpResponse(html)

def test(request):
	bookings = Booking.objects.filter(complete=0,entered_by=None)
	if len(bookings) < 1:
		return HttpResponse("none");
	else:
		data = serializers.serialize("json", bookings)
		return HttpResponse(data)


def create(request):
	t = get_template('create.html')
	html =t.render(Context({}))
	return HttpResponse(html)