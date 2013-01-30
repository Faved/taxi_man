from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'taxi_man.views.home', name='home'),
    # url(r'^taxi_man/', include('taxi_man.foo.urls')),
    url(r'^$','tamas.views.home'),
    url(r'^api/$','tamas.views.api'),
    url(r'^time/$','tamas.views.time'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
