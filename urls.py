from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'taxi_man.views.home', name='home'),
    # url(r'^taxi_man/', include('taxi_man.foo.urls')),
    url(r'^$','tamas.views.home'),
    url(r'^api/$','tamas.views.api'),
    url(r'^time/$','tamas.views.time'),
    # This url is for the table, so that i can be refreshed.
    url(r'^table/$','tamas.views.table'),
    url(r'^cleartable/$','tamas.views.cleartable'),
    url(r'^create/$','tamas.views.create'),
    url(r'^test/$','tamas.views.test'),
    url(r'^add/$','tamas.views.add'),

    # add driver to job
    url(r'^addDriverToBooking/$','tamas.views.addDriverToBooking'),
    url(r'^setBookingClear/$','tamas.views.setBookingClear'),
    url(r'^getBookingInfo/$','tamas.views.getBookingInfo'),
    url(r'^cancelBooking/$','tamas.views.cancelBooking'),
    url(r'^removeFromJob/$','tamas.views.removeFromJob'),
    



    # account stuff
    url(r'^accounts/login/$', 'django.contrib.auth.views.login',{'template_name': 'login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}),

   

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
