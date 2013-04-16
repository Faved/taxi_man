from django.db import models
from django.contrib.auth.models import User
# Create your models here.
#Models for the tamas project will go here

#account
class Account(models.Model):
	name 				= models.CharField(max_length=200)
	contact_name 		= models.CharField(max_length=200)
	ref_no 				= models.CharField(max_length=200)
	billing_no 			= models.CharField(max_length=200)
	alias 				= models.CharField(max_length=200)
	contact_number 		= models.CharField(max_length=50)
	contact_address_1 	= models.CharField(max_length=200)
	contact_address_2 	= models.CharField(max_length=200, blank=True)
	contact_city 		= models.CharField(max_length=50)
	contact_county 		= models.CharField(max_length=50)
	contact_postcode 	= models.CharField(max_length=20)
	billing_name 		= models.CharField(max_length=50)
	billing_address_1 	= models.CharField(max_length=200)
	billing_address_2 	= models.CharField(max_length=200,blank=True)
	billing_city 		= models.CharField(max_length=50)
	billing_county 		= models.CharField(max_length=50)
	billing_postcode 	= models.CharField(max_length=20)

#User
# class User(models.Model):
# 	USER_CHOICES = (
# 		('Controller','Controller'),
# 		('Office','Office'),
# 		('Administrator','Administrator'),
# 		)
# 	username 			= models.CharField(max_length=50)
# 	password 			= models.CharField(max_length=200)
# 	account_level 		= models.CharField(max_length=20, choices=USER_CHOICES)
# 	name 				= models.CharField(max_length=50)



#Driver Table
class Driver(models.Model):
	DRIVER_CHOICES = (
		('Owner','Owner'),
		('Company','Company'),
		)
	name 				= models.CharField(max_length=50)
	callsign 			= models.CharField(max_length=10)
	contact_number 		= models.CharField(max_length=50)
	badge_number 		= models.CharField(max_length=50)
	driver_type 		= models.CharField(max_length=20,choices=DRIVER_CHOICES)

#Driver Rota Table
class Driver_rotas(models.Model):
	start_time 			= models.TimeField()
	end_time 			= models.TimeField()

#Rota Table
class Rotas(models.Model):
	date 				= models.DateField()
	driver 				= models.ForeignKey(Driver)
	rota 				= models.ForeignKey(Driver_rotas)

#Esort Table
class Escort(models.Model):
	name 				= models.CharField(max_length=100)
	contact 			= models.CharField(max_length=100)

#Booking Table - props the main table thats used!
class Booking(models.Model):
	VEHICLE_CHOICES = (
		('Car','Car'),
		('Minibus','Minibus'),
		('Mobility','Mobility'),
		)
	pickup_address 		= models.CharField(max_length=200)
	destin_address 		= models.CharField(max_length=200)
	is_via 				= models.BooleanField()
	pickup_time 		= models.TimeField()
	leave_time 			= models.TimeField()
	customer_name 		= models.CharField(max_length=200, blank=True)
	customer_number 	= models.CharField(max_length=50, blank=True)
	no_passengers 		= models.IntegerField(blank=True)
	wait_return 		= models.BooleanField()
	escort_id 			= models.ForeignKey(Escort,null=True,blank=True)
	driver 				= models.ForeignKey(Driver,null=True,blank=True)
	entered_by 			= models.ForeignKey(User,null=True,blank=True)
	vehicle_type 		= models.CharField(max_length=20, choices=VEHICLE_CHOICES)
	extra_info 			= models.TextField(blank=True)
	complete 			= models.BooleanField()
	date 				= models.DateField()
	account 			= models.ForeignKey(Account, null=True,blank=True)
	def __unicode__(self):
		return unicode(self.id)

#contract table
class Contract(models.Model):
	booking_id 			= models.ForeignKey(Booking)
	account_id 			= models.ForeignKey(Account)

#Via Table]
class Via(models.Model):
	booking_id 		= models.ForeignKey(Booking)
	via_address 		= models.CharField(max_length=200)

#Driver Status Table - this is basically a look up table to store the drivers status and will be wiped 
class Driver_status(models.Model):
	STATUS_CHOICES = (
		('On Job','On Job'),
		('Clear','Clear'),
		('Lunch','Lunch'),
		('Out Of Car','Out Of Car'),
		)
	driver 				= models.ForeignKey(Driver)
	status 				= models.CharField(max_length=30,choices=STATUS_CHOICES)
