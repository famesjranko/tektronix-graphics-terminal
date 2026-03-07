# Tektronix Graphics Terminal
# Static site served via nginx

FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY gallery.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/

# Expose port 80
EXPOSE 80

# nginx runs automatically from base image
