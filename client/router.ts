import express from 'express';
import bodyParser from 'body-parser';
import { startServer } from './server';

const app = express();
app.use(bodyParser.json());

// Import routes
import indexRoutes from './controllers/index';
import uploadRoutes from './controllers/upload';
import soundsRoutes from './controllers/sounds'; 
import authRoutes from './controllers/authentication';

// Use routes
export function runServer() {
    app.use('/', indexRoutes);
    app.use('/', uploadRoutes);
    app.use('/', soundsRoutes);
    app.use('/', authRoutes);
    app.listen(3040);

    startServer(app);
}
