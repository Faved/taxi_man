# Create your views here.
from django.http import HttpResponse
from django.template import Context
from django.template.loader import get_template

def home(request):
	t = get_template('content.html')
	html = t.render(Context({'mine':'mine'}))
	return HttpResponse(html)
