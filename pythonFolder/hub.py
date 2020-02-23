# RUN WITH PYTHON 3.7
import json
from time import sleep
from firebase_streaming import Firebase
from smbus2 import SMBus, SMBusWrapper
import RPi.GPIO as GPIO 
# don't forget the last /
fb = Firebase("https://ecal-mit-hub.firebaseio.com/")

# HUB NAME HAS TO MATCH ONLINE NAME
HUB_NAME = "HUB ECAL"
I2CS = {}
ADDRESSES = {}
ARDUINO_I2C = {}
bus=SMBus(1)

# INFO LEDS
GPIO.setmode(GPIO.BCM)
LED_1 = 18
LED_2 = 16
GPIO.setup(LED_1, GPIO.OUT)
GPIO.setup(LED_2, GPIO.OUT)
GPIO.output(LED_1, GPIO.HIGH)
GPIO.output(LED_2, GPIO.LOW)



def sendMessage(hub,id,message):
    # use id to retrieve I2c address
    if hub !='none' and str(id) != 'none':
        print(hub,ADDRESSES[str(id)]['address'],message)
         # action to write bytes data 
        if hub == HUB_NAME:
            print('send direct',ADDRESSES[str(id)]['address'],message)
            address = ADDRESSES[str(id)]['address']
            try:
                print('send to device',address,message)
                bus.write_byte_data(int(address,16),0,int(message))
            except:
                print('error with address '+address)
        else:
            print('send to FB',hub, id,message)

       

def read(_data):
    data = json.loads(_data[1])
    # print(data['path'])
    # print('data',data['data'],len(data['data']))
    if data['path'] == '/':
        # init  addresses 
        # print(data['data'])
        try:
            HUB_DATA = data['data'][HUB_NAME]
            for i,address in enumerate(HUB_DATA):
                # store all I2C For the hub
                I2CS[str(i)] = address
                # only get named connection
                if address and address['name']!='undefined':
                    ADDRESSES[str(i)] = {'address':address['address'],'connection':address['connection']} 
                    ARDUINO_I2C[address['address']] = {'id':str(i),'connection':address['connection']}
        except:
            # if connection change
            if data['data'] is not None:
                for i,address in enumerate(data['data']):
                    chapter=address.split('/')
                    c = chapter[len(chapter)-1]
                    id = chapter[len(chapter)-2]
                    if c == 'connection':
                        # only available if ADDRESS EXIST  -----> !!! NEED A FIX
                        ADDRESSES[str(id)]['connection'] = data['data'][address]
                    elif c == 'name':
                        # update ADDRESSES
                        ADDRESSES[str(id)] = {'address':I2CS[str(id)],'connection':{'hub_name':'none','id':'none'}} 
                        ARDUINO_I2C[str(I2CS[str(id)])] = {'id':str(id),'connection':{'hub_name':'none','id':'none'}}
    else:
        try:
            # send message to other device
            path = data['path'].split('/')
            id = path[2]
            message = path[3]
            sendMessage(ADDRESSES[str(id)]['connection']['hub_name'],ADDRESSES[str(id)]['connection']['id'],data['data'])
        except:
            print('error with splitting path')

cb = fb.child("HUBS").listener(read)
cb.start()


sleep(2)
while 1:
    # check all recorded ARDUINO ADDRESSES 
    for i,address in enumerate(ARDUINO_I2C):
        try:
            # print(address)
            data = bus.read_i2c_block_data(int(address,16),5,2)
            if data[1]!=255:
                print('Offset2 {}, data {}'.format(data[0],data[1]))
                # send to FB OR HUBDATE THE HUB DIRECTLY
                # get connection 
                # adno_connection = ARDUINO_I2C[address]['connection']
                adno_id= ARDUINO_I2C[address]['id']
                # update FB
                try:
                    __message = fb.child('HUBS/'+HUB_NAME+'/'+adno_id+'/message')
                    __message.put(int(data[1]))
                    print('good fb put')
                except:
                    print('error for fb put')
        except:
            pass
    sleep(0.05)