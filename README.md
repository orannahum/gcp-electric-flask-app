# gcp-electric-flask-app

1. Build the image:

`docker build --platform linux/amd64 -t flask-app:v* .`

2. Tag the image:

`docker tag flask-app:v* gcr.io/electric-flask-app/flask-app:v*`

3. Push the image:
`docker push gcr.io/electric-flask-app/flask-app:v*`

4. Run the Docker Container:

`docker run -p 5001:5001 oranne5/flask-app:v*`

5. Docker compose up (Flask App + Prometheus Service + Grafana Service)

`docker-compose up -d`

or with build

`docker-compose up -d --build`

6. Docker compose down     

`docker-compose down`
