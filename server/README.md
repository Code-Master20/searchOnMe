# searchOnMe Backend

Production-ready Node.js, Express, and MongoDB backend for the `searchOnMe` portfolio contact system.

## Features

- Contact message submission with email verification
- Admin-only authentication using JWT in HTTP-only cookies
- Protected message management and reply endpoints
- Admin-only Cloudinary signed uploads for resume, education documents, and photos
- Public portfolio asset listing for approved uploaded files
- Resend-powered transactional emails
- Mongoose models for messages and admin credentials
- Input validation, security headers, CORS, and rate limiting

## Project Structure

```text
server/
  src/
    config/
      db.js
    controllers/
      adminController.js
      assetController.js
      messageController.js
    middlewares/
      authMiddleware.js
      errorMiddleware.js
    models/
      Admin.js
      Message.js
      PortfolioAsset.js
    routes/
      adminRoutes.js
      assetRoutes.js
      messageRoutes.js
    services/
      cloudinaryService.js
      emailService.js
    utils/
      generateToken.js
    app.js
    server.js
  package.json
  .env
```

## Environment Variables

Create `.env` based on `.env.example`.

- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `APP_BASE_URL`
- `ADMIN_EMAILS`
- `ADMIN_PASSWORD`
- `COOKIE_SAME_SITE`
- `RESEND_API_KEY`
- `EMAIL_FROM` or `EMAIL_USER`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Install and Run

From this folder:

```bash
npm install
npm run dev
```

## API Endpoints

### Public

- `POST /api/messages`
- `GET /api/messages/verify/:token`
- `GET /api/assets`
- `GET /api/health`

### Admin

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/messages`
- `GET /api/admin/messages/:id`
- `POST /api/admin/reply/:id`
- `POST /api/admin/assets/signature`
- `GET /api/admin/assets`
- `POST /api/admin/assets`
- `DELETE /api/admin/assets/:id`

## Notes

- The admin notification email is sent only after the user verifies their message.
- Verification uses a token in the URL, not cookies.
- Admin accounts are auto-created on server startup from comma-separated `ADMIN_EMAILS` and `ADMIN_PASSWORD` if they do not already exist.
- Existing admin passwords are synced from `ADMIN_PASSWORD` on server startup, so changing the environment value updates the stored login hash.
- Deleting an asset from the admin panel removes it from both MongoDB and Cloudinary.
- For separate Vercel and Render domains, use `COOKIE_SAME_SITE=none`, `NODE_ENV=production`, and an HTTPS backend so admin cookies work cross-site.
