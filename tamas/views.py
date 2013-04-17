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

@login_required
def home(request):
	now = datetime.datetime.now()
	# need to filter the results for that day and order them by the time.
	startdate = date.today()
	enddate = startdate + timedelta(days=1)
	bookings = Booking.objects.filter(complete=0,driver=None,date__range=[startdate, enddate]).order_by('pickup_time')
	# need to also get the driver details for who is on rota today. TODO - need some sort of mechanisim to work on the times
	drivers = Rotas.objects.filter(date__range=[startdate,enddate])
	t = get_template('content.html')
	html = t.render(Context({'time':now,'bookings':bookings,'drivers':drivers}))
	return HttpResponse(html)

def table(request):
	now = datetime.datetime.now()
	# need to filter the results for that day and order them by the time.
	startdate = date.today()
	enddate = startdate + timedelta(days=1)
	bookings = Booking.objects.filter(complete=0,date__range=[startdate, enddate]).order_by('pickup_time')
	t = get_template('table.html')
	html = t.render(Context({'time':now,'bookings':bookings}))
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
		return HttpResponse("added")
	else:
		return HttpResponse("incorrect format")


# this is the url call to add a driver to a booking
@csrf_exempt
def addDriverToBooking(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		b = Booking.objects.get(id=int(data['jobid']))
		d = Driver.objects.get(id=int(data['driverid']))
		b.driver = d
		b.save()
	return HttpResponse("OK")

#This is to set a job as "clear" ie complete
@csrf_exempt
def setBookingClear(request):
	if request.method == 'POST':
		jobno = simplejson.loads(request.body)
		b = Booking.objects.get(id=int(jobno)) 
		b.complete = True
		b.save()

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