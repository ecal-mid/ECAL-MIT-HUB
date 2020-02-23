# RUN WITH PYTHON 3.7
import json
from time import sleep
from firebase_streaming import Firebase
from smbus2 import SMBus, SMBusWrapper
# don't forget the last /
fb = Firebase("https://ecal-mit-hub.firebaseio.com/")

# HUB NAME HAS TO MATCH ONLINE NAME
HUB_NAME = "HUB ECAL"
ADDRESSES = {}
ARDUINO_I2C = {}


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
                # bus.write_byte(address,message)
            except:
                print('error with address '+address)
        else:
            # send hub name + id
            print('send to FB',hub, id,message)

       

def read(_data):
    data = json.loads(_data[1])
    # print(data['path'])
    # print('data',data['data'],len(data['data']))
    if data['path'] == '/':
        # init  addresses 
        # print(data['data'][HUB_NAME])
        try:
            HUB_DATA = data['data'][HUB_NAME]
            for i,address in enumerate(HUB_DATA):
                # only get named connection
                if address and address['name']!='undefined':
                    ADDRESSES[str(i)] = {'address':address['address'],'connection':address['connection']} 
                    ARDUINO_I2C[address['address']] = {'connection':address['connection']}
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

# raw_input("ENTER to stop...")
# cb.stop()


# ------------------------------------------------> UPDATE TO WORK BASED ON ALL RECORDED ADDRESSES

#Listen to slave messages
#sleep(2)
#while 1:
#    try:
#        data = bus.read_i2c_block_data(addr2,5,2)
#        print('Offset2 {}, data {}'.format(data[0],data[1]))
#    except:
#        print('cannot read 0x9')
#    try:
#        data = bus.read_i2c_block_data(addr1,5,2)
#        print('Offset1 {}, data {}'.format(data[0],data[1]))
#    except:
#        print('cannot read 0x8')
#    sleep(0.05)

sleep(2)
while 1:
    # check all recorded ARDUINO ADDRESSES 
    for i,address in enumerate(ARDUINO_I2C):
        try:
            # print(address)
            data = bus.read_i2c_block_data(int(address,16),5,2)
            if data[1]!=255:
                print('Offset2 {}, data {}'.format(data[0],data[1]))
        except:
            pass
    sleep(0.05)