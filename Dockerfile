FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the Sudoku game HTML file into the nginx public directory
COPY index.html /usr/share/nginx/html/
COPY sudoku.js /usr/share/nginx/html/

# Expose port 80
EXPOSE 80
