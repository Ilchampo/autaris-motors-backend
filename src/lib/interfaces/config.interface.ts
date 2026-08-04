interface MongoConfig {
    uri: string;
    dbName: string;
}

interface AppConfig {
    port: number;
    env: string;
    frontendUrl: string;
}

interface CorsConfig {
    whitelist: string[];
}

interface JwtConfig {
    secret: string;
    expiresIn: string;
}

interface ResendConfig {
    apiKey: string;
    maxRetries: number;
    retryDelay: number;
    fromEmail: string;
}

interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    transformationName: string;
}

export interface Config {
    app: AppConfig;
    cors: CorsConfig;
    cloudinary: CloudinaryConfig;
    mongo: MongoConfig;
    jwt: JwtConfig;
    resend: ResendConfig;
}
