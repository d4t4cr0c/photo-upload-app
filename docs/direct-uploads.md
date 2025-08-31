
# Direct image uploads

Right now app uploads images to Cloudinary, then sends webook to notify backend. The upload process is taking too long, which is bad for UX. Better to just send images directly to backend.

Backend has been refactored to accept direct uploads at this endpoint:

`${ENV.BACKEND_API_URL}/api/image/uploads`

Backend validates request with API key so request must be sent with API Key provided in `.env` file, like so:

```js
const formData = new FormData();
  formData.append('productId', productId);
  files.forEach(file => formData.append('images', file));

  fetch(`${ENV.BACKEND_API_URL}/api/image/uploads`, {
    method: 'POST',
    headers: {
      'X-API-Key': ENV.FRONTEND_API_KEY
    },
    body: formData
  });

```

## Polling backend for status

Also, backend polling endpoint has been changed 