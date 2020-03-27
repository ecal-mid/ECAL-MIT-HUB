/*
  MIT x ECAL
  This is a generic example that you can use as a base for developing your project
  It works on Arduino Uno with the custom shield
  NOTE: Virtual Hub mode require a NODE JS server running and serial communication
  More info here https://github.com/gaelhugo/ECAL-MIT-HUB

*/

#define USE_VIRTUAL_HUB // Comment or uncomment to activate/deactivate virtual HUB

#if !defined(USE_VIRTUAL_HUB)
#include <Wire.h>
#endif

// CONSTANTS
#define I2C_ADDR 7 // Update this to your attributed address 
#define LED_PIN LED_BUILTIN // Led for basic output
#define BTN_PIN 2 // Pin for basic input (Push Button)

// Global variables
int receiveBuffer[9];
int the_value_to_send = 0;
int value_received = 0;
int last_value_sent = -1;
int last_value_received = -1;

// Sketch variables
int value_to_send = 0;
int button_state = 0;
int last_button_state = 0;
bool btn_pressed = false;


void setup() {
  Serial.begin(9600);
  delay(100);
  // Start i2c or Serial/Node communication
  startupCommunication();
  delay(100);
  // Setup Output as the builtin LED
  pinMode(LED_PIN, OUTPUT);
  // Setup Input
  pinMode(BTN_PIN, INPUT_PULLUP);
  // Turn LED off
  digitalWrite(LED_PIN, LOW);
}


void loop() {
  /////////   INPUT EXAMPLE /////////
  // Detect Button press
  if (digitalRead(BTN_PIN) == LOW && btn_pressed == false) {
    button_state = !button_state;
    btn_pressed = true;
    // digitalWrite(LED_PIN, button_state);
    delay(10); // keeps a small delay
    Serial.println(button_state);
    //
    value_to_send = map(button_state, 0, 1, 0, 99);

  } else if (digitalRead(BTN_PIN) == HIGH) {
    btn_pressed = false;
  }

  setDataToSend(value_to_send);

  /////////  OUTPUT EXAMPLE /////////
#if defined(USE_VIRTUAL_HUB)
  checkDataFromNode();
#endif

  if (value_received != last_value_received) {
    // new value has beed received
    // update your output
    digitalWrite(LED_PIN, map(value_received, 0, 99, 0, 1)); // simple example with LED
    value_received = last_value_received;
  }

}



/*

  NO EDIT SHOULD BE REQUIRED UNDER THIS LINE

*/

void startupCommunication() {

#if defined(USE_VIRTUAL_HUB)
  // !!! IMPORTANT FOR VIRTUALHUB
  // Init infos
  Serial.print('*');
  Serial.print(I2C_ADDR);
  Serial.print('%');
  // Startup message
  Serial.println(" ");
  Serial.println("NODE - VIRTUAL HUB MODE");
  Serial.print("Serial connection with Node started with i2c address: ");
  Serial.println(I2C_ADDR);
  Serial.println(" ");

#else
  // I2C
  // Join I2C bus as slave
  Wire.begin(char(I2C_ADDR));
  // Callbacks receiveEvent when data received
  Wire.onReceive(receiveEvent);
  Wire.onRequest(requestEvent);
  // Startup message
  Serial.println(" ");
  Serial.println("I2C - REAL HUB MODE");
  Serial.print("Wire started as slave with i2c address: ");
  Serial.print(I2C_ADDR);
  Serial.println(" ");
#endif
}

void setDataToSend(int data_value) {
  constrain(data_value, 0, 99); // in case the value is out of range
  the_value_to_send = data_value;

#if defined(USE_VIRTUAL_HUB)
  writeDataToNode();
#endif


}


/* VIRTUAL HUB FUNCTIONS */
#if defined(USE_VIRTUAL_HUB)

void checkDataFromNode() {
  while (Serial.available() > 0) {
    String ReaderFromNode; // Store current character
    ReaderFromNode = Serial.readStringUntil('\n');
    value_received = (ReaderFromNode.toInt());
  }
}

void writeDataToNode() {
  // BAD SOLUTION TO ENCAPSULATE VALUE
  // WE ADD A KNOWN begin CHAR b
  // WE PUT THE VALUE
  // WE ADD A KNOWN end CHAR e
  //--> on the virutal hub, we can get the proper value
  // need to be optimized
  if (the_value_to_send != last_value_sent) {
    Serial.print('*');
    Serial.print(the_value_to_send);
    Serial.print('%');
    last_value_sent = the_value_to_send;
    delay(15);
  }
}

#endif

/* I2C HUB FUNCTIONS */
#if !defined(USE_VIRTUAL_HUB)

// Function that executes whenever data is received from master
void receiveEvent(int howMany) {
  while (Wire.available()) { // loop through all but the last
    char c = Wire.read(); // receive byte as a character
    if (howMany > 1) {
      value_received = c;
    }
  }
}

void requestEvent() {
  if (the_value_to_send != last_value_sent) {
    writeDataToi2c(the_value_to_send);
    last_value_sent = the_value_to_send;
  }
}

void writeDataToi2c(char newData) {
  char data[] = {5, newData};
  int dataSize = sizeof(data);
  Wire.write(data, dataSize);
}

#endif
