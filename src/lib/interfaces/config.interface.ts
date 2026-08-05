interface MongoConfig {
    uri: string;
    dbName: string;
}

interface AppConfig {
    port: number;
    env: string;
    frontendUrl: string;
    trustProxy: boolean | number;
}

interface CorsConfig {
    whitelist: string[];
}

interface RateLimitConfig {
    windowMs: number;
    apiMax: number;
    authMax: number;
    publicWriteMax: number;
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
    rateLimit: RateLimitConfig;
    cloudinary: CloudinaryConfig;
    mongo: MongoConfig;
    jwt: JwtConfig;
    resend: ResendConfig;
}
