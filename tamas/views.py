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
import json
from datetime import date, time, timedelta
import logging
log = logging.getLogger(__name__)

@login_required
def home(request):
	now = datetime.datetime.now()
	# need to filter the results for that day and order them by the time.
	startdate = date.today()
	enddate = startdate + timedelta(days=1)
	bookings = Booking.objects.filter(complete=0,cancelled=0,date__range=[startdate, enddate]).order_by('leave_time').exclude(entered_by=None)
	completeBookings = Booking.objects.filter(complete=1,cancelled=0,date__range=[startdate, enddate]).order_by('leave_time').exclude(entered_by=None)
	alldrivers = Driver.objects.all()
	escorts = Escort.objects.all()
	accounts = Account.objects.all()
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
	user = request.user
	html = t.render(Context({'time':now,'user':user,'bookings':bookings,'driversAvail':driverAvail,"driversUnavail":driverBusy,"completebookings":completeBookings,"accounts":accounts,"escorts":escorts,"allDrivers":alldrivers}))
	# log it
	log.debug(request.user.username+' - loaded all jobs from home')
	return HttpResponse(html)

def table(request):
	now = datetime.datetime.now()
	# need to filter the results for that day and order them by the time.
	startdate = date.today()
	enddate = startdate + timedelta(days=1)
	bookings = Booking.objects.filter(complete=0,cancelled=0,date__range=[startdate, enddate]).order_by('leave_time').exclude(entered_by=None)
	t = get_template('table.html')
	html = t.render(Context({'time':now,'bookings':bookings}))
	return HttpResponse(html)

def places(request):
	places = Addresses.objects.all()
	returnData = serializers.serialize("json",places)
	return HttpResponse(returnData,mimetype='application/json')


def cleartable(request):
	now = datetime.datetime.now()
	# need to filter the results for that day and order them by the time.
	startdate = date.today()
	enddate = startdate + timedelta(days=1)
	bookings = Booking.objects.filter(complete=1,cancelled=0,date__range=[startdate, enddate]).order_by('leave_time').exclude(entered_by=None)
	t = get_template('completedTable.html')
	html = t.render(Context({'time':now,'completebookings':bookings}))
	return HttpResponse(html)

# search form 
@csrf_exempt
def search(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		# create a date object
		date_array = data['startdate'].split('-')
		print date_array
		startdate = datetime.date(int(date_array[0]),int(date_array[1]),int(date_array[2]))
		# create a date object
		date_array = data['enddate'].split('-')
		enddate = datetime.date(int(date_array[0]),int(date_array[1]),int(date_array[2]))
		driver = data['driver']
		account = data['account']
		tempacc = account.split('|')
		tempdriver = driver.split('|')
		
		if driver != "None" and account != "None":
			print "i am here"
			acc = Account.objects.filter(name=tempacc[0].strip(),alias=tempacc[1].strip(),ref_no=tempacc[2].strip())
			drive = Driver.objects.filter(name=tempdriver[0].strip(),callsign=tempdriver[1].strip())
			bookings = Booking.objects.filter(date__range=[startdate,enddate],account=acc,driver=drive)
		elif driver != 'None' and account == 'None':
			drive = Driver.objects.filter(name=tempdriver[0].strip(),callsign=tempdriver[1].strip())
			bookings = Booking.objects.filter(date__range=[startdate,enddate],driver=drive)
		elif driver == 'None' and account != 'None':
			acc = Account.objects.filter(name=tempacc[0].strip(),alias=tempacc[1].strip(),ref_no=tempacc[2].strip())
			bookings = Booking.objects.filter(date__range=[startdate,enddate],account=acc)
		else:
			bookings = Booking.objects.all()

		t = get_template('resulttable.html')
		html = t.render(Context({"results":bookings}))
		return HttpResponse(html)

@csrf_exempt	
def api(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		print data
		idCode = ""
		# try:
		date_array = data['date'].split('-')
		jobDate = datetime.date(int(date_array[0]),int(date_array[1]),int(date_array[2]))
		# create a time object for leave time....
		temptime = data['time'].split(':')
		pickup_time = datetime.time(int(temptime[0]),int(temptime[1]))
		leave_time = pickup_time
		print data['customerName']
		b = Booking(pickup_address=data['pickup'],num_escorts=0,customer_number=data['customerContact'],extra_info=data['moreInfo'],destin_address=data['destination'],date=jobDate,leave_time=leave_time,pickup_time=pickup_time,no_passengers=int(data['num_passengers']),customer_name=data['customerName'],vehicle_type=data['vehicle'])
		print b
		b.save()
		idCode = b.pk
		book = Booking.objects.filter(id=idCode).exclude(entered_by=None)
		while book.count() is 0:
			book = Booking.objects.filter(id=idCode).exclude(entered_by=None)
		if book[0].cancelled == 1:
			returnData =  json.dumps({'message':'Not Accepted','Reason':book[0].cancelled_reason})
			return HttpResponse(returnData,mimetype='application/json')
		else:
			returnData = json.dumps({'message':'Accepted','Job ID':idCode})
			return HttpResponse(returnData,mimetype='application/json')
		# except:
			# return HttpResponse("Malformed Data")
	else:
		message = "Method Not Allowed"
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
		if int(data['travelTime']) < 5 or data['travelTime'] =='':
			leave_time = pickup_time
		else:
			# to make it work we need to create a datetime object frm the time
			tempdate = datetime.date(2010,8,27)
			tempdate2 = datetime.datetime.combine(tempdate,pickup_time)
			temp_leavedatetime = tempdate2 - timedelta(seconds=data['travelTime'])
			leave_time = temp_leavedatetime.time()
		# need to getthe user who is submitting
		user = request.user
		# 
		# find out if account of not
		if data['isaccount'] == 'true':
			tempaccountdata = data['account'].split('|')
			theaccount = Account.objects.filter(name=tempaccountdata[0].strip(),alias=tempaccountdata[1].strip(),ref_no=tempaccountdata[2].strip())

			print theaccount
			# lets make a booking object
			b = Booking(pickup_address=data['pickup'],account=theaccount[0],num_escorts=int(data['num_escorts']),customer_number=data['cus_contact'],extra_info=data['moreinfo'],destin_address=data['destination'],date=jobDate,leave_time=leave_time,pickup_time=pickup_time,entered_by=user,no_passengers=data['num_of_pass'],customer_name=data['cus_name'],vehicle_type=data['vehicle'])
			b.save()
		else:
			b = Booking(pickup_address=data['pickup'],num_escorts=int(data['num_escorts']),customer_number=data['cus_contact'],extra_info=data['moreinfo'],destin_address=data['destination'],date=jobDate,leave_time=leave_time,pickup_time=pickup_time,entered_by=user,no_passengers=data['num_of_pass'],customer_name=data['cus_name'],vehicle_type=data['vehicle'])
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
		if b.num_escorts > 0:
			e = Escort.objects.filter(name=data['escort1'])
			print data
			b.escort_id = e[0]
			if b.num_escorts > 1:
				e = Escort.objects.filter(name=data['escort2'])
				b.escort_id_2 = e[0]
				if b.num_escorts > 2:
					e = Escort.objects.filter(name=data['escort3'])
					b.escort_id_3 = e[0]
					if b.num_escorts > 3:
						e = Escort.objects.filter(name=data['escort4'])
						b.escort_id_4 = e[0]

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

# This will make a driver available
@csrf_exempt
def makeDriverAvail(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		# first we check to see if there is a rota with this start & end time
		temptime = data['starttime'].split(':')
		starttime = datetime.time(int(temptime[0]),int(temptime[1]))
		temptime = data['endtime'].split(':')
		endtime = datetime.time(int(temptime[0]),int(temptime[1]))
		rotas = Driver_rotas.objects.filter(start_time=starttime,end_time=endtime)
		if rotas.count() < 1:
			rotas = Driver_rotas(start_time=starttime,end_time=endtime)
			rotas.save()
			driver = Driver.objects.filter(id=int(data['driverid']))
			today = date.today()
			rota = Rotas(date=today,driver=driver[0],rota=rotas)
			rota.save()
		else:
			driver = Driver.objects.filter(id=int(data['driverid']))
			today = date.today()
			rota = Rotas(date=today,driver=driver[0],rota=rotas[0])
			rota.save()

		# log it
		log.debug(request.user.username+' - made driver available ')
	return HttpResponse("OK")

# Return available drivers
def getAvailableDrivers(request):
	today = date.today()
	drivers = Rotas.objects.filter(date=today)
	t = get_template('drivers.html')
	html = t.render(Context({'driversAvail':drivers}))
	return HttpResponse(html)

# This is a test view
def CreateLogFile(data):
	fo = open("log.txt", 'a')
	fo.write(data)
	fo.write("\n")
	fo.close()
	
# this is to comfirm a booking from the api
@csrf_exempt
def comfirmBooking(request):
	if request.method == 'POST':
		jobno = simplejson.loads(request.body)
		b = Booking.objects.get(id=int(jobno['jobid'])) 
		b.entered_by = request.user
		b.save()
		log.debug(request.user.username+' - Accepted remote booking with job id of: '+unicode(jobno['jobid']))
	return HttpResponse("OK")
# this is to decline a booking from the api
@csrf_exempt
def declineBooking(request):
	if request.method == 'POST':
		jobno = simplejson.loads(request.body)
		reason = jobno['reason']
		b = Booking.objects.get(id=int(jobno['jobid'])) 
		b.entered_by = request.user
		b.cancelled_reason = reason
		b.cancelled = True
		b.save()
		log.debug(request.user.username+' - Declined remote booking with job id of: '+unicode(jobno['jobid']))
	return HttpResponse("OK")


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

def checkForBooking(request):
	bookings = Booking.objects.filter(complete=0,entered_by=None,cancelled=0)
	if len(bookings) < 1:
		return HttpResponse("none");
	else:
		data = serializers.serialize("json", bookings)
		return HttpResponse(data)


def create(request):
	t = get_template('create.html')
	html =t.render(Context({}))
	return HttpResponse(html)