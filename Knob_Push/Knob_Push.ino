


// Hardware setup:
// Attach a rotary encoder with output pins to A0 and A1.
// The common contact should be attached to ground.

#include <Wire.h>

#include <RotaryEncoder.h>

#define ROTARYMIN 0
#define ROTARYMAX 99

// Setup a RoraryEncoder for pins A0 and A1:
RotaryEncoder encoder(A0, A1);

// push on A2 ?
#define encoder0Btn A2


const int ledPin = LED_BUILTIN;

int button_state = 0;
int last_button_state = 0;

void setup()
{
  Serial.begin(57600);
  Serial.println("Serial Ready");

 // Join I2C bus as slave with address 10
  Wire.begin(0x10);
  Wire.onRequest(requestEvent);   // transmits data from hub
  Wire.onReceive(receiveEvent);   // receives data from hub
  Serial.println("i2c Ready");

  // Setup pin 13 as output and turn LED off
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  pinMode(encoder0Btn, INPUT_PULLUP);
  
} 

// declaring this outside of the loop so we can read from request event
static int pos = 0;
int newPos = 0;

// Read the current position of the encoder and print out when changed.
void loop()
{
  if (digitalRead(encoder0Btn) == LOW) {
    button_state = 1;
    //Serial.println("on");
    delay(2);
  } else {
    //Serial.println("off");
    button_state = 0;
  }
  
  encoder.tick();

  newPos = encoder.getPosition();
  if (newPos < ROTARYMIN) {
    encoder.setPosition(ROTARYMAX);
    newPos = ROTARYMAX;

  } else if (newPos > ROTARYMAX) {
    encoder.setPosition(ROTARYMIN);
    newPos = ROTARYMIN;
  } // if

  
  //Serial.println(newPos);
  //Serial.println(newPos);       // to check encoder is working
  /*if (pos != newPos) {
    Serial.print(newPos);
    Serial.println();
    pos = newPos;
  } */
} 


// THIS IS THE CODE THAT ASKS THE HUB IF IT CAN TRANSMIT
void requestEvent() {

  /* THIS SENDS RANDOM NUMBER TO HUB IN CASE YOU NEED TO TEST THE CONNECTION
  int randNumber = random(1,99);
  writeData(randNumber);
  */

  if (pos != newPos) {
    Serial.println(pos); // transmit over serial to debuf
    writeData(pos);           // transmit to hub
    pos = newPos;
  } 

  if (button_state != last_button_state) {
    if(button_state == 1){
     // int randNumber = random(1,99);
      writeData(99);
    }else{
       writeData(0);
     }
    last_button_state = button_state;
  }

  //Serial.println("request received");
}

// THIS PACKAGES AND TRANSMITS DATA TO HUB
void writeData(char newData) {
  char data[] = {5, newData};
  int dataSize = sizeof(data);
  Wire.write(data, dataSize);
}


// CODE THAT EXECUTES WHEN DATA IS RECEIVED FROM MASTER
void receiveEvent(int howMany) {
  //Serial.println(howMany);
  while (Wire.available()) { // loop through all but the last
    char c = Wire.read(); // receive byte as a character
    //Serial.println(int(c));
    //if (int(c) < 2) {
      
      digitalWrite(ledPin, HIGH);
      Serial.println(int(c));
    //}

  }
  digitalWrite(ledPin, LOW);
}
