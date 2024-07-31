# Skipli-server
# STEP 1:
Make sure your computer has node from v20 After clone the project and start the server
# STEP 2:
Contact me if you want to get the ENV file
### Detail of ENV:
PORT: This will be the port the project listens and runs. <br>
GEMINI_API_KEY: This is the gemini api key of the gemini of google generate you can follow this tutorial to get the api key: https://ai.google.dev/gemini-api/docs/get-started/tutorial?lang=node#generate-text-from-text-input<br>
JWT_KEY: This is random key you want to set. It can be any string. <br>
TWILIO_SID: This is the SID of Twilio to send the sms. <br>
TWILIO_TOKEN: This is the Auth Token of Twilio to send the sms. <br>
APP_PASSWORD: This is the gmail app password provide for you when you create the app in gmail service to send email. <br>
APP_USERNAME: This is the gmail app username provide for you when you create the app in gmail service to send email. <br>
 - For interviwer: please put the ENV file I attach at the same level of folder with main.js file. <br>
 - Note: The Twilio trial account only can send sms to the verified phone number in the tab Verified Caller IDs, the message should be like this screen:
   ![z5684651373838_a33b990b0fb69e277acd485fe059f097](https://github.com/user-attachments/assets/91bb3f67-c55f-4ae8-b9f4-b46934f49bde)
If you want to send sms to any phone number, you need to uprade the account Twilio.
# STEP 3:
Make sure you have the key of your Firestore database of firebase. <br>
To embed your Firestore database to the app follow this tutorial https://firebase.google.com/docs/firestore/quickstart#node.js_1 <br>
 - For interviewer: please put the skipli-key.json at the same level of folder with the main.js file
# STEP 4:
Run the command:
### npm install
# STEP 5:
Run the command:
### npm run start
# SUMMARY:
After all steps the app should run at the url http://localhost:8080
