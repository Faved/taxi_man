# Create your views here.
from django.http import HttpResponse
from django.template import Context
from django.template.loader import get_template
import datetime

def home(request):
	now = datetime.datetime.now()
	t = get_template('content.html')
	html = t.render(Context({'time':now}))
	return HttpResponse(html)
def api(request):
	if request.method == 'POST':
		t = "post"
	else:
		t = "get"
	return HttpResponse(t)

def time(request):
	now = datetime.datetime.now()
	time = now.time()
	t = get_template('header.html')
	html = t.render(Context({'time':time.strftime("%H:%M:%S %Z")}))
	return HttpResponse(html)