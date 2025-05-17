import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "@/app.module";
import { envs } from "@/envs";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const config = new DocumentBuilder()
		.setTitle("Swagger")
		.addBearerAuth()
		.build();

	app.enableCors({
		origin: "*",
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
		allowedHeaders: "Content-Type, Authorization",
	});

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("swagger", app, document);

	await app.listen(envs.PORT, envs.HOST);
}

await bootstrap();
