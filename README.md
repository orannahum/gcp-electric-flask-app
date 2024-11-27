# gcp-electric-flask-app

1. Build the image:

`docker build --platform linux/amd64 -t flask-app:v* .`

2. Tag the image:

`docker tag flask-app:v* gcr.io/electric-flask-app/flask-app:v*`

3. Push the image:
`docker push gcr.io/electric-flask-app/flask-app:v*`

4. Run the Docker Container:

`docker run -p 8080:5001 oranne5/flask-app:v7`

5. URL

`https://flask-app-209305145679.us-central1.run.app/`