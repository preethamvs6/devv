# ==========================================================================
# PRODUCTION-READY WEB APP CONTAINER
# Lightweight Nginx Web Server for high performance & minimal vulnerability surface
# ==========================================================================

# Use the lightweight Nginx Alpine base image
FROM nginx:1.25-alpine

# Metadata labels for container tracking & resume value
LABEL maintainer="Alex Mercer <alex.mercer.devops@example.com>"
LABEL project="devops-ci-cd-pipeline"
LABEL version="1.0"

# Remove the default Nginx static landing pages
RUN rm -rf /usr/share/nginx/html/*

# Copy the compiled static production assets (created by Vite in the build stage) 
# into the default Nginx public HTML directory
COPY dist/ /usr/share/nginx/html/

# Optional: Copy custom Nginx configuration if special routing is needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Port 80 for incoming HTTP web traffic
EXPOSE 80

# Start Nginx with global configuration run in the foreground (non-daemonized) 
# to keep the Docker container active
CMD ["nginx", "-g", "daemon off;"]
