import { Module } from "@nestjs/common";
import { WebsocketTesterController } from "./websocketTester.controller";

@Module({
	controllers: [WebsocketTesterController],
})
export class WebsocketTesterModule {}
