ionic start devdacticSql blank --type=angular --capacitor
cd ./devdacticSql
 
# Install the Capacitor plugin
npm install @capacitor-community/sqlite
 
# Add some app logic
ionic g service services/database
ionic g page pages/details
 
# Add the native platforms
ionic build
npx cap add ios
npx cap add android