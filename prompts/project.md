# React Native (Expo) Photo Upload App

A mobile app using React Native and Expo, and styles with Nativewind.

The app allows the user to take photos of a product (or select photos from the device's photo library) and then uploads them to Cloudinary (Cloudinary credentials in .env file).

The Cloudinary folder to upload the images is called `app-images`.

Before uploading images to Cloudinary a new sub-folder inside the `app-images` folder should be created for each product, so that all images for the product are saved inside this sub-folder. The name of the sub-folder should reference the product like so: `/app-images/product-${productId}`

Before uploading the images they should be resized to 1200px (larger dimension) to make upload consume less bandwidth.

## Interaction with backend app

The app acts as a frontend for this backend app:

https://github.com/d4v1dl3d4/ml-listings-backend

The backend app listens to webhooks from Cloudinary notifying that new images have been uploaded, then analyzes the images for each product using Claude API, then creates a product listing using the Mercado Libre API, and finally sends a webhook notification to this frontend app:

https://github.com/d4v1dl3d4/ml-listings-backend/blob/main/src/services/frontendWebhook.ts

The webhook notifyies that either the process has been completed succesfully or some step has failed.

After uploading the images this frontend app should listen for this webhook and then show the user a message saying that either the listing has been successfully created or that something in the process went wrong and the user should try again.

If the listing has been successfully created the link to the listing should be shown to user.

The permalink for the listing is part of the payload of the webhook:

`product.mercado_libre_listing.permalink`

