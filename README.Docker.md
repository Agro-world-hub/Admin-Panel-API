### Building and running your application

First, build your image, e.g.: `docker build -t adminpanel-api .`.
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t adminpanel-api .`.

When you're ready, start your application by running:
`docker run -p 3000:3000 adminpanel-api .`.

Your application will be available at http://localhost:3000.
