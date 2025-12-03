PROJECT OVERVIEW
---------------------------------------------------------------------------------------------
TigerTix is a microservice-based event ticketing platform that allows users to browse Clemson University campus events, register/login, and purchase tickets manually or using an LLM-driven booking service with optional voice input and tab-based control for accessibility. 

## Tech Stack
|Service|Tech|Platform|URL|
|--|--|--|--|
|frontend|React|Vercel|[cpsc3720-sprint4.vercel.app](https://cpsc3720-sprint4.vercel.app/)|
|admin-service  |Node/Express|Render|[https://tigertix-admin-service-g3s2.onrender.com](https://tigertix-admin-service-g3s2.onrender.com/)|
|client-service  |Node/Express|Render|[https://tigertix-client-service-s128.onrender.com](https://tigertix-client-service-s128.onrender.com/)|
|user-authentication|Node/Express|Render|[https://tigertix-user-authentication.onrender.com](https://tigertix-user-authentication.onrender.com/)|
|llm-driven-booking|Node.js/Express.js/REST microservices (Auth, Admin, Events, LLM)|Render|[https://cpsc3720-sprint1-new.onrender.com](https://cpsc3720-sprint1-new.onrender.com/)|
|shared-db|SQLite|file-based|\backend\shared-db\tigertix.db|

## Architecture Summary
TigerTix is built using a microservices architecture, where each service runs independently with its own responsibilities and ports.

**Services & Ports**
|Service|Description|Local Port
|--|--|--|
|Frontend|React UI|3000|
|Auth Service|Login/Register, JWT tokens|4000
|Admin Service|Admin event controls|5001
|LLM Service|Processes natural-language booking|6001|
|Database|SQLite event storage|n/a (file-based)|



## Installation and Setup Instructions
1. Clone the Repository
   * git clone https://github.com/UNGUYEN09/cpsc3720-sprint1-NEW.git
2. Install Dependencies
   * Run "npm install" on \backend and \frontend
   * cd user-authentication, then type “npm install express sqlite3 bcryptjs jsonwebtoken cookie-parser dotenv” to install all the Node.js libraries the authentication microservice needs
3. Environment Variables Setup
   * Create a .env file inside each service directory with the following information:
     * FRONTEND_ORIGIN=http://localhost:3000
     * JWT_SECRET = generate_one_yourself by typing: node -e “console.log(require(‘crypto’).randombyres(64).toString(‘hex’))”
     * USE_OLLAMA=true
     * LLAMA_URL=http://localhost:11434/api/generate
     * REACT_APP_AUTH_API_URL=http://localhost:4000
     * REACT_APP_ADMIN_API_URL=http://localhost:5001
     * REACT_APP_CLIENT_API_URL=http://localhost:6001

4. Running Locally
**Start Admin & LLM Service**
cd TigerTix\backend\llm-driven-booking\
node server.js
**Start Auth Service**
cd TigerTix\user-authentication\
node server.js
**Start Frontend**
cd TigerTix\frontend\
npm start

 
## Environment Variables Setup
**FRONTEND**
|Variable|Purpose|
|--|--|
|REACT_APP_AUTH_API_URL|URL of the authentication microservice|
|REACT_APP_ADMIN_API_URL|URL of the admin microservice|
|REACT_APP_CLIENT_API_URL|URL of the client microservice|
|REACT_APP_LLM_API_URL|URL of the LLM-driven booking microservice|

**ADMIN-SERVICE**
|Variable|Purpose|
|--|--|
|PORT|Port number of admin-service|
|FRONTEND_ORIGIN|Allowed domain for CORS|

**CLIENT-SERVICE**
|Variable|Purpose|
|--|--|
|PORT|Port number of client-service|
|FRONTEND_ORIGIN|Allowed domain for CORS|

**USER-AUTHENTICATION**
|Variable|Purpose|
|--|--|
|PORT|Port number of user-authentication|
|FRONTEND_ORIGIN|Allowed domain for CORS|
|JWT_SECRET|Secret key used to sign JWT tokens|
|JWT_EXPIRES_IN|Expiration time of token|
|COOKIE_NAME|Name of browser cookie|

**LLM-DRIVEN-BOOKING**
|Variable|Purpose|
|--|--|
|PORT|Port number of LLM-Driven-Booking|
|FRONTEND_ORIGIN|Allowed domain for CORS|
|USE_OLLAMA|Boolean that determines whether or not full LLM is used|
|LLAMA_URL|Local URL of Ollama service|
## How to Run Regression Tests
Regression tests run automatically in GitHub Actions, but you can run them locally: npm test

Install dependencies before running all tests:
npm install --save-dev jest supertest
npm install sqlite3
npm install dotenv

## Team Members, Instructor, TAs, and roles
|Name|Role|
|--|--|
|Uyen Nguyen|Co-Developer - unguyen@clemson.edu|
|Pierson Rinchere|Co-Developer - prinche@clemson.edu|
|Dr. Brinkley|Instructor - julianbrinkley@clemson.edu|
|Colt Doster|TA - scdoste@clemson.edu|
|Atik Enam|TA - menam@g.clemson.edu|
## License 
This project is licensed under the **MIT License**, which allows commercial and private use, modification, distribution, and sublicensing with attribution.
Learn more at: https://chosealicense.com/licenses/mit/





