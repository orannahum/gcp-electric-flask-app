# gcp-electric-flask-app

1. Build the image:

`docker build --platform linux/amd64 -t flask-app:latest .`

2. Tag the image:

`docker tag flask-app:latest gcr.io/electric-flask-app/flask-app:latest`

3. Push the image:
`docker push gcr.io/electric-flask-app/flask-app:latest`

4. Run the Docker Container:

`docker run -p 5001:5001 oranne5/flask-app:latest`

5. Docker compose up (Flask App + Prometheus Service + Grafana Service)

`docker-compose up -d`

or with build

`docker-compose up -d --build`

6. Docker compose down     

`docker-compose down`
