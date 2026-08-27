FROM node:24.11.0-alpine3.22    
WORKDIR /app          
COPY package*.json ./      
RUN npm ci --omit=dev      
COPY . .                  
CMD ["npm", "start"]      
