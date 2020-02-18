import json
from time import sleep
from smbus2 import SMBus,SMBusWrapper
from firebase_streaming import Firebase
fb = Firebase("https://esptest-73b9b.firebaseio.com/")

addr1=0x8
addr2=0x9
bus = SMBus(1)
numb = 1
print("start")


def light_toggle(_val):
    
    print("hello git hub 008",_val)
    data = json.loads(_val[1])
    print(data['path'])
    print(data['data'])
    pathes = data['path'].split('/')
    val = data['data']
    print('all good')
    if str(val) == "1":
        print('inside 1',bus,addr1)
        try:
            bus.write_byte(addr1,0x1)
        except:
            print('problem with bus1')
        print("1 from fb")
    elif str(val) == "2":
        try:
            bus.write_byte(addr2,0x1)
        except:
            print('problem with bus 2')
        print("2 from fb")
    else:
        try:
            bus.write_byte(addr1,0x0)
        except:
            print('problem with bus1')
        try:
            bus.write_byte(addr2,0x0)
        except:
            print('problem with bus2')
        print("lights off")



cb = fb.child("light").listener(light_toggle)
cb.start()

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
