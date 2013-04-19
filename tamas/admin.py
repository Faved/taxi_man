from django.contrib import admin
from tamas.models import *
from django.contrib.sites.models import Site

class BookingAdmin(admin.ModelAdmin):
	list_filter = ['date']
	search_fields = ['pickup_address']

admin.site.register(Booking,BookingAdmin)
admin.site.register(Driver)
admin.site.register(Account)
admin.site.register(Rotas)
admin.site.register(Driver_rotas)
admin.site.register(Escort)
admin.site.register(Addresses)
admin.site.unregister(Site)