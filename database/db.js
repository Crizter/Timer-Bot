import "dotenv/config";
import { MongoClient } from 'mongodb';



export async function connectToCluster(uri) {
    let mongoClient;
 
    try {
        console.log(uri);
        
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
 
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
 }