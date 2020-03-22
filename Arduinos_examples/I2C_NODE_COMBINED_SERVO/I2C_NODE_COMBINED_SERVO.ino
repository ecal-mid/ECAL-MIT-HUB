#include <Wire.h>
#include <Servo.h>

Servo myServo;

// LED on pin 13
const int ledPin = LED_BUILTIN;
int receiveBuffer[9];
int button_state = 0;
int last_button_state = 0;
int prev_val = 0;
int angle = 0;
String address = "0x7";
bool lightIsOn = false;
bool pressed = false;
bool VIRTUAL_HUB = false;

void setup() {
   Serial.begin(9600);

  if(!VIRTUAL_HUB){
    // Join I2C bus as slave with address 7
    Wire.begin(0x7); 
    // Call receiveEvent when data received
    Wire.onReceive(receiveEvent);
    Wire.onRequest(requestEvent);
  }

  // Setup pin 13 as output and turn LED off
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  pinMode(4, INPUT_PULLUP);

  //Setup Servo
  myServo.attach(2);

  // !!! IMPORTANT FOR VIRTUALHUB
  // init infos
  Serial.print('b');
  Serial.print(address);
  Serial.print('e');
  myServo.write(0);
}

void loop() {
  //DETECT BUTTON
  if (digitalRead(4) == HIGH && pressed == false) {
    pressed = true;
    lightIsOn = !lightIsOn;
    if(lightIsOn){
      button_state = 1;
      }else{
      button_state = 0;
     }
   
    delay(5);
  }else if(digitalRead(4) == LOW){
    pressed = false;
  }
  
  if(VIRTUAL_HUB){
    checkSerial();
  }
  delay(15);
}

////////////////////// ....... SERIAL STUFF ........ //////////////////////

void checkSerial(){
   while(Serial.available()>0){
      String ReaderFromNode; // Store current character
      ReaderFromNode = Serial.readStringUntil('\n');
      convertToState(ReaderFromNode); // Convert character to state  
    }

    if (button_state != last_button_state) {
      //if(button_state == 1){
       if(lightIsOn){
       // last_button_state = 1;
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
       // last_button_state = 0;
         Serial.print('b');
         Serial.print(0);
         Serial.print('e');
       }
       last_button_state = button_state;
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
  while (Wire.available()) { // loop through all but the last
    char c = Wire.read(); // receive byte as a character
  if (howMany > 1) {
      char d = map(c,0,99,0,1);
      digitalWrite(ledPin, d);
      int angle = map(c,0,99,0,170);
      myServo.write(angle);
    }

  }
}

void requestEvent() {
  if (button_state != last_button_state) {
    if(lightIsOn){
      Serial.println("on");
      writeData(99);
    }else{
       Serial.println("off");
      writeData(0);
    }
    last_button_state = button_state;
  }
}

void writeData(char newData) {
  char data[] = {5, newData};
  int dataSize = sizeof(data);
  Wire.write(data, dataSize);
}
