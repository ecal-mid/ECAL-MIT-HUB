int button_state = 0;
int last_button_state = 0;
int prev_val = 0;
String address = "0x7";
//int init = false;
// the setup function runs once when you press reset or power the board
void setup() {
  // initialize digital pin LED_BUILTIN as an output.

  Serial.begin(9600); // Begen listening on port 9600 for serial
  
  pinMode(LED_BUILTIN, OUTPUT);

  digitalWrite(LED_BUILTIN, LOW);
  pinMode(4, INPUT_PULLUP);
  // init infos
  Serial.print('b');
  Serial.print(address);
  Serial.print('e');
}

// the loop function runs over and over again forever
void loop() {
  //if(Serial.available() > 0) // Read from serial port
  //{
  
    while(Serial.available()>0){
      String ReaderFromNode; // Store current character
      ReaderFromNode = Serial.readStringUntil('\n');
      convertToState(ReaderFromNode); // Convert character to state  
    }

/*
    if (Serial.available())
      {
        char myBuffer[3] = "";
        byte index = 0;
        while (Serial.available() and index < sizeof(myBuffer) - 1)
        {
          myBuffer[index++] = Serial.read();
          myBuffer[index] = '\0';
        }
        // then convert to a number....
         int number = atoi( myBuffer );
        //Serial.println(number);
         convertToState(number);
      }
*/
    
    
  if (digitalRead(4) == LOW) {
    button_state = 1;
    //Serial.println("on");
    delay(5);
  } else {
     //Serial.println("off");
    button_state = 0;
  }
   if (button_state != last_button_state) {
    if(button_state == 1){
     last_button_state = 1;
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
 
  delay(100); 
}

void convertToState(String chr) {
  /*
  Serial.println(chr);
  if(chr=="o"){
    digitalWrite(LED_BUILTIN, HIGH);
    delay(50); 
  }
  if(chr=="f"){
    digitalWrite(LED_BUILTIN, LOW);
    delay(50); 
  }
*/
  if(chr=="99"){
    digitalWrite(LED_BUILTIN, HIGH);
    delay(50); 
  }
  if(chr=="0"){
    digitalWrite(LED_BUILTIN, LOW);
    delay(50); 
  }
  
}
