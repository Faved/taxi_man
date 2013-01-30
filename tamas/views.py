# Create your views here.
from django.http import HttpResponse
from django.utils import simplejson
from django.views.decorators.csrf import csrf_exempt
from django.template import Context
from django.template.loader import get_template
import datetime

def home(request):
	now = datetime.datetime.now()
	t = get_template('content.html')
	html = t.render(Context({'time':now}))
	return HttpResponse(html)

@csrf_exempt	
def api(request):
	if request.method == 'POST':
		data = simplejson.loads(request.body)
		try:
			name = data[0]
			fromPlace = data[1]
			destin = data[2]
			time = data[3]
		except:
			HttpResponseServerError("Malformed data!")
		idCode = 'Txa102'
		message = idCode
	else:
		message = "fail"
	return HttpResponse(message)

def time(request):
	now = datetime.datetime.now()
	time = now.time()
	t = get_template('header.html')
	html = t.render(Context({'time':time.strftime("%H:%M:%S %Z")}))
	return HttpResponse(html)