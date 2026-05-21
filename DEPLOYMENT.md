# Deployment

## Render backend

Use the `backend` folder as the Render service root.

Build command:

```sh
npm install
```

Start command:

```sh
npm start
```

Set these Render environment variables:

```env
NODE_ENV=production
DB_TYPE=mysql
MYSQL_HOST=your-mysql-host
MYSQL_PORT=3306
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=your-mysql-database
MYSQL_CREATE_DATABASE=false
JWT_SECRET=use-a-long-random-secret
FRONTEND_URL=https://your-netlify-site.netlify.app
```

Your local `backend/.env` file is ignored by git, so Render cannot read it.

## Netlify frontend

The frontend build is configured by `netlify.toml`.

Set these Netlify environment variables:

```env
REACT_APP_API_URL=https://your-render-backend.onrender.com
REACT_APP_SOCKET_URL=https://your-render-backend.onrender.com
```
