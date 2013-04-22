from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'taxi_man.views.home', name='home'),
    # url(r'^taxi_man/', include('taxi_man.foo.urls')),
    # Home page (same as index.html)
    url(r'^$','tamas.views.home'),
    # Web API call
    url(r'^api/$','tamas.views.api'),
    # page which returns the time
    url(r'^time/$','tamas.views.time'),
    # This url is for the table, so that i can be refreshed.
    url(r'^table/$','tamas.views.table'),
    # Clear the table
    url(r'^cleartable/$','tamas.views.cleartable'),
    # Create a booking
    url(r'^create/$','tamas.views.create'),
    # Check for booking
    url(r'^checkForBooking/$','tamas.views.checkForBooking'),
    # Search for booking
    url(r'^search/$','tamas.views.search'),
    # Get a list of places on database
    url(r'^places/$','tamas.views.places'),
    # Add a new booking to the system
    url(r'^add/$','tamas.views.add'),
    # Confirm a booking fro the API
    url(r'^comfirmBooking/$','tamas.views.comfirmBooking'),
    # Decline a booking from the API
    url(r'^declineBooking/$','tamas.views.declineBooking'),
    # Make the driver available from the on call list
    url(r'^makeDriverAvail/$','tamas.views.makeDriverAvail'),
    # get a list of all available drivers
    url(r'^getAvailableDrivers/$','tamas.views.getAvailableDrivers'),
    # add driver to job
    url(r'^addDriverToBooking/$','tamas.views.addDriverToBooking'),
    # Set a booking to being complete
    url(r'^setBookingClear/$','tamas.views.setBookingClear'),
    # Get information about a vbooking
    url(r'^getBookingInfo/$','tamas.views.getBookingInfo'),
    # Cancell a booking
    url(r'^cancelBooking/$','tamas.views.cancelBooking'),
    # Remove a driver from a job but do not make it complete
    url(r'^removeFromJob/$','tamas.views.removeFromJob'),
    # account stuff
    url(r'^accounts/login/$', 'django.contrib.auth.views.login',{'template_name': 'login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/'}),
    # Admin site
    url(r'^admin/', include(admin.site.urls)),
)
