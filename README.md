PROJECT OVERVIEW
---------------------------------------------------------------------------------------------
Uyen will fill this out

## Tech Stack
|Service|Tech|Platform|URL|
|--|--|--|--|
|frontend|React|Vercel|[cpsc3720-sprint4.vercel.app](https://cpsc3720-sprint4.vercel.app/)|
|admin-service  |Node/Express|Render|[https://tigertix-admin-service-g3s2.onrender.com](https://tigertix-admin-service-g3s2.onrender.com/)|
|client-service  |Node/Express|Render|[https://tigertix-client-service-s128.onrender.com](https://tigertix-client-service-s128.onrender.com/)|
|user-authentication|Node/Express|Render|[https://tigertix-user-authentication.onrender.com](https://tigertix-user-authentication.onrender.com/)|
|llm-driven-booking|Node/Express|Render|[https://cpsc3720-sprint1-new.onrender.com](https://cpsc3720-sprint1-new.onrender.com/)|
|shared-db|SQLite|n/a|n/a|

## Architecture Summary
Uyen will fill this out

## Installation and Setup Instructions
Uyen will fill this out
 
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
|PORT|Port number of admin-service|
|FRONTEND_ORIGIN|Allowed domain for CORS|

**USER-AUTHENTICATION**
|Variable|Purpose|
|--|--|
|PORT|Port number of admin-service|
|FRONTEND_ORIGIN|Allowed domain for CORS|
|JWT_SECRET|Secret key used to sign JWT tokens|
|JWT_EXPIRES_IN|Expiration time of token|
|COOKIE_NAME|Name of browser cookie|

**LLM-DRIVEN-BOOKING**
|Variable|Purpose|
|--|--|
|PORT|Port number of admin-service|
|FRONTEND_ORIGIN|Allowed domain for CORS|
|USE_OLLAMA|Boolean that determines whether or not full LLM is used|
|LLAMA_URL|Local URL of Ollama service|
## How to Run Regression Tests
Uyen will fill this out
## Team Members, Instructor, TAs, and roles
Uyen will fill this out
## License 
Uyen will fill this out





