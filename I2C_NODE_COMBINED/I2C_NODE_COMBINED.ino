#include <Wire.h>

// LED on pin 13
const int ledPin = LED_BUILTIN;
int receiveBuffer[9];
int button_state = 0;
int last_button_state = 0;
int prev_val = 0;
String address = "0x7";

void setup() {
  // Join I2C bus as slave with address 9
  Wire.begin(0x07); 
  Serial.begin(9600);

  // Call receiveEvent when data received
  Wire.onReceive(receiveEvent);
  Wire.onRequest(requestEvent);
  //Serial.println("i2c Ready");

  // Setup pin 13 as output and turn LED off
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  pinMode(4, INPUT_PULLUP);

  // !!! IMPORTANT FOR VIRTUALHUB
  // init infos
  Serial.print('b');
  Serial.print(address);
  Serial.print('e');
}

void loop() {
  //DETECT BUTTON
  if (digitalRead(4) == LOW) {
    button_state = 1;
    //Serial.println("on");
    delay(5);
  } else {
     //Serial.println("off");
    button_state = 0;
  }

  checkSerial();
  delay(100);
}

////////////////////// ....... SERIAL STUFF ........ //////////////////////

void checkSerial(){
   while(Serial.available()>0){
      String ReaderFromNode; // Store current character
      ReaderFromNode = Serial.readStringUntil('\n');
      convertToState(ReaderFromNode); // Convert character to state  
    }

    if (button_state != last_button_state) {
      if(button_state == 1){
       last_button_state = 1;
        // BAD SOLUTION TO ENCAPSULATE VALUE
        // WE ADD A KNOWN begin CHAR b
        // WE PUT THE VALUE
        // WE ADD A KNOWN end CHAR e
        //--> on the virutal hub, we can get the proper value
        // need to be optimized
        Serial.print('b');
        Serial.print(99);
        Serial.print('e');
      }else{
        last_button_state = 0;
         Serial.print('b');
         Serial.print(0);
         Serial.print('e');
       }
   }
}

void convertToState(String chr) {
  if(chr=="99"){
    digitalWrite(LED_BUILTIN, HIGH);
    delay(50); 
  }
  if(chr=="0"){
    digitalWrite(LED_BUILTIN, LOW);
    delay(50); 
  }
}


////////////////////// ....... I2C STUFF ........ //////////////////////


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
     // int randNumber = random(1,99);
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
