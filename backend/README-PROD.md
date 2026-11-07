# Production Setup for Quiz Backend

## 1. Environment Variables
- Set `NODE_ENV=production`.
- Set `PORT` as needed (default is 4000).
- (Optional) Use environment variables for Firebase config for extra security.

## 2. Install Dependencies
```sh
cd backend
npm install
```

## 3. Start with PM2 (Recommended for Production)
```sh
npm install -g pm2
pm run build # (if you add a build step)
pm start # or use pm2 below
pm2 start ecosystem.config.js
```

## 4. Reverse Proxy (Nginx/Apache)
- Use Nginx or Apache to proxy requests to your Node.js server for SSL and domain support.

## 5. Security
- Ensure `firebase-config.json` is not exposed publicly.
- Use HTTPS in production.
- Set CORS to your frontend domain in `quiz-server.js`:
  ```js
  app.use(cors({ origin: 'https://your-frontend-domain.com' }));
  ```

## 6. Health Check
- Add a health endpoint in `quiz-server.js`:
  ```js
  app.get('/health', (req, res) => res.send('OK'));
  ```

## 7. Logs
- PM2 manages logs. Use `pm2 logs` to view.

---

**You are ready for production!**
