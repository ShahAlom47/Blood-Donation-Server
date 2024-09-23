# RedLove - Server Side

[Live Link](https://blood-donation-client-zeta.vercel.app)

[Client-side Code Repository](https://github.com/ShahAlom47/Blood-Donation-Project)

This is the server-side code for the **RedLove** blood donation platform. It handles the backend logic, database operations, and payment processing for the RedLove project.

## Technologies Used

- **Node.js**: The runtime environment used for server-side development.
- **Express.js**: A minimal web framework for Node.js to handle routing and server-side logic.
- **MongoDB**: NoSQL database for storing user, donation, and blood request data.
- **Cors**: Middleware to handle Cross-Origin Resource Sharing.
- **Dotenv**: To manage environment variables.
- **JSON Web Token (JWT)**: For user authentication and authorization.
- **Stripe**: For handling secure payment processing.


1. Clone the repository:
   ```bash
   https://github.com/ShahAlom47/Blood-Donation-Server.git

2. Install npm
  
3. Create a `.env` file:

   ```bash
   # JWT Token
   ACCESS_TOKEN= ******

   # MongoDB Credentials
   DB_USER=your_mongodb_username
   DB_PASS=your_mongodb_password

   # Stripe API Key
   STRIPE_KEY=*******

   # Nodemailer Credentials
   NODEMAILER_USER=*****
   NODEMAILER_PASS=******

   
