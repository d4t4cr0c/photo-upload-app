# React Native (Expo) Photo Upload App

This project consist of a mobile app using React Native and Expo, styled with Nativewind.

The app allows the user to take photos of a product (or select photos from the device's photo library) and then uploads them to the backend app (backend app URL in .env file).

Before uploading the images they should be resized to 1500px (larger dimension) to make the upload consume less bandwidth.

## Interaction with backend app

The backend received the images from this app at this endpoint:

`${ENV.BACKEND_API_URL}/api/image/uploads`

Then the backend app analyzes the images for each product using Claude API, then creates a product listing using the Mercado Libre API. After upload this app starts polling the backend app for listing status, either ´completed´, ´failed´ or ´processing´.

If the listing has been successfully created the link to the listing is shown to the user.

The link for the listing is part of the payload of the webhook from the backend service:

`product.mercado_libre_listing.permalink`

