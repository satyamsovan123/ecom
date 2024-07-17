### Sample frontend for testing payment integration

This is a sample frontend for testing payment integration.

This frontend has 6 routes -

- /home (Home page)
- /signin (Signin page)
- /signup (Signup page)
- /order (Order page)
- /profile (Profile page)
- /content (Content page)

These routes can be accessed only after authentication, where (Authorization: Bearer `token`) is passed in headers when required -

- /order
- /profile
- /content

In case of invalid route, user will be redirected to /home.

### Application flow

- Signup and signin
- Apply coupon / place order (for one item at a time) and make payment (not implemented yet)
- View profile
- View content
- Signout

### Setup payment integration

Stripe | Razorpay | PhonePe | Paytm are to be used for payment integration. It's not implemented yet.

### Setup application

- Clone the repository
- Run `npm install`
- Run `ng serve`
- Open `http://localhost:4200/` in browser

### Live demo

The frontend is deployed on Firebase (free) - [https://ecom-angular-ui.web.app](https://ecom-angular-ui.web.app)
