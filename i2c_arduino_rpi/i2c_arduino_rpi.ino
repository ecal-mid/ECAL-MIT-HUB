#include <Wire.h>

// LED on pin 13
const int ledPin = LED_BUILTIN;
int receiveBuffer[9];
int button_state = 0;
int last_button_state = 0;

void setup() {
  // Join I2C bus as slave with address 9
  Wire.begin(0x08); 
  Serial.begin(9600);

  // Call receiveEvent when data received
  Wire.onReceive(receiveEvent);
  Wire.onRequest(requestEvent);
  Serial.println("i2c Ready");

  // Setup pin 13 as output and turn LED off
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  pinMode(4, INPUT_PULLUP);
}

// Function that executes whenever data is received from master
void receiveEvent(int howMany) {
  //Serial.println(howMany);
  while (Wire.available()) { // loop through all but the last
    char c = Wire.read(); // receive byte as a character
    //Serial.println(int(c));
    if (int(c) < 2) {
      digitalWrite(ledPin, c);
      Serial.println(int(c));
    }

  }
}

void requestEvent() {
  if (button_state != last_button_state) {
    if(button_state == 1){
      int randNumber = random(1,99);
      writeData(1);
    }else{
       writeData(0);
     }
    last_button_state = button_state;
  }
  //Serial.println("request received");
}

void writeData(char newData) {
  char data[] = {5, newData};
  int dataSize = sizeof(data);
  Wire.write(data, dataSize);
}

void loop() {
  if (digitalRead(4) == LOW) {
    button_state = 1;
    //Serial.println("on");
    delay(500);
  } else {
     //Serial.println("off");
    button_state = 0;
  }
  delay(100);
}
